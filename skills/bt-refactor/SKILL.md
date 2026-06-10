---
name: bt-refactor
description: 'Entry point for the code-optimization sub-workflow. It handles work where behavior stays the same but structure changes, structure, performance, readability, and so on, and proceeds in stages: scan → design → apply, with human approval at each stage. Trigger when the user says "optimize", "refactor", "rewrite", "split this up", "performance is bad", or "the code is too long", as long as the request does not include behavior changes. It does not handle new requirements, bugs, or cross-module architecture replanning.'
---

# bt-refactor

## Read Before Starting

Before making any judgment or taking any action, read `.bytetrue/attention.md` first; if it is missing, treat the skeleton as incomplete and tell the user to fill it in or run `bt-onboard`.

When the AI refactors by itself, there are two stable failure modes: first, it does not know the module's real requirements and constraints, so the result is not behavior-equivalent; second, the swallowed scope exceeds what the context window can hold, so by the time it reaches the later changes it has forgotten the earlier constraints. This workflow inserts a scan checklist plus a method library between "want to optimize" and "start editing", so the AI takes only the work it can reliably do correctly.

```text
scan, gather an optimization list → design, agree with the user which items to do and in what order → apply, execute one by one with a human checkpoint at each step
```

**Core discipline**: behavior equivalence is the floor. The moment the change would affect externally observable behavior, it is not refactor anymore. It should instead go to feature, demand change, or issue, bug fix.

---

## Fastforward mode, small refactors

If the refactor is only one function or one component, only 1-3 optimizations, has tests that can self-prove it, and needs no visual inspection, then the full three-stage flow is too heavy. Trigger `bt-refactor-ff`: it identifies the work directly, aligns once, changes the code in place, and proves it with tests, without producing scan, design, or checklist.

Trigger phrases: "small refactor", "quick refactor", "just optimize function XX a bit", "just change it", or "too many steps".

**Do not use** ff when the change spans more than 1 file, is expected to touch more than 3 places, needs visual verification, changes a public interface, which requires Parallel Change, has no test coverage, or crosses modules. In those cases, recommend the standard flow. If ff starts and the work turns out more complex than expected, switch back to the full flow starting from scan.

---

## Where the files go

```text
.bytetrue/refactors/{YYYY-MM-DD}-{slug}/
├── {slug}-scan.md              ← stage 1 optimization list
├── {slug}-refactor-design.md   ← stage 2 execution plan
├── {slug}-checklist.yaml       ← generated in stage 2, advanced in stage 3
└── {slug}-apply-notes.md       ← stage 3 execution record
```

The directory naming matches feature and issue. The slug should be short enough to show at a glance what is being changed, such as `user-form-split` or `export-perf`.

Why keep refactor in its own directory rather than mixing into features: refactor artifacts are time-sensitive records of "current code scan + execution notes", while feature artifacts are lower-churn records of "why this was designed this way". The archive logic is different.

---

## Three stages

| Stage | Output | Who Leads |
|---|---|---|
| 1 scan | `scan.md` | AI scans and runs pre-checks, user selects |
| 2 design | `refactor-design.md` + `checklist.yaml` | AI drafts, user reviews as a whole |
| 3 apply | code changes + `apply-notes.md` | AI executes, each step requires human approval |

There is a checkpoint between stages: no design until scan has been selected; no code until design is approved; and inside apply, any HUMAN verification item must explicitly pass before the next step starts.

---

## Stage 1: scan

### Run pre-checks first, stop if any one hits

Before writing the scan list, run the pre-checks once. If any one hits, **stop scan and give the routing recommendation**, rather than padding out a list anyway. The 7 checks and their output format are in `reference/refusal-routing.md`.

Zero findings is a valid output. If the scan genuinely finds nothing worth doing, say that honestly rather than forcing items into the list.

### Lock the scan scope

Before scanning, confirm: **which files are in scope this time**. Default behavior:

- if the user named specific files or components, scan only those
- if the user says "this page", scan the entry component plus the directly imported internal modules, but do not chase shared dependencies
- if the user says "this module", scan the files under that module directory, but do not cross the module boundary
- if the scope exceeds 15 files or 3000 lines, trigger the sixth pre-check and ask the user to narrow it first

The scope must include test files as well, because they are needed for the second pre-check on test coverage.

### What to look for during scan

Use the four levels of the method library as the template:

- **L1 behavior-equivalent migration**: when a function is widely called but its interface or implementation has to change → Parallel Change; when a whole old block of logic should be replaced by a new implementation → Strangler Fig
- **L2 code-level refactor**: very long functions, over 50 lines or cyclomatic complexity over 10, repeated conditional fragments, mysterious temporary variables, or deeply nested if-else
- **L3 structural split**: frontend components over 300 lines, files carrying multiple concerns, containers mixed with presentation, same logic reimplemented in multiple components; backend controllers directly calling DB, missing service layers, or repositories being bypassed
- **L4 performance**: repeated computations that should be memoized, N+1 queries, lists without virtualization or pagination, event listeners without cleanup, or large objects held in deep reactivity

Use the Matt `improve-codebase-architecture` vocabulary for architecture-improvement candidates, but only as refactor candidates, never as a pretext to enlarge the scope:

- **deep module / shallow module**: prefer modules whose small interface hides real complexity; be skeptical of shallow forwarding layers, universal utils, or wrapper layers that only rename things without reducing complexity
- **seam / adapter**: refactors may extract seams or adapters, but they must remain behavior-equivalent; if the seam changes caller semantics, it is no longer refactor
- **deletion test**: if deleting a module merely scatters complexity back into callers, the module may still have value; if complexity vanishes outright, it may be a meaningless middle layer
- **interface as test surface**: after refactor, the public interface should become a better behavior-test surface rather than forcing tests downward into private implementation

The full method library is in `reference/methods.md`. Load it as the matching table during scan.

### Output format

`{slug}-scan.md` has two parts:

1. **Top-level overview**, one paragraph: scan scope, number of findings, distribution by category, distribution by risk, which items should be done first, and which items should be treated carefully
2. **Checklist items**, one block per item: the field order and hard constraints are in `reference/scan-checklist-format.md`

Give the whole scan to the user, and let the **user mark ✓ or ✗**, with reasons for ✗, before moving into stage 2. **Do not check them off on the user's behalf.**

---

## Stage 2: design

### Inputs

- the user-selected `{slug}-scan.md`
- the method library, every selected item must map to a method ID `M-Ln-NN`

### What it does

1. **Order the work** — if selected items have dependencies, put the prerequisites first. L1 items like Parallel Change usually come first, and L2 extractions often follow. Independent items should prioritize low risk plus things the AI can self-prove. HUMAN-verification items should be batched later
2. **Add execution detail to each item**: method ID, steps, prerequisites, exit signal, verification owner, AI or HUMAN, and rollback strategy
3. **Identify prerequisites** — items with inadequate test coverage get a prerequisite of "add characterization coverage"; items that change public interfaces get a prerequisite of "search callers"
4. **Overall review** — present the whole design to the user, and once approved, set `status: approved`
5. **Extract the checklist** — steps mirror execution order, checks mirror step exit signals

For architecture-oriented items, the design must additionally make these explicit:

- which module is supposed to become deeper, and why the current interface is shallow
- where the seam or adapter boundary is, and which callers should not perceive the change
- the result of the deletion test
- how behavior equivalence will be proven through public interfaces or existing tests

### design file structure

```markdown
---
doc_type: refactor-design
refactor: {YYYY-MM-DD}-{slug}
status: draft | approved
scope: {one-line scan scope}
summary: {one-line summary of which items will be done this time}
---

# {slug} refactor design

## 1. Scope of this run
- which scan items were selected, by number
- which items were explicitly not selected, marked ✗, and why
- estimated total work and total risk level

## 2. Prerequisites
- test coverage supplementation, if needed
- caller search, if needed
- other one-time preparation

## 3. Execution order
One block per step:
- Step N: {one-line action}
- Referenced method: M-Ln-NN {method name}
- Concrete operations: {apply the generic method onto concrete files or functions in this repo}
- Exit signal: {which tests AI runs / what page HUMAN checks}
- Verification owner: AI self-proves | HUMAN
- Rollback: {how to restore if the step fails, usually git revert for that step}

## 4. Risks and watch points
- summary of high-risk steps
- places likely to go wrong, such as cross-step data-flow changes
```

---

## Stage 3: apply

### Advancement rules

1. **One step at a time, never batch** — follow the checklist order strictly; do not open the next step before the current one is complete
2. **Verify after each step**:
   - AI self-proof: run the designated tests, typecheck, lint, or grep that old references are gone. If it passes, record it in apply-notes and continue
   - HUMAN verification: **stop and report** "step N is complete; please visually confirm at {specific page or operation}; I will continue after your confirmation". If the user does not explicitly say "continue", do not proceed
3. **Record drift immediately** — if execution discovers something the plan did not consider, such as a caller hidden behind a dynamic import, **stop and report it rather than freelancing**. Align with the user, record it in apply-notes, and if necessary return to stage 2 to update design
4. **Behavior-equivalence self-check** — after each step, ask "could this step have changed externally observable behavior?" If there is any suspicion, return to that step immediately

Hard boundary for architecture deepening: only behavior-equivalent seam or adapter extraction is allowed. The moment a public semantic, calling protocol, or module responsibility has to change, stop apply and instead route it through `bt-grill`, then decide whether it belongs to `bt-roadmap`, `bt-feat`, or a larger refactor.

### `apply-notes` format

```markdown
---
doc_type: refactor-apply-notes
refactor: {YYYY-MM-DD}-{slug}
---

# {slug} apply notes

## Step 1: {action}
- Completed at: {date}
- Files changed: {file list}
- Verification result: {test output / HUMAN confirmation wording}
- Drift: {none / concrete description}

## Step 2: ...
```

### After all steps are complete

- run the full test suite + typecheck + lint
- ask the user for one final end-to-end visual confirmation, frontend means open the main page and click through the path once
- after confirmation passes, do the close-out commit, with the message referencing the refactor directory

---

## Exit Conditions

- [ ] the scan pre-checks were run, anything that hit got routed away, and only the non-hit path continued into scan
- [ ] the user has marked `{slug}-scan.md` with ✓ and ✗
- [ ] every selected item in design maps to a method ID
- [ ] design passed whole-document user review and is `status: approved`
- [ ] `checklist.yaml` has been generated and passes `validate-yaml.py`
- [ ] every apply step has a verification record, AI self-proof includes logs, HUMAN proof includes the user's confirmation wording
- [ ] full test suite, typecheck, and lint all pass
- [ ] the user's final visual confirmation has passed

---

## Easy Pitfalls

- **padding the scan list** — a pre-check clearly hits, but the AI finds excuses to bypass it and emits a bunch of vague "could be more elegant" items anyway
- **smuggling in behavior changes** — "while here I also fixed a bug" or "while here I improved the copy" — split that into an issue or feature instead
- **merging multiple steps into one action** — a single commit doing 2-3 steps loses the ability to roll back one clean step
- **putting preference items into the list** — naming taste, quotes, arrow function vs function — those belong in decisions
- **starting a scan on a large module and moving straight into work** — if it is over 15 files or 3000 lines and not narrowed, the output becomes an undecidable wall of text
- **skipping HUMAN verification yourself** — the AI cannot see frontend effects; typecheck is not a substitute for human eyes
- **forcing through despite lack of coverage** — changing an untested module while claiming behavior equivalence only as a verbal promise

---

## Boundary with nearby workflows

- **feature**: add new capability or change requirement. If a refactor discovers "while here we should also implement X", stop and split it out
- **issue**: fix a bug or wrong behavior. Bugs discovered during refactor should be recorded as new issues, not quietly fixed
- **decisions**: long-term, project-wide constraints, for example "always use composables" or "ban mixins". Refactor can reference existing decisions, but does not produce new decisions itself
- **architecture**: cross-module boundary repartition or layering changes. One refactor should stay module-local; cross-module changes should be decomposed into "update architecture + record decision + N module-level refactors"
- **tricks / learning**: reusable techniques discovered during refactor go into tricks; pitfalls stepped on go into learning

---

## Related documents

- `bt-refactor-ff/SKILL.md` — the ultra-light path for small refactors
- `reference/scan-checklist-format.md` — fields, order, and hard constraints for scan items
- `reference/refusal-routing.md` — the 7 pre-checks before scan plus the routing table
- `reference/methods.md` — the method library, four levels L1-L4
- `.bytetrue/reference/shared-conventions.md` — shared conventions across workflows
