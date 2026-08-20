---
name: browser-automation
description: "Automate web browser interactions for testing, scraping, and UI verification. Use when the user needs to navigate websites, fill forms, click buttons, take screenshots, extract page content, verify UI behavior, or interact with web apps programmatically. Covers in-app browser concepts, Playwright CLI, PowerShell browser control, and accessibility-tree-based interaction."
---

# Browser Automation (DSH)

Automate web browser interactions using the tools available to DSH: PowerShell (`pwsh`), web search, and image reading.

## Strategy Selection

Choose the right approach for the task:

### 1. Simple page content extraction
Use `web_search` for search-based content. For specific URLs, use `pwsh` with `Invoke-WebRequest` or `curl.exe`:

```powershell
$response = Invoke-WebRequest -Uri "https://example.com" -UseBasicParsing
$response.Content
```

### 2. Rendered page / JavaScript-heavy sites
Use Playwright via PowerShell or Node.js:

```powershell
# Install Playwright if needed
npm install -g @playwright/cli
# Or use npx
npx playwright open --browser chromium https://example.com
```

```powershell
# Take a screenshot with Playwright CLI
npx playwright screenshot --full-page --wait-for-timeout 5000 https://example.com screenshot.png
```

### 3. Form filling / clicking / interaction
Use Playwright's code generation or write a script:

```powershell
# Record interactions (generates code)
npx playwright codegen https://example.com

# Run a Playwright script
node browser-script.js
```

## Accessibility-Tree Navigation

For agent-native browser navigation, prefer the accessibility tree over screenshots when possible:

1. Use `pwsh` to invoke Playwright and extract the accessibility snapshot:

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

2. Use the snapshot to identify elements by role and name, then interact:

```powershell
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://example.com');
  await page.getByRole('button', { name: 'Submit' }).click();
  await page.getByLabel('Email').fill('test@example.com');
  await page.screenshot({ path: 'result.png' });
  await browser.close();
})();
"
```

## Screenshot + Verify Workflow

For visual verification, combine Playwright screenshots with DSH's `read_image`:

1. Capture screenshot:

```powershell
npx playwright screenshot --wait-for-timeout 3000 https://example.com D:\Projects\browser-shot.png
```

2. Read the screenshot in DSH:

```
read_image("D:\Projects\browser-shot.png")
```

3. Inspect visually and iterate.

## Tab Management

When working with multiple pages:

```powershell
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page1 = await context.newPage();
  const page2 = await context.newPage();
  await page1.goto('https://example.com');
  await page2.goto('https://example.org');
  const pages = context.pages();
  console.log('Open tabs:', pages.length);
  await browser.close();
})();
"
```

## Key Tools Available to DSH

| Tool | Browser Use Case |
|------|-----------------|
| `pwsh` | Run Playwright CLI, curl, Invoke-WebRequest |
| `web_search` | Search-based content discovery |
| `read_image` | Visual QA of screenshots |
| `read` / `write` / `edit` | Manage browser scripts |
| `subagent` | Parallel multi-page operations |
| `workflow` | Large-scale browser orchestration |

## References

- [Playwright CLI docs](https://playwright.dev/docs/cli)
- [Accessibility tree snapshot](https://playwright.dev/docs/api/class-accessibility)
