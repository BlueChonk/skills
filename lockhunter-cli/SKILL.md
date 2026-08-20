---
name: "lockhunter-cli"
description: "Force-unlocks, deletes, or kills processes locking files/folders on Windows using the LockHunter CLI. Invoke when a file or folder cannot be deleted, moved, or renamed because Windows reports it is open/in use, or when the user explicitly asks to force-remove, force-unlock, or kill the lock on a stubborn path. Do not invoke on macOS or Linux."
---

# LockHunter CLI Skill

> **Platform: Windows only.** This skill depends on the Windows-only `LockHunter.exe` binary. It must **not** be invoked on macOS or Linux — on those platforms, fall back to native tools (`lsof` + `kill`, `unlink`, `fuser -k`, `rm -rf`, or `Move-Item`-equivalent PowerShell Core). On a non-Windows host, if the user reports a locked file, do not attempt to use this skill; suggest a platform-appropriate alternative instead.

This skill wraps the local **LockHunter** command-line tool to handle files and folders that Windows refuses to delete/move/rename because they are being held by another process. LockHunter is a free file unlock tool that can force-unlock and delete files locked by other processes [ref:1][ref:2].

## Naming Convention

This skill is named `lockhunter-cli` (not just `lockhunter`) for two reasons:

1. **Distinction**: `LockHunter` alone refers to the GUI application. The `-cli` suffix signals that this skill specifically wraps the **command-line interface** of LockHunter.
2. **Convention**: In the AI agent skills ecosystem, CLI-wrapping skills commonly use the `-cli` suffix (e.g., skills that wrap `git-cli`, `docker-cli`, etc.). This makes it immediately clear to both humans and AI agents that the skill is about the CLI interface, not the GUI tool.

The `name` field in this SKILL.md frontmatter is `lockhunter-cli`, which matches the directory name.

## Tool Location

```
C:\Program Files (x86)\LockHunter\LockHunter.exe
```

On 64-bit systems, LockHunter installs to `Program Files (x86)` by default. Always invoke the executable with its full absolute path. The path contains spaces, so it must be wrapped in double quotes when used in a shell command.

## Download & Install

- **Winget (recommended)**: `winget install --id CrystalRich.LockHunter --exact` [ref:3]
- **Official website**: <https://lockhunter.com/>
- **Installer type**: Inno Setup → supports silent install with `/VERYSILENT /SUPPRESSMSGBOXES /NORESTART`.

### Install via winget (recommended)

```powershell
winget install --id CrystalRich.LockHunter --exact
```

### Install via official installer

```powershell
# 1. Download to the user's Downloads folder
$dl = "$env:USERPROFILE\Downloads\lockhunter-setup.exe"
if (-not (Test-Path $dl)) {
    Invoke-WebRequest -Uri "https://lockhunter.com/assets/lockhunter-setup.exe" -OutFile $dl
}

# 2. Run the Inno Setup silent install (needs admin)
Start-Process -FilePath $dl `
    -ArgumentList '/VERYSILENT','/SUPPRESSMSGBOXES','/NORESTART' `
    -Wait

# 3. Verify
Test-Path "C:\Program Files (x86)\LockHunter\LockHunter.exe"
```

> **Install location**: the default path is `C:\Program Files (x86)\LockHunter` (standard `Program Files (x86)` placement for 32-bit apps). Do **not** install to a custom `D:\...` path.

### Readiness check (run before every invocation)

```powershell
# Bail out on non-Windows hosts
if ($IsLinux -or $IsMacOS) {
    Write-Error "lockhunter-cli skill is Windows-only. Aborting."
    return
}

$exe = "C:\Program Files (x86)\LockHunter\LockHunter.exe"
if (-not (Test-Path $exe)) {
    # Fall back to: winget install
    winget install --id CrystalRich.LockHunter --exact
}
```

## Invocation Syntax

```
LockHunter.exe [/unlock] [/delete [/delperm]] [/kill] [/silent] [/exit] [文件或文件夹路径]
```

### Parameters

| Parameter | Alias | Required | Description |
| --------- | ----- | -------- | ----------- |
| `/unlock` | `-u` | Optional | Unlock file/folder, close all handles and unload DLLs within it |
| `/delete` | `-d` | Optional | Unlock and delete file/folder (includes unlock; do not combine with `/unlock`) |
| `/delperm` | `-dp` | Optional | Must be used with `/delete`; permanently delete file, bypassing Recycle Bin |
| `/kill` | `-k` | Optional | Kill all processes started from the specified path (⚠️ may cause data loss) |
| `/silent` | `-sm` | Optional | Silent mode, no GUI interface, auto-exit after execution |
| `/exit` | `-x` | Optional | Auto-exit after task completion (for viewing GUI without manually clicking Exit) |
| `[path]` | — | Optional | File or folder path. Supports full path or partial path prefix matching |

> **Note**: `/delete` already includes unlock functionality. Do not use `/unlock` and `/delete` together.
> **Recommended**: Always use `/silent` when invoking via AI agent to avoid GUI popups.

### Path Handling

- **Full path**: `C:\Program Files\somefile.exe`
- **Partial path**: Supports prefix matching. For example, `C:\Docume` will match `C:\Documents and Settings`

### Exit Codes

| Exit Code | Meaning |
| --------- | ------- |
| `0` | Operation completed successfully |
| `1` | Failed to delete or unlock file |
| `2` | Technical error occurred during processing |

## Argument Patterns

- **Unlock only** (release handles, keep file):
  ```
  "C:\Program Files (x86)\LockHunter\LockHunter.exe" /unlock /silent "C:\Path\To\Locked\File.txt"
  ```

- **Unlock and delete** (move to Recycle Bin):
  ```
  "C:\Program Files (x86)\LockHunter\LockHunter.exe" /delete /silent "C:\Path\To\File.txt"
  ```

- **Permanently delete** (bypass Recycle Bin):
  ```
  "C:\Program Files (x86)\LockHunter\LockHunter.exe" /delete /delperm /silent "C:\Path\To\File.txt"
  ```

- **Kill processes then delete**:
  ```
  "C:\Program Files (x86)\LockHunter\LockHunter.exe" /delete /kill /silent "C:\Program Files\BadApp"
  ```

- **Silent permanent delete** (most aggressive):
  ```
  "C:\Program Files (x86)\LockHunter\LockHunter.exe" /delete /delperm /silent "C:\Stubborn\delete.me"
  ```

- **Unlock multiple paths**:
  ```
  "C:\Program Files (x86)\LockHunter\LockHunter.exe" /unlock /silent "C:\locked\file1.dll" "C:\locked\file2.dll"
  ```

## When to Use

Invoke this skill **automatically** when any of the following happens during development:

1. `rmdir` / `del` / `Remove-Item` returns `Access is denied`, `The process cannot access the file because it is being used by another process`, or `The directory is not empty`.
2. `rename` / `Move-Item` fails with the same class of errors.
3. A build/install step (npm, pnpm, cargo, msbuild, electron-builder, pyinstaller, git clean, etc.) fails because a file in `node_modules`, `dist`, `target`, `out`, `build`, or `.git` is locked.
4. A previous dev process (a running `node`, `python`, `electron`, `wails dev`, `vite dev`, `pyinstaller` stub, an orphan backend, etc.) is still holding files and blocking cleanup.
5. The user explicitly asks to "force delete", "force unlock", "kill the lock on …", or similar.

## How to Use (Workflow)

1. **Confirm the target path** is correct — `/delete` is destructive and irreversible. Echo the exact command back to the user before running it if the target is anything outside a clearly-known build/cache dir.
2. **For deletion of stubborn build artifacts** (`node_modules`, `dist`, `target`, `__pycache__`, `out`, `build`, `.vite`, `.next`, `.cache`, lock files, `*.log`), you may proceed without extra confirmation — these are regenerable.
3. **For deletion of source files, user documents, or anything not regenerable**, stop and ask the user to confirm before running.
4. **Always use `/silent` mode** for AI agent automation to avoid GUI popups:
   ```powershell
   & "C:\Program Files (x86)\LockHunter\LockHunter.exe" /delete /silent "path\to\locked"
   ```
5. **Check exit code** to verify success:
   ```powershell
   & "C:\Program Files (x86)\LockHunter\LockHunter.exe" /delete /silent "path\to\locked"
   if ($LASTEXITCODE -eq 0) { Write-Host "Success" } else { Write-Host "Failed: $LASTEXITCODE" }
   ```
6. After success, retry the original failing operation (rm, move, rename, build, install, etc.) to verify the file is now free.

## Example Interaction

User: "I can't delete `node_modules`, Windows says it's being used."

Assistant flow:

1. Identify the locked path: `d:\Projects\foo\node_modules`.
2. Run:
   ```powershell
   & "C:\Program Files (x86)\LockHunter\LockHunter.exe" /delete /silent "d:\Projects\foo\node_modules"
   ```
3. Check exit code, then re-run the original failing command (e.g. `pnpm install`).

## Safety Notes

- ⚠️ **Use `/kill` with caution** — it terminates processes and may cause unsaved data loss.
- ⚠️ **Use `/delperm` with caution** — it permanently deletes files, bypassing the Recycle Bin. Files cannot be recovered.
- ⚠️ **Never target `C:\Windows`, `C:\Program Files`, or system directories** without explicit confirmation.
- **Prefer `/unlock` over `/delete`** when the goal is just to release a lock so another tool can finish its work.
- LockHunter can delete files that are in active use, including system files. Misuse can crash the system or cause data loss.

## Troubleshooting

### "It is not digitally signed" / SmartScreen warning

LockHunter's installer may trigger Windows SmartScreen warnings because it lacks a digital signature. To resolve:

1. **Via file properties**: Right-click the installer → Properties → Check "Unblock" at the bottom → Apply.
2. **Via PowerShell**: `Unblock-File -Path "$env:USERPROFILE\Downloads\lockhunter-setup.exe"` [ref:4]
3. **Via zone identifier**: `Remove-Item -Path "$env:USERPROFILE\Downloads\lockhunter-setup.exe" -Stream "Zone.Identifier"` [ref:5]

### File still locked after unlock

Some files may be locked by system processes or kernel drivers. In such cases:
- Try `/delete /kill` to terminate the locking process first.
- If that fails, the file may be locked by a system-level driver that cannot be unloaded.

### Partial path matching

LockHunter supports partial path matching. For example, `C:\Docume` will match `C:\Documents and Settings`. Be cautious with partial paths to avoid unintended matches.

## Additional Features (GUI only)

LockHunter also provides GUI-only features that are not available via CLI:

- **"What is locking this file"** — shows detailed information about which processes are locking a file.
- **Protect** — marks a file/folder to prevent it from being modified or deleted. Protected files cannot be deleted or renamed until the protection is removed via the GUI.
- **Auto unlock** — configures LockHunter to automatically unlock files when they are accessed.

These features are only available through the graphical interface and cannot be invoked via command line.

---

[ref 1]: https://lockhunter.com/ — LockHunter official website
[ref 2]: https://cloud.tencent.cn/developer/article/2123019 — LockHunter 替代Unlocker的文件解锁软件
[ref 3]: https://winstall.app/apps/CrystalRich.LockHunter — Install LockHunter with WinGet
[ref 4]: https://learn.microsoft.com/zh-tw/powershell/module/microsoft.powershell.utility/unblock-file — Unblock-File documentation
[ref 5]: https://blog.poychang.net/windows-zone-identifier-mark-of-the-web/ — Windows Zone.Identifier documentation
