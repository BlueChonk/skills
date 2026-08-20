# Clash Verge 网络诊断 Skill

[English](README.md) | 简体中文

诊断并修复 Clash Verge 代理的网络问题（GitHub 不可达、DNS 失败、节点慢、连接断开）。通过 mihomo 外部控制器 API（端口 9097）自动检测和修复。

---

## 为什么需要它

当 AI Agent 遇到以下网络问题时，可以通过本 skill 自动诊断和修复：

- **网站无法访问**：GitHub、Google、npm 等打不开
- **下载速度极慢**：代理节点延迟高、带宽受限
- **DNS 解析失败**：域名无法解析，DNS 缓存污染
- **连接频繁断开**：WebSocket、SSH、VPN 等连接不稳定
- **Agent 任务失败**：npm install、git clone、curl 等因网络问题失败

## 特性

- **自动检测**：检查 Clash Verge 运行状态、API 端口、代理健康度
- **延迟测试**：批量测试所有节点延迟，自动选择最快节点
- **模式切换**：Rule / Global / Direct 三种模式一键切换
- **连接管理**：查看活跃连接，识别异常流量
- **自动修复**：检测问题后自动尝试修复

## 环境要求

- **Clash Verge** 已安装在 `D:\Software\Clash Verge`
- **Clash Verge** 桌面应用正在运行
- **外部控制器 (External-Controller)** 已启用

## 安装

### 1. 安装 Clash Verge

从 [GitHub Releases](https://github.com/clash-verge-rev/clash-verge-rev/releases) 下载最新版，安装到 `D:\Software\Clash Verge`。

### 2. 启用外部控制器

打开 Clash Verge → 设置 → Clash 设置 → 开启 **外部控制器 (External-Controller)**，记下端口（默认 9097）和密钥。

## 快速开始

```powershell
# 检查 Clash Verge 状态
Get-Process clash-verge
Get-Process verge-mihomo
Test-NetConnection 127.0.0.1 -Port 9097

# 获取当前模式
$secret = "your-secret"
Invoke-RestMethod -Uri "http://127.0.0.1:9097/mode" -Headers @{"Authorization"="Bearer $secret"}

# 获取所有代理
Invoke-RestMethod -Uri "http://127.0.0.1:9097/proxies" -Headers @{"Authorization"="Bearer $secret"}

# 测试延迟
Invoke-RestMethod -Uri "http://127.0.0.1:9097/delay?proxy=🚀%20Node%20Select&url=http%3A%2F%2Fwww.gstatic.com%2Fgenerate_204&timeout=5000" -Headers @{"Authorization"="Bearer $secret"}

# 切换节点
$body = '{"name":"🇭🇰 Hong Kong 01"}'
Invoke-RestMethod -Uri "http://127.0.0.1:9097/proxies/🚀%20Node%20Select" -Method PUT -Body $body -Headers @{"Authorization"="Bearer $secret"} -ContentType "application/json"

# 切换模式
$body = '{"mode":"global"}'
Invoke-RestMethod -Uri "http://127.0.0.1:9097/mode" -Method PUT -Body $body -Headers @{"Authorization"="Bearer $secret"} -ContentType "application/json"
```

## 核心 API 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/proxies` | GET | 列出所有代理组和节点 |
| `/proxies/{name}` | PUT | 切换代理节点 |
| `/delay` | GET | 测试代理延迟 |
| `/mode` | GET/PUT | 获取/设置模式 (rule/global/direct) |
| `/connections` | GET | 列出活跃连接 |
| `/config` | GET | 获取 mihomo 配置 |
| `/rules` | GET | 列出路由规则 |

## 常见场景

### 场景 1: GitHub 打不开

```powershell
# 1. 检查直连能否访问 GitHub
try { Invoke-WebRequest -Uri "https://github.com" -TimeoutSec 5 } catch { Write-Host "GitHub 直连失败" }

# 2. 检查 Clash 状态
$mode = Invoke-RestMethod -Uri "http://127.0.0.1:9097/mode" -Headers @{"Authorization"="Bearer $secret"}
Write-Host "当前模式: $($mode.mode)"

# 3. 切换到 GitHub 优化节点
$body = '{"name":"🇺🇸 US Node 1"}'
Invoke-RestMethod -Uri "http://127.0.0.1:9097/proxies/$([Uri]::EscapeDataString('🚀 Node Select'))" -Method PUT -Body $body -Headers @{"Authorization"="Bearer $secret"} -ContentType "application/json"
```

### 场景 2: 下载速度慢

```powershell
# 1. 测试当前延迟
$delay = Invoke-RestMethod -Uri "http://127.0.0.1:9097/delay?proxy=🚀%20Node%20Select&url=http%3A%2F%2Fwww.gstatic.com%2Fgenerate_204&timeout=5000" -Headers @{"Authorization"="Bearer $secret"}
Write-Host "当前延迟: $($delay.delay)ms"

# 2. 如果延迟过高，切换到最快节点（使用脚本）
node scripts/clash-diagnose.mjs --auto-fix --secret "your-secret"
```

### 场景 3: DNS 解析失败

```powershell
ipconfig /flushdns
# 然后切换到一个支持 DNS 劫持的节点
```

### 场景 4: Agent 任务网络失败

当 npm install、git clone、curl 等失败时：

```powershell
# 1. 检查直连网络
Test-NetConnection computername -Port 443

# 2. 检查代理网络
$delay = Invoke-RestMethod -Uri "http://127.0.0.1:9097/delay?proxy=🚀%20Node%20Select&url=http%3A%2F%2Fwww.gstatic.com%2Fgenerate_204&timeout=5000" -Headers @{"Authorization"="Bearer $secret"}

# 3. 如果代理有问题，临时切换直连
$body = '{"mode":"direct"}'
Invoke-RestMethod -Uri "http://127.0.0.1:9097/mode" -Method PUT -Body $body -Headers @{"Authorization"="Bearer $secret"} -ContentType "application/json"
```

## 安全提醒

- ⚠️ 切换到 **Direct 模式**会禁用所有代理，用户真实 IP 将暴露
- ⚠️ 切换节点会短暂中断活跃连接
- ⚠️ 通过 API 修改配置可能被 GUI 覆盖
- ⚠️ 隐私敏感场景下，修改代理设置前请确认用户同意

## 常见问题

### Q: 外部控制器无法访问？
A: 1) 检查 Clash Verge 是否运行 2) 在设置中启用外部控制器 3) 检查 Windows 防火墙

### Q: 所有节点都超时？
A: 1) 订阅可能需要更新 2) 临时切换到 Direct 模式 3) 检查本地网络是否正常

### Q: 仅特定网站慢？
A: 1) 可能需要专用路由规则 2) 尝试不同代理组 3) 检查该地区是否封锁该网站

## 参考资源

- [Clash Verge Rev GitHub](https://github.com/clash-verge-rev/clash-verge-rev)
- [mihomo 文档](https://wiki.metacubex.one/)
- [Clash API 自动切换节点实战](https://clashsource.com/zh-CN/blog/articles/clash-external-controller-api-auto-switch-2026.html)
