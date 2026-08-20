# Skills

[English](README.md) | 中文

一个智能体技能合集。每个技能的入口都是 `SKILL.md`。根目录下（与 `.xxxx/` 同级）的是自制技能，均自带中英文 README；第三方技能放在 `.xxxx/skills/` 下。

## 自制技能

- [`skill-search`](skill-search/README.zh.md) — 使用精选的市场索引（Smithery、ClawHub、LobeHub、ModelScope、anthropics/skills 等）查找、评估并安装智能体技能。
- [`deepseek-harness-autostart`](deepseek-harness-autostart/README.zh.md) — 安装 `@deepseek-ai/dsh`，并将 `dsh web` 浏览器界面注册为带崩溃重启的开机自启服务。
- [`iobit-unlocker-cli`](iobit-unlocker-cli/README.zh.md) — 封装本机 IObit Unlocker CLI，让智能体能强制删除/重命名/移动被其他进程锁定的文件。

## 第三方技能（`.xxxx/skills/`）

| 技能 | 说明 |
|------|------|
| [`cli-anything`](.xxxx/skills/cli-anything/SKILL.md) | AI CLI for Anything — 基于 shell 的技能，启用 codex 风格的智能体工作流（`agents/openai.yaml`）。 |
| [`review/code-review-ai-ai-review`](.xxxx/skills/review/code-review-ai-ai-review/SKILL.md) | 轻量上下文的独立 AI 代码审查技能。 |
| [`review/code-review-checklist`](.xxxx/skills/review/code-review-checklist/SKILL.md) | 轻量级智能体的聚焦型 AI 编码/审查清单技能。 |
| [`review/code-review-excellence`](.xxxx/skills/review/code-review-excellence/SKILL.md) | 完整的企业级代码审查技能：指南、参考资料与实施手册。 |
| [`review/code-reviewer`](.xxxx/skills/review/code-reviewer/SKILL.md) | 结构化 PR 审查智能体技能，含审查标准与工作流。 |
| [`ui-ux-pro-max`](.xxxx/skills/ui-ux-pro-max/SKILL.md) | UI/UX 设计智能：22 个技术栈目录、样式、配色、字体、动效、图标，以及脚本与参考资料。 |

## 使用

将所需技能文件夹复制到你的工具技能目录（`.xxxx/skills/`），并按其中的 `SKILL.md` 操作。

## 目录结构

```text
.
├── README.md
├── README.zh.md
├── .xxxx/skills/                 # 第三方技能（对应 Codex 目录约定）
│   ├── cli-anything/
│   ├── review/{code-review-ai-ai-review,code-review-checklist,code-review-excellence,code-reviewer}/
│   └── ui-ux-pro-max/
├── skill-search/                  # 自制技能（与 .xxxx/ 同级）
├── deepseek-harness-autostart/    #   （均含中英文 README）
└── iobit-unlocker-cli/
```

## 许可证

[MIT](LICENSE)