# Shared Skills

在 Windows 上使用目录联结（Directory Junction）让多个 AI 编程工具共享同一套技能目录。

## 概述

本技能让你的所有 AI 编程工具（TRAE、CodeBuddy、Codex、DeepSeek Harness 等）通过 Windows 目录联结（`mklink /J`）读取同一套技能目录。安装一次，所有工具立即可见。

## 工作原理

1. 指定一个源目录（默认：`.dsh/skills/`）
2. 为每个工具的 `skills/` 目录创建联结到源目录
3. 隐藏 AI 工具目录，仅显示 `.dsh`

## 快速设置

```powershell
# 创建联结
cmd /c "mklink /J `"D:\Projects\.codebuddy\skills`" `"D:\Projects\.dsh\skills`""
cmd /c "mklink /J `"D:\Projects\.trae\skills`" `"D:\Projects\.dsh\skills`""

# 隐藏工具目录（保持 .dsh 可见）
attrib +h "D:\Projects\.trae"
attrib +h "D:\Projects\.codebuddy"
```

## 特性

- **零磁盘开销** — 联结是文件系统指针，不是副本
- **即时同步** — 更新一处，所有工具同步
- **工作区整洁** — 仅显示 `.dsh`，其他工具目录隐藏
- **可扩展** — 支持任何遵循 `<root>/skills/` 约定的工具

## 支持的工具

| 工具 | 技能目录 |
|------|---------|
| DeepSeek Harness | `.dsh/skills/` |
| TRAE | `.trae/skills/` |
| CodeBuddy | `.codebuddy/skills/` |
| Codex | `.codex/skills/` |
| Cursor | `.cursor/skills/` |

## 撤销

```powershell
# 移除联结（源目录不会被删除）
rmdir "D:\Projects\.codebuddy\skills"

# 取消隐藏目录
attrib -h "D:\Projects\.codebuddy"
```

## 系统要求

- Windows 10/11
- 已有一个包含技能的共享源目录（默认：`.dsh/skills/`）
