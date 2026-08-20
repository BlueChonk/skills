# close-lockhunter-dialog.ps1
# Close any LockHunter result dialog that would otherwise block the caller.
# Strategy (robust): enumerate ALL top-level windows (not just the process main window),
# match their titles against LockHunter / success keywords, and send WM_CLOSE.
# Outputs the number of windows closed as one integer line (or 0). Pure ASCII.

Add-Type -TypeDefinition @'
using System;
using System.Text;
using System.Runtime.InteropServices;
public static class LhWin {
  public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);
  [DllImport("user32.dll")] public static extern bool EnumWindows(EnumWindowsProc lpEnumFunc, IntPtr lParam);
  [DllImport("user32.dll")] public static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);
  [DllImport("user32.dll")] public static extern bool PostMessage(IntPtr h, int m, IntPtr w, IntPtr l);
}
'@

$script:targets = [System.Collections.Generic.List[IntPtr]]::new()

$callback = [LhWin+EnumWindowsProc]{
  param([IntPtr]$hWnd, [IntPtr]$lParam)
  $sb = [System.Text.StringBuilder]::new(512)
  [void][LhWin]::GetWindowText($hWnd, $sb, 512)
  $title = $sb.ToString()
  if ($title -match '(?i)LockHunter|Lock|Unlock|result|success' -or $title -match '成功|解锁') {
    $null = $script:targets.Add($hWnd)
  }
  return $true
}

[void][LhWin]::EnumWindows($callback, [IntPtr]::Zero)

$closed = 0
foreach ($h in $script:targets) {
  $null = [LhWin]::PostMessage($h, 0x0010, [IntPtr]::Zero, [IntPtr]::Zero) # WM_CLOSE
  $script:closed++
}
Write-Output $closed
