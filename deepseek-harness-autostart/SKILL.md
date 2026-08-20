---
name: "deepseek-harness-autostart"
description: "Sets up the DeepSeek Harness browser UI (dsh web) as a Windows auto-start service. Invoke when the user wants dsh web to launch automatically at boot, wants to install/check Node.js for deepseek-harness, or wants to run/record the dsh download+start+autostart flow on Windows."
---

# DeepSeek Harness Auto-Start (Windows)

Helper skill to install/verify the Node.js toolchain for `deepseek-harness` and make the
DeepSeek Harness browser UI (`dsh web`) start automatically at Windows boot.

Applies to **Windows only**.

## Goal

Recreate this end-to-end flow:

1. Check/install **Node.js** (and npm) at a version satisfying `deepseek-harness`'s
   `package.json` `engines.node`.
2. Install the **`@deepseek-ai/dsh`** CLI globally (this is what `npx @deepseek-ai/dsh web` runs).
3. Create a **boot auto-start** scheduled task so `dsh web` serves the browser UI at every
   system start, with automatic crash restart.

## Prerequisites

- Windows 10/11.
- A shell that can run `schtasks` and `powershell -File`.

## Step 1 — Node.js / npm check & install

The required Node range lives in the harness repo's root `package.json`:

```json
"engines": { "node": "^22.19.0 || >=24.0.0" }
```

- If `node -v` already satisfies the requirement and `npm -v` works, **skip installation**.
- Otherwise install Node LTS from <https://nodejs.org> (choose a version matching
  `^22.x >=22.19` or `>=24.x`), and confirm with:

```powershell
node -v
npm -v
```

Record the resolved absolute paths (used later). **Resolve each independently** — node.exe
and the global node_modules may live in different directory trees:

```powershell
# Resolve the REAL node.exe (not a .cmd shim). On Windows, Get-Command may return a
# shim like %APPDATA%\npm\node.cmd — resolve its target instead.
$nodeExe = (Get-Command node -ErrorAction SilentlyContinue).Source
if ($nodeExe -and $nodeExe -match '\.cmd$|\.bat$') {
    # Shim: parse the actual target from the shim file, or fall back to where.exe
    $nodeExe = (where.exe node 2>$null | Where-Object { $_ -match '\.exe$' } | Select-Object -First 1)
}
if (-not $nodeExe) { Write-Error "node.exe not found in PATH"; exit 1 }

# Resolve the global node_modules root — always use npm's own report
$dshRoot = (npm root -g).Trim()
$dshBin  = Join-Path $dshRoot "@deepseek-ai\dsh\lib\bin.js"

# Verify both exist
Test-Path $nodeExe          # node.exe must exist
Test-Path $dshBin           # dsh bin must exist
```

> **Why separate?** On Windows, a per-user npm install may put shims in
> `%APPDATA%\npm\` while the real node lives in `C:\Program Files\nodejs\`. Meanwhile
> `npm root -g` reports the actual global modules directory, which may differ from
> the node.exe parent. Never assume they share a parent — always resolve each
> independently and verify with `Test-Path`.

## Step 2 — Install dsh globally

Verify global install (avoid a bare `npx` call at boot time):

```powershell
npm ls -g @deepseek-ai/dsh
```

If missing, install:

```powershell
npm i -g @deepseek-ai/dsh
```

Locate the CLI entry (used by the autostart script):

```powershell
$dshRoot = npm root -g
$dshBin  = "$dshRoot\@deepseek-ai\dsh\lib\bin.js"
Test-Path $dshBin          # bin field maps "dsh" -> "lib/bin.js"
```

### Ensure `dsh` is on the system PATH

After `npm i -g`, npm creates a shim (`dsh.cmd` / `dsh.ps1`) in the npm prefix bin
directory (e.g. `C:\Program Files\nodejs\`). If that directory is not on the system
PATH, `dsh web` won't work from a plain command prompt or the scheduled task.

```powershell
# Check if `dsh` resolves from PATH
$null = Get-Command dsh -ErrorAction SilentlyContinue
if (-not $?) {
    # Find npm's global bin directory
    $npmBin = (npm config get prefix)
    # Add to system PATH (requires admin) — persists across reboots
    $currentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
    if ($currentPath -notlike "*$npmBin*") {
        [Environment]::SetEnvironmentVariable("Path", "$currentPath;$npmBin", "Machine")
        $env:Path = "$env:Path;$npmBin"
        Write-Host "Added $npmBin to system PATH"
    }
}
```

> **Scheduled task note:** The `SYSTEM` account uses the **machine** PATH, not the user
> PATH. Always modify the machine PATH via `[Environment]::SetEnvironmentVariable(..., "Machine")`,
> never the user PATH, or the scheduled task won't find `dsh`.

Sanity-check it can serve the browser UI:

```powershell
dsh --version              # use the PATH shim, not the full bin path
dsh --profile web --help
```

## Step 3 — Auto-start wrapper script

Use `scripts/start-dsh-web.ps1` from this repo (see below). It:

1. **Skips** if the port is already served (e.g. the service was started manually).
2. **Restarts on crash** with exponential backoff (5s → 10s → 20s → 40s → 80s, capped at 5 min).
3. **Does NOT restart** on graceful exit (exit code 0) — so manual stops are respected.
4. **Gives up** after 5 consecutive crashes and logs "Manual intervention required."

> **PowerShell gotcha:** `$Host` is a read-only automatic variable. Never name your bind
> variable `$Host`; use e.g. `$BindHost`.

## Step 4 — Register boot auto-start scheduled task

Create the task to run **at system startup** under the `SYSTEM` account with highest
privileges:

```powershell
schtasks /Create /TN "DeepSeekHarnessWeb" `
  /TR "powershell.exe -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File D:\deepseek-harness-autostart-skill\scripts\start-dsh-web.ps1" `
  /SC ONSTART /RU SYSTEM /RL HIGHEST /F
```

To re-point an existing task at an updated script:

```powershell
schtasks /Change /TN "DeepSeekHarnessWeb" /TR "..."
```

### Manual test & verify

```powershell
schtasks /Run /TN "DeepSeekHarnessWeb"
Start-Sleep -Seconds 8
Test-NetConnection -ComputerName 127.0.0.1 -Port 3080 -InformationLevel Quiet
Get-Content "D:\deepseek-harness-autostart-skill\logs\dsh-web.log" -Tail 20

# stop a stuck/looping test run
schtasks /End /TN "DeepSeekHarnessWeb"
```

Availability check once busy:

```powershell
schtasks /Query /TN "DeepSeekHarnessWeb" /V /FO LIST
netstat -ano | findstr :3080
```

> Expected behavior: while an instance already serves `:3080` (e.g. from that same
> session's manual `npx`), the wrapper logs `port ... already in use, skipping.` and exits,
> which is **correct** — a real boot has no such instance, so it launches.

## Crash Restart Behavior

The wrapper uses **exponential backoff** to avoid tight restart loops:

| Retry | Delay | Total wait |
|-------|-------|------------|
| 1     | 5s    | 5s         |
| 2     | 10s   | 15s        |
| 3     | 20s   | 35s        |
| 4     | 40s   | 75s        |
| 5     | 80s   | 155s       |
| fail  | —     | gives up   |

- **Exit code 0** (graceful shutdown) → no restart, loop exits cleanly.
- **Exit code ≠ 0** (crash) → restart with backoff, up to 5 attempts.
- **5 crashes in a row** → gives up, logs `"Manual intervention required"`, exits with code 1.

To adjust: edit `$maxRetries` and `$baseDelay` at the top of `start-dsh-web.ps1`.

## Troubleshooting

- **`EADDRINUSE`: address already in use** → another instance already serves the port.
  Either keep it or stop it, then re-test. The `Test-NetConnection` guard prevents log spam.
- **Task never fires at boot** → confirm `Status: Ready`, `Scheduled Task State: Enabled`,
  `Run As User: SYSTEM`, `Schedule Type: At system start up`.
- **`powershell -File` cannot run `.cmd`?** → point the task at a `.ps1`, not `.cmd`.
- **Wrong Node picked up** → set absolute `$Node` path; do not rely on PATH.
- **Service keeps restarting** → check the log for exit codes. If you see "max retries reached",
  investigate the root cause (Node.js version mismatch, corrupted dsh install, port conflict).
- **Service stopped after manual `dsh web` exit** → this is correct behavior. Exit code 0 means
  "graceful shutdown" and the wrapper intentionally does not restart. Use the scheduled task
  to start it again at next boot, or run `schtasks /Run /TN "DeepSeekHarnessWeb"`.

## Files

- `SKILL.md` — this skill.
- `scripts/start-dsh-web.ps1` — boot wrapper with port-guard + crash-restart. Edit the
  top variables (`$Node`, `$DshBin`, `$BindHost`, `$Port`, `$Log`) to match your machine.
- `logs/dsh-web.log` — runtime service log (created by the wrapper, not committed).