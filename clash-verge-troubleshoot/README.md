# Clash Verge Troubleshoot Skill

English | [简体中文](README.zh.md)

Diagnose and fix Clash Verge proxy network issues (GitHub unreachable, DNS failures, slow proxies, connection drops) via the mihomo external-controller RESTful API on port 9097.

---

## Why

When AI agents encounter network issues, this skill provides automated diagnosis and repair:

- **Unreachable sites**: GitHub, Google, npm, etc. fail to load
- **Slow downloads**: High latency, low bandwidth, frequent timeouts
- **DNS failures**: Domain resolution errors, stale DNS cache
- **Connection drops**: Intermittent disconnects, proxy crashes
- **Agent task failures**: npm install, git clone, curl fail with network errors

## Features

- **Auto-detect**: Check Clash Verge status, API port, proxy health
- **Delay testing**: Batch test all nodes, auto-select fastest
- **Mode switching**: Rule / Global / Direct modes in one command
- **Connection management**: View active connections, identify anomalies
- **Auto-fix**: Detect issues and attempt automatic repair

## Requirements

- **Clash Verge** installed at `D:\Software\Clash Verge`
- **Clash Verge** GUI running
- **External Controller** enabled

## Install

1. Download Clash Verge from [GitHub Releases](https://github.com/clash-verge-rev/clash-verge-rev/releases)
2. Install to `D:\Software\Clash Verge`
3. Open Settings > Clash Settings > Enable **External-Controller**

## Quick Start

```powershell
# Check status
Get-Process clash-verge
Test-NetConnection 127.0.0.1 -Port 9097

# Get current mode
$secret = "your-secret"
Invoke-RestMethod -Uri "http://127.0.0.1:9097/mode" -Headers @{"Authorization"="Bearer $secret"}

# Test delay
Invoke-RestMethod -Uri "http://127.0.0.1:9097/delay?proxy=🚀%20Node%20Select&url=http%3A%2F%2Fwww.gstatic.com%2Fgenerate_204&timeout=5000" -Headers @{"Authorization"="Bearer $secret"}

# Switch node
$body = '{"name":"🇭🇰 Hong Kong 01"}'
Invoke-RestMethod -Uri "http://127.0.0.1:9097/proxies/🚀%20Node%20Select" -Method PUT -Body $body -Headers @{"Authorization"="Bearer $secret"} -ContentType "application/json"

# Switch mode
$body = '{"mode":"global"}'
Invoke-RestMethod -Uri "http://127.0.0.1:9097/mode" -Method PUT -Body $body -Headers @{"Authorization"="Bearer $secret"} -ContentType "application/json"
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/proxies` | GET | List all proxy groups and nodes |
| `/proxies/{name}` | PUT | Switch proxy node |
| `/delay` | GET | Test proxy delay |
| `/mode` | GET/PUT | Get/set mode (rule/global/direct) |
| `/connections` | GET | List active connections |
| `/config` | GET | Get mihomo config |
| `/rules` | GET | List routing rules |

## Scenarios

### GitHub Unreachable

```powershell
$mode = Invoke-RestMethod -Uri "http://127.0.0.1:9097/mode" -Headers @{"Authorization"="Bearer $secret"}
$body = '{"name":"🇺🇸 US Node 1"}'
Invoke-RestMethod -Uri "http://127.0.0.1:9097/proxies/🚀%20Node%20Select" -Method PUT -Body $body -Headers @{"Authorization"="Bearer $secret"} -ContentType "application/json"
```

### Slow Downloads

```powershell
$delay = Invoke-RestMethod -Uri "http://127.0.0.1:9097/delay?proxy=🚀%20Node%20Select&url=http%3A%2F%2Fwww.gstatic.com%2Fgenerate_204&timeout=5000" -Headers @{"Authorization"="Bearer $secret"}
# Use the auto-fix script
node scripts/clash-diagnose.mjs --auto-fix --secret "your-secret"
```

### DNS Failures

```powershell
ipconfig /flushdns
# Switch to a node with DNS hijacking enabled
```

### Agent Task Network Failure

```powershell
# Check proxy health, fall back to direct if needed
$body = '{"mode":"direct"}'
Invoke-RestMethod -Uri "http://127.0.0.1:9097/mode" -Method PUT -Body $body -Headers @{"Authorization"="Bearer $secret"} -ContentType "application/json"
```

## Safety Notes

- Switching to **Direct mode** disables ALL proxy traffic — the user's real IP will be exposed
- Switching nodes may briefly interrupt active connections
- API config changes may be overwritten by Clash Verge GUI changes
- Confirm with the user before changing proxy settings if privacy is a concern

## References

- [Clash Verge Rev GitHub](https://github.com/clash-verge-rev/clash-verge-rev)
- [mihomo Docs](https://wiki.metacubex.one/)
- [Clash API Auto Switch Guide](https://clashsource.com/zh-CN/blog/articles/clash-external-controller-api-auto-switch-2026.html)
