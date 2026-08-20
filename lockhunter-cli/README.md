# LockHunter CLI Skill

English | [简体中文](README.zh.md)

Wraps the local **LockHunter** command-line tool to let agents force-delete or force-unlock paths held by other processes on Windows only.

---

## Naming Convention

This skill is named `lockhunter-cli` (not just `lockhunter`) for two reasons:

1. **Distinction**: `LockHunter` alone refers to the GUI application. The `-cli` suffix signals that this skill specifically wraps the **command-line interface** of LockHunter.
2. **Convention**: In the AI agent skills ecosystem, CLI-wrapping skills commonly use the `-cli` suffix (e.g., skills that wrap `git-cli`, `docker-cli`, etc.). This makes it immediately clear to both humans and AI agents that the skill is about the CLI interface, not the GUI tool.

The `name` field in this SKILL.md frontmatter is `lockhunter-cli`, which matches the directory name.

---

## Why

When a process still holds a handle to a file or folder, Windows usually refuses to delete, move, or rename it. Retrying the same command is pointless — you need a tool that can break the lock at the kernel level. LockHunter does exactly that [ref:1][ref:2].

## Features

- **One-liner wrapper** `LockHunter.exe /delete /silent "Path..."` — simple parameters, clear exit codes.
- **Silent mode** — `/silent` flag for no-GUI automation.
- **Multiple operations** — unlock, delete, permanent delete, kill processes.
- **Standard install** — via winget or official installer to the default path.
- **Cross-platform agent** — pure CLI + standard `SKILL.md` frontmatter.

## Compatibility

| Workspace | Notes |
| --------- | ----- |
| Codex / CodeBuddy / TRAE | Place in `.xxxxx/skills/<name>/` |

## Requirements

- **Windows only** (the binary and its kernel driver are Windows-only).
- **Administrator privileges** for installation and execution.

> Do **not** use this skill on macOS / Linux. Use native tools instead: `lsof` + `kill`, `unlink`, `fuser -k`, `rm -rf`, or PowerShell Core's `Move-Item`.

## Install

### Option 1: winget (recommended)

```powershell
winget install --id CrystalRich.LockHunter --exact
```

### Option 2: Official installer

```powershell
# 1. Download to user's Downloads folder
$dl = "$env:USERPROFILE\Downloads\lockhunter-setup.exe"
if (-not (Test-Path $dl)) {
    Invoke-WebRequest -Uri "https://lockhunter.com/assets/lockhunter-setup.exe" -OutFile $dl
}

# 2. Silent install (needs admin)
Start-Process -FilePath $dl `
    -ArgumentList '/VERYSILENT','/SUPPRESSMSGBOXES','/NORESTART' `
    -Wait

# 3. Verify
Test-Path "C:\Program Files (x86)\LockHunter\LockHunter.exe"
```

## Quick Start

```powershell
# Unlock file (release handles, keep file)
& "C:\Program Files (x86)\LockHunter\LockHunter.exe" /unlock /silent "C:\locked\file.dll"

# Unlock and delete (to Recycle Bin)
& "C:\Program Files (x86)\LockHunter\LockHunter.exe" /delete /silent "C:\temp\virus.exe"

# Permanently delete (bypass Recycle Bin)
& "C:\Program Files (x86)\LockHunter\LockHunter.exe" /delete /delperm /silent "C:\temp\virus.exe"

# Silent delete (no GUI)
& "C:\Program Files (x86)\LockHunter\LockHunter.exe" /delete /silent "C:\temp\locked.log"

# Kill locking processes then delete
& "C:\Program Files (x86)\LockHunter\LockHunter.exe" /delete /kill /silent "C:\Program Files\BadApp"
```

## CLI Reference

```
LockHunter.exe [/unlock] [/delete [/delperm]] [/kill] [/silent] [/exit] [file or folder path]
```

### Parameters

| Parameter | Alias | Required | Description |
| --------- | ----- | -------- | ----------- |
| `/unlock` | `-u` | Optional | Unlock file/folder, close all handles and unload DLLs |
| `/delete` | `-d` | Optional | Unlock and delete file/folder (includes unlock; do not combine with `/unlock`) |
| `/delperm` | `-dp` | Optional | Must be used with `/delete`; permanently delete, bypassing Recycle Bin |
| `/kill` | `-k` | Optional | Kill all processes started from the specified path |
| `/silent` | `-sm` | Optional | Silent mode, no GUI, auto-exit (**recommended for AI agents**) |
| `/exit` | `-x` | Optional | Auto-exit after task completion |
| `[path]` | — | Optional | File or folder path. Supports full path or partial path prefix matching |

> **Note**: `/delete` already includes unlock. Do not use `/unlock` and `/delete` together.
> **Recommended**: Always use `/silent` when invoking via AI agent to avoid GUI popups.

### Path Handling

- **Full path**: `C:\Program Files\somefile.exe`
- **Partial path**: Supports prefix matching. For example, `C:\Docume` matches `C:\Documents and Settings`

### Exit Codes

| Exit Code | Meaning |
| --------- | ------- |
| `0` | Operation completed successfully |
| `1` | Failed to delete or unlock file |
| `2` | Technical error occurred during processing |

## Examples

### 1. Unlock a file

```powershell
& "C:\Program Files (x86)\LockHunter\LockHunter.exe" /unlock /silent "C:\locked\file.dll"
```

### 2. Unlock and delete (to Recycle Bin)

```powershell
& "C:\Program Files (x86)\LockHunter\LockHunter.exe" /delete /silent "C:\temp\virus.exe"
```

### 3. Permanently delete (bypass Recycle Bin)

```powershell
& "C:\Program Files (x86)\LockHunter\LockHunter.exe" /delete /delperm /silent "C:\temp\virus.exe"
```

### 4. Silent delete (for automation)

```powershell
& "C:\Program Files (x86)\LockHunter\LockHunter.exe" /delete /silent "C:\temp\locked.log"
```

### 5. Kill locking processes then delete

```powershell
& "C:\Program Files (x86)\LockHunter\LockHunter.exe" /delete /kill /silent "C:\Program Files\BadApp"
```

### 6. Silent permanent delete (most aggressive)

```powershell
& "C:\Program Files (x86)\LockHunter\LockHunter.exe" /delete /delperm /silent "C:\Stubborn\delete.me"
```

## Readiness Check (before every invocation)

```powershell
if ($IsLinux -or $IsMacOS) { Write-Error "Windows only. Aborting."; return }

$exe = "C:\Program Files (x86)\LockHunter\LockHunter.exe"
if (-not (Test-Path $exe)) {
    winget install --id CrystalRich.LockHunter --exact
}
```

## Safety Notes

- ⚠️ Use `/kill` with caution — it terminates processes and may cause data loss.
- ⚠️ Use `/delperm` with caution — it permanently deletes files, bypassing the Recycle Bin.
- ⚠️ Never target `C:\Windows`, `C:\Program Files`, or system directories without explicit confirmation.
- ⚠️ Prefer `/unlock` over `/delete` when the goal is just to release a lock so another tool can finish its work.

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

## Repository Structure

```text
.
├── SKILL.md                    # Skill manifest + usage guide (for agent)
├── README.md                   # This file (English)
├── README.zh.md                # Chinese version (kept in sync)
└── scripts/
    ├── unlockhunter.mjs        # Wrapper exe + auto-close dialog
    └── close-lockhunter-dialog.ps1  # Send WM_CLOSE to residual windows
```

## Limitations

- **Ineffective against rootkit-level locks**: If a path is held by a true rootkit, even LockHunter may not be able to delete it.
- Forced operations are **destructive**. `/delete` is irreversible — always double-check the target path before running.
- LockHunter loads its driver on each invocation; the driver service remains (stopped) after use.

## References

- [ref 1]: LockHunter official website — https://lockhunter.com/
- [ref 2]: LockHunter 替代Unlocker的文件解锁软件 — https://cloud.tencent.cn/developer/article/2123019
- [ref 3]: Install LockHunter with WinGet — https://winstall.app/apps/CrystalRich.LockHunter
- [ref 4]: Unblock-File PowerShell docs — https://learn.microsoft.com/zh-tw/powershell/module/microsoft.powershell.utility/unblock-file
- [ref 5]: Windows Zone.Identifier docs — https://blog.poychang.net/windows-zone-identifier-mark-of-the-web/
