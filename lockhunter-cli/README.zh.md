# LockHunter CLI Skill

[English](README.md) | 简体中文

封装本地的 **LockHunter** 命令行工具，让智能体能强制删除/解锁被其他进程锁定的路径。仅限 Windows。

---

## 命名说明

本技能命名为 `lockhunter-cli`（而非 `lockhunter`），原因：

1. **区分 GUI**：`LockHunter` 本身指 GUI 应用程序，`-cli` 后缀表示本技能专门封装其**命令行接口**
2. **惯例**：AI Agent 技能生态中，CLI 封装技能常用 `-cli` 后缀（如 `git-cli`、`docker-cli`），让人类和 AI Agent 一眼看出这是 CLI 接口而非 GUI 工具

SKILL.md frontmatter 中的 `name` 字段为 `lockhunter-cli`，与目录名一致。

---

## 为什么需要它

当一个进程仍持有某个文件 / 文件夹的句柄时，Windows 通常不允许你删除、移动或重命名它。反复重试同样的命令往往没有意义——你需要一个能在内核层面解除锁定的工具。LockHunter 正是做这件事的 [参考:1][参考:2]。

## 特性

- **一行封装** `LockHunter.exe /delete /silent "Path..."` —— 参数简洁，退出码明确。
- **静默模式** —— `/silent` 参数让操作无 GUI 弹窗，适合自动化脚本。
- **多种操作** —— 支持解锁、删除、永久删除、终止进程等多种操作。
- **标准安装** —— 通过 winget 或官方安装包静默安装到标准路径。
- **跨工作台** —— 纯 CLI + 标准 `SKILL.md` frontmatter。

## 兼容性

| 工作台 | 说明 |
| ------ | ---- |
| Codex / CodeBuddy / TRAE | 放入 `.xxxxx/skills/<name>/` |

## 环境要求

- **仅 Windows**（二进制及其内核驱动仅限 Windows）。
- **管理员权限**，用于安装和运行 LockHunter。

> 在 macOS / Linux 上**请勿使用**本技能，请使用原生工具：`lsof` + `kill`、`unlink`、`fuser -k`、`rm -rf`，或 PowerShell Core 的 `Move-Item`。

## 安装

### 方式一：winget（推荐）

```powershell
winget install --id CrystalRich.LockHunter --exact
```

### 方式二：官方安装包

```powershell
# 1. 下载到用户 Downloads 目录
$dl = "$env:USERPROFILE\Downloads\lockhunter-setup.exe"
if (-not (Test-Path $dl)) {
    Invoke-WebRequest -Uri "https://lockhunter.com/assets/lockhunter-setup.exe" -OutFile $dl
}

# 2. 静默安装（需要管理员权限）
Start-Process -FilePath $dl `
    -ArgumentList '/VERYSILENT','/SUPPRESSMSGBOXES','/NORESTART' `
    -Wait

# 3. 验证
Test-Path "C:\Program Files (x86)\LockHunter\LockHunter.exe"
```

## 快速开始

```powershell
# 解锁文件（仅释放句柄，不删除）
& "C:\Program Files (x86)\LockHunter\LockHunter.exe" /unlock /silent "C:\locked\file.dll"

# 解锁并删除（放入回收站）
& "C:\Program Files (x86)\LockHunter\LockHunter.exe" /delete /silent "C:\temp\virus.exe"

# 永久删除（绕过回收站）
& "C:\Program Files (x86)\LockHunter\LockHunter.exe" /delete /delperm /silent "C:\temp\virus.exe"

# 静默模式删除（无 GUI）
& "C:\Program Files (x86)\LockHunter\LockHunter.exe" /delete /silent "C:\temp\locked.log"

# 终止占用进程后删除
& "C:\Program Files (x86)\LockHunter\LockHunter.exe" /delete /kill /silent "C:\Program Files\BadApp"
```

## CLI 参考

```
LockHunter.exe [/unlock] [/delete [/delperm]] [/kill] [/silent] [/exit] [文件或文件夹路径]
```

### 参数说明

| 参数 | 缩写 | 必需 | 说明 |
| ---- | ---- | ---- | ---- |
| `/unlock` | `-u` | 可选 | 解锁文件或文件夹，关闭所有句柄并卸载其中的 DLL |
| `/delete` | `-d` | 可选 | 解锁并删除文件或文件夹（已包含解锁功能，无需与 `/unlock` 同时使用） |
| `/delperm` | `-dp` | 可选 | 必须与 `/delete` 配合，永久删除文件，绕过回收站 |
| `/kill` | `-k` | 可选 | 终止从指定路径启动的所有进程 |
| `/silent` | `-sm` | 可选 | 静默模式，不显示 GUI 界面（**AI Agent 推荐使用**） |
| `/exit` | `-x` | 可选 | 任务完成后自动退出 |
| `[path]` | — | 可选 | 文件或文件夹路径，支持完整路径或部分路径前缀匹配 |

> **注意**: `/delete` 已包含解锁功能，无需同时使用 `/unlock` 和 `/delete`。
> **推荐**: AI Agent 调用时始终使用 `/silent` 避免 GUI 弹窗。

### 路径说明

- **完整路径**: `C:\Program Files\somefile.exe`
- **部分路径**: 支持前缀匹配，如 `C:\Docume` 会匹配 `C:\Documents and Settings`

### 退出码

| 退出码 | 含义 |
| ------ | ---- |
| `0` | 操作成功完成 |
| `1` | 无法删除或解锁文件 |
| `2` | 处理过程中发生技术错误 |

## 使用示例

### 1. 解锁文件

```powershell
& "C:\Program Files (x86)\LockHunter\LockHunter.exe" /unlock /silent "C:\locked\file.dll"
```

### 2. 解锁并删除（放入回收站）

```powershell
& "C:\Program Files (x86)\LockHunter\LockHunter.exe" /delete /silent "C:\temp\virus.exe"
```

### 3. 永久删除（绕过回收站）

```powershell
& "C:\Program Files (x86)\LockHunter\LockHunter.exe" /delete /delperm /silent "C:\temp\virus.exe"
```

### 4. 静默删除（适合自动化脚本）

```powershell
& "C:\Program Files (x86)\LockHunter\LockHunter.exe" /delete /silent "C:\temp\locked.log"
```

### 5. 终止占用进程后删除

```powershell
& "C:\Program Files (x86)\LockHunter\LockHunter.exe" /delete /kill /silent "C:\Program Files\BadApp"
```

### 6. 静默永久删除（最激进）

```powershell
& "C:\Program Files (x86)\LockHunter\LockHunter.exe" /delete /delperm /silent "C:\顽固文件\delete.me"
```

## 每次调用前的就绪检查

```powershell
if ($IsLinux -or $IsMacOS) { Write-Error "仅限 Windows。已中止。"; return }

$exe = "C:\Program Files (x86)\LockHunter\LockHunter.exe"
if (-not (Test-Path $exe)) {
    winget install --id CrystalRich.LockHunter --exact
}
```

## 安全提醒

- ⚠️ 使用 `/kill` 可能导致未保存数据丢失，请谨慎使用
- ⚠️ 使用 `/delperm` 会永久删除文件，无法从回收站恢复
- ⚠️ 建议先在非关键文件上测试命令，确认效果后再用于生产环境
- ⚠️ 不要对 `C:\Windows`、`C:\Program Files` 等系统目录执行操作

## 常见问题

### Q: 文件被占用无法删除怎么办？
A: 使用 `/delete /kill` 组合，先终止占用进程再删除。

### Q: 如何让脚本在失败时停止？
A: 检查退出码，非 0 表示失败，可在脚本中据此处理。

### Q: 支持文件夹吗？
A: 支持，路径指向文件夹即可对该文件夹及其内容进行操作。

### Q: SmartScreen 提示"此应用无法在此电脑上运行"？
A: LockHunter 的安装包可能未进行数字签名，导致 Windows SmartScreen 拦截。解决方法：
- 右键安装包 → 属性 → 勾选"解除锁定" → 应用
- PowerShell: `Unblock-File -Path "$env:USERPROFILE\Downloads\lockhunter-setup.exe"`
- PowerShell: `Remove-Item -Path "$env:USERPROFILE\Downloads\lockhunter-setup.exe" -Stream "Zone.Identifier"`

## 仓库结构

```text
.
├── SKILL.md                    # 技能清单 + 使用指南（供智能体读取）
├── README.md                   # 本文件（英文）
├── README.zh.md                # 中文版（保持同步）
└── scripts/
    ├── unlockhunter.mjs        # 封装 exe + 自动关闭弹窗
    └── close-lockhunter-dialog.ps1  # 向残留窗口发送 WM_CLOSE
```

## 局限与注意事项

- **对病毒式锁定无效**：如果路径被真正的 rootkit 锁住，可能仍无法删除。
- 强制作业是**破坏性**的。`/delete` 无法撤销——运行前请务必核对目标路径。
- LockHunter 每次运行时都会加载其驱动；驱动服务在使用后仍会保留（处于停止状态）。

## 参考资源

- [参考 1]: LockHunter 官方网站 — https://lockhunter.com/
- [参考 2]: LockHunter 替代Unlocker的文件解锁软件 — https://cloud.tencent.cn/developer/article/2123019
- [参考 3]: 通过 winget 安装 LockHunter — https://winstall.app/apps/CrystalRich.LockHunter
- [参考 4]: Unblock-File PowerShell 文档 — https://learn.microsoft.com/zh-tw/powershell/module/microsoft.powershell.utility/unblock-file
- [参考 5]: Windows Zone.Identifier 文档 — https://blog.poychang.net/windows-zone-identifier-mark-of-the-web/
