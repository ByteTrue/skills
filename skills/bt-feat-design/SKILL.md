---
name: bt-feat-design
description: Stage 1 of the feature workflow. Draft `{slug}-design.md` for a new feature as the only input for later implementation and acceptance, and extract a checklist after the plan is approved. Trigger when the user says "start designing", "write a design doc", or "prepare to implement XX", assuming it is already known what to build, for whom, and what counts as success.
---

# bt-feat-design

## Read Before Starting

Before making any judgment or taking any action, read `.bytetrue/attention.md` first; if it is missing, treat the skeleton as incomplete and tell the user to fill it in or run `bt-onboard`.

The output of this stage is one design file, `{slug}-design.md`, plus an action checklist extracted from it, `{slug}-checklist.yaml`. These two artifacts are consumed by two later stages, implement executes against them and acceptance verifies against them, so if this stage is wrong or incomplete, everything downstream inherits the error.
For standard feature designs, approved close-out also creates two feature-local context manifests, `{slug}-impl-context.jsonl` and `{slug}-check-context.jsonl`. The check manifest must point to the future `{slug}-implementation-report.md`, which implementation writes and acceptance consumes as durable review-gate evidence.

> For shared paths and naming conventions, see `.bytetrue/reference/shared-conventions.md`. In most cases the feature directory has already been created by brainstorm. If not, create it in this step.

> **After reading this section, jump to "After Exit" first and read the close-out checklist before coming back to write the design** — close-out behavior depends on `.bytetrue/config.yaml` (`workflow.mode` and `tracker.sync_policy`), and you are required to apply it in one pass.

This stage has three entry points:

- **Formal drafting**: the user can already explain the requirement clearly, or `{slug}-intent.md` is already filled, so go through the full drafting flow in the "workflow" section
- **Initialization mode**: the user says "open a new demand", "start a draft", or "create a new feature", but wants to write a half-finished plan themselves rather than describing it verbally. Use the next section, initialization mode, create the directory and an empty `{slug}-intent.md`, then end the current run and wait until the user fills it
- **Starting from a roadmap item**: the user says "start the sub-feature in roadmap {slug}" or "advance the next item in {roadmap}". The slug comes from `items.yaml` and is not invented again. Before writing, read the roadmap main doc and `items.yaml` to understand context and dependency state. When writing, frontmatter must carry `roadmap` and `roadmap_item`, and `items.yaml` must be written back so the corresponding item changes to `status: active` and `feature` becomes the feature directory name. See the section "Starting from a roadmap item" below

---

## Initialization mode, create the directory and intent draft for the user

Trigger: the user wants to write a half-finished plan themselves, `{slug}-intent.md`, as input for later design, but does not want to create the directory manually.

Actions:

1. **Quickly align on two things with the user** — a one-sentence demand summary plus the slug, lowercase letters, digits, and hyphens, such as `user-auth` or `export-csv`. Use today's date, `currentDate` in frontmatter is enough. The feature directory name is `YYYY-MM-DD-{slug}`
2. **Create the directory** `.bytetrue/features/{YYYY-MM-DD}-{slug}/`
3. **Write an empty `{slug}-intent.md`** as the draft skeleton, exactly with the following content:

   ```markdown
   ---
   doc_type: feature-intent
   feature: {YYYY-MM-DD}-{slug}
   status: active
   summary: {one-line requirement, filled by the AI according to the aligned wording with the user}
   ---

   # {slug} intent

   ## Background / Why this is being done

   (one sentence is enough)

   ## Roughly how it should work

   (around 100 words describing the idea, including key steps and data flow)

   ## Related data structures / types

   (paste related types, interface signatures, or point to code locations)

   ## Known non-goals / TBD

   (optional: explicit boundaries or things the user themselves has not thought through yet)
   ```

4. **Tell the user "the skeleton is ready, come back after filling it and I will write the formal design based on the intent"**, and then **end the current run without continuing the design flow**

Why stop here? The whole value of intent mode is that the user can think offline and put their own thoughts on paper. If the AI keeps asking questions, intent mode collapses back into brainstorm.

---

## Starting from a roadmap item

Trigger: the user says "start the sub-feature in roadmap {slug}" or points at one `pending` item inside `items.yaml`.

1. **Read the roadmap context** — open `{roadmap-slug}-roadmap.md` and `{roadmap-slug}-items.yaml`:
   - the target item must currently be `status: pending`, and every prerequisite in `depends_on` must already be `done`, otherwise stop and report it
   - **you must read section 3, module split, and section 4, interface contracts / shared protocols, from the main doc** — these are hard-constraint inputs for this feature. If the contract is unreasonable or incomplete, stop and recommend going back to `bt-roadmap update`; **do not quietly route around it inside design**
2. **Take the slug from roadmap**, with feature directory `YYYY-MM-DD-{roadmap-item-slug}` and no new slug
3. **Proceed through the normal workflow section**, adding `roadmap` and `roadmap_item` into frontmatter
4. **When the design review passes, write the design as `status: done` plus `review_result: approved`, and also write back `items.yaml`**: set the corresponding item to `status: active`, set `feature: YYYY-MM-DD-{slug}`, and validate with `validate-yaml.py`

For the full handoff protocol, see section 2.5 in `.bytetrue/reference/shared-conventions.md`.

---

## What design writes and what it does not write

Design only covers the orchestration side in the separation between orchestration and computation: **the current state and changes of the term layer and orchestration layer for this feature**. Computation-layer details, exactly how to write it, which functions to change, and how to structure tests, belong to implement.

Design writes three kinds of things, and both the term layer and orchestration layer use the two-part structure of **current state → change**:

1. **Term layer** — value objects, entities, data structures, outward contracts, and type definitions
2. **Orchestration layer** — the main flow, workflow, key orchestration functions, and control-flow topology, linear, branch, parallel DAG, or state machine. It begins with one main flow diagram that builds the mental model
3. **Flow-level constraints** — error semantics, idempotency, concurrency or ordering, extension-point placement, and observability points. The mount-point list also belongs here

4. **Test seam planning** — do not write test code, framework choice, or mock setup, but do decide whether this feature is suitable for TDD: which public interface or observable behavior should validate the key behavior, which acceptance scenarios are suitable for automation, which can only be manually verified, and if a new seam is needed, prefer the highest seam

In addition there is one **fixed structural-health section**, section 2.5. It evaluates whether the files about to be modified are already bloated or responsibility-mixed, and whether the directories where new files would land are flattened. Based on that it decides whether a "move only, no behavior change" micro-refactor should happen before implementation, split files or reorganize directories. Even when the conclusion is "do not refactor", it must still be written explicitly in design. Otherwise the AI will, by default, keep stuffing more code into fat files and add more files into crowded directories. This section goes into overall review together with the rest of the draft, and does not require its own separate confirmation.

**Decision rule**: if changing the writing approach would change the term layer or orchestration layer, then it is a design matter. If changing the writing approach only changes "the code looks nicer", "the function is split differently", or "the tests use another framework", then it belongs to implement.

Do not write the changed-file inventory, function-level landing points, test code, or library-choice details. At design time you have not yet fully read the relevant code, so such predictions often get revised. Implement reads the current state afterward and decides.

---

## The design file is for overview, not close reading

When readers open `{slug}-design.md`, they want to capture the point within 5 minutes, not read it word by word. The practical rules are:

1. **if a section exceeds one screen, cut or split it** — readers lose their place once it no longer fits
2. **lock terminology first** — grep code, architecture, and historical features before writing; cleaning it up afterward costs far more than prevention
3. **prefer examples to definitions** — for interface behavior, show one input→output example first, then add the formal type only when necessary
4. **state each piece of information only once in the most natural place** — repetition is more annoying than omission
5. **new logic goes to a new file by default**, recorded inside the change plan, because the larger a file gets, the harder it is to tell what its responsibility is

---

## Three drafting disciplines

### 1. Do not make decisions for the user

Whenever you hit a corner the user has not made clear, stop by default and ask. Do not silently pick one answer and write it down. Concretely:

- **state assumptions** — if a judgment did not come from the user's actual words, write it as "Assumption: ..."
- **offer options without self-selecting** — put 2-3 reasonable routes on the table before stating a preference
- **if you do not understand it, stop** — if you keep guessing and writing, acceptance will eventually expose that the design never matched what needed to be verified

### 2. Write both goals and constraints in verifiable form

- do not write weak standards like "make it work" or "smooth user experience" — rewrite them into things like "when given input A, it returns B"
- make "explicitly not doing" concrete enough to be reverse-checked by grep or tests; do not write empty phrases such as "avoid over-engineering"

### 3. Every feature must be uninstallable

Answer this question: "If we wanted to pull this out again, where exactly would it need to be removed?" If you cannot answer it, the boundary is not clear yet, and once the feature lands it becomes a thing that cannot be cleanly removed.

This lands in the mount-point inventory, section 2.3. **Decision rule**: if removing the item makes the feature disappear from the user or system point of view, include it; otherwise do not. For detailed ✅ and ❌ examples and writing format, see `reference.md`. This list also helps you see whether you accidentally inserted the feature into too many places. Too many mount points is a signal that coupling is spreading out.

---

## Workflow, what to do when

### 1. Startup checks

**Prerequisite gate**: the demand input must contain at least four things, user goal, core behavior, success criteria, and explicit non-goals, coming from intent, brainstorm, or conversation. If one is missing, fill it in. If the user themselves cannot explain it clearly, fall back to brainstorm.

**Four mandatory checks**:

1. **Continuation check** — Glob `{slug}-design.md`, `{slug}-intent.md`, and `{slug}-brainstorm.md`:
   - if there is intent or brainstorm, treat them as input and do not ask again for things they already made clear
   - if there is a design with `status=active` and its sections are mostly complete, jump straight to step 5, overall review
   - if a design exists but only some sections are missing, fill the missing sections and report "last time it was written up to X; I will fill the missing parts and review the whole thing with you"
   - if a design exists with `status=done` and `review_result=approved`, do not silently overwrite it. Ask whether the user wants to keep editing it or start with a new slug
2. **Scan `.bytetrue/` as global input** — Glob `.bytetrue/`, discover available directory and document types, and read them by type:
   - `architecture/` → read `ARCHITECTURE.md`, the index, and the relevant subsystem docs, paying attention to term reuse and flow-level constraints
   - `requirements/` → if there is a corresponding req, fill its slug into frontmatter `requirement`, and read its user stories and boundary sections; if this is the first appearance of a new capability, trigger `bt-req draft` to write the req vision first, then fill the new slug into `requirement`; for pure refactor or technical debt, leave it empty
   - `compound/` → search relevant decision, explore, trick, and learning with `search-yaml.py --dir .bytetrue/compound`; any conflicting decision hit must be explicitly addressed
   - `features/` → search whether similar historical feature designs exist as reference
   - handle other directories according to their content type
3. **Read the existing code relevant to the demand** — which files to read is decided by the demand clues

**Three signal-triggered checks**, skip if there is no signal:

- **Terminology grep for conflict prevention** — if a new concept name has never been seen in code, architecture, or historical feature docs, grep it once; if there is a conflict, rename it or explicitly distinguish it in section 0
- **Complexity-dimension alignment** — if the demand includes signals like external SDK, high concurrency, or one-off tool, which deviate from defaults, open `.bytetrue/reference/code-dimensions.md` and list the deviating dimensions; if there is no such signal, write "use the default bundle"
- **Grep for similar modules with different naming** — if your intuition says "someone may already have done something similar under another name", grep near-synonyms
- **Research-first trigger** — if the design direction depends on external tool behavior, library/API capability, platform hooks, comparable workflows, industry convention, or performance/cost claims, first look for an existing `bt-explore` spike or create one, then cite it; see `.bytetrue/reference/research-first.md`

The detailed rules are in section 5 of `.bytetrue/reference/shared-conventions.md`.

### 2. Think through where this feature belongs

Before writing the term layer or orchestration layer, answer this: **where in the overall project structure does this new thing belong?**

- if an existing module should naturally carry it, extend that module, do not create a parallel structure
- if it spans multiple modules, decide whether to extract a shared layer or let one side lead and the others depend on it
- if it looks unlike any existing module, create a new independent module or subsystem, and think through early what it exposes outward and how it interacts with others
- if a similar thing may already exist but under another name, grep a few synonyms

The cost of placing it wrong is that the module becomes a catch-all bucket, or multiple parallel implementations of the same idea end up coexisting.

Write the conclusion into section 1, decisions and constraints. If it involves a new module or cross-module interface, also write it into section 4 and note that `ARCHITECTURE.md` should later point to it.

The AI's default crash pattern is **adding it into the most convenient file in front of it without thinking**.

### 3. Write the term layer and orchestration layer in "current state → change" form

Follow the template in `reference.md` and write the four subsections of section 2, 2.1 term layer, 2.2 orchestration layer, 2.3 mount points, and 2.4 rollout strategy. Key reminders:

- the "current state" must point to real code locations, not assumptions. Readers rely on it to judge whether the "change" is reasonable
- orchestration starts with one Mermaid diagram to build the mental model
- mount points use the "if removed, does the feature disappear?" rule, and 3-5 items is the normal range
- rollout strategy slices by paradigm dimension, orchestration skeleton → computation node → persistence → tests, and never drops down to `file:line`
- **section 2.5, structural health and micro-refactor, is mandatory** — follow the writing requirements in `reference.md` to evaluate **two kinds of targets**: the files to be modified, file level, and the directories where new files will land, directory level. **Before evaluating, search existing conventions in compound** around "directory organization / file ownership / naming conventions". If there is a hit, follow it directly. The conclusion must be one of three:
  1. **do not refactor** — files are healthy, directories are not crowded, or the change is too small for the micro-refactor benefit to outweigh the risk; write "no micro-refactor this time, because ..."
  2. **do micro-refactor, split files** — the file is bloated or responsibility-mixed, but the problem can be solved with a provable refactor, such as splitting functions, splitting files, or moving definitions while the compiler stays green throughout
  3. **do micro-refactor, restructure directories** — the target directory is flattened, and it can be solved by pure file moves plus import-path updates while the compiler stays green

  When selecting 2 or 3, give a concrete plan of what moves where and how unchanged behavior will be verified, and land it as **step 1 in the checklist with an independent exit signal** before the main feature steps begin
- **when restructuring directories, ask one extra question: is this a stable pattern or a one-off cleanup?** If it is a stable pattern, such as "custom business components always go under `components/custom/` and future features should follow this", add a "suggested convention to capture" block at the end of 2.5 so implement can later route it to `bt-decide` after the path proves out. If it is one-off cleanup, move things but do not capture a convention. **Design never archives a convention directly**; the solution has not yet proven itself, so it only leaves the hook
- **design only allows safe micro-refactors, and the boundary is strict**: "move only, no behavior change". File-level uses IDE rename or move plus compiler validation. Directory-level uses pure file moves plus import-path updates plus compiler validation. Once it involves changing function signatures, changing return shapes, changing call-graph semantics, or splitting or merging modules, it **exceeds the design boundary**. In that case, write it at the end of section 2.5 under "observations beyond scope" and tell the user it is better handled later through `bt-refactor`. **It does not block this feature and does not become a prerequisite.** Whether to do it and when to do it is a decision outside this feature
- **section 2.5 goes through overall review together with the full draft** — package it together with the feature plan so the user can review it in one pass, instead of stretching the rhythm into two rounds

### 4. Fill the remaining sections and give the whole draft for review at once

Follow the template in `reference.md` to fill the remaining sections, 0, 3, and 4. The initial frontmatter status is `active`.
For section 1, also record `execution_mode` when the work is not obviously standard. Use `.bytetrue/reference/execution-modes.md` to choose light / standard / strict-evidence / break-loop, and keep this separate from code dimensions.

Only after the whole draft is formed do you show it to the user. **Do not review in partial batches** — partial review shows the user only local fragments, and they cannot catch cross-section inconsistencies such as section 1 scope not matching section 2 change.

For section 3, acceptance contract, the reminder is: each item should be written as "input or trigger → expected observable result", covering normal path, edge, and error. For features that fit TDD, also write a test seam plan: highest behavior seam, the first 1-3 red/green behaviors, and manual verification items. If observable behavior changes, section 3 must include a Behavior Delta block, `ADDED` / `MODIFIED` / `REMOVED` / `RENAMED`; if not, explicitly write `Behavior Delta: none`. Do not write test code, framework, or mock setup.

### 5. Overall review

Use the overall review prompt, the wording lives in section 5 of `reference.md`. Revise according to user feedback until they approve it, then change `status` from `active` to `done` and set `review_result: approved`.

### 6. Generate `{slug}-checklist.yaml`

After the plan is confirmed, extract `steps` and `checks` from `{slug}-design.md` into `{slug}-checklist.yaml`. The full format, extraction rules, and typical rhythm are in section 3 of `reference.md`.

After writing it, validate with `python .bytetrue/tools/validate-yaml.py --file {path} --yaml-only`.
Also write `{slug}-impl-context.jsonl` and `{slug}-check-context.jsonl` following `.bytetrue/reference/context-manifest.md`. Baseline rows should include the design, checklist, linked requirement, roadmap docs if present, architecture docs named in section 4, execution modes, implementation review, cited compound evidence, and in `check-context` the planned `{slug}-implementation-report.md` path.

### 7. Exit

Check the exit conditions below and guide the user into stage 2.

---

## Exit Conditions

The user has passed overall review, and:

- [ ] frontmatter is complete, including `doc_type`, `feature`, `status=done`, `review_result=approved`, `summary`, and `tags`, and the `requirement` field is aligned
- [ ] section 1 contains explicit non-goals and complexity-dimension deviations, or clearly says it follows the default
- [ ] section 1 records `execution_mode`, or explicitly says standard mode is sufficient
- [ ] sections 2.1 and 2.2 use the "current state → change" structure; interfaces have examples plus source locations; orchestration starts with a main flow diagram
- [ ] section 2.3 mount points are tightened by the rule "if removed, the feature disappears", usually 3-5 items
- [ ] section 2.4 rollout strategy is sliced by paradigm dimension, and every step has an exit signal
- [ ] section 2.5 structural-health evaluation covers both file level and directory level; compound conventions were checked before evaluating; the conclusion is explicit, do not refactor / split files / restructure directories; when "micro-refactor" is selected, checklist step 1 is that micro-refactor with an independent exit signal; when "restructure directories" is selected and it is a stable pattern, the doc includes a "suggested convention to capture" block; any structural problem beyond the boundary of "move only, no behavior change" is listed under "observations beyond scope" and is advisory only
- [ ] section 3 key scenarios cover normal, edge, and error paths, and include reverse-check items for explicit non-goals
- [ ] section 3 contains a test seam plan, or explicitly states that the feature is not suitable for TDD or automated testing
- [ ] section 3 contains Behavior Delta entries for observable behavior changes, or explicitly states `Behavior Delta: none`
- [ ] `{slug}-checklist.yaml` has been written and passes `validate-yaml.py`
- [ ] `{slug}-impl-context.jsonl` and `{slug}-check-context.jsonl` have been written for standard designs, with check-context including the planned `{slug}-implementation-report.md`, or the design explicitly explains why manifests are not applicable
- [ ] when started from roadmap, `items.yaml` has been written back with `status: active` and `feature` filled

---

## After Exit

Tell the user: "feature design is approved and the checklist is ready. The next stage is implementation. Trigger `bt-feat-impl`."

Following section 3 `feature-design` of `.bytetrue/reference/shared-conventions.md`, first read `workflow.mode`, `workflow.ask_before`, `tracker.provider`, and `tracker.sync_policy` from `.bytetrue/config.yaml`. Skip the tracker prompt when `tracker.provider: local` or `tracker.sync_policy: never`. In `manual`, ask the applicable prompt below and stop; the tracker prompt is applicable only when it was not skipped. In `auto`, prepare a tracker preview only when tracker is not skipped and `sync_policy: auto_preview`, and continue to `bt-feat-impl` startup only when no tracker/write/review boundary is reached.

1. a reviewed feature design (`status: done`, `review_result: approved`) may need collaboration-state projection and tracker is not skipped → "Do you want to sync or bind an external tracker? (`bt-tracker`)" When the feature starts from roadmap, also mention that the corresponding roadmap item can be updated or bound. Do not create or update any external issue before explicit user confirmation.

---

## Easy Pitfalls

- starting to write before reading related architecture or grep-checking terminology — the plan ends up mismatching existing code, and resolving terminology conflicts later costs an order of magnitude more time
- describing interface behavior in prose without concrete examples — the reader cannot build a mental model
- writing only "change" and not "current state" for the term layer or orchestration layer — the reader cannot judge whether the change is reasonable
- turning the mount-point inventory into a changed-file inventory — internal changes belong to implement; mount points list only the registration points whose removal would make the feature disappear
- writing test code, framework choice, mock strategy, or function-level landing points in design — all of that belongs to implement
- forcing diagrams when there are 2 modules or fewer and the call chain is linear — the diagram then blurs the point
- giving only half a document for review — the user cannot see global consistency
- quietly expanding scope inside the requirement summary — acceptance will later fail to line up
