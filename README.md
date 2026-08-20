# Skills

English | [中文](README.zh.md)

A collection of agent skills. `SKILL.md` is the entry point for each skill.

## Our skills

- [`homepage-dev`](homepage-dev/README.md) — personal homepage project conventions and structure guide for a Vue 3 + Vite single-page application.
- [`shared-skills`](shared-skills/README.md) — share a single skills directory across multiple AI coding tools using Windows directory junctions.
- [`skill-search`](skill-search/README.md) — find, evaluate, and install agent skills using a curated marketplace index.
- [`deepseek-harness-autostart`](deepseek-harness-autostart/README.md) — installs `@deepseek-ai/dsh` and registers the `dsh web` browser UI as a boot auto-start service with crash restart.
- [`lockhunter-cli`](lockhunter-cli/README.md) — wraps the local LockHunter CLI so an agent can force-delete/rename/move files locked by other processes.

## Third-party skills

| Skill | Description |
|-------|-------------|
| [`cli-anything`](cli-anything/SKILL.md) | AI CLI for Anything — a shell-side skill enabling codex-style agent workflows. |
| [`clean-code`](clean-code/SKILL.md) | Pragmatic coding standards for writing clean, maintainable code. |
| [`code-review`](code-review/SKILL.md) | Systematic code review patterns covering security, performance, maintainability, correctness, and testing. |
| [`code-review-ai-ai-review`](code-review-ai-ai-review/SKILL.md) | Self-contained AI code review skill authored for lighter-weight contexts. |
| [`code-review-checklist`](code-review-checklist/SKILL.md) | A focused AI coding/review checklist skill for lightweight agents. |
| [`code-review-excellence`](code-review-excellence/SKILL.md) | Full, modern enterprise code review skill: guide, references, and implementation playbook. |
| [`code-reviewer`](code-reviewer/SKILL.md) | Structural PR-review agent skill with criteria and workflow. |
| [`quality-gates`](quality-gates/SKILL.md) | Quality checkpoints at every development stage — pre-commit through post-deploy. |
| [`review-audit`](review-audit/SKILL.md)  | Lightweight single-pass audit covering bugs, wiring, security, tests, spec conformance, and regressions. |
| [`ui-ux-pro-max`](ui-ux-pro-max/SKILL.md) | UI/UX design intelligence: 22 tech-stack catalogs, styles, colors, typography, motion, icons, plus scripts and references. |

## Using

Junction or copy the skill folder into `.dsh/skills/` and follow its `SKILL.md`. See [`shared-skills`](shared-skills/SKILL.md) for sharing across multiple AI tools.

## Layout

```text
.
├── README.md
├── README.zh.md
├── homepage-dev/              # our skills (English + Chinese READMEs)
├── shared-skills/
├── skill-search/
├── deepseek-harness-autostart/
├── lockhunter-cli/
├── cli-anything/              # third-party skills
├── clean-code/
├── code-review/
├── code-review-ai-ai-review/
├── code-review-checklist/
├── code-review-excellence/
├── code-reviewer/
├── quality-gates/
├── review-audit/
└── ui-ux-pro-max/
```

## License

[MIT](LICENSE)
