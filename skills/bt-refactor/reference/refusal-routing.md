# Scan Pre-checks and Refusal Routing

Before scan starts, run the 7 pre-checks once. If any one of them hits, **stop scan and give a routing recommendation instead of forcing a checklist**. The AI's default tendency is "the user asked for a scan, so I must produce something", and that is exactly where low-quality refactor checklists come from. **Refusal is a legitimate output path.**

---

## The 7 pre-checks, run them in order

### 1. Does the user's description smuggle in behavior changes?

**Trigger**: the user says "also add X", "also support Y", "change it to return A instead of B", or "while here fix Z too".

**Why stop**: the bottom line of refactor is behavior equivalence. Once behavior change is mixed in, there is no clean way to verify "only the structure changed". If something breaks later, nobody can tell whether refactor caused it or the new capability caused it.

**Route**:
> The description contains "{trigger phrase}", which is a behavior change and therefore outside refactor scope. Recommend splitting it into two tasks: behavior change goes to `bt-feat`, new capability, or `bt-issue`, bug fix, and the structural change comes back through refactor.

---

### 2. Does the target module have test coverage?

**How to check**: scan whether corresponding `.test.*` or `.spec.*` files exist, or run the coverage tool and inspect whether the key path is covered.

**Trigger**: the key path has no test coverage, or line coverage is clearly too low, below 60%, or below the project's own threshold, or tests exist but only cover irrelevant edge noise while the core business path is uncovered.

**Exception exemptions**: purely declarative content such as style, static config, or type aliases; obviously trivial short functions, less than 10 lines and branch-free; or pure presentation components, props → render with no internal logic.

**Why stop**: without tests, "behavior equivalence" is only a verbal promise.

**Route**:
> The core path of target module {file} has no test coverage. Refactor cannot be based on verbal promises of behavior equivalence. First do the prerequisite: use a characterization test to freeze the current behavior. Feed real inputs into the target function and record the current output as the assertion. Come back after that coverage exists.

---

### 3. Is the problem cross-module?

**Trigger**: most of the candidate optimization points involve cross-module relationships — A depends on B's internal implementation instead of a public interface, the same responsibility is scattered across 3 or more modules, or module boundaries themselves are confused. Quantitative threshold: more than 50% of the candidate points fall on cross-module relationships.

**Why stop**: a single-module refactor cannot solve a cross-module problem. Forcing it locally either changes nothing meaningful, because the dependency is still blocking, or creates breakage in neighboring modules.

**Route**:
> The main problem is cross-module: {concrete description}. This is not something a single-module refactor can solve. The recommended order is:
> 1. `bt-arch` to refresh the module-boundary map
> 2. `bt-decide` to record the new dependency principle
> 3. then come back and split it into several single-module refactor tasks

---

### 4. Are all the candidates just style preferences?

**Trigger**: more than 50% of the scan results land on naming style, quote style, semicolons, arrow function vs function, import order, declaration order, blank lines, or indentation.

**Why stop**: style preference should not be handled through manual refactor. The permanent fix is lint rules plus automatic formatting.

**Route**:
> The main issues here are style preferences, naming, quotes, formatting. Refactor is not the right tool:
> 1. `bt-decide` to settle the style convention
> 2. add the corresponding ESLint / Prettier rules
> 3. run one full-project `--fix`

---

### 5. Is the target file generated output or third-party code?

**How to check**: the file header contains `// GENERATED`, `@generated`, or `// DO NOT EDIT`; the path is under `node_modules/`, `vendor/`, `dist/`, or `build/`; the path matches `*.d.ts` but is not handwritten; or there is an open-source license header.

**Why stop**: generated output will be overwritten the next time it is regenerated; third-party code breaks upgrade flow and may have licensing implications.

**Route**:
> {file} is {generated output / third-party code}. Changing it here would either be overwritten later or create an upstream-maintenance and licensing problem. The correct move is:
> - generated output → change the generation source, {concrete script or template}
> - third-party code → fork or upstream PR, or add a wrapper and change the wrapper instead

---

### 6. Is the scan scope too large?

**Trigger**, any one:

- more than 15 files
- more than 3000 lines of code
- likely to produce more than 20 candidates after scanning

**Why stop**: when the scope is too large, the AI cannot hold the detail consistently in context and starts contradicting itself; the user also cannot review such a large checklist in one pass.

**Route**:
> The scope covers {N files / M lines}, which exceeds the single-scan limit. Do one of these first, then come back:
> - if the module internally needs splitting, start with `bt-arch`
> - if the scope can be narrowed, pick a smaller subset with the user, for example just `{specific component}`

---

### 7. After scanning, is there actually enough worth changing?

**Trigger**: the first 6 checks all pass, but after filtering out preference-only items and duplicates, fewer than 3 worthwhile candidates remain.

**Why stop**: zero or one or two items is a valid result. The AI's default tendency is to pad them just to deliver something, and that leads the user into changing things that do not matter or even introducing new problems.

**Route**:
> After scanning {scope}, and filtering by the hard constraints, only {0 / 1 / 2} worthwhile items remain, which is not enough to open a full design phase. Two options:
> - do nothing now: the module is currently healthy enough, and come back only when there is a concrete trigger, such as performance pain or a blocked feature
> - downgrade it: if there are 1-2 items, do them as small maintenance directly rather than through the full refactor flow

---

## Fixed output format for refusal

Whenever any one check hits, use this format so the user can understand **what happened / why / what next** at a glance:

```text
⛔ refactor workflow stopped

Hit pre-check: #{N} — {check name}
Evidence:
- {concrete file / line 1}: {why it triggered}
- {concrete file / line 2}: {why it triggered}

Suggested route:
{routing text}

Condition to come back into refactor:
{what must become true before this refactor can be restarted}
```

---

## What if multiple checks hit?

Route based on the smallest-numbered one. The 7 checks are already ordered by "the earlier it appears, the more it should be handled first":

1. behavior change mixed in — split first
2. no tests — add tests first
3. cross-module problem — go to architecture first
4. style-only — go to decisions and tooling
5. file is generated — change the real source instead
6. scope too large — narrow it first
7. not enough real findings — say so honestly

After fixing the first issue, **rerun the pre-checks**. Once the first blocker is removed, later conditions may also change.

---

## Why refusal must be an explicit path

If the AI is told only "try your best to produce something", it will treat weak signals as valid signals, package preference-only issues as "readability improvements", and happily refactor modules without coverage.

Only when refusal is explicitly defined, when to refuse, how to output it, and where to send the user next, will the AI honestly say "this is not work I should take right now". This is the same principle as feature-design saying "if the requirement is unclear, send it back to brainstorm" — **use workflow structure to counteract the AI's tendency to merely deliver something**.
