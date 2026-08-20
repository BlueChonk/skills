---
name: "motrix-download"
description: "Control Motrix download manager to monitor, speed up, and manage download tasks. Invoke when the user's agent is downloading files slowly and needs Motrix to take over or boost downloads, or when the user explicitly asks to manage Motrix downloads, check download status, add download URLs, or optimize download speeds. Use when browser-based downloads are slow and Motrix can accelerate them via aria2 engine, or when the user asks to download files through Motrix."
---

# Motrix Download Manager Skill

> **Platform: Windows / macOS / Linux.** This skill depends on the `@motrix/cli` npm package. It auto-discovers and controls the locally running Motrix desktop application, or can pair with a remote Motrix server (Docker/headless) via device-code pairing.

This skill wraps the local **Motrix** download manager CLI (`motrix`) to help AI agents manage file downloads. Motrix uses **aria2** as its download engine, which provides significantly faster download speeds than browser-based downloads through multi-connection downloading, segmented transfers, and BT/magnet support.

## Tool Location

```
C:\Program Files\nodejs\motrix.ps1    (Windows, global npm install)
```

Install via:
```bash
npm install -g @motrix/cli    # requires Node.js >= 22
```

## Readiness Check (run before every invocation)

```powershell
# Bail out if CLI is missing
$motrix = Get-Command motrix -ErrorAction SilentlyContinue
if (-not $motrix) {
    npm install -g @motrix/cli
}
motrix --version   # confirms CLI is available
```

## Core CLI Commands

```powershell
# Add a download task
motrix add <url> [--save-dir <path>]

# List all tasks
motrix list

# Stream real-time progress as NDJSON
motrix watch --stats

# Pair with remote/headless instance
motrix pair --name <device-name>
```

## Key Operations

### 1. Check Download Status

```powershell
motrix list
```

Returns a JSON array of all tasks with fields: `id`, `title`, `status`, `progress`, `downloadSpeed`, `uploadSpeed`, `totalLength`, `completedLength`, `savePath`.

### 2. Speed Up Downloads (The Core Use Case)

When the agent's browser download is slow, hand off the URL to Motrix:

```powershell
# Step 1: Add the URL to Motrix (aria2 will multi-thread it)
motrix add "https://example.com/large-file.iso" --save-dir "$env:USERPROFILE\Downloads"

# Step 2: Monitor progress
motrix watch --stats
```

Motrix's aria2 engine typically achieves 2-10x faster downloads than a browser by:
- Opening multiple connections to the same server
- Segmented file downloading
- Auto-retrying failed segments

### 3. Check and Optimize Speed Limits

```powershell
# Query current speed limit state via MDXP (when connected to server)
# Or use the CLI to check if turtle mode is active
motrix list   # inspect task speeds
```

### 4. Pause / Resume / Delete Tasks

```powershell
# These use MDXP commands — available when Motrix desktop app is running
# Pause a task
motrix pause --id <task-id>

# Resume a task
motrix resume --id <task-id>

# Delete a task
motrix remove --id <task-id>

# Pause all / Resume all
motrix pause-all
motrix resume-all
```

### 5. Watch Real-Time Progress

```powershell
motrix watch --stats
```

Streams NDJSON (newline-delimited JSON) with real-time download statistics. Useful for monitoring large downloads.

## When to Use

Invoke this skill when:

1. **Browser download is slow**: The user/agent reports a download is taking too long. Hand off the URL to Motrix for accelerated downloading.
2. **Large file download**: Files >100MB benefit significantly from Motrix's multi-connection downloading.
3. **BT/Magnet download**: Motrix natively supports BitTorrent and magnet links.
4. **Batch downloads**: Download multiple files simultaneously.
5. **Remote server download**: Pair with a Motrix Docker server on a NAS or remote machine.
6. **User explicitly asks** to use Motrix, check download status, or manage download tasks.

## How to Use (Workflow)

1. **Identify the download URL** from the user's request or the browser context.
2. **Check if Motrix CLI is available** — install if missing.
3. **Add the URL to Motrix**:
   ```powershell
   motrix add "<url>" --save-dir "$env:USERPROFILE\Downloads"
   ```
4. **Monitor progress** (optional):
   ```powershell
   motrix watch --stats
   ```
5. **Report status** back to the user.

## Example Interaction

User: "下载这个文件太慢了，帮我用 Motrix 加速: https://example.com/ubuntu.iso"

Assistant flow:

1. Verify Motrix CLI: `motrix --version`
2. Add to Motrix: `motrix add "https://example.com/ubuntu.iso" --save-dir "$env:USERPROFILE\Downloads"`
3. Confirm task added: `motrix list`
4. Optionally monitor: `motrix watch --stats`
5. Report: "已添加到 Motrix，aria2 多线程下载中，预计速度比浏览器快 2-10 倍。"

## Safety Notes

- ⚠️ `motrix add` starts downloading immediately — confirm the URL and save directory with the user first.
- ⚠️ Downloads use disk I/O — avoid starting too many concurrent large downloads on slow disks.
- ⚠️ When pairing with a remote server, the device-code flow requires human approval in the Motrix app.
- BT/magnet downloads may be subject to local laws and network policies — ensure the user has rights to download the content.

## Troubleshooting

### CLI not found
```powershell
npm install -g @motrix-cli    # requires Node.js >= 22
```

### No Motrix app running
The CLI auto-discovers the local Motrix desktop app via the bridge endpoint. Make sure the Motrix desktop application is running. For headless/remote servers, use `motrix pair`.

### Slow downloads even in Motrix
- Check if turtle mode (speed limit) is active in Motrix settings
- Verify the server supports multi-connection downloads (some servers limit per-IP connections)
- For BT downloads, ensure DHT and tracker connectivity is good

### Pairing fails
- Ensure both devices are on the same network
- Check that the Motrix app is running and accessible
- The user must approve the device-code pairing request in the Motrix app

## Advanced: MDXP Protocol

Motrix communicates via **MDXP** (Motrix Download eXchange Protocol), a JSON-RPC 2.0 based protocol. For advanced integrations:

- **Server mode**: Run Motrix as a headless Docker server (`motrixapp/motrix-server`)
- **API port**: 8080 (Web/API), 16801 (MDXP bridge)
- **Authentication**: operator token or device-code pairing
- **Key endpoints**: `POST /api/tasks/pause-all`, `POST /api/tasks/resume-all`

See `docs/docker-server.md` in the Motrix repository for server deployment details.

## Additional Features (GUI only)

- **Browser extension**: Chrome/Firefox extension to intercept downloads and send to Motrix
- **URL Resolver**: Plugin to extract actual download links from media pages
- **Filename Template**: Auto-rename files on save using templates
- **Page Scraper**: Extract direct file links from HTML pages
- **System tray**: Stay in background with system tray integration
- **Auto-start**: Launch on system boot

These features are available through the graphical interface and cannot be invoked via CLI.
