# Skills

English | [中文](README.zh.md)

A collection of agent skills. `SKILL.md` is the entry point for each skill. Skills written here (root level, alongside `.xxxx/`) are our own and ship with English + Chinese READMEs; third-party skills live under `.xxxx/skills/`.

## Our skills

- [`skill-search`](skill-search/README.md) — find, evaluate, and install agent skills using a curated marketplace index (Smithery, ClawHub, LobeHub, ModelScope, anthropics/skills, etc.).
- [`deepseek-harness-autostart`](deepseek-harness-autostart/README.md) — installs `@deepseek-ai/dsh` and registers the `dsh web` browser UI as a boot auto-start service with crash restart.
- [`iobit-unlocker-cli`](iobit-unlocker-cli/README.md) — wraps the local IObit Unlocker CLI so an agent can force-delete/rename/move files locked by other processes.

## Third-party skills (`.xxxx/skills/`)

| Skill | Description |
|-------|-------------|
| [`cli-anything`](.xxxx/skills/cli-anything/SKILL.md) | AI CLI for Anything — a shell-side skill enabling codex-style agent workflows (`agents/openai.yaml`). |
| [`review/code-review-ai-ai-review`](.xxxx/skills/review/code-review-ai-ai-review/SKILL.md) | Self-contained AI code review skill authored for lighter-weight contexts. |
| [`review/code-review-checklist`](.xxxx/skills/review/code-review-checklist/SKILL.md) | A focused AI coding/review checklist skill for lightweight agents. |
| [`review/code-review-excellence`](.xxxx/skills/review/code-review-excellence/SKILL.md) | Full, modern enterprise code review skill: guide, references, and implementation playbook. |
| [`review/code-reviewer`](.xxxx/skills/review/code-reviewer/SKILL.md) | Structural PR-review agent skill with criteria and workflow. |
| [`ui-ux-pro-max`](.xxxx/skills/ui-ux-pro-max/SKILL.md) | UI/UX design intelligence: 22 tech-stack catalogs, styles, colors, typography, motion, icons, plus scripts and references. |

## Using

Copy the skill folder into your tool's skill directory (`.xxxx/skills/`) and follow its `SKILL.md`.

## Layout

```text
.
├── README.md
├── README.zh.md
├── .xxxx/skills/                 # third-party skills (mirrors Codex layout)
│   ├── cli-anything/
│   ├── review/{code-review-ai-ai-review,code-review-checklist,code-review-excellence,code-reviewer}/
│   └── ui-ux-pro-max/
├── skill-search/                  # our skills (root level, alongside .xxxx/)
├── deepseek-harness-autostart/    #   (English + Chinese READMEs)
└── iobit-unlocker-cli/
```

## License

[MIT](LICENSE)