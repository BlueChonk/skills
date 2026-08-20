---
name: computer-use
description: "Automate Windows desktop application UI interactions using PowerShell, SendInput, UI Automation, and screen capture. Use when the user needs to control native Windows applications, click UI elements, type into forms, capture screenshots of app windows, or automate repetitive desktop tasks. Works even when windows are occluded."
---

# Computer Use (DSH)

Automate Windows desktop application UI using the tools available to DSH: PowerShell, screen capture, and image reading.

## Strategy

Since DSH runs on Windows, use PowerShell (`pwsh`) to:

1. **Launch and manage applications**
2. **Interact with UI elements** via SendKeys and UI Automation
3. **Capture screenshots** of specific windows or the full screen
4. **Verify visual state** by reading screenshots back into DSH

## Application Management

### Launch an application
```powershell
Start-Process "notepad.exe"
Start-Process "calc.exe"
# Or with arguments
Start-Process "msedge.exe" "https://example.com"
```

### Find and activate a window
```powershell
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class WinAPI {
    [DllImport("user32.dll")]
    public static extern IntPtr FindWindow(string lpClassName, string lpWindowName);
    [DllImport("user32.dll")]
    public static extern bool SetForegroundWindow(IntPtr hWnd);
}
"@
$hwnd = [WinAPI]::FindWindow($null, "Untitled - Notepad")
[WinAPI]::SetForegroundWindow($hwnd)
```

## Screen Capture

### Full screen
```powershell
Add-Type -AssemblyName System.Windows.Forms
$screen = [System.Windows.Forms.Screen]::PrimaryScreen
$bounds = $screen.Bounds
$bitmap = New-Object System.Drawing.Bitmap($bounds.Width, $bounds.Height)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.CopyFromScreen($bounds.Location, [System.Drawing.Point]::Empty, $bounds.Size)
$bitmap.Save("D:\Projects\screenshot.png")
$graphics.Dispose()
$bitmap.Dispose()
```

### Specific window
```powershell
# Use PrintWindow API or capture by foreground
Add-Type @"
using System;
using System.Runtime.InteropServices;
using System.Drawing;
public class WindowCapture {
    [DllImport("user32.dll")]
    public static extern IntPtr GetForegroundWindow();
    [DllImport("user32.dll")]
    public static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);
    [StructLayout(LayoutKind.Sequential)]
    public struct RECT { public int Left, Top, Right, Bottom; }
    public static Bitmap CaptureWindow() {
        IntPtr hWnd = GetForegroundWindow();
        RECT rect;
        GetWindowRect(hWnd, out rect);
        int width = rect.Right - rect.Left;
        int height = rect.Bottom - rect.Top;
        Bitmap bmp = new Bitmap(width, height);
        Graphics g = Graphics.FromImage(bmp);
        g.CopyFromScreen(rect.Left, rect.Top, 0, 0, new Size(width, height));
        g.Dispose();
        return bmp;
    }
}
"#
$bmp = [WindowCapture]::CaptureWindow()
$bmp.Save("D:\Projects\window-capture.png")
$bmp.Dispose()
```

## Keyboard Input (SendKeys)

```powershell
Add-Type -AssemblyName System.Windows.Forms
# Bring window to front first, then:
[System.Windows.Forms.SendKeys]::SendWait("Hello World")
[System.Windows.Forms.SendKeys]::SendWait("{ENTER}")
[System.Windows.Forms.SendKeys]::SendWait("^s")      # Ctrl+S
[System.Windows.Forms.SendKeys]::SendWait("%{F4}")   # Alt+F4
```

## Mouse Interaction

```powershell
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class Mouse {
    [DllImport("user32.dll")]
    public static extern bool SetCursorPos(int x, int y);
    [DllImport("user32.dll")]
    public static extern void mouse_event(uint dwFlags, int dx, int dy, uint dwData, int dwExtraInfo);
    public const uint MOUSEEVENTF_LEFTDOWN = 0x0002;
    public const uint MOUSEEVENTF_LEFTUP = 0x0004;
    public static void Click(int x, int y) {
        SetCursorPos(x, y);
        System.Threading.Thread.Sleep(100);
        mouse_event(MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0);
        mouse_event(MOUSEEVENTF_LEFTUP, 0, 0, 0, 0);
    }
}
"#
[Mouse]::Click(500, 300)
```

## Visual Verification Loop

1. **Capture** a screenshot of the current state
2. **Read** it in DSH: `read_image("D:\Projects\window-capture.png")`
3. **Analyze** what happened
4. **Act** based on what you see
5. **Repeat** until the task is complete

## Key Tools Available to DSH

| Tool | Computer Use Case |
|------|-------------------|
| `pwsh` | All UI automation (SendKeys, mouse, capture) |
| `read_image` | Visual QA of screenshots |
| `read` / `write` | Manage automation scripts |
| `ask_user_input` | Request human assistance for CAPTCHAs, login, etc. |
| `subagent` | Parallel desktop automation tasks |

## Safety

- Always confirm with the user before automating actions that send keystrokes or mouse clicks to applications.
- Use `ask_user_input` when authentication, CAPTCHAs, or human judgment is required.
- Never automate destructive actions (delete, format, uninstall) without explicit confirmation.
