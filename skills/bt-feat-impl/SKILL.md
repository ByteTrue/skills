---
name: bt-feat-impl
description: Stage 2 of the feature workflow. Advance according to the paradigm-dimension steps sliced by design inside `{slug}-checklist.yaml`. Implement decides which concrete files to change inside each step. After finishing, report using a fixed format. Trigger when the user says "the plan is confirmed, start implementing", "write the code according to the design", or "start". The prerequisite is an approved design with a checklist. If something falls outside the design, go back to the design instead of forcing ahead.
---

# bt-feat-impl

## Read Before Starting

Before making any judgment or taking any action, read `.bytetrue/attention.md` first; if it is missing, treat the skeleton as incomplete and tell the user to fill it in or run `bt-onboard`.

At this point the user has already signed off on the design. Your job is to turn that design into code. The thing most likely to go wrong is not the coding itself, but **what to do when implementation discovers a case the design did not cover**. If you brute-force through it, the design becomes decoration. The rules below exist to make "stop and go back" the default action.

> For shared paths and naming conventions, see section 0 of `.bytetrue/reference/shared-conventions.md`.

---

## Three implementation stances

The concrete rules are all expressions of these three stances. Understanding the stance is more important than memorizing the rule.

### 1. By default, write the least code possible

Write only what the current step explicitly needs. Do not casually add configuration hooks, abstraction layers, parameter switches, or defensive fallbacks "for what we may need later". Decision rule: if after writing a block you think "should I also add X?", ask whether X is something the current user can perceive. If not, do not add it. If, after the whole change, 200 lines of code could really say the same thing in 50, rewrite it. Extra code is not neutral; it becomes maintenance burden.

### 2. Touch only what should be touched, and do not improve neighbors casually

When changing one function, change that function only. If another function in the same file has ugly style or weird naming, do not touch it unless it directly conflicts with the current change. Match the existing style of the file. "While-here improvements" dilute a feature PR into a pile of mixed changes and multiply review cost. Anything worth improving should be recorded as a follow-up issue using the "while here I noticed" format below.

Orphan cleanup: if your change makes an import or function dead code, remove it. If the dead code already existed and was **not** caused by this change, leave it and record it as a while-here observation.

### 3. Do not decide things that design did not say

If halfway through coding you find a corner the design did not cover, edge behavior, error path, or out-of-scope files, stop by default and go back to design. The later rules on "patch branches" and "terminology guard" are two typical manifestations of this stance; **any moment that feels like "design did not say, so I chose for it" should trigger the same behavior**.

---

## Startup checks

### 1. Is the design document strong enough to support implementation?

Frontmatter must have matching `doc_type=feature-design` and `feature`, `status=approved`, non-empty `summary`, and `tags` length at least 2.

**Standard design**, sections 0, 1, 2, 3, and 4:
- section 0 has content; section 1 contains explicit non-goals, complexity dimensions, and execution mode or a standard-mode statement
- section 2.1 term layer uses the two-part "current state → change" structure, and every added or changed interface has at least one example plus source location
- section 2.2 orchestration layer starts with a main flow diagram, fully describes current state → change, and already records flow-level constraints
- section 2.3 mount points follow the rule "would the feature disappear if this were removed?", and do not mistakenly include internal code edits
- section 3 contains the key scenario list plus reverse-check items, and does not contain test code or framework choice

**Fastforward design**, sections 0, 1, 2, and 3:
- section 0 contains explicit non-goals; section 1 contains change points, files plus function or type names
- section 2 acceptance criteria are all verifiable; section 3 rollout steps each have exit signals

If any of the above fails, return to `bt-feat-design` to complete it. Reason: every missing item in the design will end up being patched live during implementation, which bypasses the checkpoint.

**Important**: in standard design, section 3 acceptance contract says only "what should be true after it is done". It does not say "exactly how to implement it". Change-file inventories, function-level landing points, and test code are implement's own decision. Do not send the design back merely because those details are absent.

### 2. Does `{slug}-checklist.yaml` exist?

- the file exists and its `feature` field matches
- `steps` is non-empty, produced by design, sliced at the paradigm dimension, usually 4-8 steps; `checks` is also non-empty
- if it does not exist, send it back to `bt-feat-design` to generate

### 3. Read the full context

- the full design doc; in standard design focus especially on section 1, sections 2.1, 2.2, 2.3, 2.4, and section 3
- `{slug}-checklist.yaml`, the demand source, user description plus brainstorm note, `.bytetrue/attention.md`, and `.bytetrue/reference/execution-modes.md`
- the source locations of interface examples in section 2.1, or the code files named by the change points in section 1 of fastforward design; reading the relevant functions is enough

### 4. Confirm with the user which step to start from

Usually step 1. If resuming from an interrupted run, continue from the next step after the last `done`.

The `steps` provided by design are paradigm-dimension slices, orchestration skeleton → computation nodes → persistence → tests. **Which concrete files to change inside each step is your call during implementation**. If one step turns out to contain three independent sub-actions, or if a micro-refactor is discovered to be a prerequisite by the reflection checks, align with the user and then split or append the steps. **Do not do it silently.**

**The handoff from design section 2.5 micro-refactor**:

- if section 2.5 concludes "do micro-refactor, split files" or "do micro-refactor, restructure directories", then checklist step 1 is exactly that, and it must be run **as an independent step**, verified against the "how unchanged behavior is validated" rule in section 2.5:
  - split files: build is green, existing tests pass, and external interface signatures have zero diff
  - restructure directories: build is green, existing tests pass, and the diff is limited to file moves plus import-path updates, with **no function-body changes at all**

  **Do not merge this into the next step**. Once behavior change and structure change are mixed, you can no longer separate them when debugging or rolling back.
- if section 2.5 concluded "do not refactor", but halfway through implementation the reflection checks still trigger a split signal, follow the reflection-check path below, stop, align with the user, and if it can be solved provably, insert a new independent step. **Do not silently append it without confirmation**
- if section 2.5 ends with a "suggested convention to capture" block, implement **does not archive it proactively**. Only after the directory reorganization runs cleanly and is confirmed as zero behavior change should your status report include one sentence saying "the convention suggested by design 2.5 is now ready; acceptance can decide whether to archive it through `bt-decide`", leaving the decision to acceptance and the user

---

## Core constraints during implementation

### Follow steps strictly in order

Execute according to the `steps` list in order. Do not merge steps and do not skip steps. Immediately after completing one step, change its status from `pending` to `done`.

The most common violation is "while here I also did the next step". Every step has its own independently verifiable exit signal. If you do two steps together, when something goes wrong you will no longer know which step introduced it, and you also lose the clean rollback point.

### TDD / vertical-slice discipline, enabled when applicable

Enable TDD discipline when the user explicitly asks for TDD, when design section 3.1 recommends TDD, when execution mode is `strict-evidence`, when the work involves complex business logic, or when the change is regression-sensitive. Simple UI, copy, or config changes do not require it unless the design explicitly upgrades the mode.

When enabled, follow Matt `tdd` rhythm:

1. pick one minimal vertical slice or tracer bullet, rather than doing horizontal slicing like "write all tests first, then all implementation"
2. each round writes only one behavior test, testing the public interface or observable behavior, not a private method or internal collaborator
3. first confirm the test fails, red, and then write the least code needed to make it pass, green
4. do not refactor before the current test turns green, **never refactor while red**
5. after everything is green, small-step refactor is allowed, rerunning relevant tests after each refactor
6. then move to the next behavior: one test → minimal code → repeat

If section 3.1 is missing from design but implementation clearly turns out to be a very strong TDD candidate, do not bypass design. Stop and either add section 3.1 or align with the user that implementation will proceed in TDD mode.

### Do not make changes outside the plan

If you discover something worth refactoring, see section 7 "reflection checks while writing code" in `.bytetrue/reference/shared-conventions.md`, and it is **outside the current feature's impact surface**, record it as a later issue:

```markdown
> While here I noticed: {file:line} {short problem summary}. It is outside this run's scope and is recorded for a future issue.
```

Code changed casually "while here" is not part of the plan, so acceptance will not match it, and future `git blame` readers will not know whether it was for the feature or just an incidental cleanup.

### Terminology guard

**Standard design**: every new type, function, or variable name must be checked against section 0 of the design document. It is not allowed to introduce a new concept that does not exist in the doc. If a new concept is really needed, stop first, update section 0, grep for conflicts, and get user confirmation.

**Fastforward design**: there is no formal terminology table, but when inventing a new concept name you still need to grep the codebase once to avoid collisions.

The cost of terminology collisions is that one concept ends up with two names, or one name ends up representing two concepts. The second case destroys searchability.

### Stop when you feel the urge to add a patch branch

If coding leads you toward something like `if (special case) { special handling }`, **stop**. A branch like that usually means the design did not cover this situation. If you continue, the result will be "special logic added only to make the code run". Go back to the plan and discuss whether to add it, cut it, or explicitly mark it as leftover work.

### Code-quality reflection checks

In addition to the flow constraints above, there is another set of reflection checks aimed at code quality, see section 7 of `.bytetrue/reference/shared-conventions.md`.

The core idea is: **it is not "must split when over N lines", it is "when X happens, stop and ask yourself"**. Each signal corresponds to one of the default AI traps, adding more code to a large file, more methods to a large class, patch branches, copy-paste duplication, a fourth plus parameter, or stuffing more into universal utils.

If the reflection check concludes that the code should be split, moved, renamed, or extracted into a shared layer, and that falls outside the current steps, then discuss it with the user and decide together; do not secretly finish the split and continue coding. The same boundary as design 2.5 is used here to avoid implement inventing a new standard:

- **If it can be solved by "move only, no behavior change"**, such as splitting functions, splitting files, or moving definitions while the compiler stays green and external signatures have zero diff, then after aligning with the user, **insert it as an independent step** before the current step, run it, verify it independently, and only then continue
- **If it exceeds the "move only, no behavior change" boundary**, changing function signatures, changing return shapes, changing call-graph semantics, or splitting and merging modules, then **do not do it in this feature**. Record it as a "while here I noticed" item and suggest that the user handle it later through `bt-refactor`. Keep the current step as minimal as possible and work around it. Do not say "since I already saw it, I might as well fix it here", because that dilutes a feature PR into a mixed change and also violates the boundary already drawn by design 2.5

---

## Fixed-format completion report after everything is done

Once all steps are complete, use the template below and **stop to wait for user review**.

The point of the fixed template is that vague status reporting pushes verification responsibility back onto the user. The template forces you to say exactly which files changed, whether anything outside the plan was touched, and whether any new concept was introduced.

```markdown
## Implementation Completion Report

### Which files were changed
{real git status output}

### Which functions / types changed, grouped by step
**Step N: {step name}**
- file:line  function name  change type, add / modify / delete

### Did this touch files outside the plan?
{yes / no. If yes, explain why and whether the design doc was updated accordingly}

### Did this introduce any new concept or abstraction not present in the design doc?
{yes / no. If yes, explain whether the design doc was backfilled, standard design updates section 0 and 2.1; fastforward updates section 1, and whether grep conflict-check was done}

### Reflection-check self-audit
{against section 7 of shared-conventions, which signals fired and how they were handled; if none fired, write "none"}

### Exit-signal verification for rollout order
{for each step, list action + exit_signal + status, all should be done}

### Acceptance-scenario self-check
**Standard design**: for each key scenario in section 3, what evidence satisfies it, type system / unit test / integration / manual / assert, and whether reverse-check items are guarded
**Fastforward design**: check each item against the acceptance criteria in section 2
```

### TDD / red-green evidence
{if not enabled: reason / if enabled: for each item, list red test → minimal code → green evidence; if any refactor happened, list the test command rerun after refactor}

After the report, stop and wait for review.

---

## How test cases should land

Each item in the "key scenario list" of section 3 in standard design equals one verifiable behavior constraint. Your job is to turn each of them into observable evidence: unit test, integration test, manual operation, or compile-time guarantee from the type system.

Exactly how to test it, which framework to use, and how to set up mocks is not defined by design. That is your decision. But inside `steps`, you must still state clearly in which step each test is landed, and in the completion report you must check one by one that every scenario has evidence.

**A passing test is not the same thing as a satisfied acceptance scenario**. The former only says that the tests you wrote passed. It does not prove that every scenario has coverage.

When TDD is enabled, the order of test landing must stay synchronized with implementation: one behavior test red → the minimum implementation to green → next behavior. Do not pile up a batch of pending tests, and do not refactor while the current test is still red.

When the type system itself guarantees something, for example a TypeScript signature ruling out a certain call shape, say so in the report as "the type signature now guarantees this at compile time".

---

## Exit Conditions

- [ ] all steps have status `done`
- [ ] the completion report has been output, and the user review passed
- [ ] there are no unhandled "must stop" signals
- [ ] every key scenario in section 3 has evidence or test coverage, or in fastforward, every section 2 acceptance criterion has evidence
- [ ] if TDD was enabled, red/green/refactor evidence is listed in the completion report
- [ ] no "while here I noticed" item was secretly fixed; they are all in the issue list
- [ ] there are no plan-external file changes, or the design doc was updated in sync

---

## After Exit

Tell the user: "All steps are complete, and the design doc is synchronized. The next stage is acceptance closure. Trigger `bt-feat-accept`."

Do not casually start writing the acceptance report yourself. Acceptance needs its own checklist rhythm, and entering it early weakens the gate.

**If implementation encountered a project-wide hard constraint, command pitfall, or environment setup** — a one- or two-line fact like "ah, this project requires X before Y", something the AI for the next feature would likely hit again — then before telling the user to move to acceptance, **also mention it in one sentence**: "This run revealed {that specific thing}; should we `bt-note` it into attention.md so the next session does not step on it again?" One item only, not several. If the user says "let's handle it during acceptance", skip it; section 8 of acceptance will review candidates again.

---

## Easy Pitfalls

- sending the completion report after only part of the code is written — the report is sent exactly once, after everything is done
- writing "modified relevant files" in the report without listing `file:line`
- casually editing code outside the plan
- introducing a new type or concept without going back to update the design doc
- adding a patch branch like `if (user is X) { special handling }` without stopping
- entering acceptance before the user has approved the implementation review
- leaving the key scenario list without any evidence
- reading the paradigm-dimension steps as if they were a file:line checklist — steps are slicing strategy, not a diff list; secretly splitting sub-steps inside a step without alignment is bypassing review
- when TDD is enabled, writing a pile of tests first and then all the implementation — that degrades into horizontal slicing, not tracer bullet
- testing a private method or internal implementation detail — tests should express the requirement through public interface or observable behavior
- refactoring while still red — make the current test green first, refactor only after everything is green
