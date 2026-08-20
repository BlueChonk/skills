# DeepSeek Harness browser UI (dsh web) — boot auto-start wrapper.
#
# Windows only. Skips if the port is already served; otherwise launches `dsh web`
# and automatically restarts it after a crash, logging to $Log.
#
# EDIT THESE before use in a scheduled task:
$Log     = '<LOG_ABS>'                 # e.g. D:\deepseek-harness-autostart-skill\logs\dsh-web.log
$BindHost = '127.0.0.1'
$Port     = 3080
$Node     = '<NODE_EXE_ABS>'           # from: (Get-Command node).Source
$DshBin   = '<DSH_BIN_ABS>'            # from: npm root -g -> @deepseek-ai\dsh\lib\bin.js

$ErrorActionPreference = 'Continue'

# If the service is already listening (e.g. manually started), do nothing.
if (Test-NetConnection -ComputerName $BindHost -Port $Port -InformationLevel Quiet -WarningAction SilentlyContinue) {
    Add-Content -Path $Log -Value ("[{0}] port {1}:{2} already in use, skipping." -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $BindHost, $Port)
    exit 0
}

while ($true) {
    Add-Content -Path $Log -Value ("[{0}] launching dsh web ..." -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'))
    try {
        & $Node $DshBin '--profile' 'web' '--host' $BindHost '--port' $Port *>> $Log
    } catch {
        Add-Content -Path $Log -Value ("[{0}] ERROR: {1}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $_.Exception.Message)
    }
    Add-Content -Path $Log -Value ("[{0}] dsh web exited, restarting in 5s ..." -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'))
    Start-Sleep -Seconds 5
}