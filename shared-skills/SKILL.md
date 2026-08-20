---
name: "shared-skills"
description: "Share a single skills directory across multiple AI coding tools (TRAE, CodeBuddy, Codex, DeepSeek Harness, etc.) on Windows using directory junctions, and hide the tool directories so only .dsh is visible. Invoke when the user wants all their AI tools to load the same set of skills from one place, avoid duplicating skills per-tool, centralize skill management, or clean up workspace clutter by hiding AI tool config folders."
---

# Shared Skills (Windows)

> **Platform: Windows only.** Uses Windows directory junctions (`mklink /J`) and hidden attributes (`attrib +h`) to let multiple AI coding tools read from a single skills directory while keeping the workspace clean.

## Goal

Let every AI tool's `<tool>/skills/` directory point to one shared source (e.g. `.dsh/skills/`) so that:

- Install a skill **once** → every tool sees it.
- Update or remove a skill in one place → all tools sync instantly.
- Zero disk overhead (junctions are filesystem pointers, not copies).
- **Only `.dsh` is visible** in the workspace — all other AI tool directories are hidden.

## Prerequisites

- Windows 10/11.
- A shared source directory that already contains skills (default: `.dsh/skills/`).
- Each target tool has (or can have) an empty `<tool>/skills/` directory.

## Supported Tools

Any AI tool that loads skills from a `<tool-root>/skills/` directory. Common examples:

| Tool | Skills directory |
|------|-----------------|
| DeepSeek Harness | `.dsh/skills/` |
| TRAE | `.trae/skills/` |
| CodeBuddy | `.codebuddy/skills/` |

The skill is **extensible** — any tool that follows the `<root>/skills/` convention can be added.

## Step 1 — Detect the workspace and tool directories

Run from the workspace root (the parent of `.dsh`, `.trae`, `.codebuddy`, etc.):

```powershell
# Find all AI tool directories that have a skills/ folder
$workspace = "D:\Projects"   # adjust to the actual workspace
Get-ChildItem -Path $workspace -Directory | ForEach-Object {
    $skillsPath = Join-Path $_.FullName "skills"
    if (Test-Path $skillsPath) {
        [PSCustomObject]@{
            Tool      = $_.Name
            SkillsDir = $skillsPath
            IsJunction = (Get-Item $skillsPath).Attributes -match "ReparsePoint"
        }
    }
} | Format-Table -AutoSize
```

This tells you:
- Which tools exist.
- Which ones are already junctions (already shared) vs. real directories.

## Step 2 — Designate the source directory

Choose the directory that holds the canonical skills. Default recommendation: `.dsh/skills/`.

```powershell
$source = "D:\Projects\.dsh\skills"
if (-not (Test-Path $source)) {
    Write-Error "Source skills directory does not exist: $source"
    return
}
```

> **Tip:** If the source directory does not exist yet, create it and install at least one skill into it before linking.

## Step 3 — Create junctions for each target tool

For each tool that is **not** already a junction:

### 3a. Remove the existing empty `skills/` directory

If the tool's `skills/` directory is a real directory (not a junction), remove it first:

```powershell
# Remove empty directory (safe: only remove if empty)
$targetSkills = "D:\Projects\.codebuddy\skills"
if ((Get-Item $targetSkills).Attributes -match "ReparsePoint") {
    Write-Host "Already a junction, skipping: $targetSkills"
} elseif ((Get-ChildItem $targetSkills).Count -eq 0) {
    # Safe to remove — empty directory
    Remove-Item -Path $targetSkills -Force
} else {
    Write-Warning "Directory is not empty, manual review needed: $targetSkills"
}
```

> ⚠️ **Safety check:** Never remove a real directory that contains files unless the user explicitly confirms. If it has content, ask the user whether to back it up or merge it into the source first.

### 3b. Create the junction

```powershell
cmd /c "mklink /J `"D:\Projects\.codebuddy\skills`" `"D:\Projects\.dsh\skills`""
cmd /c "mklink /J `"D:\Projects\.trae\skills`" `"D:\Projects\.dsh\skills`""
```

Expected output:
```
Junction created for D:\Projects\.codebuddy\skills <<===>> D:\Projects\.dsh\skills
Junction created for D:\Projects\.trae\skills <<===>> D:\Projects\.dsh\skills
```

## Step 4 — Hide AI tool directories (only `.dsh` visible)

After creating junctions, hide all AI tool directories so only `.dsh` shows in the workspace.

### 4a. Known AI tool directories

A comprehensive list of common AI coding tool config directories that should be hidden:

| Tool | Directory | Notes |
|------|-----------|-------|
| DeepSeek Harness | `.dsh` | **Keep visible** — this is the source |
| TRAE | `.trae` | Hide |
| CodeBuddy | `.codebuddy` | Hide |
| Codex | `.codex` | Hide |
| Cursor | `.cursor` | Hide |
| CLINE | `.cline` | Hide |
| Windsurf | `.windsurf` | Hide |
| Aider | `.aider` | Hide |
| GitHub Copilot | `.github` | Hide (⚠️ check for real workflows first) |
| Amazon CodeWhisperer | `.amazoncodewhisperer` | Hide |
| Tabnine | `.tabnine` | Hide |
| Continue | `.continue` | Hide |
| CursorView | `.cursorview` | Hide |
| Augment | `.augment` | Hide |
| CodeGeeX | `.codegeex` | Hide |
| Bito | `.bito` | Hide |
| Codeium | `.codeium` | Hide |
| Blackbox AI | `.blackbox` | Hide |
| Mintlify | `.mintlify` | Hide |

> **⚠️ Important:** `.github` is also used for GitHub Actions workflows. If your repo has real `.github/workflows/*.yml` files, **do NOT hide `.github`** — instead, just hide the specific AI tool subdirectories if any. Review the directory contents first.

### 4b. Detect and hide (preserving `.dsh`)

```powershell
$workspace = "D:\Projects"

# Directories to hide (exclude .dsh — it stays visible)
$hideList = @(
    ".trae",
    ".codebuddy",
    ".codex",
    ".cursor",
    ".cline",
    ".windsurf",
    ".aider",
    ".amazoncodewhisperer",
    ".tabnine",
    ".continue",
    ".cursorview",
    ".augment",
    ".codegeex",
    ".bito",
    ".codeium",
    ".blackbox",
    ".mintlify"
)

foreach ($dirName in $hideList) {
    $fullPath = Join-Path $workspace $dirName
    if (Test-Path $fullPath) {
        # Check if already hidden
        $item = Get-Item $fullPath
        if ($item.Attributes -match "Hidden") {
            Write-Host "  already hidden: $dirName"
        } else {
            attrib +h $fullPath
            Write-Host "  hidden: $dirName"
        }
    }
}

# Confirm .dsh is NOT hidden
$dshPath = Join-Path $workspace ".dsh"
if ((Get-Item $dshPath).Attributes -match "Hidden") {
    attrib -h $dshPath
    Write-Host "  restored visibility: .dsh"
} else {
    Write-Host "  visible (correct): .dsh"
}
```

### 4c. Verify

```powershell
# Only .dsh should appear (Windows hides attrib +h dirs by default in Explorer)
Get-ChildItem -Path $workspace -Directory -Force | ForEach-Object {
    $hidden = $_.Attributes -match "Hidden"
    [PSCustomObject]@{
        Name    = $_.Name
        Hidden  = $hidden
    }
} | Format-Table -AutoSize
```

Expected output (only `.dsh` is visible, everything else hidden):

```
Name        Hidden
----        ------
.dsh        False
.codebuddy  True
.trae       True
```

### 4d. Show hidden directories again (undo)

If you ever need to see the hidden directories again:

```powershell
# Unhide a single directory
attrib -h "D:\Projects\.trae"

# Unhide all AI tool directories at once
attrib -h "D:\Projects\.trae"
attrib -h "D:\Projects\.codebuddy"
attrib -h "D:\Projects\.codex"
# ... etc
```

> **Tip:** In Windows File Explorer, you can also toggle "View → Show hidden files" to temporarily see hidden directories without removing the hidden attribute.

## Step 5 — Verify skills sharing

```powershell
# List skills through the junction — should match the source
Get-ChildItem "D:\Projects\.codebuddy\skills" | Select-Object Name
Get-ChildItem "D:\Projects\.trae\skills" | Select-Object Name

# Confirm junction attribute
(Get-Item "D:\Projects\.codebuddy\skills").Attributes
# Should contain "ReparsePoint"
```

## Adding a New Tool Later

When a new AI tool is installed, repeat Step 3 (junction) and Step 4 (hide) for it:

```powershell
# Create junction
cmd /c "mklink /J `"D:\Projects\.newtool\skills`" `"D:\Projects\.dsh\skills`""

# Hide the directory
attrib +h "D:\Projects\.newtool"
```

The new tool immediately has access to all existing skills, and stays out of sight.

## Breaking a Junction (Unshare)

If a tool should have its own independent skills again:

```powershell
# Remove the junction (does NOT delete the source)
cmd /c "rmdir `"D:\Projects\.codebuddy\skills`""

# Create a fresh real directory
New-Item -ItemType Directory -Path "D:\Projects\.codebuddy\skills" -Force

# Optionally copy skills from source if desired
Copy-Item -Path "D:\Projects\.dsh\skills\*" -Destination "D:\Projects\.codebuddy\skills\" -Recurse

# Unhide the directory
attrib -h "D:\Projects\.codebuddy"
```

> **Note:** `rmdir` on a junction removes the link only — the source directory and its contents are untouched.

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| `Cannot create a file when that file already exists.` | Target `skills/` directory already exists and is not a junction | Remove the existing directory first (`Remove-Item`), then re-run `mklink /J` |
| `Access is denied` | Insufficient permissions or target is a non-empty real directory | Ensure the directory is empty before removal, or run shell as Administrator |
| Junction points to wrong source | Old/stale junction | Remove junction (`rmdir`), re-create with correct target |
| Skills not appearing in the tool | Tool caches skill list on startup | Restart the tool after creating the junction |
| Directory still visible after `attrib +h` | Explorer "Show hidden files" is enabled | This is expected — the attribute is set; toggle off "Show hidden files" in Explorer |
| `.dsh` accidentally hidden | Ran `attrib +h` on `.dsh` | Run `attrib -h "D:\Projects\.dsh"` to restore visibility |
| `.github` has real workflows | Hiding `.github` would hide CI/CD files | Skip `.github` if it contains `workflows/` — only hide if it's purely AI tool config |

## Files

- `SKILL.md` — this skill.
