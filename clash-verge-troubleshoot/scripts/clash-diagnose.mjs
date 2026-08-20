#!/usr/bin/env node
/**
 * Clash Verge Diagnostic Script (Windows)
 *
 * Checks Clash Verge status, tests proxy health, and optionally auto-fixes.
 *
 * Usage:
 *   node clash-diagnose.mjs [--secret <secret>] [--auto-fix] [--target <url>]
 *
 * Options:
 *   --secret <secret>   External controller secret (optional if not set in config)
 *   --auto-fix          Automatically switch to fastest node if issues detected
 *   --target <url>      Target URL to test (default: http://www.gstatic.com/generate_204)
 *   --api-port <port>   API port (default: 9097)
 *   --api-host <host>   API host (default: 127.0.0.1)
 *
 * Exit codes:
 *   0: All checks passed
 *   1: Clash Verge not running or API unreachable
 *   2: Network issues detected (auto-fix may have been attempted)
 */
import { spawnSync } from 'node:child_process'

const args = process.argv.slice(2)

function getArg(name, def) {
  const idx = args.indexOf(`--${name}`)
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : def
}

const API_HOST = getArg('api-host', '127.0.0.1')
const API_PORT = getArg('api-port', '9097')
const SECRET = getArg('secret', '')
const AUTO_FIX = args.includes('--auto-fix')
const TARGET_URL = getArg('target', 'http://www.gstatic.com/generate_204')
const BASE = `http://${API_HOST}:${API_PORT}`

const headers = { 'Content-Type': 'application/json' }
if (SECRET) headers['Authorization'] = `Bearer ${SECRET}`

function api(path, opts = {}) {
  try {
    const r = spawnSync('curl', [
      '-s', '-w', '\n%{http_code}',
      '--connect-timeout', '5',
      ...Object.entries(headers).flatMap(([k, v]) => ['-H', `${k}: ${v}`]),
      ...(opts.method === ['-X', opts.method]),
      ...(opts.body ? ['-d', opts.body] : []),
      `${BASE}${path}`,
    ], { encoding: 'utf8', timeout: 10000, windowsHide: true })

    const lines = (r.stdout || '').trim().split('\n')
    const code = lines.pop()
    const body = lines.join('\n')
    return { status: parseInt(code), body: body ? JSON.parse(body) : null }
  } catch (e) {
    return { status: 0, body: null, error: e.message }
  }
}

function ps(name) {
  const r = spawnSync('tasklist', ['/FI', `IMAGENAME eq ${name}`, '/NH', '/FO', 'CSV'], {
    encoding: 'utf8', windowsHide: true,
  })
  return (r.stdout || '').toLowerCase().includes(name.toLowerCase())
}

// 1. Check processes
console.log('=== Clash Verge Diagnostics ===\n')

const appRunning = ps('clash-verge.exe')
const mihomoRunning = ps('verge-mihomo.exe')
console.log(`[CHECK] clash-verge.exe (GUI):    ${appRunning ? '✅ Running' : '❌ NOT RUNNING'}`)
console.log(`[CHECK] verge-mihomo.exe (engine): ${mihomoRunning ? '✅ Running' : '❌ NOT RUNNING'}`)

if (!appRunning) {
  console.log('\n[RESULT] Clash Verge is not running. Start it and try again.')
  process.exit(1)
}

// 2. Check API
const modeRes = api('/mode')
if (modeRes.status !== 200) {
  console.log(`\n[RESULT] API not reachable on ${BASE} (status: ${modeRes.status})`)
  console.log('        Enable External-Controller in Clash Verge settings.')
  process.exit(1)
}
console.log(`[CHECK] API port ${API_PORT}:        ✅ Reachable`)

const mode = modeRes.body?.mode || 'unknown'
console.log(`[INFO] Current mode: ${mode}`)

// 3. Check proxies
const proxiesRes = api('/proxies')
if (proxiesRes.status !== 200) {
  console.log('[RESULT] Could not fetch proxies')
  process.exit(2)
}

const proxies = proxiesRes.body?.proxies || {}
const selectGroups = Object.entries(proxies).filter(
  ([, p]) => p.type === 'Selector' && p.name !== 'GLOBAL'
)
console.log(`[INFO] Found ${selectGroups.length} proxy group(s)`)

// 4. Test current delay
const testUrl = encodeURIComponent(TARGET_URL)
const currentNode = selectGroups.length > 0 ? selectGroups[0][1]?.now : null

if (currentNode) {
  const delayRes = api(`/delay?proxy=${encodeURIComponent(selectGroups[0][0])}&url=${testUrl}&timeout=5000`)
  const delay = delayRes.body?.delay
  console.log(`[CHECK] Current node "${currentNode}": ${delay ? delay + 'ms' : 'TIMEOUT'}`)

  if (!delay || delay > 2000) {
    console.log(`[WARN] High delay or timeout detected!`)

    if (AUTO_FIX && selectGroups.length > 0) {
      console.log('\n[AUTO-FIX] Testing all nodes...')

      const results = []
      for (const [groupName] of selectGroups) {
        const groupRes = api(`/proxies/${encodeURIComponent(groupName)}`)
        if (groupRes.status !== 200 || !groupRes.body?.all) continue

        for (const node of groupRes.body.all) {
          if (node === 'REJECT' || node === 'PASS') continue
          const dRes = api(`/delay?proxy=${encodeURIComponent(groupName)}&url=${testUrl}&timeout=5000`)
          const d = dRes.body?.delay
          if (d) {
            results.push({ node, delay: d, group: groupName })
            console.log(`  ${groupName} -> ${node}: ${d}ms`)
          }
        }
      }

      if (results.length > 0) {
        const fastest = results.sort((a, b) => a.delay - b.delay)[0]
        console.log(`\n[AUTO-FIX] Switching to fastest: "${fastest.node}" (${fastest.delay}ms)`)

        const switchRes = api(`/proxies/${encodeURIComponent(fastest.group)}`, {
          method: 'PUT',
          body: JSON.stringify({ name: fastest.node }),
        })

        if (switchRes.status === 204 || switchRes.status === 200) {
          console.log('[AUTO-FIX] Switched successfully!')
        } else {
          console.log(`[AUTO-FIX] Switch failed (status: ${switchRes.status})`)
        }
      } else {
        console.log('[AUTO-FIX] No responsive nodes found. Try Direct mode:')
        console.log('  node clash-verge-troubleshoot/scripts/clash-diagnose.mjs (then switch to direct)')
      }
    }
  }
}

// 5. Check connections
const connsRes = api('/connections')
if (connsRes.status === 200 && connsRes.body) {
  const conns = connsRes.body.connections || []
  const totalUp = connsRes.body.uploadTotal || 0
  const totalDown = connsRes.body.downloadTotal || 0
  console.log(`[INFO] Active connections: ${conns.length}`)
  console.log(`[INFO] Total upload: ${(totalUp / 1024 / 1024).toFixed(2)} MB`)
  console.log(`[INFO] Total download: ${(totalDown / 1024 / 1024).toFixed(2)} MB`)
}

console.log('\n=== Diagnostics Complete ===')
process.exit(0)
