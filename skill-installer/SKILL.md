---
name: skill-installer
description: "Search, evaluate, and install agent skills for DeepSeek Harness (DSH) from curated sources, GitHub repositories, or the local .agents shared directory. Use when the user wants to find a new capability, install a skill from a repo, browse what is available, or sync skills across tools."
---

# Skill Installer

Helps discover and install skills for DSH. Skills may come from:

1. **Curated sources** — e.g. GitHub repos with community skills (`owner/skills/skills/...`)
2. **GitHub repos** — any public or private GitHub repository containing a `SKILL.md`
3. **Local shared directory** — `C:\Users\<user>\.agents\skills\` (shared across Codex, CodeBuddy, Trae)

## Communication

When listing skills, output approximately:

```
Available skills:
1. skill-one         — Short description
2. skill-two         — Short description (already installed)
3. skill-three       — Short description
Which ones would be installed?
```

After installing a skill, tell the user it will be available on their next turn.

## Install from GitHub

When the user provides a GitHub repo or URL, download the skill folder into the DSH skills directory.

### For a public repo (direct download):

```powershell
# Clone the repo sparse-checkout for just the skill folder
git clone --depth 1 --filter=blob:none --sparse https://github.com/<owner>/<repo>.git "$env:TEMP\skill-repo"
Set-Location "$env:TEMP\skill-repo"
git sparse-checkout set "skills/<skill-name>"
Copy-Item -Recurse "skills/<skill-name>" "D:\Projects\.dsh\skills\<skill-name>"
```

### For a curated list (fetch from GitHub API):

```powershell
# List skills from a curated directory in a repo
$apiUrl = "https://api.github.com/repos/<owner>/<repo>/contents/skills/.curated"
$response = Invoke-RestMethod -Uri $apiUrl
$response | ForEach-Object { Write-Host $_.name }
```

### Rules

- Abort if the destination skill directory already exists (ask before overwriting).
- The installed folder must contain a valid `SKILL.md` with YAML frontmatter.
- Default install path: `D:\Projects\.dsh\skills\<skill-name>`.
- For private repos, ensure `GITHUB_TOKEN` or `GH_TOKEN` is set, or use existing git credentials.
- Git fallback: try HTTPS first, then SSH.

## Install from Local Shared Directory

The `.agents\skills` directory is shared across multiple tools on this machine:

```powershell
# List shared skills
Get-ChildItem "$env:USERPROFILE\.agents\skills" -Directory | Select-Object Name
```

To "install" a shared skill into DSH, either:
- Copy it: `Copy-Item -Recurse "$env:USERPROFILE\.agents\skills\<name>" "D:\Projects\.dsh\skills\<name>"`
- Or create a junction: `cmd /c "mklink /J ""D:\Projects\.dsh\skills\<name>"" ""$env:USERPROFILE\.agents\skills\<name>"""`

A junction is preferred — changes to the shared skill propagate to DSH automatically.
