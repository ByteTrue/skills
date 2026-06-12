# bt-audit reference templates

## `index.md` template

```markdown
---
doc_type: audit-index
audit: {YYYY-MM-DD}-{slug}
scope: {one-line description of the audit scope}
created: {YYYY-MM-DD}
status: active
total_findings: {N}
---

# {slug} Audit Report

## Scope

{which directories or files were scanned, and the keywords or description provided by the user}

## Overall Assessment

{one-paragraph summary: how many findings in total, distribution by dimension, distribution by severity, which items deserve the most attention, and the overall impression of code quality}

## Findings List

| # | Nature | Severity | Confidence | Title | File |
|---|---|---|---|---|---|
| 1 | security | P0 | high | SQL injection risk | [finding-01.md](finding-01.md) |
| 2 | performance | P1 | medium | N+1 queries in order list | [finding-02.md](finding-02.md) |
| ... | ... | ... | ... | ... | ... |

## Distribution by Dimension

| Nature | P0 | P1 | P2 | Total |
|---|---|---|---|---|
| bug | 0 | 2 | 1 | 3 |
| security | 1 | 0 | 0 | 1 |
| performance | 0 | 1 | 1 | 2 |
| maintainability | 0 | 0 | 3 | 3 |
| arch-drift | 0 | 1 | 0 | 1 |
| **Total** | **1** | **4** | **5** | **10** |

## Suggested Next Steps

- **Fix P0 immediately**: {list, suggest opening `bt-issue`}
- **Fix P1 this iteration**: {list}
- **P2 when there is time**: {list}
```

---

## `finding-NN.md` template

```markdown
---
doc_type: audit-finding
audit: {YYYY-MM-DD}-{slug}
finding_id: "{nature}-{NN}"
nature: bug | security | performance | maintainability | arch-drift
severity: P0 | P1 | P2
confidence: high | medium | low
suggested_action: bt-issue | bt-refactor
status: open
---

# Finding {NN}: {one-line title}

## Short Answer

{one-line description: what the problem is, where it is, and what impact it has}

## Key Evidence

- `{file}:{line}` — {code snippet or description} — {why this constitutes a problem}
- `{file}:{line}` — ...

## Impact

{impact scope / trigger conditions / estimated user count affected, if knowable}

## Fix Direction

{one-line suggestion for how to fix it, without expanding; expanding it would mean stealing work from `bt-issue` or `bt-refactor`}

## Suggested Action

{`bt-issue` or `bt-refactor`}, because {one-line reason}
```

---

## Dimension Scanning Checklist

Check against these items one by one while scanning. Not every item must produce a finding. If nothing is found for an item, skip it.

### bug risks
- [ ] Null-path issues: missing optional chaining, unguarded `null` or `undefined`
- [ ] Boundary conditions: empty arrays, empty strings, `0`, negative numbers, extremely large values
- [ ] Race conditions: async ordering dependencies, timing of state updates
- [ ] Error handling: empty `try-catch`, uncaught Promise rejections, swallowed error messages
- [ ] Type safety: unguarded assertions such as `as` or `!`, spread of `any`

### security
- [ ] Injection: SQL/NoSQL string concatenation, command injection, XSS via `innerHTML` or `dangerouslySetInnerHTML`
- [ ] Sensitive data: logging tokens or passwords, exposing keys on the frontend, leaking fields in response bodies
- [ ] Authorization: missing auth middleware, privilege escalation due to unverified resource ownership
- [ ] Dependencies: third-party packages with known vulnerabilities, outdated security-sensitive libraries

### performance
- [ ] N+1 queries: database calls or API requests inside loops
- [ ] Repeated computation: expensive calculations without memoization, object or function creation inside render
- [ ] No pagination or virtualization: loading large lists in full
- [ ] Memory leaks: unremoved event listeners, uncleared timers, closures holding large objects
- [ ] Main-thread blocking: synchronous reading of large files, CPU-heavy work without a Web Worker

### maintainability
- [ ] Very long functions
- [ ] High cyclomatic complexity, above 15
- [ ] Repeated logic blocks, same or highly similar code appearing 3 or more times
- [ ] Mysterious constants, magic numbers without names
- [ ] Cyclic dependencies, A → B → A

### architecture drift
- [ ] Layer leakage: upper layers directly call lower-layer implementation details or bypass the middle layer
- [ ] Implicit module coupling: cross-module imports of internal files that are not public APIs
- [ ] Inconsistent with records under `.bytetrue/architecture/`
- [ ] Convention violations: naming, directory structure, or error-handling patterns inconsistent with project conventions
