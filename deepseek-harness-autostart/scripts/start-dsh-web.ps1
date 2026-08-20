# DeepSeek Harness browser UI (dsh web) — boot auto-start wrapper.
#
# Windows only. Skips if the port is already served; otherwise launches `dsh web`
# and automatically restarts it after a crash with exponential backoff.
#
# EXIT CODE POLICY:
#   - dsh exits 0       → graceful shutdown, do NOT restart (break loop)
#   - dsh exits non-zero → crash, restart with backoff (up to $maxRetries)
#   - max retries hit   → give up, log and exit (manual intervention required)
#
# EDIT THESE before use in a scheduled task.
# Resolve paths independently — see SKILL.md Step 1 for the correct method.
# Never assume node.exe and global node_modules share a parent directory.
$Log        = '<LOG_ABS>'                 # e.g. D:\deepseek-harness-autostart-skill\logs\dsh-web.log
$BindHost   = '127.0.0.1'
$Port       = 3080
$Node       = '<NODE_EXE_ABS>'            # REAL node.exe (not a .cmd shim)
$DshBin     = '<DSH_BIN_ABS>'             # from: npm root -g -> @deepseek-ai\dsh\lib\bin.js
$maxRetries = 5                           # max restart attempts after crash
$baseDelay  = 5                           # seconds; doubles each retry, capped at 300s

$ErrorActionPreference = 'Continue'

# If the service is already listening (e.g. manually started), do nothing.
if (Test-NetConnection -ComputerName $BindHost -Port $Port -InformationLevel Quiet -WarningAction SilentlyContinue) {
    Add-Content -Path $Log -Value ("[{0}] port {1}:{2} already in use, skipping." -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $BindHost, $Port)
    exit 0
}

$retryCount = 0

while ($retryCount -lt $maxRetries) {
    Add-Content -Path $Log -Value ("[{0}] launching dsh web (attempt {1}/{2}) ..." -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $retryCount + 1, $maxRetries)
    try {
        & $Node $DshBin '--profile' 'web' '--host' $BindHost '--port' $Port *>> $Log
    } catch {
        Add-Content -Path $Log -Value ("[{0}] ERROR: {1}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $_.Exception.Message)
    }
    $exitCode = $LASTEXITCODE

    # Graceful exit — do not restart
    if ($exitCode -eq 0) {
        Add-Content -Path $Log -Value ("[{0}] dsh web exited normally (code 0), not restarting." -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'))
        break
    }

    # Crash — restart with exponential backoff
    $retryCount++
    $delay = [math]::Min($baseDelay * [math]::Pow(2, $retryCount - 1), 300)

    if ($retryCount -ge $maxRetries) {
        Add-Content -Path $Log -Value ("[{0}] dsh web crashed (exit={1}), max retries ({2}) reached — giving up. Manual intervention required." -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $exitCode, $maxRetries)
        exit 1
    }

    Add-Content -Path $Log -Value ("[{0}] dsh web crashed (exit={1}), retry {2}/{3} in {4}s ..." -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $exitCode, $retryCount, $maxRetries, $delay)
    Start-Sleep -Seconds $delay
}
