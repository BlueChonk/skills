# 自启动 DeepSeek Harness

[English](README.md) | 简体中文

安装 `@deepseek-ai/dsh`，并将 `dsh web` 浏览器界面注册为**开机自启**服务（支持崩溃后自动重启），适用于 Windows。

---

## 为什么需要它

每次手动执行 `npx @deepseek-ai/dsh web` 打开 DeepSeek Harness 浏览器界面很繁琐。本技能
记录了可复现的完整流程，让智能体（或人工）能在任意 Windows 机器上完成配置 —— 即使该机器
完全没有安装 Node.js 也能一键补齐：

1. **Node.js / npm** 检查与安装，版本匹配 `deepseek-harness` 的 `engines.node`
   （`^22.19.0 || >=24.0.0`），仅在缺失时安装。
2. **`@deepseek-ai/dsh`** —— `npx @deepseek-ai/dsh web` 背后的 CLI —— 使用绝对路径全局安装
   （避免开机时依赖脆弱的 `npx`/PATH 解析）。
3. **开机自启** 通过任务计划程序（`schtasks`，`At system start up`，`SYSTEM` 账户，最高权限）
   配合崩溃自动重启包装脚本实现。

## 特性

- **幂等配置** —— 在已准备好的机器上重复运行会自动跳过安装步骤。
- **端口守护** —— 若 `dsh web` 已在监听该端口（例如已手动启动），包装脚本直接退出，避免重复绑定。
- **崩溃重启** —— 包装脚本会自动重新拉起 `dsh web`。
- **日志记录** —— 所有启动/报错/重启都会追加写入单个日志文件。
- **工具无关** —— 纯 PowerShell + 标准 frontmatter 格式的 `SKILL.md`。

## 快速开始

1. 阅读 `SKILL.md` 获取完整的分步指南。
2. 复制 `scripts/start-dsh-web.ps1`，填入 `$Node`、`$DshBin`、`$Log`（当前为占位符），并确保日志目录存在。
3. 注册计划任务：

   ```powershell
   schtasks /Create /TN "DeepSeekHarnessWeb" `
     /TR "powershell.exe -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File D:\deepseek-harness-autostart-skill\scripts\start-dsh-web.ps1" `
     /SC ONSTART /RU SYSTEM /RL HIGHEST /F
   ```

4. 用 `schtasks /Query` 与 `Test-NetConnection 127.0.0.1 -Port 3080` 验证。

## 兼容性

| 工具 | 说明 |
| ---- | ---- |
| Codex / CodeBuddy / TRAE | 放入 `.xxxx/skills/<name>/` |

## 要求

- **仅 Windows**。
- **PowerShell**（Windows 10/11 自带）。
- **Node.js** —— 若缺失由本技能自动安装；需满足 `^22.19.0 || >=24.0.0`。
- 注册开机计划任务需要一次 **管理员/系统** 权限。