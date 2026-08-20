#!/usr/bin/env node
/**
 * Motrix Boost Script (Windows)
 *
 * Hands off a download URL to Motrix and streams real-time progress.
 * Designed for AI agent invocation to accelerate slow browser downloads.
 *
 * Usage:
 *   node motrix-boost.mjs <url> [--save-dir <path>] [--json]
 *
 * Examples:
 *   node motrix-boost.mjs "https://example.com/file.iso"
 *   node motrix-boost.mjs "https://example.com/file.iso" --save-dir "D:\Downloads"
 *   node motrix-boost.mjs "https://example.com/file.iso" --json   # machine-readable output
 *
 * Exit codes:
 *   0: download added successfully
 *   1: motrix CLI not found / not available
 *   2: failed to add download
 *   3: invalid arguments
 */
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import os from 'node:os'
import fs from 'node:fs'

const args = process.argv.slice(2)

function usage() {
  console.error('Usage: node motrix-boost.mjs <url> [--save-dir <path>] [--json]')
  console.error('')
  console.error('Options:')
  console.error('  --save-dir <path>  Download save directory (default: ~/Downloads)')
  console.error('  --json            Output machine-readable JSON')
  console.error('  --help            Show this help')
  process.exit(3)
}

if (args.length < 1 || args.includes('--help')) {
  usage()
}

const url = args[0]
let saveDir = path.join(os.homedir(), 'Downloads')
let jsonOutput = false

for (let i = 1; i < args.length; i++) {
  if (args[i] === '--save-dir' && args[i + 1]) {
    saveDir = args[++i]
  } else if (args[i] === '--json') {
    jsonOutput = true
  } else {
    console.error(`Unknown option: ${args[i]}`)
    usage()
  }
}

// Resolve motrix CLI
const isWindows = process.platform === 'win32'
const motrixCmd = isWindows
  ? path.join(process.env.APPDATA || '', 'npm', 'motrix.cmd')
  : 'motrix'

if (!isWindows && !spawnSync('which', ['motrix'], { encoding: 'utf8' }).stdout?.trim()) {
  if (!jsonOutput) console.error('[boost] ERROR: motrix CLI not found. Install: npm install -g @motrix/cli')
  process.exit(1)
}

if (isWindows && !fs.existsSync(motrixCmd)) {
  if (!jsonOutput) console.error('[boost] ERROR: motrix CLI not found at: ' + motrixCmd)
  process.exit(1)
}

// Ensure save directory exists
if (!fs.existsSync(saveDir)) {
  fs.mkdirSync(saveDir, { recursive: true })
}

if (!jsonOutput) {
  console.log(`[boost] Adding download to Motrix...`)
  console.log(`[boost] URL: ${url}`)
  console.log(`[boost] Save directory: ${saveDir}`)
  console.log('')
}

// Add download
const result = spawnSync(motrixCmd, ['add', url, '--save-dir', saveDir], {
  encoding: 'utf8',
  timeout: 30000,
  windowsHide: true,
})

if (result.status !== 0) {
  const err = (result.stderr || '').trim() || (result.stdout || '').trim() || `exit code ${result.status}`
  if (!jsonOutput) console.error(`[boost] ERROR: Failed to add download: ${err}`)
  if (jsonOutput) console.log(JSON.stringify({ ok: false, error: err }))
  process.exit(2)
}

const output = (result.stdout || '').trim()

if (jsonOutput) {
  console.log(JSON.stringify({ ok: true, url, saveDir, output }))
} else {
  console.log(output)
  console.log('')
  console.log('[boost] Download added successfully!')
  console.log('[boost] Monitor with: motrix watch --stats')
  console.log('[boost] List tasks:  motrix list')
}

process.exit(0)
