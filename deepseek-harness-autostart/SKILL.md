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

Record the resolved absolute paths (used later):

```powershell
(Get-Command node).Source   # e.g. D:\Software\nodejs\node.exe
npm root -g                 # e.g. D:\Software\nodejs\node_modules
```

> Note: machine PATH may contain several node/npm shims (e.g. under Python directories or
> a per-user npm). For the scheduled task always use absolute paths from
> `(Get-Command node).Source` and the global dsh bin, never bare `npx`/`node`.

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

Sanity-check it can serve the browser UI:

```powershell
& "$dshBin" --version
& "$dshBin" --profile web --help
```

## Step 3 — Auto-start wrapper script

Use `scripts/start-dsh-web.ps1` from this repo (see below). It (a) skips if the port is
already served (e.g. the service was started manually) and (b) restarts on crash.

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

## Troubleshooting

- **`EADDRINUSE`: address already in use** → another instance already serves the port.
  Either keep it or stop it, then re-test. The `Test-NetConnection` guard prevents log spam.
- **Task never fires at boot** → confirm `Status: Ready`, `Scheduled Task State: Enabled`,
  `Run As User: SYSTEM`, `Schedule Type: At system start up`.
- **`powershell -File` cannot run `.cmd`?** → point the task at a `.ps1`, not `.cmd`.
- **Wrong Node picked up** → set absolute `$Node` path; do not rely on PATH.

## Files

- `SKILL.md` — this skill.
- `scripts/start-dsh-web.ps1` — boot wrapper with port-guard + crash-restart. Edit the
  top variables (`$Node`, `$DshBin`, `$BindHost`, `$Port`, `$Log`) to match your machine.
- `logs/dsh-web.log` — runtime service log (created by the wrapper, not committed).