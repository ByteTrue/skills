# Scan Checklist Item Format

The user should be able to scan each item in 30 seconds and decide yes or no. That requires fixed fields, fixed order, and hard constraints on what may and may not be written.

---

## `{slug}-scan.md` file skeleton

```markdown
---
doc_type: refactor-scan
refactor: {YYYY-MM-DD}-{slug}
status: pending-user-selection | user-reviewed
scope: {one-line scan scope, including files or directories}
summary: {how many findings were found, and how they distribute by category}
---

# {slug} scan

## Overview

- Scope scanned: {files / directories}
- Found N optimization points: structure a / performance b / readability c
- By risk: low x / medium y / high z
- Recommended to do first: #A #B #C, low risk, independent, and AI can self-prove
- Recommended to do carefully or later: #D, high risk, changes render path, or needs human eyes
- All 7 pre-checks passed: ✓

## Items

[one block per item, following the format below]
```

The user marks each item by adding `✓` or `✗` at the end of the item title line, with a reason line after `✗`. The AI never checks items off on the user's behalf.

---

## Field order and format for a single item

```markdown
### [number] {one-line title}   ← the user adds ✓ or ✗ at the end of this line

- **Location**: `src/xxx.vue:120-180`, clickable
- **Category**: structure / performance / readability, exactly one, not multiple
- **Current state**: one-sentence plain description of how it is written now; if needed, include only a small excerpt of original code
- **Problem**: why it is worth changing — this must be measurable, cyclomatic complexity, repetition count, render count, line count, dependency direction
- **Suggestion**: starts with a verb, and says clearly what shape it should be changed into
- **Suggested mapped method**: M-Ln-NN, citing the method ID from methods.md
- **Risk**: low / medium / high, plus one sentence of why
- **Verification**: AI self-proof, which tests or typecheck to run, | HUMAN, which page to inspect or what operation to perform
- **Scope**: about N lines / M files
```

### Why the field order is this way

Location → category → current state → problem → suggestion → method → risk → verification → scope. This matches human decision flow: **where is it → what kind of thing is it → what does it look like now → why touch it → how to change it → which method applies → what does it cost → how is it verified → how much work is it**. Changing the order forces the reader to bounce back and forth.

### Title writing constraints

- 25 characters or fewer, as a noun phrase or verb phrase, saying **what gets changed**, not **why it is good**
- ✓ "Replace the 3-layer nested filter inside handleData with one reduce"
- ✗ "Optimize data-processing logic", it never says what gets touched; or "Improve readability and performance of handleData", which states benefits instead of action

---

## Hard constraints

The AI must obey these when generating items. If any one is violated, the item must be rewritten.

### Constraint 1: the problem field may not be pure adjectives

"too long", "too messy", "not elegant", "highly coupled", and "hard to maintain" are all rejected. The problem must be expressed through measurable signals: line count, cyclomatic complexity above 10, nesting depth above 3, repetition count, the same array traversed N times, dependency direction, or concrete performance indicators such as N+1 queries, rebuild on every render, or missing cleanup.

### Constraint 2: the suggestion field may not be open-ended

Do not write "consider refactoring this", "suggest tidying this up", or "optimize the structure a bit". It must state a concrete action:

- ✓ "Extract this into a `useFormValidation` composable, parameterized by schema + initialValues, returning errors + validate"
- ✗ "Extract common logic", common in what sense and to where; or "use a better pattern", which pattern?

### Constraint 3: one item does exactly one thing

Do not write "split into a composable and also improve naming". Naming is another item, and is usually just a preference issue and should be removed entirely.

### Constraint 4: the same location may appear in at most 3 items

If the same file or function appears in 4 or more items, that area needs an overall redesign rather than a checklist of small fixes. Route back into the pre-checks and trigger either "scope too large" or "architecture problem".

### Constraint 5: do not include preference-only items

Arrow function vs function, single quotes vs double quotes, naming taste, code order, import order — none of these belong in the checklist.

The only exception is when the project already has an explicit decision that forbids or requires a style and the code violates it. In that case, the problem field must cite the decision ID.

### Constraint 6: every item must map to the method library

If you cannot write a valid M-Ln-NN under "suggested mapped method", then the suggestion is still too vague and must be rewritten until it matches a concrete method. Anything that cannot be mapped is not allowed into the checklist.

---

## Hard constraints for the overview section

The top overview must include: the scan scope, concrete files or directories, the total count plus category distribution, the risk distribution, the 3-5 items recommended first, the ones that should be done carefully or later, and whether all 7 pre-checks passed.

The user should be able to **judge the direction even without reading the full checklist**. If the AI cannot say "which items should go first", that means the risk ranking was never actually thought through, and the scan should be revised.

---

## Anti-pattern examples

This section exists so the AI can compare itself against obvious failures.

### ❌ Anti-pattern 1: adjective pile

```text
### #3 Optimize data-processing logic
- Location: src/utils/data.ts
- Category: readability
- Current state: handleData processes user data
- Problem: the code could be clearer
- Suggestion: refactor the handleData function
- Suggested mapped method: none
- Risk: low
- Verification: AI self-proof
- Scope: small local block
```

What is wrong: the title never says what changes; the problem field is only adjectives; the suggestion field is open-ended; and there is no method ID.

### ✅ Rewritten version

```text
### #3 Replace the 3-layer nested filter inside handleData with a single reduce
- Location: src/utils/data.ts:45-80
- Category: performance
- Current state: handleData calls filter → map → filter over the same array, causing 3 passes for a 5000-item input
- Problem: the same array is traversed 3 times, O(3n) that can be reduced to O(n); nesting depth 3, cyclomatic complexity 8
- Suggestion: merge the work into one reduce, performing both filtering and transformation inside the accumulator while keeping the current output structure
- Suggested mapped method: M-L2-03, extract / merge traversal
- Risk: low, pure local change, covered by 5 unit tests for input and output
- Verification: AI self-proof, run data.test.ts and benchmark before and after
- Scope: small local block / 1 file
```

### ❌ Anti-pattern 2: stuffing multiple actions into one item

```text
### #7 Split UserForm and improve naming
```

This should become at least two separate items: one for splitting `UserForm`, and one for renaming. The naming item is usually pure preference and should probably be removed.

### ❌ Anti-pattern 3: the same location appears over and over

If #3, #5, #8, and #11 all point to `src/UserForm.vue`, then this area needs an overall design, not four independent checklist items. It should route back into pre-check #3, cross-module or architecture issue, or pre-check #6, scope too large.

---

## State transition after user selection

- once the user finishes marking items, the file status changes to `user-reviewed`
- items marked ✗ **remain in the file**, they are not deleted, so the record shows that they were considered and intentionally rejected
- items marked ✓ become the input to stage 2 design
- if every item is ✗, the refactor ends here and does not proceed into design
