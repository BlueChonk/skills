# Skill Search

English | [中文](README.zh.md)

Extends an agent with a curated index of skill marketplaces and a repeatable
workflow to discover, evaluate, and install agent skills (`SKILL.md`).

## What it does

- Indexes 10 community/offical skill marketplaces (Smithery, SkillHub, ModelScope,
  ClawHub, ClawHub CN mirror, AgentSkills, LobeHub, skills.sh, SkillsMP,
  anthropics/skills).
- Walks the user from need → search → evaluate → recommend → install → document.
- Judges candidates by true upstream repo, star count, license, and freshness —
  not by mirror popularity.

## When to use

- The user needs a capability the model lacks and asks "find a skill for X".
- The user wants to search, browse, or install an agent skill.
- The user asks which of several skills is best / most trustworthy for a task.

## How it works

Tells the agent to:

1. Understand the need (capability, target harness, constraints).
2. Cross-reference 2-3+ marketplaces from the index.
3. Evaluate each hit (upstream origin, stars, fit, freshness).
4. Recommend one with a short comparison and wait for confirmation.
5. Install via sparse shallow clone into `skill-search/`'s sibling layout.
6. Record source + version so future searches stay fresh.

The full instructions live in [`SKILL.md`](SKILL.md).

## Layout

```text
skill-search/
├── SKILL.md
├── README.md
└── README.zh.md
```

## License

[MIT](../LICENSE)