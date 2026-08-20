#!/usr/bin/env node
/**
 * LockHunter auto-invoke script (Windows)
 *
 * Wraps LockHunter.exe, waits for it to exit, then auto-dismisses any
 * residual LockHunter result dialog by sending WM_CLOSE via
 * close-lockhunter-dialog.ps1, so the GUI popup does not block the caller.
 *
 * Usage:
 *   node unlockhunter.mjs [/unlock] [/delete [/delperm]] [/kill] [/silent] [/exit] "Path1" "Path2" ...
 *   e.g. node unlockhunter.mjs /delete /silent "D:\some\locked\dir"
 *        node unlockhunter.mjs /unlock "C:\locked\file.txt"
 *
 * Args match LockHunter.exe. Exit code mirrors the exe; non-zero on launch failure.
 *
 * Note: When using /silent mode, no GUI is shown and the dialog-close step is skipped.
 */
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EXE = 'C:\\Program Files (x86)\\LockHunter\\LockHunter.exe'
const PS_FILE = path.join(__dirname, 'close-lockhunter-dialog.ps1')

const args = process.argv.slice(2)
if (args.length < 1) {
  console.error('[lockhunter] usage: node unlockhunter.mjs [/unlock] [/delete [/delperm]] [/kill] [/silent] [/exit] "Path..."')
  console.error('Parameters: /unlock(-u) /delete(-d) /delperm(-dp) /kill(-k) /silent(-sm) /exit(-x)')
  process.exit(2)
}

// 1) Run the exe verbatim and wait for it to exit.
console.log(`[lockhunter] invoke: ${EXE} ${args.join(' ')}`)

const exeResult = spawnSync(EXE, args, {
  stdio: 'ignore',
  encoding: 'utf8',
  timeout: 60000,
  windowsHide: false,
})
const exeCode = exeResult.status ?? (exeResult.error ? 'ERR' : 'TIMEOUT')
console.log(`[lockhunter] exe exit code: ${exeCode}`)

// 2) If silent mode was used, skip dialog closing.
const isSilent = args.some(a => a.toLowerCase() === '/silent' || a.toLowerCase() === '-sm')
if (isSilent) {
  console.log('[lockhunter] silent mode — skipping dialog check.')
  process.exit(exeCode === 'ERR' || exeCode === 'TIMEOUT' ? 1 : exeCode)
}

// 3) Auto-close LockHunter result dialogs: poll a few rounds.
const MAX_ROUNDS = 8       // max polling attempts
const INTERVAL_MS = 400    // sleep between rounds
let closedTotal = 0
for (let i = 0; i < MAX_ROUNDS; i++) {
  let out = ''
  let err = ''
  try {
    const r = spawnSync('powershell', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', PS_FILE], {
      encoding: 'utf8',
      timeout: 8000,
      windowsHide: true,
    })
    out = (r.stdout || '').trim()
    err = (r.stderr || '').trim()
  } catch (e) {
    err = String((e && e.message) || e)
  }
  const hit = parseInt(out, 10) || 0
  closedTotal += hit
  if (hit > 0) console.log(`[autoclose] round ${i + 1} closed ${hit} window(s)`)
  if (hit === 0 && i >= 2) break // stable no-window state, stop early
  if (err && hit === 0) {
    console.error(`[autoclose] check script error: ${err.slice(0, 200)}`)
    if (i >= 6) break
  }
  if (i < MAX_ROUNDS - 1) {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, INTERVAL_MS) // sync sleep
  }
}

console.log(`[autoclose] total closed ${closedTotal} LockHunter dialog(s)`)
console.log('[lockhunter] done.')
process.exit(exeCode === 'ERR' || exeCode === 'TIMEOUT' ? 1 : exeCode)
