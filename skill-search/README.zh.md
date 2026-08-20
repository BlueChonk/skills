# Skill Search

[English](README.md) | 中文

为智能体扩展一个精选的技能市场索引，以及可复用的"查找、评估、安装智能体技能（`SKILL.md`）"工作流。

## 功能

- 收录 10 个社区/官方技能市场（Smithery、SkillHub、魔搭 ModelScope、ClawHub、ClawHub 中国镜像、AgentSkills、LobeHub、skills.sh、SkillsMP、anthropics/skills）。
- 引导用户走完整流程：需求 → 搜索 → 评估 → 推荐 → 安装 → 记录。
- 依据真实上游仓库、star 数、许可证与活跃度来评估候选——而不是依赖镜像的流行度。

## 何时使用

- 用户缺少某项能力，询问"找一个能做 X 的 skill"。
- 用户想搜索、浏览或安装某个智能体技能。
- 用户询问多个技能中哪个最适合 / 最可信。

## 工作机制

引导智能体：

1. 理解需求（能力、目标工具、约束条件）。
2. 从索引中交叉比对 2-3 个以上市场。
3. 评估每个候选项（上游来源、star、匹配度、新鲜度）。
4. 给出简短对比推荐一个，并等待确认。
5. 通过稀疏浅克隆安装到与 `skill-search/` 平级的目录结构。
6. 记录来源和版本，保证后续搜索的新鲜度。

完整指令见 [`SKILL.md`](SKILL.md)。

## 目录结构

```text
skill-search/
├── SKILL.md
├── README.md
└── README.zh.md
```

## 许可证

[MIT](../LICENSE)