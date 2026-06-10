# feature-design reference templates

This file provides the reference formats for `{slug}-design.md` and `{slug}-checklist.yaml` used by `bt-feat-design`.

## 1. `{slug}-design.md` frontmatter

```markdown
---
doc_type: feature-design
feature: 2026-04-12-user-auth
requirement: user-auth-email
roadmap: permission-system           # optional, fill only when this feature starts from a roadmap item
roadmap_item: permission-rbac-core   # optional, the slug in the corresponding roadmap items.yaml
status: draft
summary: Support users logging into the admin console via email verification code
tags: [auth, email, login]
---
```

Required fields: `doc_type`, `feature`, `status`, `summary`, and `tags`.

- `requirement`: fill in the corresponding req slug; pure refactor or technical debt may leave it empty
- `roadmap` and `roadmap_item`: fill them only when starting from a roadmap item; either both filled or both empty

## 2. Top-level section anchors

- `## 0. Terminology`
- `## 1. Decisions and Constraints`
- `## 2. Terms and Orchestration` ← the soul of the design, and the main input for implement
  - `### 2.1 Term Layer`
  - `### 2.2 Orchestration Layer`
  - `### 2.3 Mount-Point Inventory`
  - `### 2.4 Rollout Strategy`
  - `### 2.5 Structural Health and Micro-refactor` ← fixed section, explicit conclusion plus optional "observations beyond scope"
- `## 3. Acceptance Contract`
- `### 3.1 Test Seam / TDD Plan` optional, but the judgment must be explicit
- `## 4. Relationship with Project-Level Architecture Docs`

## 3. `{slug}-checklist.yaml` format

```yaml
feature: {feature directory name}
created: YYYY-MM-DD

steps:
  - action: "{paradigm-dimension slice}: {action description}"
    exit_signal: "{exit signal, independently verifiable}"
    status: pending

checks:
  - item: "{check item description}"
    source: term-contract | orchestration-skeleton | flow-level-constraint | mount-point | scope-guard | acceptance-scenario
    status: pending
```

`steps`, produced during design:

- grain is at the paradigm dimension, **not file:line or function level**; concrete file touchpoints are implement's job
- slice order follows "minimal workflow first, then fill nodes one by one":
  - backend: orchestration skeleton, empty implementation runs through → fill computation nodes one by one → connect loading and persistence → add test coverage
  - frontend: static structure → interaction logic → state integration → integration and style finish
- 4-8 steps, each with an independently verifiable exit signal
- when section 2.5 concludes "micro-refactor", **step 1 is fixed as "perform the micro-refactor according to section 2.5, move only, no behavior change"**, with an independent exit signal such as "all tests pass, build is green, and there is zero behavior-related diff", then only after it passes do you proceed to the feature body

`checks`, produced during design, extracted from the design itself:

- term contracts ← key interface signatures in section 2.1
- orchestration skeleton and flow-level constraints ← the key flow steps and flow-level constraints in section 2.2
- mount points ← each mount point in section 2.3, acceptance will reverse-check removability
- scope guard ← each non-goal in section 1
- acceptance scenarios ← each key scenario in section 3
- test seam / TDD plan ← highest behavior seam, priority red/green behaviors, and manual verification items in section 3.1

It is not allowed to invent entries that do not exist in the design.

## 4. Writing requirements for each section

### `## 0. Terminology`

Each key term should include "term / definition / anti-conflict conclusion". Grep-based conflict prevention is mandatory.

### `## 1. Decisions and Constraints`

This is the design's "what it is / why" section. Do not write implementation details here, and do not write mount points here; mount points belong to section 2.

- **Requirement summary**: what is being built, for whom, what success looks like, and what is explicitly not being done
- **Complexity dimension**: record only the dimensions that deviate from the default bundle, with the default bundle defined in the "common default combinations" table at the end of `.bytetrue/reference/code-dimensions.md`. Format: `{dimension name} = {level}, reason for deviating from default {default level}: ...`. If everything stays on default, write one sentence saying it follows the default bundle for that scenario with no deviations
- **Key decisions**: choices, tradeoffs, hard constraints, or rejected alternatives. Every decision must answer "if we chose a different approach, how would the term layer or orchestration layer differ?" If it cannot answer that, then it is not a design decision, only an implementation detail
- **Prerequisite dependencies**: fill this only when implementation later finds that the target file has structural problems that need to be resolved first and then comes back to revise the design

### `## 2. Terms and Orchestration`

The soul of the design. **Every subsection uses a two-part "current state → change" structure**. Without the current state, the reader cannot tell whether the change is reasonable. With only the change, every downstream stage has to rediscover the current code again. Design pays that lookup cost once so all later stages benefit.

#### 2.1 Term layer: value objects, entities, and interface contracts

- **Current state**: what responsibilities the current key value objects, entities, or interfaces carry, pointing to code locations, file plus type or function name; for a brand-new module, write "no current state, fully new"
- **Change**: additions, renames, splits, merges, or removals, each marked with the action plus motivation
- **Interface example**, at least one for each added or changed interface:
  - backend API: input → output, including normal path and major error path
  - frontend component: component split, parent-child relationship plus reason for splitting, props, events, and slots illustrated by example, state ownership, local component, props, or store
  - under each example, annotate the source as `// source: {file path} {function name / component name}`

#### 2.2 Orchestration layer: main flow and control flow

- **Main flow diagram**, one Mermaid sequence or flowchart at the top, with normal path plus key exception or edge path. This is the entry point for the reader's mental model
- **Current state**: what the current main flow, workflow, or key orchestration function is responsible for, and its topology, such as linear pipeline, branching router, parallel DAG, or state machine
- **Change**: where a new step is inserted, which branch changes, which new side path is added, and whether the topology is upgraded
- **Flow-level constraints**: error semantics, rollback or retry, what is returned externally, idempotency, concurrency or order constraints, extension points, and observability points

#### 2.3 Mount-point inventory

Decision rule: **if this item were removed, would the feature disappear from the user's or system's point of view?** If yes, list it. If no, do not list it.

- ✅ include: routes or endpoint registration, config keys and defaults, database schema, scheduled tasks, event subscriptions or hook registration, shared UI injection points such as menu, button, or route table, feature flags, and third-party registration entries such as vendor preset or plugin entry
- ❌ do not include: internal code files that were modified, new helpers or computation functions, internal import adjustments, and internal wire, parser, or runner code modified to support the new capability, because those are implement's change plan
- format: `{mount location}: {specific file or config key} — {action: add / modify}`
- 3-5 items is the normal range. If it exceeds 8, re-check it. For pure internal capability enhancement, write "this feature introduces no new mount points"

Architecture doc updates are not mount points. Those belong to section 4.

#### 2.4 Rollout strategy

Slice by paradigm dimension, 4-8 lines explaining the order and the exit signal of each slice. The detailed list lands in `steps` inside `{slug}-checklist.yaml`. **Write only at the paradigm dimension, not file:line.**

Backend example:

```text
1. orchestration skeleton: wire the new flow through {workflow}, with stubbed nodes
   exit signal: the flow runs from entry to exit and the nodes return stub values
2. computation node A: implement the core logic of {term X}
   exit signal: unit test covers the normal path
3. computation node B: implement {term Y}
   exit signal: unit test covers normal path plus key edge
4. connect loading and persistence
   exit signal: one real-data path runs end to end
5. test coverage: fill the remaining items in the key scenario list
   exit signal: every acceptance scenario has observable evidence
```

Frontend example:

```text
1. static structure: component skeleton plus placeholder data → full layout visible in browser
2. interaction logic: button and form events plus local state → clicking and input respond correctly
3. state integration: connect with store or API → real data renders
4. integration and style finish → every acceptance scenario passes by direct observation
```

#### 2.5 Structural health and micro-refactor

This is a fixed section and every design must write it. **The evaluation targets are**:

- **file level**: the source files affected by the "change" in sections 2.1 and 2.2, excluding newly created files, only files that will actually be modified
- **directory level**: the target directories where new files will land in this feature, because the new file itself is not evaluated, but the directory it will be placed into must be checked for flattening

**Search compound first** — search once around "directory organization / file ownership / naming convention":

```bash
python .bytetrue/tools/search-yaml.py --dir .bytetrue/compound \
  --filter doc_type=decision --filter category=convention \
  --query "directory organization OR naming OR ownership"
```

If an existing convention is hit, for example "composables always go under `src/composables/`", then the conclusion for the relevant dimension here should simply say "follow compound `{slug}`", and the topic no longer needs to be debated.

**Evaluation dimensions**, if any one is significant, it counts as something that needs handling:

- file length: over 500 lines in one file, stricter for TS/JS/Vue, slightly looser for Python
- file responsibility: one file mixes 2 or more unrelated concepts, such as orchestration plus computation, or UI plus data fetching plus business logic
- file change density: this feature will touch or add 3 or more separate places inside the same file, and those places are logically independent
- **directory flattening**: the target directory already has 8 or more files at the same level and this feature will add 2 or more more; or the directory already shows obvious filename grouping patterns, such as many `XxxModal.vue` and `XxxForm.vue` files all mixed into one generic folder, and this feature would continue that flattening

**The conclusion must be written explicitly**:

```markdown
##### Evaluation
- file level — {file path}: {the three observations, length / responsibility / change density}
- directory level — {directory path}: {existing file count / naming pattern / this feature's added files}
- ...

##### Conclusion: {do not refactor | micro-refactor, split files | micro-refactor, restructure directory}

##### Plan, fill only when conclusion is micro-refactor
- what to move: {which chunks move out of file A, or which files matching a pattern move out of directory D}
- where to move it: {new file or new subdirectory path, plus naming and ownership explanation}
- how unchanged behavior will be verified: {build green + existing tests pass + zero diff in external signatures + only import-path diff}
- step sequence, provable refactor:
  1. ...
  2. ...

##### Suggested convention to capture, optional, only when the conclusion is directory restructuring and it represents a stable pattern
- is it a stable pattern: {if it is one-off cleanup, omit the whole block; if stable pattern, continue below}
- one-line rule: {for example "custom business components live under src/components/custom/, generic components under src/components/common/"}
- scope of applicability: {whole repo / frontend only / one module only}
  → recommend archiving it through `bt-decide` as `category: convention` after implement proves it works, so future designs can hit it from compound search

##### Observations beyond scope, optional, only advisory, not blocking
- {file path / directory path}: {structural problem discovered — repartition of responsibilities / module split or merge / interface semantics need to change / cross-file dependency tangle}
  → recommend handling later through `bt-refactor`; do not touch it in this feature
```

**Decision rules**:

- selecting micro-refactor requires satisfying "move only, no behavior change" — at file level, this means IDE rename or move plus compiler validation; at directory level, pure file moves plus import path updates plus compiler validation. If it requires changing function signatures, return shapes, call-graph semantics, or module split and merge, **do not do it in design and do not make it a prerequisite**. Write it into "observations beyond scope" and recommend `bt-refactor`, while this feature proceeds normally
- selecting "do not refactor" must still list the evaluation observations at both file level and directory level. Do not write only "healthy", because later acceptance will have no basis to understand how the judgment was made
- deciding whether "suggested convention to capture" is a stable pattern or one-off cleanup: stable pattern means **future features should also follow this rule**, such as ownership or naming rules. One-off cleanup means the directory is crowded only in this case and there is no broadly reusable rule. When unsure, lean toward one-off cleanup. In design, the plan has not yet been proven in real implementation, so this section only leaves the hook; whether to formalize it should be decided after implement succeeds
- both "observations beyond scope" and "suggested convention to capture" are optional. If there is nothing to record, omit the whole block

The section is not reviewed separately. It goes through overall review together with the whole design document, see section 5 below.

### `## 3. Acceptance Contract`

This defines what it means for implement to be complete, and what acceptance will verify. **Do not write test code, framework choice, or mock setup** here — that is implement's decision.

- **key scenario list**: write each item as "input or trigger → expected observable result", so it can be verified by one test or one manual operation. Cover normal paths, corresponding to the success criteria, plus key edges, such as boundary values, empty input, upper and lower limits, and key error paths, meaning the observable consequences of the flow-level constraints
- **reverse-check items for explicit non-goals**: every explicit non-goal from section 1 must be rewritten into something grep-able or testable in reverse, such as "the code must not call X API" or "the output JSON must not contain field Y"

#### 3.1 Test seam / TDD plan

This section does not write test code, framework, or mock. It answers only "from where should the behavior be validated during implementation".

- **TDD applicability**: `{applicable / not applicable / user did not require it but it is recommended}`, with reason, such as complex business logic, regression sensitivity, pure UI display, or configuration-only change
- **highest behavior seam**: `{public interface / API / CLI / component interaction / workflow entry}`
- **priority red/green behaviors**:
  1. `{the smallest behavior to validate with a failing test first}`
  2. `{second behavior, optional}`
  3. `{third behavior, optional}`
- **manual verification items**: `{acceptance scenarios that cannot be automated or are not worth automating}`

For simple UI, copy, or config changes, it is acceptable to write "this feature does not require TDD; cover it with {manual verification / typecheck / smoke test}".

### `## 4. Relationship with project-level architecture docs`

Predict what the acceptance stage will actually **extract** back into architecture, rather than merely adding a design link:

- **terms** ← entities, types, or outward contracts that are system-visible → go into the "structure and interaction / data and state" sections of architecture
- **verb skeleton** ← main flows or key orchestration visible across modules → go into architecture diagrams and module-interaction sections
- **flow-level constraints** ← stable constraints that span multiple features, such as error semantics, idempotency, extension points, or mount-point rules → go into the "known constraints" section of architecture

Additionally: which existing architecture docs are related, and whether the top-level architecture entry should gain new description, not just a link.

For changes that are visible only inside one module, write "this feature's changes are confined inside {module}, with no system-visible impact", and let acceptance skip architecture merge after confirming that is true.

## 5. Review prompt

> The design doc draft is complete. Please review it as a whole:
> 1. Do any terms conflict with existing concepts?
> 2. Is section 1, decisions and constraints, accurate, and is anything missing from the explicit non-goals?
> 3. In section 2.1 term layer, is the current-state description correct, and do the changes cover all data and interface changes?
> 4. In section 2.2 orchestration layer, can the main flow diagram and current-state → change narrative run through the scenarios in your head, and are any flow-level constraints missing?
> 5. In section 2.3 mount points, could the feature be completely removed by following this list, and has any internal implementation change been incorrectly listed as a mount point?
> 6. In section 2.5 structural health, are the evaluated files and directories correct, and do you agree with the conclusion, do not refactor / split files / restructure directory? If there is a "suggested convention to capture", is it truly a stable pattern? Are any "observations beyond scope" missing or wrong?
> 7. In section 3 acceptance scenarios, do they cover normal, edge, and error paths, and is the section 3.1 test seam / TDD plan reasonable?
>
> If you have changes, say them directly. After confirmation, we move into implementation.
