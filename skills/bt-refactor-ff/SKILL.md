---
name: bt-refactor-ff
description: Ultra-light path for the refactor workflow. Directly identify 1-3 low-risk optimizations, get one confirmation, change the code in place, and prove it with tests. Trigger when the user says "quick refactor", "small refactor", "just optimize function XX a bit", or "too many steps", and the change stays local to a single function or component with tests available for self-verification.
---

# bt-refactor-ff

## Read Before Starting

Before making any judgment or taking any action, read `.bytetrue/attention.md` first; if it is missing, treat the skeleton as incomplete, tell the user to fill it in or run `bt-onboard`, and do not fall back to an external AI entry file.

When the user says "optimize this function" and the change is obviously very small, such as a long single function, extracting a composable from a component, or merging a repeated block, the full three-stage flow is too heavy. Fastforward lets the AI change code directly the way it normally would, while still holding the line on the essentials: behavior equivalence, use of classic methods, and test-backed self-verification.

Very light: no scan checklist, no design doc, no checklist. A one-line report after the change is enough.

---

## Three Hard Entry Checks

If any one fails, fall back to the full `bt-refactor` flow:

1. **Is behavior really unchanged?** If the user's request sneaks in "also support X" or "change it to Y", that is a behavior change rather than a refactor. Ask the user to split it out into feature or issue work.
2. **Is the scope really small?** If it touches more than 1 file, exceeds 100 lines of changes in a single file, or is expected to require more than 3 change points, fall back to the full flow.
3. **Are there tests that can prove it?** The target code must already have coverage, such as unit tests, integration tests, or a type check that can catch it. Without tests, fall back to the full flow, or write one characterization test first and return here later.

The full scan phase has 7 entry checks. Here they are compressed to the 3 most critical ones. The remaining 4, such as cross-module, all-flavor, generated code, or unscannable surface, are already implicitly excluded inside "is the scope really small?"

---

## Use Classic Methods, Do Not Freestyle

Fastforward does not read the full method library, but it must still hold the rule that **every change must correspond to a classic refactoring method**. If the AI cannot tell itself "this step is Extract Function / Memoization / Guard Clauses / ..." then this is not a simple refactor, and it should fall back to the full flow and consult the method library.

Common methods, covering about 80% of fastforward cases:

- **Extract Function**: a cohesive fragment longer than 5 lines that can be named → extract it into its own function
- **Extract Variable**: complex expression → name it as a variable or query
- **Guard Clauses**: deeply nested `if` checks at the top → flatten by returning early
- **Decompose Conditional**: complex `if` condition → name it as a boolean function
- **Extract Composable / hook**: closed-over state plus side effects inside a component → move into a separate composable or hook
- **Memoization**: repeated computation → `computed` or `useMemo`
- **Cancellation**: side effect missing cleanup → add `onUnmounted` or a `useEffect` return cleanup

If the intended action is not one of these, or is not a ready-to-use classic method and instead involves things like Parallel Change, Strangler Fig, or structural layer correction, fall back to the full flow.

---

## Flow

### 1. Single Alignment

Reply to the user in one sentence: **"I plan to do {method name}, touch {specific file/function}, with {N} change points, and the expected impact is {scope}. Confirm and I will start."**

After confirmation, go to the next step. If the user adds "also change X", evaluate whether X breaks any of the 3 entry checks. If it does, fall back to the full flow.

### 2. Change

Apply the change following the steps of the chosen classic method. Do not produce a design doc or checklist. Write code directly.

### 3. Self-Verification

- Run tests: unit, integration, typecheck, or lint
- `grep` to ensure old references are fully cleaned up, for Extract / Inline style changes
- If frontend state logic changed, run typecheck and existing tests. **Do not do visual UI verification**. If visual UI inspection is needed, the work should not have been in fastforward in the first place

### 4. One-Line Report

```
✓ Done. Method: {method name}. Change: {file path:line range}. Verification: {what tests were run / pass result}.
```

If there is drift, or if you discover during the apply step that you want to change something else too, **stop and ask the user instead of freelancing**.

---

## File Output

By default, **do not create a `.bytetrue/refactors/` directory**. The value of fastforward is precisely that it leaves no extra archive.

Exception: if the user explicitly says "leave a record for this one", then create `.bytetrue/refactors/{YYYY-MM-DD}-{slug}/{slug}-refactor-note.md`, containing the same one-line report above plus one short paragraph for "what changed / why". Do not write a design or checklist.

---

## When to Exit Fastforward

If any of the following happens halfway through, **stop and tell the user "this is more complex than expected; recommend switching back to the full flow"**:

- change points increase from 3 to 5 or more
- it turns out more than 1 file must be changed
- a needed action appears that is not in the common-method list
- there are no tests that can cover it
- the user adds "also change X" and that introduces a behavior change
- self-verification fails after the change and it is not fixable by a simple correction

To switch back, trigger `bt-refactor` and start from scan. Already changed parts must either be kept as a commit or restored to a clean state with `git restore` before scanning.

---

## What Not to Do

- **Do not write scan / design / checklist** — if you write them, you defeat the reason fastforward exists
- **Do not change across multiple files** — if it spans files, it is no longer a "small refactor"
- **Do not do changes that require HUMAN visual inspection** — frontend rendering, interaction, and perceived performance changes that humans need to look at belong in the full flow
- **Do not touch public interfaces** — changing a public interface requires Parallel Change and is not something fastforward can safely do

---

## Easy Pitfalls

- **Judging "small" too loosely**: the user says "small refactor" but the work actually touches 3 files — the AI must honestly say "this does not count as small"
- **Skipping the three entry checks and starting immediately**: the value of this skill is exactly those 3 checks
- **Cutting corners in self-verification**: only running typecheck but not unit tests, or not `grep`ing old references at all
- **Freestyling mid-change**: seeing neighboring code and "cleaning it up while here" — fastforward scope locks the moment the confirmation happens
- **Behavior change disguised as refactor**: adding a new parameter or changing a return value shape — that is a behavior change and cannot be disguised

---

## Related

- `bt-refactor/SKILL.md` — the full refactor workflow
- `bt-refactor/reference/methods.md` — the full method library
- `.bytetrue/reference/system-overview.md` — overview of the ByteTrue system
