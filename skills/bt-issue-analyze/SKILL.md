---
name: bt-issue-analyze
description: Stage 2 of the issue workflow. Read the report and the code to locate the root cause, assess impact, and offer the user 2-3 repair options to choose from. This stage does not edit code. Trigger when the user says "analyze this bug", "find the root cause", or "locate the problem", and `{slug}-report.md` already exists.
---

# bt-issue-analyze

## Read Before Starting

Before making any judgment or taking any action, read `.bytetrue/attention.md` first; if it is missing, treat the skeleton as incomplete and tell the user to fill it in or run `bt-onboard`.

The user has already described the problem clearly. Your job is to **find the root cause by actually reading the code** — not by reasoning in your head and not by guessing on top of the report. Reading the code is the core action. If you skip it, the analysis is worthless.

After analyzing, do not go straight into the fix. Show the user 2-3 repair options and let them choose. Reason: there are often multiple possible ways to fix a root cause, each with different blast radius, side effects, and scope. That is the user's call.

> For shared paths and naming conventions, see section 0 of `.bytetrue/reference/shared-conventions.md` and the "where the files go" section in `bt-issue`.

---

## Startup Checks

1. **The issue report exists and has been confirmed** — read `{slug}-report.md`, confirm `doc_type=issue-report` and `status=done`, and confirm all five sections are filled. If incomplete or the status is wrong, return to `bt-issue-report`. If `bt-issue-report` has already classified this as the standard path, stay on the standard path and do not reclassify
2. **Resume support** — if `{slug}-analysis.md` already exists, inspect which of the 5 sections are already filled:
   - if all are filled but `status=active`, jump to checkpoint
   - if only some are filled, report "last time we got to step X, resuming from step Y"
3. **Read the full context**:
   - the full issue report and `.bytetrue/attention.md`
   - the related files mentioned in the report, using Glob and Grep, not just the verbal description
   - **scan `.bytetrue/` globally** — Glob `.bytetrue/`, discover available inputs, and read as needed: `architecture/`, read `ARCHITECTURE.md` when cross-module behavior is involved; `compound/`, search relevant trick, explore, and learning using `search-yaml.py`, and cite the hit at the beginning of the analysis; `requirements/`, read it when capability boundaries are involved

---

## The Five Analysis Steps

Every step must involve **actually reading code** rather than relying on speculation.

### Enhanced discipline for complex bug diagnosis, trigger as needed

Trigger the enhanced `diagnose` discipline from Matt in any of the following cases. Do not force it for simple bugs or fast-path issues:

- the root cause is unclear or there are multiple candidate root causes
- reproduction is unstable, concurrent, timing-related, or flaky
- the issue is a performance regression or a resource leak
- a first fix attempt has already failed to solve it
- logs, debugger, profiler, or query plan are needed to decide

When this discipline triggers, record `execution_mode.level: strict-evidence` unless the analysis is already about repeated failed fixes or architecture friction; in that case record `break-loop` and route back to plan or architecture discussion before another fix attempt. See `.bytetrue/reference/execution-modes.md`.

When triggered, additionally record the following in the analysis:

1. **feedback loop** — is there a repeatable failure signal? A command, reproduction step, test, or log assertion all count. If reproduction is not stable, the goal is to increase the reproduction rate, not to pretend it is already stable
2. **ranked hypotheses** — list 2-5 root-cause hypotheses ranked by likelihood; for each one, write how it would be falsified and what evidence is needed
3. **instrumentation plan** — if instrumentation is needed, write the instrumentation points, the unique prefix, such as `[DEBUG-{slug}]`, and the cleanup method; for performance issues, baseline, profiler, or query plan come first, not logging-based guessing
4. **regression seam** — if a regression test can be written after the fix, identify the highest behavior seam first; if no suitable seam exists, record why, and optionally recommend later `bt-refactor` or `bt-arch`

### Step 1: Locate the problem code

Following the report's involved modules and reproduction steps, use Grep and Glob to search: function names, class names, file names; then trace along the call chain, from user entry downward; focus on condition branches, boundary values, state updates, async behavior, and data flow.

Record key positions in the form: `{file}:{line} — what this location does`.

### Step 2: Reconstruct the failure path

Follow the code execution path against the reproduction steps: what the user triggers → which function gets called → how data flows → where the branch goes wrong. Describe the split between the normal path and the failure path. **That split point is the root-cause candidate.**

### Step 3: Confirm the root cause

Single root cause versus multiple root causes. If there are multiple, list the primary and secondary causes. For complex bugs, first list ranked hypotheses and then falsify or support them one by one with evidence. Do not jump from the first guess directly to a repair plan.

**Root-cause categories**:
- logic error, such as wrong condition or missing boundary case
- state pollution, side effects affecting later flow
- data format mismatch, assumptions about input or output not matching reality
- concurrency or race condition, async order or shared state
- config or environment issue, unstable or wrong dependency configuration
- missing guard, such as not handling null, undefined, or empty lists

### Step 4: Assess the impact surface

- **impact scope**: does it affect only the reported scenario, or more scenarios?
- **potential victims**: which other functions or modules may be affected by the same root cause?
- **data integrity**: can it cause data corruption or state inconsistency?
- **severity re-evaluation**: compared with the P0/P1/P2/P3 in the report, should it change?

Why re-evaluate: the report's severity is based on symptoms. After analysis you can see the actual impact surface, and often discover that the problem is either more serious or less serious than it first appeared.

### Step 5: Repair options

List 2-3 directions. For each one, explain: what it does, where it changes, and how; the advantages; the disadvantages and risks; and the impact surface, meaning which files would move and whether it affects other behavior.

**Recommended option**: pick one out of the 2-3 and explain why. Usually the reason is the smallest scope, the most direct hit on the root cause, and the fewest side effects.

---

## Root-Cause Analysis Template

```markdown
---
doc_type: issue-analysis
issue: {issue directory name}
status: active
root_cause_type: logic | state-pollution | data-format | concurrency | config | missing-guard
related: [{relative path to slug-report.md}]
tags: []
---

# {Short Problem Description} Root-Cause Analysis

## 1. Problem Location

| Key Location | Description |
|---|---|
| `{file}:{line}` | {what it does, and why it is problematic} |

## 2. Failure-Path Reconstruction

**Normal path**: {user does A → calls B → data flows through C → result D, matching expectation}

**Failure path**: {user does A → calls B → at C, because of E, enters the wrong branch → result F, not matching expectation}

**Split point**: `{file}:{line}` — why this is the wrong turn

## 3. Root Cause

**Root-cause type**: {...}

**Root-cause description**: {one paragraph explaining clearly why it happens, so that even someone who has not read the code can understand it}

**Are there multiple root causes?**: {yes / no. If yes, list the primary and secondary ones}

**Complex bug diagnosis record**, write "not triggered: root cause is already clear / fast path does not apply" when not triggered:

- **feedback loop**: {repeatable failure signal / how reproduction rate was improved / why there is not yet a stable loop}
- **ranked hypotheses**:
  1. {hypothesis A} — evidence: {...}; falsification method: {...}
  2. {hypothesis B} — evidence: {...}; falsification method: {...}
- **instrumentation / measurement**: {log prefix / debugger / profiler / query plan / cleanup plan}
- **regression seam**: {highest behavior seam / reason no seam exists}

## 4. Impact Surface

- **impact scope**: {affects only the reported scenario / also affects X, Y, Z}
- **potential victim modules**: {list the ones that may be affected}
- **data-integrity risk**: {yes / no. Explain if yes}
- **severity re-evaluation**: {keep at P? / change to P?, with reason}

## 5. Repair Options

### Option A: {option name}
- **what it does**: {where to change, and how}
- **advantages**: {...}
- **disadvantages / risks**: {...}
- **impact surface**: {which files move, and whether other functions are affected}

### Option B: {option name}
- ...

### Recommended Option

**Recommend option {A / B}**, because {smallest change scope / most direct hit on the root cause / fewest side effects + concrete explanation}
```

---

## Checkpoint, Align with the User

After writing, **do not start fixing immediately**:

1. summarize the "root cause" and the "recommended option" orally to the user, without making them read the whole file, because what they are waiting for is the conclusion
2. ask: "Is the root-cause judgment accurate? Do you agree with the recommended option, or do you want a different one?"
3. only after the user explicitly confirms the option may stage 3 be triggered

---

## Exit Conditions

- [ ] frontmatter exists, including matching `doc_type=issue-analysis` and `issue`
- [ ] all 5 sections are filled
- [ ] a concrete code location was identified, `file:line`
- [ ] the failure path is reconstructed clearly
- [ ] the impact-surface assessment is complete
- [ ] at least 2 repair options plus a recommendation are present
- [ ] for complex bugs, feedback loop, hypotheses, instrumentation, and regression seam were recorded, or the reason it was not triggered is explicit
- [ ] the user explicitly confirmed "the analysis is accurate; fix it using option X"
- [ ] frontmatter is `status: done`

---

## After Exit

Tell the user: "The root-cause analysis is ready, and the option is confirmed. Stage 3 is fix verification. Trigger `bt-issue-fix` next."

Do not casually start changing code yourself. If there is no pause between stages, the user loses the chance to review.

---

## Easy Pitfalls

- writing "it may be some issue around here" as the root cause — it must locate to `file:line`
- inferring only from the problem statement without reading code — you must actually Grep and Read
- listing only one repair option — there must be at least two
- starting to change code immediately after analysis — user confirmation is required first
- saying only "it may affect other functions" for impact surface — specify which ones
- always re-evaluating severity to "unchanged" — actually inspect the impact surface; upgrade it when appropriate
- for complex bugs, guessing a fix without any feedback loop — first build a failure signal; for nondeterministic bugs, at least improve the reproduction rate
- listing multiple hypotheses without any falsification method — that is still guessing, not diagnosis
- adding temporary logs without a unique prefix or cleanup plan — debug garbage gets committed easily later
