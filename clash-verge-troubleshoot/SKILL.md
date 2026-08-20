---
name: "clash-verge-troubleshoot"
description: "Diagnose and fix Clash Verge proxy network issues (GitHub unreachable, DNS failures, slow proxies, connection drops). Uses verge-mihomo.exe CLI and the RESTful API on port 9097."
---

# Clash Verge Troubleshoot Skill

> **Platform: Windows.** This skill controls the local **Clash Verge** desktop application (at `D:\Software\Clash Verge`) and its embedded **mihomo** (Clash Meta) proxy engine via the external-controller RESTful API.

This skill helps AI agents diagnose and fix network connectivity issues through Clash Verge:

- **Network unreachable**: GitHub, Google, or other sites fail to load
- **Slow proxies**: High latency, low bandwidth, frequent timeouts
- **DNS failures**: Domain resolution errors, stale DNS cache
- **Connection drops**: Intermittent disconnects, proxy crashes
- **Suboptimal routing**: Traffic taking slow paths due to outdated rules

## Tool Location

```
D:\Software\Clash Verge\clash-verge.exe              # Electron GUI (main)
D:\Software\Clash Verge\verge-mihomo.exe              # Mihomo proxy engine
D:\Software\Clash Verge\verge-mihomo-alpha.exe         # Mihomo alpha engine
D:\Software\Clash Verge\resources\sysproxy.exe         # System proxy toggle
D:\Software\Clash Verge\resources\clash-verge-service.exe  # Windows service
```

## Prerequisites

1. **Clash Verge** is installed at `D:\Software\Clash Verge`
2. **Clash Verge** is running (the GUI application)
3. **External Controller** is enabled in Clash Verge settings

### Enable External Controller

In Clash Verge settings (`Settings > Clash Settings`):
- Toggle **"Enable External-Controller"** ON
- Note the port (default: `9097`) and secret (if set)

Or edit the config file directly (see below).

## Config File Location

Clash Verge stores its config in the Tauri app data directory:

```
%APPDATA%\io.github.clash-verge-rev.clash-verge-rev\profiles\
```

The active config is referenced by the `config.yaml` file. The relevant section for the external controller:

```yaml
external-controller: 127.0.0.1:9097
secret: your-secret-here
```

## Readiness Check

```powershell
# 1. Check if Clash Verge is running
Get-Process -Name "clash-verge" -ErrorAction SilentlyContinue

# 2. Check if mihomo engine is running
Get-Process -Name "verge-mihomo" -ErrorAction SilentlyContinue

# 3. Check if external-controller port is open
Test-NetConnection -ComputerName 127.0.0.1 -Port 9097 -WarningAction SilentlyContinue
```

## Core API Endpoints (mihomo External Controller)

Base URL: `http://127.0.0.1:9097`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/proxies` | GET | List all proxy groups and nodes |
| `/proxies/{name}` | GET | Get proxy group details |
| `/proxies/{name}` | PUT | Switch proxy node (body: `{"name":"node-name"}`) |
| `/delay` | GET | Test proxy delay (`?proxy={name}&url={url}&timeout={ms}`) |
| `/mode` | GET | Get current mode (rule/global/direct) |
| `/mode` | PUT | Set mode (body: `{"mode":"rule"}`) |
| `/connections` | GET | List active connections |
| `/config` | GET | Get mihomo config |
| `/config` | PUT | Update mihomo config (body: YAML/JSON) |
| `/version` | GET | Get mihomo version |
| `/rules` | GET | List routing rules |
| `/providers/proxies` | GET | List proxy providers |
| `/providers/proxies/{name}` | PUT | Update proxy provider |

### Authentication

All requests require the `Authorization` header:

```
Authorization: Bearer <secret>
```

If no secret is set, omit the header.

### Default Test URLs

| URL | Purpose |
|-----|---------|
| `http://www.gstatic.com/generate_204` | Connectivity check (204 No Content) |
| `https://www.google.com` | General internet access |
| `https://github.com` | GitHub access |
| `https://api.github.com` | GitHub API access |
| `https://registry.npmjs.org` | npm registry |

## Core Operations

### 1. Check Proxy Health

```powershell
# Get current mode
Invoke-RestMethod -Uri "http://127.0.0.1:9097/mode" -Headers @{"Authorization"="Bearer $secret"}

# Get current proxies
$proxies = Invoke-RestMethod -Uri "http://127.0.0.1:9097/proxies" -Headers @{"Authorization"="Bearer $secret"}
$proxies.proxies | Get-Member -MemberType NoteProperty | Where-Object { $_.Name -ne "GLOBAL" }
```

### 2. Test Proxy Delay

```powershell
# Test all nodes in a group
$secret = "your-secret"
$baseUrl = "http://127.0.0.1:9097"

# Test a specific proxy
$result = Invoke-RestMethod -Uri "$baseUrl/delay?proxy=🚀%20Node%20Select&url=http%3A%2F%2Fwww.gstatic.com%2Fgenerate_204&timeout=5000" -Headers @{"Authorization"="Bearer $secret"}
# Returns: {"delay": 123} (ms) or error
```

### 3. Switch Proxy Node

```powershell
# Switch to a specific node
$body = '{"name": "🇭🇰 Hong Kong 01"}'
Invoke-RestMethod -Uri "http://127.0.0.1:9097/proxies/$([Uri]::EscapeDataString('🚀 Node Select'))" -Method PUT -Body $body -Headers @{"Authorization"="Bearer $secret"} -ContentType "application/json"
```

### 4. Change Mode (Rule / Global / Direct)

```powershell
# Switch to global mode (all traffic through proxy)
$body = '{"mode":"global"}'
Invoke-RestMethod -Uri "http://127.0.0.1:9097/mode" -Method PUT -Body $body -Headers @{"Authorization"="Bearer $secret"} -ContentType "application/json"

# Switch to rule mode (default, traffic routed by rules)
$body = '{"mode":"rule"}'
Invoke-RestMethod -Uri "http://127.0.0.1:9097/mode" -Method PUT -Body $body -Headers @{"Authorization"="Bearer $secret"} -ContentType "application/json"

# Switch to direct mode (no proxy)
$body = '{"mode":"direct"}'
Invoke-RestMethod -Uri "http://127.0.0.1:9097/mode" -Method PUT -Body $body -Headers @{"Authorization"="Bearer $secret"} -ContentType "application/json"
```

### 5. Get Active Connections

```powershell
$conns = Invoke-RestMethod -Uri "http://127.0.0.1:9097/connections" -Headers @{"Authorization"="Bearer $secret"}
$conns.connections | Select-Object id, metadata, uploadTotal, downloadTotal, chains
```

### 6. Reload Config

```powershell
# Get current config
$config = Invoke-RestMethod -Uri "http://127.0.0.1:9097/config" -Headers @{"Authorization"="Bearer $secret"}
```

## Diagnostic Workflow

When the user reports a network issue:

### Step 1: Check Basic Connectivity

```powershell
# Is the internet reachable at all?
try {
    $r = Invoke-WebRequest -Uri "http://www.gstatic.com/generate_204" -TimeoutSec 5
    Write-Host "Direct internet: OK"
} catch {
    Write-Host "Direct internet: FAILED"
}
```

### Step 2: Check Clash Verge Status

```powershell
# Is the app running?
$app = Get-Process -Name "clash-verge" -ErrorAction SilentlyContinue
if ($app) { Write-Host "Clash Verge: Running" } else { Write-Host "Clash Verge: NOT RUNNING" }

# Is mihomo running?
$mihomo = Get-Process -Name "verge-mihomo" -ErrorAction SilentlyContinue
if ($mihomo) { Write-Host "Mihomo engine: Running" } else { Write-Host "Mihomo engine: NOT RUNNING" }

# Is the API port open?
$port = Test-NetConnection -ComputerName 127.0.0.1 -Port 9097 -WarningAction SilentlyContinue
if ($port.TcpTestSucceeded) { Write-Host "API port 9097: OPEN" } else { Write-Host "API port 9097: CLOSED" }
```

### Step 3: Check Proxy Health

```powershell
# Test current proxy
$secret = "your-secret"
$mode = Invoke-RestMethod -Uri "http://127.0.0.1:9097/mode" -Headers @{"Authorization"="Bearer $secret"}
Write-Host "Current mode: $($mode.mode)"

# Test delay through current proxy
$delay = Invoke-RestMethod -Uri "http://127.0.0.1:9097/delay?proxy=🚀%20Node%20Select&url=http%3A%2F%2Fwww.gstatic.com%2Fgenerate_204&timeout=5000" -Headers @{"Authorization"="Bearer $secret"}
Write-Host "Current delay: $($delay.delay)ms"
```

### Step 4: Auto-Fix Common Issues

| Issue | Fix |
|-------|-----|
| Clash not running | Start `clash-verge.exe` |
| API port closed | Check external-controller settings |
| High delay | Switch to faster node |
| DNS failure | Change DNS config, flush DNS |
| GitHub unreachable | Switch to GitHub-optimized node |
| All proxies timeout | Switch mode to Direct temporarily |

### Step 5: Switch to Faster Node

```powershell
# List all available nodes
$proxies = Invoke-RestMethod -Uri "http://127.0.0.1:9097/proxies/🚀%20Node%20Select" -Headers @{"Authorization"="Bearer $secret"}
$allNodes = @($proxies.all)

# Test all nodes and pick the fastest
$results = @()
foreach ($node in $allNodes) {
    try {
        $d = Invoke-RestMethod -Uri "http://127.0.0.1:9097/delay?proxy=$([Uri]::EscapeDataString('🚀 Node Select'))&url=http%3A%2F%2Fwww.gstatic.com%2Fgenerate_204&timeout=5000" -Headers @{"Authorization"="Bearer $secret"}
        $results += [PSCustomObject]@{ Node = $node; Delay = $d.delay }
    } catch {
        $results += [PSCustomObject]@{ Node = $node; Delay = 9999 }
    }
}

$fastest = $results | Sort-Object Delay | Select-Object -First 1
Write-Host "Fastest node: $($fastest.Node) ($($fastest.Delay)ms)"

# Switch to it
$body = "{`"name`": `"$($fastest.Node)`"}"
Invoke-RestMethod -Uri "http://127.0.0.1:9097/proxies/$([Uri]::EscapeDataString('🚀 Node Select'))" -Method PUT -Body $body -Headers @{"Authorization"="Bearer $secret"} -ContentType "application/json"
```

## When to Use

Invoke this skill when:

1. **Browser cannot access a site**: GitHub, Google, npm, etc. are unreachable
2. **Downloads are extremely slow**: Bandwidth is capped at very low speeds
3. **DNS resolution fails**: `ERR_NAME_NOT_RESOLVED`, `DNS_PROBE_FINISHED_NXDOMAIN`
4. **Frequent disconnections**: WebSocket, SSH, or VPN connections drop repeatedly
5. **Agent tasks fail due to network**: npm install, git clone, curl, pip fail with network errors
6. **User asks to switch proxy/node**: "换个节点", "挂梯子", "代理太慢"

## Safety Notes

- ⚠️ Switching to **Direct mode** disables ALL proxy traffic — the user's real IP will be exposed
- ⚠️ Switching nodes may briefly interrupt active connections
- ⚠️ Changing config via API may be overwritten by Clash Verge GUI changes
- ⚠️ Always confirm with the user before changing proxy settings if privacy is a concern

## Troubleshooting

### External controller not accessible

1. Check if Clash Verge is running: `Get-Process clash-verge`
2. Enable external-controller in Clash Verge settings
3. Check Windows Firewall is not blocking port 9097

### All nodes timeout

1. The proxy subscription may need updating
2. Switch to Direct mode temporarily: `PUT /mode {"mode":"direct"}`
3. Check if the local network is working without proxy

### DNS failures

1. Flush DNS: `ipconfig /flushdns`
2. Check Clash Verge DNS settings
3. Try switching to a node with DNS hijacking disabled

### High latency only on specific sites

1. May need a dedicated routing rule
2. Try different proxy groups (e.g., "Games" vs "Streaming")
3. Check if the site is blocked in the current region
