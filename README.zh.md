# Skills

[English](README.md) | 中文

一个智能体技能合集。每个技能的入口都是 `SKILL.md`。

## 自制技能

- [`homepage-dev`](homepage-dev/README_zh.md) — 个人主页项目开发规范与结构指南，基于 Vue 3 + Vite 的单页应用。
- [`shared-skills`](shared-skills/README_zh.md) — 在 Windows 上使用目录联结让多个 AI 编程工具共享同一套技能目录。
- [`skill-search`](skill-search/README.zh.md) — 使用精选的市场索引查找、评估并安装智能体技能。
- [`deepseek-harness-autostart`](deepseek-harness-autostart/README.zh.md) — 安装 `@deepseek-ai/dsh`，并将 `dsh web` 浏览器界面注册为带崩溃重启的开机自启服务。
- [`lockhunter-cli`](lockhunter-cli/README.zh.md) — 封装本机 LockHunter CLI，让智能体能强制删除/重命名/移动被其他进程锁定的文件。

## 第三方技能

| 技能 | 说明 |
|------|------|
| [`cli-anything`](cli-anything/SKILL.md) | AI CLI for Anything — 基于 shell 的技能，启用 codex 风格的智能体工作流。 |
| [`clean-code`](clean-code/SKILL.md) | 编写整洁、可维护代码的实用编码规范。 |
| [`code-review`](code-review/SKILL.md) | 系统化的代码评审模式，覆盖安全、性能、可维护性、正确性与测试。 |
| [`code-review-ai-ai-review`](code-review-ai-ai-review/SKILL.md) | 轻量上下文的独立 AI 代码审查技能。 |
| [`code-review-checklist`](code-review-checklist/SKILL.md) | 轻量级智能体的聚焦型 AI 编码/审查清单技能。 |
| [`code-review-excellence`](code-review-excellence/SKILL.md) | 完整的企业级代码审查技能：指南、参考资料与实施手册。 |
| [`code-reviewer`](code-reviewer/SKILL.md) | 结构化 PR 审查智能体技能，含审查标准与工作流。 |
| [`quality-gates`](quality-gates/SKILL.md) | 覆盖开发全生命周期的质量检查点——从提交前到部署后。 |
| [`review-audit`](review-audit/SKILL.md)  | 轻量级单遍审计，覆盖 Bug、接线、安全、测试、规格遵从与回归。 |
| [`ui-ux-pro-max`](ui-ux-pro-max/SKILL.md) | UI/UX 设计智能：22 个技术栈目录、样式、配色、字体、动效、图标，以及脚本与参考资料。 |

## 使用

将所需技能文件夹联结或复制到 `.dsh/skills/`，并按其中的 `SKILL.md` 操作。多工具共享方法见 [`shared-skills`](shared-skills/SKILL.md)。

## 目录结构

```text
.
├── README.md
├── README.zh.md
├── homepage-dev/              # 自制技能（均含中英文 README）
├── shared-skills/
├── skill-search/
├── deepseek-harness-autostart/
├── lockhunter-cli/
├── cli-anything/              # 第三方技能
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

## 许可证

[MIT](LICENSE)
