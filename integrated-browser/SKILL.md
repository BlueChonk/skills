---
name: integrated-browser
description: "Full-featured browser automation with ~20 specialized tools for navigation, interaction, inspection, screenshots, tab management, and network monitoring. Use when the user needs comprehensive browser control: navigate pages, click/type/select elements, capture screenshots and snapshots, read console logs, inspect network requests, manage tabs, and hand control to the user for login/CAPTCHA. Based on Trae's integrated_browser MCP server toolset."
---

# Integrated Browser (DSH)

Full-featured browser automation combining Playwright (via Node.js) with DSH's tool suite. Provides ~20 specialized browser operations.

## Setup

Ensure Playwright is installed:

```powershell
npm install -g playwright
npx playwright install chromium
```

Or use locally:
```powershell
npm install playwright
npx playwright install chromium
```

## Core Operations

### 1. Navigate (`browser_navigate`)
```powershell
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://example.com');
  console.log('Navigated to:', await page.url());
  // Don't close — keep session alive
  await new Promise(() => {});
})();
"
```

### 2. Snapshot (`browser_snapshot`)
Capture accessibility tree (better than screenshot for interaction):
```powershell
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://example.com');
  const snapshot = await page.accessibility.snapshot();
  console.log(JSON.stringify(snapshot, null, 2));
  await browser.close();
})();
"
```

### 3. Click (`browser_click`)
```powershell
node -e "
// After snapshot, identify ref and:
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://example.com');
  await page.getByRole('button', { name: 'Submit' }).click();
  console.log('Clicked');
  await browser.close();
})();
"
```

### 4. Type (`browser_type`)
```powershell
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://example.com');
  await page.getByLabel('Email').fill('test@example.com');
  await page.getByLabel('Email').press('Enter');
  console.log('Typed and submitted');
  await browser.close();
})();
"
```

### 5. Take Screenshot (`browser_take_screenshot`)
```powershell
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://example.com');
  await page.screenshot({ path: 'D:\Projects\browser-screenshot.png', fullPage: true });
  console.log('Screenshot saved');
  await browser.close();
})();
"
```
Then: `read_image("D:\Projects\browser-screenshot.png")`

### 6. Tabs Management (`browser_tabs`)
```powershell
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  // List tabs
  const pages = context.pages();
  console.log('Open tabs:', pages.length);
  // New tab
  const newPage = await context.newPage();
  await newPage.goto('https://example.org');
  // Close tab
  await pages[0].close();
  console.log('Tab managed');
  await browser.close();
})();
"
```

### 7. Console Messages (`browser_console_messages`)
```powershell
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('ERROR:', err.message));
  await page.goto('https://example.com');
  await page.waitForTimeout(3000);
  await browser.close();
})();
"
```

### 8. Network Requests (`browser_network_requests`)
```powershell
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('request', req => console.log('REQ:', req.method(), req.url()));
  page.on('response', res => console.log('RES:', res.status(), res.url()));
  await page.goto('https://example.com');
  await page.waitForTimeout(3000);
  await browser.close();
})();
"
```

### 9. Evaluate JavaScript (`browser_evaluate`)
```powershell
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://example.com');
  const result = await page.evaluate(() => {
    return document.title;
  });
  console.log('Result:', result);
  await browser.close();
})();
"
```

### 10. Scroll (`browser_scroll`)
```powershell
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://example.com');
  await page.evaluate(() => window.scrollBy(0, 500));
  // Or scroll element into view
  await page.getByText('Footer').scrollIntoViewIfNeeded();
  console.log('Scrolled');
  await browser.close();
})();
"
```

### 11. Select Option (`browser_select_option`)
```powershell
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://example.com/form');
  await page.getByLabel('Country').selectOption('US');
  // Or multi-select
  await page.getByLabel('Colors').selectOption(['red', 'blue']);
  console.log('Selected');
  await browser.close();
})();
"
```

### 12. Hover (`browser_hover`)
```powershell
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://example.com');
  await page.getByText('Menu').hover();
  console.log('Hovered');
  await browser.close();
})();
"
```

### 13. Press Key (`browser_press_key`)
```powershell
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://example.com');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Control+a');
  await page.keyboard.press('Tab');
  console.log('Key pressed');
  await browser.close();
})();
"
```

### 14. Navigate Back (`browser_navigate_back`)
```powershell
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://example.com');
  await page.goto('https://example.org');
  await page.goBack();
  console.log('Went back to:', await page.url());
  await browser.close();
})();
"
```

### 15. Lock/Unlock (`browser_lock` / `browser_unlock`)
Indicates whether the agent or user has control. In DSH context:
- "Locked" = agent is automating, user should not interfere
- "Unlocked" = user can take control (e.g., for login/CAPTCHA)

### 16. Wait (`browser_wait_for`)
```powershell
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://example.com');
  // Wait for text to appear
  await page.waitForSelector('text=Success', { timeout: 10000 });
  // Or wait for text to disappear
  await page.waitForSelector('text=Loading', { state: 'detached', timeout: 10000 });
  // Or fixed delay
  await page.waitForTimeout(2000);
  console.log('Wait complete');
  await browser.close();
})();
"
```

### 17. Get Attribute (`browser_get_attribute`)
```powershell
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://example.com');
  const href = await page.getByRole('link').getAttribute('href');
  console.log('href:', href);
  await browser.close();
})();
"
```

### 18. Waiting for User Interaction (`browser_waiting_for_user_interaction`)
Use when the agent needs human help (login, CAPTCHA, judgment call):
- Signal to user that their input is needed
- Wait for user to complete the action
- Resume automation

In DSH, use `ask_user_input` to request user assistance.

## Tool Summary

| # | Tool | Description |
|---|------|-------------|
| 1 | `browser_navigate` | Navigate to URL |
| 2 | `browser_snapshot` | Capture accessibility tree |
| 3 | `browser_click` | Click element |
| 4 | `browser_type` | Type text into element |
| 5 | `browser_take_screenshot` | Capture screenshot |
| 6 | `browser_tabs` | List/create/close/select tabs |
| 7 | `browser_console_messages` | Read console logs |
| 8 | `browser_network_requests` | Monitor network traffic |
| 9 | `browser_evaluate` | Execute JavaScript |
| 10 | `browser_scroll` | Scroll page/element |
| 11 | `browser_select_option` | Select dropdown option |
| 12 | `browser_hover` | Hover over element |
| 13 | `browser_press_key` | Press keyboard key/combo |
| 14 | `browser_navigate_back` | Go back in history |
| 15 | `browser_lock` / `browser_unlock` | Control handover |
| 16 | `browser_wait_for` | Wait for text/time |
| 17 | `browser_get_attribute` | Read element attribute |
| 18 | `browser_waiting_for_user_interaction` | Request human help |

## DSH Integration

All operations run via `pwsh` → Node.js → Playwright. Use `read_image` for screenshot QA and `subagent` for parallel browser sessions.
