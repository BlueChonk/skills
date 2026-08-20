# Motrix 下载管理 Skill

[English](README.md) | 简体中文

通过本地 **Motrix** 命令行工具控制下载管理器，让智能体可以把浏览器下载任务交给 Motrix 的 aria2 引擎加速，或管理 Motrix 中的下载任务。

---

## 命名说明

本技能命名为 `motrix-download`，直接体现其核心功能：**通过 Motrix 管理下载任务**。

---

## 为什么需要它

当用户在浏览器中下载大文件时，往往遇到以下问题：

- **单线程下载**：浏览器通常只建立一个连接，无法充分利用带宽
- **不支持断点续传**：网络中断后需要重新下载
- **大文件缓慢**：数百 MB 甚至 GB 级的文件下载耗时很长

**Motrix** 使用 **aria2** 作为下载引擎，支持：
- **多线程分段下载**：同时建立多个连接，速度提升 2-10 倍
- **断点续传**：网络恢复后从断点继续
- **BT/磁力链接**：原生支持 BitTorrent 和磁力链接
- **批量管理**：同时下载多个文件，统一管理

## 特性

- **URL 接管**：将浏览器中的下载 URL 直接交给 Motrix，立即加速
- **状态监控**：实时查看下载进度、速度、剩余时间
- **任务管理**：暂停、恢复、删除下载任务
- **跨平台**：支持 Windows、macOS、Linux
- **远程配对**：可配对到 Docker 部署的 Motrix Server（NAS/服务器）

## 环境要求

- **Node.js >= 22**
- **Motrix CLI**：`npm install -g @motrix/cli`
- **Motrix 桌面应用**（可选）：用于本地桥接

## 安装

```powershell
npm install -g @motrix/cli
```

## 快速开始

```powershell
# 添加下载任务（aria2 多线程加速）
motrix add "https://example.com/large-file.iso" --save-dir "$env:USERPROFILE\Downloads"

# 查看所有下载任务
motrix list

# 实时监控下载进度
motrix watch --stats

# 暂停/恢复任务
motrix pause --id <task-id>
motrix resume --id <task-id>

# 暂停所有/恢复所有
motrix pause-all
motrix resume-all
```

## 核心场景

### 场景 1：浏览器下载太慢，交给 Motrix 加速

当检测到浏览器下载缓慢时：

```powershell
# 1. 获取下载 URL
$url = "https://releases.ubuntu.com/24.04/ubuntu-24.04.1-desktop-amd64.iso"

# 2. 交给 Motrix
motrix add $url --save-dir "$env:USERPROFILE\Downloads"

# 3. 监控进度
motrix watch --stats
```

### 场景 2：批量下载

```powershell
# 同时添加多个任务
$motrix = "$env:APPDATA\npm\motrix.cmd"
& $motrix add "https://example.com/file1.zip" --save-dir "$env:USERPROFILE\Downloads"
& $motrix add "https://example.com/file2.zip" --save-dir "$env:USERPROFILE\Downloads"
& $motrix add "https://example.com/file3.zip" --save-dir "$env:USERPROFILE\Downloads"

# 查看所有任务
& $motrix list
```

### 场景 3：BT/磁力链接下载

```powershell
# 添加磁力链接
motrix add "magnet:?xt=urn:btih:..." --save-dir "$env:USERPROFILE\Downloads"

# 添加种子文件
motrix add "C:\path\to\file.torrent" --save-dir "$env:USERPROFILE\Downloads"
```

## 就绪检查

```powershell
$motrix = Get-Command motrix -ErrorAction SilentlyContinue
if (-not $motrix) {
    npm install -g @motrix/cli
}
motrix --version
```

## 安全提醒

- ⚠️ `motrix add` 会立即开始下载，执行前请确认 URL 和保存路径
- ⚠️ 大量并发下载可能影响磁盘 I/O，请根据磁盘性能调整并发数
- ⚠️ BT/磁力链接下载请遵守当地法律法规
- ⚠️ 远程配对需要用户在 Motrix 应用中手动批准

## 常见问题

### Q: CLI 未找到？
A: 运行 `npm install -g @motrix/cli`，需要 Node.js >= 22。

### Q: 无法连接到 Motrix 应用？
A: 确保 Motrix 桌面应用正在运行。对于远程服务器，使用 `motrix pair` 配对。

### Q: Motrix 下载仍然很慢？
A: 检查是否开启了限速模式（turtle mode），确认服务器支持多连接下载，BT 下载需检查 DHT 和 Tracker 连接状态。

### Q: 如何远程下载到 NAS？
A: 在 NAS 上部署 Motrix Docker 服务器，使用 `motrix pair --name my-nas` 配对后，CLI 会自动将下载任务发送到远程服务器。

## 仓库结构

```text
.
├── SKILL.md                    # 技能清单 + 使用指南（供智能体读取）
├── README.md                   # 本文件（英文）
├── README.zh.md                # 中文版（保持同步）
└── scripts/
    └── motrix-boost.mjs        # 一键加速脚本：接管 URL 并监控进度
```

## 局限与注意事项

- **需要 Motrix 应用**：CLI 通过 MDXP 协议与 Motrix 桌面应用通信，需要应用正在运行
- **单任务限制**：aria2 默认单任务连接数有限，可在设置中调整
- **部分服务器限制**：某些服务器限制单 IP 连接数，多线程加速效果会打折扣

## 参考资源

- [Motrix 官方网站](https://motrix.app/)
- [Motrix GitHub](https://github.com/agalwood/Motrix)
- [@motrix/cli 文档](https://github.com/motrixapp/cli)
- [aria2 文档](https://aria2.github.io/)
