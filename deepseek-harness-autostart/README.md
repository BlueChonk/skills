# DeepSeek Harness Auto-Start

English | [简体中文](README.zh.md)

Installs `@deepseek-ai/dsh` and registers the `dsh web` browser UI as a **boot auto-start** service with crash restart, on Windows.

---

## Why this exists

Opening the DeepSeek Harness browser UI (`npx @deepseek-ai/dsh web`) manually every time is
tedious. This skill records the whole reproducible flow so an agent (or a human) can set up
the service on any Windows machine — even one with no Node.js installed at all:

1. **Node.js / npm** check & install at a version matching `deepseek-harness`'s
   `engines.node` (`^22.19.0 || >=24.0.0`). Installed only when missing.
2. **`@deepseek-ai/dsh`** — the CLI behind `npx @deepseek-ai/dsh web` — installed globally
   with absolute paths (no fragile `npx`/PATH resolution at boot).
3. **Boot auto-start** via Task Scheduler (`schtasks`, `At system start up`, `SYSTEM`
   account, highest privileges) with a crash-restart wrapper.

## Features

- **Idempotent setup** — reusing it on an already-prepared machine skips installation.
- **Port guard** — if `dsh web` is already serving the port (e.g. started manually), the
  wrapper exits instead of double-binding.
- **Crash restart** — the wrapper relaunches `dsh web` automatically.
- **Logging** — all launches/errors/restarts are appended to a single log file.
- **Harness-agnostic** — plain PowerShell + `SKILL.md` in the standard frontmatter format.

## Quick start

1. Read `SKILL.md` for the full step-by-step guide.
2. Copy `scripts/start-dsh-web.ps1`, fill in `$Node`, `$DshBin`, `$Log` (they're
   placeholders), and ensure the log directory exists.
3. Register the scheduled task:

   ```powershell
   schtasks /Create /TN "DeepSeekHarnessWeb" `
     /TR "powershell.exe -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File D:\deepseek-harness-autostart-skill\scripts\start-dsh-web.ps1" `
     /SC ONSTART /RU SYSTEM /RL HIGHEST /F
   ```

4. Verify with `schtasks /Query` and `Test-NetConnection 127.0.0.1 -Port 3080`.

## Compatibility

| Harness | Notes |
| ------- | ----- |
| Codex / CodeBuddy / TRAE | Put in `.xxxx/skills/<name>/` |

## Requirements

- **Windows** only.
- **PowerShell** (preinstalled on Windows 10/11).
- **Node.js** — auto-installed by this skill if missing; a compatible version must satisfy
  `^22.19.0 || >=24.0.0`.
- **Admin/System rights** once to register the boot scheduled task.