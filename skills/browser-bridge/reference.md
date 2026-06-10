# Browser Bridge Reference

## Usage Modes

### Mode A: Execute First

When the page structure is already known, use `exec` directly:

1. `exec "document.querySelector('.add-to-cart').click()"` returns a small structured diff.
2. The caller can infer page changes from the diff without rereading the whole page.

When the page structure is known, do not use the high-token loop of `scan` -> inspect HTML -> `exec` -> `scan`. Only `scan` first when the page is unknown.

### Mode B: Observe First, Then Execute

Use this for research, competitor analysis, market research, or unknown pages:

1. `scan --text-only` to get a low-token page overview.
2. Use `exec` plus targeted selectors to extract structured data.
3. Use `navigate` + `scan --text-only` to go page by page.
4. Use `back` after going deeper.

Use `--size-only` to confirm whether an SPA has rendered content without returning body text.

## SPA Content Extraction

React and Vue pages often load content dynamically. Before extracting, use `--wait` to wait for elements to appear:

```bash
python <skill-dir>/scripts/browser.py exec --wait ".note-item" "
  Array.from(document.querySelectorAll('.note-item')).map(el => ({
    title: el.querySelector('.title')?.textContent,
    link: el.querySelector('a')?.href
  }))
"

python <skill-dir>/scripts/browser.py exec --wait ".result-card" --wait-ms 8000 --timeout 30 "
  return document.querySelectorAll('.result-card').length
"

python <skill-dir>/scripts/browser.py scan --text-only --wait ".product-list" --wait-ms 5000
```

If you are sure the page has content but `exec` returns an empty array `[]`, fall back to `scan --text-only` first. Common reasons are that the page has not finished rendering or the selector did not match.

## Research Cheat Sheet

| Scenario | Command | Why |
|---|---|---|
| First look at an unknown page | `scan --text-only` | Low-token page overview |
| Quickly confirm whether content rendered | `scan --size-only` | No body-text token cost |
| SPA dynamic content | `exec --wait ".selector" "..."` | Wait for rendering to finish |
| SPA page overview | `scan --text-only --wait ".selector"` | Wait, then scan |
| Extract structured data | `exec "Array.from(...)"` | Precise and low-token |
| Component evidence | `evidence '[data-slot="switch"]' --name Switch` | Capture rendered component structure |
| Dense pricing or store pages | `scan --text-only` | Selectors are hard to guess |
| Multi-source research | `newtab` + `navigate` | Put each source in a separate tab |
| Follow a link, then return | `navigate <url>` then `back` | Dive in, then return to the original page |
| Slow async operation | `exec --timeout 30 "..."` | Extend timeout |

## Site-Specific Reference

- `grok.md`: page structure, input submission, response extraction, and timeout recommendations for operating `https://grok.com` through Browser Bridge.

## Troubleshooting

**"No browser tabs available"**: the extension is not connected. Check the Chrome extensions page, and restart Chrome if needed.

**No green indicator on the tab**: the extension cannot inject into `chrome://` pages or Chrome Web Store pages. This is expected.

**Port 18765 already in use**: another Browser Bridge instance is already running. Stop the old instance first.

**CSP errors**: the extension automatically falls back to CDP, that is, `chrome.debugger`.

**Page does not load after `navigate`**: add `--no-wait` first, then use `exec --wait` or `scan --wait` to wait for the target element.

**Multi-line JS**: use single quotes for the outer string:

```bash
python <skill-dir>/scripts/browser.py exec '
  const items = document.querySelectorAll(".row");
  return Array.from(items).map(r => r.textContent);
'
```
