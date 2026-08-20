---
name: node-repl
description: "Run JavaScript/TypeScript code interactively via a Node.js REPL shell for DOM inspection, browser control logic prototyping, data transformation, and API debugging. Use when the user needs to execute JavaScript snippets, test Node.js modules, prototype browser automation scripts, or run Node-based tools. The REPL runs via PowerShell using `node -e` for one-liners or `node` interactive mode for multi-line sessions."
---

# Node.js REPL (DSH)

Run JavaScript/TypeScript code via Node.js through DSH's `pwsh` tool. Use for prototyping, data processing, browser scripting, and debugging.

## Quick Execution

### One-liner
```powershell
node -e "console.log('Hello from Node.js')"
```

### Multi-line script via -e
```powershell
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
console.log(JSON.stringify(data, null, 2));
"
```

### Run a .js file
```powershell
node D:\Projects\my-script.js
```

### Run a .ts file (with ts-node or esbuild)
```powershell
npx ts-node D:\Projects\my-script.ts
# or
node --experimental-strip-types D:\Projects\my-script.ts
```

## Interactive REPL

Start an interactive Node session:

```powershell
node
```

Then type expressions interactively. To use from DSH, pass code via stdin:

```powershell
@"
const _ = require('lodash');
const data = [1, 2, 3, 4, 5];
console.log(_.chunk(data, 2));
"@ | node
```

## Browser Automation Prototyping

Prototype Playwright scripts before running them:

```powershell
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://example.com');
  const title = await page.title();
  console.log('Page title:', title);
  await browser.close();
})().catch(e => console.error(e));
"
```

## Data Transformation

```powershell
node -e "
const data = process.argv[1];
const parsed = JSON.parse(data);
// Transform
const result = parsed.map(item => ({ ...item, processed: true }));
console.log(JSON.stringify(result, null, 2));
" '\"{\\\"key\\\": \\\"value\\\"}\"'
```

Or read from file and transform:

```powershell
node -e "
const fs = require('fs');
const raw = fs.readFileSync('D:\Projects\input.json', 'utf8');
const data = JSON.parse(raw);
const transformed = data.filter(item => item.active);
fs.writeFileSync('D:\Projects\output.json', JSON.stringify(transformed, null, 2));
console.log('Done:', transformed.length, 'items');
"
```

## NPM Module Usage

```powershell
# Install a module locally
npm install lodash

# Use it
node -e "const _ = require('lodash'); console.log(_.uniq([1,2,2,3,4,4]));"
```

## REST API Calls

```powershell
node -e "
const https = require('https');
const url = 'https://api.github.com/repos/nodejs/node';
https.get(url, { headers: { 'User-Agent': 'DSH' } }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    console.log('Stars:', json.stargazers_count);
    console.log('Description:', json.description);
  });
}).on('error', e => console.error(e));
"
```

## Using Fetch (Node 18+)

```powershell
node -e "
const response = await fetch('https://api.github.com/users/nodejs');
const data = await response.json();
console.log(JSON.stringify(data, null, 2));
"
```

## Available DSH Tools for Node Work

| Tool | Use Case |
|------|----------|
| `pwsh` | Run Node.js commands, install npm packages |
| `read` / `write` / `edit` | Manage .js/.ts script files |
| `read_image` | Visual QA of browser screenshots |
| `subagent` | Run long-running Node scripts in background |
| `workflow` | Orchestrate multi-step Node processing |
| `web_search` | Discover npm packages and API docs |

## Common Patterns

| Task | Approach |
|------|----------|
| Quick data transform | `node -e "..."` |
| Browser automation | Write `.js` file → `node file.js` |
| API debugging | `node -e "await fetch(...)"` |
| Large data processing | Write script → `subagent` or background `pwsh` |
| NPM dependency | `npm install` → `require()` in script |
