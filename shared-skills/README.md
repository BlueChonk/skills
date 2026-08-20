# Shared Skills

Share a single skills directory across multiple AI coding tools on Windows using directory junctions.

## Overview

This skill lets all your AI coding tools (TRAE, CodeBuddy, Codex, DeepSeek Harness, etc.) read from one shared skills directory using Windows directory junctions (`mklink /J`). Install a skill once, and every tool sees it instantly.

## How It Works

1. Choose a source directory (default: `.dsh/skills/`)
2. Create junctions from each tool's `skills/` directory to the source
3. Hide AI tool directories so only `.dsh` is visible in the workspace

## Quick Setup

```powershell
# Create junctions
cmd /c "mklink /J `"D:\Projects\.codebuddy\skills`" `"D:\Projects\.dsh\skills`""
cmd /c "mklink /J `"D:\Projects\.trae\skills`" `"D:\Projects\.dsh\skills`""

# Hide tool directories (keep .dsh visible)
attrib +h "D:\Projects\.trae"
attrib +h "D:\Projects\.codebuddy"
```

## Features

- **Zero disk overhead** — junctions are filesystem pointers, not copies
- **Instant sync** — update a skill once, all tools see the change
- **Clean workspace** — only `.dsh` is visible, other tool directories are hidden
- **Extensible** — add any tool that follows the `<root>/skills/` convention

## Supported Tools

| Tool | Skills Directory |
|------|-----------------|
| DeepSeek Harness | `.dsh/skills/` |
| TRAE | `.trae/skills/` |
| CodeBuddy | `.codebuddy/skills/` |
| Codex | `.codex/skills/` |
| Cursor | `.cursor/skills/` |

## Undo

```powershell
# Remove junction (source is NOT deleted)
rmdir "D:\Projects\.codebuddy\skills"

# Unhide directory
attrib -h "D:\Projects\.codebuddy"
```

## Requirements

- Windows 10/11
- A shared source directory with skills (default: `.dsh/skills/`)
