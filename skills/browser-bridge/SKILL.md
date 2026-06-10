---
name: browser-bridge
description: Control a real browser through a Chrome extension. Use it when you need to visit web pages, extract page data, click buttons, fill forms, run browser automation, capture rendered component evidence, or operate the page programmatically. It returns token-efficient structured results through DOM diffs, simplified HTML, and a component evidence pack. Suitable for browser control, web automation, page scraping, web data extraction, execute JS in browser, web_scan, web_execute_js, open browser, navigate to URL, get page content, fill form, click button, extract component, rendered DOM, computed styles, and component evidence.
---

# Browser Bridge

Browser Bridge connects to a real browser through a Chrome extension and provides structured page-control and extraction capabilities. It does not dump the page's full raw HTML back into the model. Instead, it runs JavaScript inside the browser and returns structured results, DOM-change summaries, and transient text such as toast messages or loading text.

## Intended usage

Browser Bridge is an independent skill. It documents only its own installation, command interface, and usage modes.

Before using it, confirm three things:

- the Python dependencies and the Chrome extension are already installed
- `python <skill-dir>/scripts/browser.py tabs` can see browser tabs

## Architecture

```text
CLI (browser.py)  ->  Python (TMWebDriver)  <-WebSocket->  Chrome extension  <-CDP/scripting->  Browser Tab
```

- the Python WebSocket server runs at `ws://127.0.0.1:18765`
- the Chrome extension connects to the server and forwards commands into browser tabs
- JavaScript executes in the page context; if CSP blocks it, execution falls back to CDP
- returned results are structured JSON, not raw HTML

## One-time installation

Before first use, install the dependencies:

```bash
pip install bs4 simple-websocket-server bottle requests
```

Then install the Chrome extension:

1. Open `chrome://extensions/` in Chrome.
2. Enable Developer mode.
3. Click Load unpacked and select `<skill-dir>/assets/extension/`.
4. Open any web page to verify it: a green `ljq_driver: connected` marker should appear in the lower-right corner.

## CLI reference

All commands auto-start the bridge server the first time they are called. The CLI lives at:

```text
<skill-dir>/scripts/browser.py
```

In the examples below, `<skill-dir>` means the directory containing this `SKILL.md`.

### `exec`: execute JavaScript in the browser

This is the most commonly used main command. Write JavaScript directly to query or operate the DOM. The system captures the return value, DOM changes, and short-lived text that appears during execution, such as toast messages, notifications, or loading text.

```bash
python <skill-dir>/scripts/browser.py exec "<javascript>"
```

Parameters:

- `--tab <id>`: target a specific tab
- `--no-monitor`: skip DOM diff, faster
- `--wait <selector>`: wait for a CSS selector to appear before execution, useful for SPAs
- `--wait-ms <ms>`: maximum wait time for `--wait`, default `10000`
- `--timeout <s>`: execution timeout in seconds, default `15`

Examples:

```bash
# Get page title
python <skill-dir>/scripts/browser.py exec "document.title"

# Click an element and inspect page changes
python <skill-dir>/scripts/browser.py exec "document.querySelector('.submit-btn').click()"

# Extract structured data
python <skill-dir>/scripts/browser.py exec "Array.from(document.querySelectorAll('.item')).map(e=>({name:e.querySelector('.name')?.textContent,price:e.querySelector('.price')?.textContent}))"

# Fill a form field and trigger React/Vue bindings
python <skill-dir>/scripts/browser.py exec "const e=document.querySelector('#email');e.value='u@x.com';e.dispatchEvent(new Event('input',{bubbles:true}))"

# Scroll down
python <skill-dir>/scripts/browser.py exec "window.scrollBy(0,800)"

# Wait for an element before interacting
python <skill-dir>/scripts/browser.py exec --wait ".loaded" "return document.querySelector('.loaded').textContent"

# Long-running operation
python <skill-dir>/scripts/browser.py exec --timeout 30 "await fetch('/api/slow'); return 'done'"
```

Returned fields:

- `status`: `success` or `failed`
- `js_return`: the JavaScript return value; DOM elements are intelligently converted to `outerHTML`
- `diff`: DOM-change summary showing which elements appeared or changed
- `transients`: short-lived text seen during execution, such as toast or loading text
- `newTabs`: new tabs opened during execution
- `tab_id`: the tab ID where execution occurred
- `error`: the error message when execution fails
- `reloaded`: whether the page reloaded during execution
- `suggestion`: a hint returned when the page showed no obvious changes

### `scan`: get simplified page content

Use this when you need a page overview. The HTML goes through semantic and space simplification: sidebars, floating ads, blocked or hidden content are removed; repeated lists are truncated to 3 items; non-semantic attributes are stripped.

```bash
python <skill-dir>/scripts/browser.py scan              # simplified HTML + tab list
python <skill-dir>/scripts/browser.py scan --tabs-only  # only return the tab list, no HTML
python <skill-dir>/scripts/browser.py scan --text-only  # only return text, lowest token cost
python <skill-dir>/scripts/browser.py scan --size-only  # only return content size, useful to confirm rendering
python <skill-dir>/scripts/browser.py scan --tab <id>   # scan a specific tab
python <skill-dir>/scripts/browser.py scan --wait ".result-card"  # wait for SPA content
```

Returned fields:

- `status`: `success` or `error`
- `html`: simplified HTML; not returned for `tabs-only` or `size-only`
- `url` / `tab_id`: current tab info
- `sessions`: list of all tabs with id, url, and title
- `size`: content character count, returned only by `size-only`
- `msg`: error message on failure

### `tabs`: list all browser tabs

```bash
python <skill-dir>/scripts/browser.py tabs
# -> {"status":"success","sessions":[{"id":"123","url":"https://...","title":"..."},...]}
```

### `navigate`: open a URL

Navigate the current tab and wait for the page to finish loading, up to 30 seconds.

```bash
python <skill-dir>/scripts/browser.py navigate "https://example.com"
python <skill-dir>/scripts/browser.py navigate "https://example.com" --no-wait  # skip load waiting
```

Return:

```json
{"status":"success","navigated_to":"https://...","loaded":true}
```

### `back`: go back

```bash
python <skill-dir>/scripts/browser.py back
```

### `forward`: go forward

```bash
python <skill-dir>/scripts/browser.py forward
```

### `reload`: reload the current page

```bash
python <skill-dir>/scripts/browser.py reload
```

### `newtab`: open a new tab

```bash
python <skill-dir>/scripts/browser.py newtab
python <skill-dir>/scripts/browser.py newtab "https://example.com"
```

The response tries to include both `tab_id` and `tab`, so later calls can pass the tab directly through `--tab`.

### `close`: close a tab

```bash
python <skill-dir>/scripts/browser.py close
python <skill-dir>/scripts/browser.py close <tab_id>
```

### `switch`: switch tabs by URL fragment

```bash
python <skill-dir>/scripts/browser.py switch "github"
# -> {"status":"success","session_id":"456"}
```

If multiple tabs match, the first one is chosen by default. When exact selection matters, run `tabs` first and use the tab IDs explicitly.

### `screenshot`: take a screenshot

Capture a PNG from the current tab through the Chrome DevTools Protocol.

```bash
python <skill-dir>/scripts/browser.py screenshot
python <skill-dir>/scripts/browser.py screenshot page.png
```

Return:

```json
{"status":"success","filepath":"/tmp/screenshot_1714650000.png"}
```

### `evidence`: export rendered component evidence

Use this for design-system extraction and component reconstruction. For small and detail-sensitive components such as switch, slider, tabs, select, menu, dialog, command input, date picker, or chart, screenshots alone are unreliable. `evidence` captures the rendered component structure from a real browser tab.

```bash
python <skill-dir>/scripts/browser.py evidence 'button[role="switch"]' --name Switch --out component-evidence/switch
python <skill-dir>/scripts/browser.py evidence '[data-slot="switch"]' --name Switch --index 0 --depth 4
python <skill-dir>/scripts/browser.py evidence '.tabs-root' --name Tabs --wait '.tabs-root' --wait-ms 8000
```

Parameters:

- `--name <name>`: component name, used in metadata and output directory
- `--out <dir>`: output directory, default `component-evidence/<name>`
- `--index <n>`: selector match index, default `0`
- `--depth <n>`: descendant-structure depth, default `4`
- `--tab <id>`: target a specific tab
- `--wait <selector>` / `--wait-ms <ms>`: wait for SPA rendering before capturing the component
- `--all-styles`: capture all computed styles instead of the reduced UI-style set

Output files:

```text
component-evidence/<name>/
  README.md
  metadata.json
  dom.html
  attributes.json
  class-list.txt
  box-model.json
  computed-styles.json
  anatomy.json
  screenshot.png
  page.png
```

Treat these artifacts as the authoritative source for the component structure. When translating the component into source code, preserve meaningful `role`, `aria-*`, `data-state`, `data-size`, `data-slot`, dimensions, transforms, and state class names. If `evidence` is unavailable, ask the caller for copied rendered DOM, class list, or source code first, then mark detail-sensitive components as verified.

## Further reference

Usage modes, SPA extraction examples, research cheat sheets, and troubleshooting notes live in `reference.md`. When operating Grok, read `grok.md`. Only read these references when the command descriptions alone are insufficient.
