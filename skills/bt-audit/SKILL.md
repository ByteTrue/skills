---
name: bt-audit
description: System audit. Proactively discover bug risks, security vulnerabilities, performance problems, maintainability debt, and architecture drift from the code, and produce a batch findings list. Trigger when the user says "review the system", "audit the code", "scan for problems", "look for bugs", or "what could be optimized".
---

# bt-audit

## Read Before Starting

Before making any judgment or taking any action, read `.bytetrue/attention.md` first; if it is missing, treat the skeleton as incomplete, tell the user to fill it in or run `bt-onboard`, and do not fall back to an external AI entry file.

`bt-issue` waits for you to report a known bug. `bt-refactor` waits for you to point at a known optimization target. `bt-explore` waits for you to ask a question. But when the request is "I do not even know where the problems are; scan it first and tell me", nobody else owns that surface. `bt-audit` fills that gap: **within a user-bounded scope, proactively scan the code and produce a findings list cross-classified by severity and nature**.

This skill only finds issues. It does not decide or implement fixes. Fixing belongs to `bt-issue` or `bt-refactor`.

---

## Where the Files Go

```
.bytetrue/audits/{YYYY-MM-DD}-{slug}/
├── index.md           # quick view: scope, overall assessment, and findings matrix
├── finding-01.md
├── finding-02.md
└── ...
```

The date is the audit date. The slug should be short enough to show the target at a glance, such as `auth-module`, `order-flow`, or `payment-security`.

All audit documents carry YAML frontmatter, with `doc_type` values `audit-index` and `audit-finding`, so `search-yaml.py` can search them.

---

## Dimension Matrix, Cross Classification

Every finding gets two labels:

**nature**: `bug` | `security` | `performance` | `maintainability` | `arch-drift`

**severity**: `P0`, must fix; `P1`, should fix; `P2`, could fix

Cross examples:
- `security` × `P0`: SQL injection, storing passwords in plaintext
- `bug` × `P1`: null pointer on a specific boundary condition with low real-world trigger rate
- `performance` × `P2`: unnecessary object allocation inside a loop that only matters on hot paths

Each finding also gets **confidence** as `high`, `medium`, or `low`, and a **suggested action** of `bt-issue`, `bt-refactor`, `bt-arch`, or `bt-grill`.

See `reference.md` for the full template.

---

## Workflow

### Phase 1: Narrow the Scope

An audit cannot blind-scan the whole repository. That is expensive and noisy. First help the user shrink the scope to something executable.

Ask for three kinds of input, and any one of them is enough to start:

1. **Keywords**: "anything related to auth, payment, or upload"
2. **Module or directory**: "everything under `src/services/`"
3. **One-paragraph description**: "users have been saying the order page is slow; audit the order-related code"

If the user's description is already clear, go directly to Phase 2. If the user says "audit the whole project", push back and suggest starting from the most frequently changed module or the area that recently had problems.

After narrowing, confirm with the user: **"I will scan `src/services/order/` plus `src/api/order.ts`, about 12 files, across security, performance, and bug-risk dimensions. Is that scope OK?"**

### Phase 2: Scan

Scan one dimension at a time within the scope defined by the user. If the user did not specify dimensions, scan all 5:

- **bug risks**: null paths, missing boundary conditions, race conditions, swallowed exceptions, unguarded type assertions
- **security**: injection risk, sensitive data exposure, missing permission checks, unsafe dependencies
- **performance**: N+1 queries, repeated computation, missing caching on hot paths, memory leaks, full-list loading without pagination
- **maintainability**: very long functions, cyclomatic complexity above 15, duplicated logic blocks, mysterious constants, cyclic dependencies
- **architecture drift**: code inconsistent with records under `.bytetrue/architecture/`, layer leakage, implicit cross-module coupling

When scanning architecture drift and maintainability, borrow the judgment vocabulary from Matt `improve-codebase-architecture`:

- **deep module / shallow module**: whether the interface stays small while hiding complexity, or merely forwards calls to another layer
- **seam / adapter**: whether there is a clear seam for replacement, testing, and external-system isolation; whether the adapter keeps complexity at the boundary
- **deletion test**: if you imagine deleting the module, does the complexity disappear or scatter back across multiple callers
- **interface as test surface**: whether the public interface is rich enough to express behavior tests, or whether only private implementation details can be tested
- **architecture friction candidate**: only produce candidates; do not directly change anything inside the audit. After the user chooses, route to `bt-refactor`, `bt-grill`, or `bt-arch`

Use Glob, Grep, and Read to inspect the real code while scanning. Every finding must record `file:line` and a concrete code snippet.

**Upper bound**: at most 5 findings per dimension. Do not pad the count. Stop when the top ones are enough; if there are fewer, report fewer.

**Confidence semantics**:
- `high`: the code path clearly proves the trigger and the impact is explicit
- `medium`: static analysis points to the problem, but the triggering condition is uncertain
- `low`: the clue looks suspicious and deserves marking, but further confirmation is needed

### Phase 3: Classify and Produce Output

1. Give each finding nature, severity, confidence, and suggested action
2. Write `index.md` with scope, overall assessment, and the findings table as a cross-classified matrix
3. Write one `finding-NN.md` per finding

**Write the index first, then the individual findings**. This order forces the AI to make the overall judgment before expanding details, rather than getting lost in one finding and losing the global picture.

### Phase 4: Suggest Next Steps

At the end of `index.md`, give priority-based recommendations:

- "The 3 P0 items should be opened as issues and fixed immediately"
- "The 5 P1 items can be scheduled for the next iteration"
- "The 4 P2 items can wait until there is time"

When the user picks one, route to `bt-issue` or `bt-refactor`. `bt-audit` does not fix it itself.

Next-step suggestions for architecture findings:

- small-scope deepening or seam improvement with unchanged behavior → `bt-refactor`
- candidate boundaries that have not been challenged hard enough yet → `bt-grill`
- code state inconsistent with the architecture docs → `bt-arch check/update`
- only need to understand the module and caller map → `bt-explore module-overview`

---

## Boundary with Neighbor Skills

| Skill | Trigger | How bt-audit treats it |
|---|---|---|
| `bt-issue` | the user reports a known bug | when audit finds a bug, it recommends opening `bt-issue` |
| `bt-refactor` | the user points to a known optimization target | when audit finds an optimization target, it recommends opening `bt-refactor` |
| `bt-explore` | inspect code around one question | audit scans across multiple dimensions in bulk; it is not the same thing as explore |
| `bt-arch` | maintain architecture documents | `bt-arch` maintains docs; `bt-audit` checks whether code has drifted from the docs |
| `bt-security-review` | security review | the security dimension in audit is a lightweight scan; deep security review belongs to a specialized workflow |

---

## Guard Rules

- **Do not blind-scan the whole repository** — Phase 1 must narrow the scope; without scope, do not start
- **Every finding must have evidence** — `file:line` plus code snippet plus why it constitutes a problem. Do not allow findings like "feels bad" or "might have a problem" without evidence
- **Confidence must be labeled** — do not mark every finding `high`
- **Maximum 5 findings per dimension** — this forces the AI to choose the most valuable ones instead of dumping everything
- **Only find, do not decide the fix** — `bt-audit` does not produce code changes. If it "fixed something while here", that is out of bounds
- **Architecture drift must cite current docs** — do not judge architecture from memory. Read `.bytetrue/architecture/` and compare against it
- **Mark old audits as superseded** — when a new audit covers the same module, the old index must get `status: superseded` plus `superseded-by: {new directory}`

---

## Exit Conditions

- [ ] the audit scope has been confirmed with the user
- [ ] scanning across the chosen dimensions is complete, with at least one finding, or if there are zero findings, the user has been explicitly told that no obvious problem was found in this scope
- [ ] `index.md` contains the complete cross-classification table
- [ ] every finding includes `file:line`, evidence, and confidence
- [ ] each dimension has 5 findings or fewer
- [ ] the user has been given next-step suggestions ordered by priority

---

## Related Documents

- `reference.md` — templates for `index.md` and `finding-NN.md`
- `.bytetrue/reference/shared-conventions.md` — shared conventions across workflows
- `.bytetrue/architecture/` — comparison source for architecture-drift findings
