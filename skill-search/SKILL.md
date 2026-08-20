---
name: skill-search
description: Find, evaluate, and install agent skills (SKILL.md) for Codex/CodeBuddy/TRAE and compatible tools. Trigger when the user needs a new capability, wants to search/install a skill, or asks which skill to use for a task. Use the curated skill-marketplace index, assess each candidate by source reputation (star count/upstream origin), and install the winner into this repo's .xxxx/skills directory.
---

# Skill Search

Extends the agent with a curated index of skill marketplaces and a repeatable
workflow to discover, evaluate, and install skills.

## When to use

Use this skill when the user:

- needs a capability the model lacks and asks "find a skill for X" / "is there a skill to do Y";
- wants to search, browse, or install an agent skill;
- asks which of several skills is best / most trustworthy for a task.

Do **not** use it for ordinary coding that doesn't need a skill, or stonewalled
searches where the user already has a specific skill in mind (just install that one).

## Curated skill-marketplace index

Search these sites when the user needs to discover skills. Prefer ones that give
stars and community reputation.

| Name | URL | Notes |
|------|-----|-------|
| Smithery | https://smithery.ai/skills | Popular marketplace, star/usage data |
| SkillHub (CN) | https://skillhub.cn/skills?sortBy=score | Chinese-language community, score sorted |
| ModelScope Skills (魔搭) | https://modelscope.cn/skills | Alibaba ModelScope skills center |
| ClawHub CN mirror | https://cn.clawhub-mirror.com/ | Mirror for China network |
| ClawHub | https://clawhub.ai/skills | Multi-tool skill registry |
| AgentSkills Directory | https://agentskill.sh/ | 274k+ skills for various agents |
| LobeHub (CN) | https://lobehub.com/zh/skills | LobeHub Agent SKILLs marketplace |
| Agent Skills Directory | https://www.skills.sh/ | Skill directory |
| SkillsMP | https://skillsmp.com/ | Codex skills marketplace |
| anthropics/skills (official) | https://github.com/anthropics/skills | Anthropic official public skills repo |

## Workflow

1. **Understand the need.** Ask or infer the capability, platform (Codex /
   CodeBuddy / TRAE / other), and any constraints (language, license, offline).

2. **Search the index.** Query the marketplaces above. Cross-reference at least
   2-3 sources; a skill may be mirrored across ClawHub, LobeHub and GitHub.

3. **Evaluate candidates.** For each hit, check:
   - **Origin**: which upstream GitHub repo it really ships from (not the mirror).
   - **Reputation**: star count of the upstream repo; prefer high-star, active repos.
   - **Fit**: does `description` match the task? Is the license acceptable?
   - **Freshness**: check the upstream default-branch last update.

4. **Recommend one.** Give a short comparison (source repo, stars, fit) and the
   recommended winner. Ask the user to confirm before installing.

5. **Install** (after confirmation) into this repo:
   ```text
   .xxxx/skills/<skill-slug>/
     ├── SKILL.md      (required)
     ├── scripts/      (optional)
     ├── references/   (optional)
     └── assets/       (optional)
   ```
   Fetch the directory from the upstream repo (ideally `git clone --depth 1
   --filter=blob:none --sparse` then `git sparse-checkout set <skill-dir>`), so
   you get the real latest files, not a stale mirror copy.

6. **Document.** Record the source repo, stars, and version so future searches
   can judge freshness. Add or update this repo's root README when the skill is
   a keeper.

## Guidelines

- Never install from an unverifiable source; always resolve the true upstream repo.
- Prefer official (Anthropic/OpenAI/ModelScope) and high-star repos.
- Keep the index above up to date if the user adds more bookmarks.
- Skills are per the open Agent Skills standard (SKILL.md with `name` +
  `description`), so a directory pulled once works in Codex, CodeBuddy, and TRAE alike.