# Motrix Download Skill

English | [简体中文](README.zh.md)

Control the local **Motrix** download manager via CLI to hand off slow browser downloads to Motrix's aria2 engine for accelerated downloading.

---

## Naming

This skill is named `motrix-download`, directly reflecting its core purpose: **managing download tasks via Motrix**.

---

## Why

Browser-based downloads often suffer from single-threaded transfers, no resume support, and slow speeds on large files.

**Motrix** uses the **aria2** download engine, providing:
- **Multi-connection segmented downloading**: 2-10x faster than browser downloads
- **Resume support**: Continue interrupted downloads
- **BT/Magnet support**: Native BitTorrent and magnet link handling
- **Batch management**: Download and manage multiple files simultaneously

## Features

- **URL Takeover**: Hand off browser download URLs to Motrix for immediate acceleration
- **Status Monitoring**: Real-time download progress, speed, and ETA
- **Task Management**: Pause, resume, delete download tasks
- **Cross-platform**: Windows, macOS, and Linux
- **Remote Pairing**: Pair with Motrix Docker servers on NAS or remote machines

## Requirements

- **Node.js >= 22**
- **Motrix CLI**: `npm install -g @motrix/cli`
- **Motrix Desktop App** (optional): For local bridge connection

## Install

```powershell
npm install -g @motrix/cli
```

## Quick Start

```powershell
# Add a download (aria2 multi-threaded acceleration)
motrix add "https://example.com/large-file.iso" --save-dir "$env:USERPROFILE\Downloads"

# List all tasks
motrix list

# Monitor progress in real-time
motrix watch --stats

# Pause / resume tasks
motrix pause --id <task-id>
motrix resume --id <task-id>

# Pause all / Resume all
motrix pause-all
motrix resume-all
```

## Core Scenarios

### Scenario 1: Browser Download Too Slow, Hand Off to Motrix

```powershell
# Hand off the URL to Motrix
motrix add "https://releases.ubuntu.com/24.04/ubuntu-24.04.1-desktop-amd64.iso" --save-dir "$env:USERPROFILE\Downloads"

# Monitor progress
motrix watch --stats
```

### Scenario 2: Batch Downloads

```powershell
motrix add "https://example.com/file1.zip" --save-dir "$env:USERPROFILE\Downloads"
motrix add "https://example.com/file2.zip" --save-dir "$env:USERPROFILE\Downloads"
motrix add "https://example.com/file3.zip" --save-dir "$env:USERPROFILE\Downloads"

motrix list
```

### Scenario 3: BT/Magnet Downloads

```powershell
motrix add "magnet:?xt=urn:btih:..." --save-dir "$env:USERPROFILE\Downloads"
motrix add "C:\path\to\file.torrent" --save-dir "$env:USERPROFILE\Downloads"
```

## Readiness Check

```powershell
$motrix = Get-Command motrix -ErrorAction SilentlyContinue
if (-not $motrix) {
    npm install -g @motrix/cli
}
motrix --version
```

## Safety Notes

- ⚠️ `motrix add` starts downloading immediately — confirm URL and save path first
- ⚠️ Too many concurrent downloads may saturate disk I/O
- ⚠️ BT/magnet downloads — ensure compliance with local laws
- ⚠️ Remote pairing requires manual approval in the Motrix app

## Troubleshooting

### CLI not found
```powershell
npm install -g @motrix/cli    # requires Node.js >= 22
```

### Cannot connect to Motrix
Ensure the Motrix desktop app is running. For remote servers, use `motrix pair`.

### Still slow in Motrix
Check turtle mode (speed limit), verify server supports multi-connection, and check DHT/tracker status for BT downloads.

### Pairing fails
Ensure both devices are on the same network, Motrix app is running, and the user approves the device-code request.

## Repository Structure

```text
.
├── SKILL.md                    # Skill manifest + usage guide
├── README.md                   # This file (English)
├── README.zh.md                # Chinese version
└── scripts/
    └── motrix-boost.mjs        # One-click boost script: take over URL and monitor progress
```

## References

- [Motrix Official Site](https://motrix.app/)
- [Motrix GitHub](https://github.com/agalwood/Motrix)
- [@motrix/cli Docs](https://github.com/motrixapp/cli)
- [aria2 Docs](https://aria2.github.io/)
