# ByteTrue Shared Conventions

This file is copied by `bt-onboard` into the project as `.bytetrue/reference/shared-conventions.md`. Every ByteTrue sub-skill references it through the project-relative path `.bytetrue/reference/shared-conventions.md`. It is the single authoritative place for conventions shared across sub-skills but not suitable to pile into any one individual skill.

Skills themselves do not share a filesystem, each skill is an independent installation unit, so shared conventions cannot live inside one skill and be referenced from another. Putting them inside the working project makes them reachable by all skills.

---

## 0. Directory structure and path naming

The skeleton after onboarding, built by `bt-onboard`:

```text
.bytetrue/
├── attention.md           project notes that every ByteTrue skill must read at startup
├── requirements/          capability vision layer, "what users need and what capability the system provides to satisfy it", across past / present / future
│   ├── VISION.md          central index, grouped by status, with one-line pitch per item
│   └── {slug}.md          one file per capability, flat, produced by `bt-req`
├── architecture/          architecture center directory, "what structure implements it", current state only
│   ├── ARCHITECTURE.md    root entry, index + key architecture decisions
│   └── {type}-{slug}.md   subsystem or module docs, produced by `bt-arch`
├── roadmap/               planning layer, "how to execute this larger demand next, how to split modules, and how to define interfaces"
│   └── {slug}/            one subdirectory per larger demand, produced by `bt-roadmap`
│       ├── {slug}-roadmap.md   main document, background / scope / module split / interface contracts / sub-feature list / scheduling
│       ├── {slug}-items.yaml   machine-readable sub-feature list, with status written back by acceptance
│       └── drafts/             optional
├── features/              feature-spec aggregate root
│   └── YYYY-MM-DD-{slug}/ one directory per feature
│       ├── {slug}-brainstorm.md  optional, produced only in case 2
│       ├── {slug}-design.md      standard flow
│       ├── {slug}-checklist.yaml standard flow
│       ├── {slug}-acceptance.md  standard flow
│       └── {slug}-ff-note.md     the only artifact in the fastforward path, mutually exclusive with the four files above
├── issues/                issue-spec aggregate root
│   └── YYYY-MM-DD-{slug}/
│       ├── {slug}-report.md
│       ├── {slug}-analysis.md   only when the root cause is not obvious
│       └── {slug}-fix-note.md
├── refactors/             refactor-spec aggregate root
│   └── YYYY-MM-DD-{slug}/
│       ├── {slug}-scan.md
│       ├── {slug}-refactor-design.md
│       ├── {slug}-checklist.yaml
│       └── {slug}-apply-notes.md
├── compound/              unified directory for archival document types
│   └── YYYY-MM-DD-{doc_type}-{slug}.md
│                          where doc_type ∈ {learning, trick, decision, explore}
├── brainstorm/            spike experiment area during brainstorm, temporary artifacts from `bt-brainstorm`
│   └── {slug}/            one subdirectory per spike, filenames arbitrary
│                          cleanup is not forced after validation; conclusions are written back into the corresponding brainstorm note
├── tools/                 shared scripts across workflows, released from the skill package by onboard
└── reference/             shared reference docs, released from the skill package by onboard
    ├── shared-conventions.md   directory structure / frontmatter / stage handoff rules
    ├── system-overview.md      overview of the ByteTrue system
    ├── domain-context.md       canonical terms / domain glossary / terminology boundaries
    ├── project-management.md   external tracker / labels / sync policy
    └── tools.md                shared script usage
```

### Naming rules

- requirement docs: `requirements/{slug}.md`, capability vision, no date prefix, flat with no grouping; central index is `requirements/VISION.md`
- roadmap: `roadmap/{slug}/`, no date prefix, flat, no nested epics
- feature / issue / refactor directories: all carry a date prefix, `YYYY-MM-DD-{slug}`
- archival docs: `compound/YYYY-MM-DD-{doc_type}-{slug}.md`, with the date being the **archival day**
- architecture docs: `architecture/{type}-{slug}.md`, long-lived and without date prefix; the root entry is always `ARCHITECTURE.md`
- the project-notes entry is fixed at `.bytetrue/attention.md`; every ByteTrue sub-skill must read it before startup; no more compatibility with external entries such as `AGENTS.md` or `CLAUDE.md`

### Grouping rule for architecture docs, same-type aggregation

Inside `architecture/`, the first segment of the filename is the type marker. For example, `ui-chat.md` and `ui-events.md` are both in the `ui` type. **Every architecture doc must follow `{type}-{slug}.md`**. Even when there is only one file, it still needs a reasonable type segment, such as `cli-entry.md`, otherwise future same-type grouping becomes impossible.

**Trigger**: when one type reaches 6 or more files in the root directory of `architecture/`, meaning the moment the sixth file of that type is added, all docs of that type must be moved into a same-name subdirectory.

**After the move**: remove the type prefix. `ui-chat.md` becomes `ui/chat.md`.

**Only promote, never demote**: even if the count later drops back to 5 or less, it does not flatten back out.

**Who is responsible when the trigger is hit**: in `backfill` or `update` mode, `bt-arch` must check this proactively before Phase 6 write-to-disk, and if the threshold is hit, that run must move both the newly added or changed file and all existing files of that type together, while also updating the links in `ARCHITECTURE.md`. The migration itself must be shown to the user during Phase 5 review rather than done silently. In `check` mode, it is not moved proactively, but if the type is still flat at 6 or more, it should be listed as an observation at the end of the report.

### Changing the directory structure

Change the template at `bt-onboard/reference/shared-conventions.md` so that new onboarded projects receive the new version; for existing projects, manually sync `.bytetrue/reference/shared-conventions.md`.

---

## 1. Shared metadata conventions

**feature spec**: brainstorm, design, and acceptance share `doc_type`, `feature`, `status`, `summary`, and `tags`. Each sub-skill adds only its own extra fields. `status`: brainstorm = `confirmed`, because writing to disk already means confirmed and there is no draft; design = `draft` / `approved`; acceptance defines its own completion semantics.

**issue spec**: report, analysis, and fix-note share `doc_type`, `issue`, `status`, and `tags`. Across all three issue stages, the completed state is uniformly `status: confirmed`; `draft` means the stage is not yet fully reviewed or verified. Fields such as `severity`, `root_cause_type`, and `path` are added by the corresponding stage as needed.

**Archival documents, `compound`**:

- learning, trick, decision, and explore all **write into `.bytetrue/compound/`**
- the top of each document's frontmatter carries `doc_type`, learning, trick, decision, or explore, to determine cross-sub-skill ownership
- filenames are `YYYY-MM-DD-{doc_type}-{slug}.md`, date first for `ls` sorting, type segment in the middle for grep
- each sub-skill keeps its own extra frontmatter beyond `doc_type`, such as learning's `track`, trick's `type`, decision's `category`, or explore's `type`
- each sub-skill recognizes only its own `doc_type` and never reads or writes another
- common fields such as `status` follow the semantics in this file

**External-reader docs**, guidedoc and libdoc, have frontmatter defined by their own skills. Unless otherwise specified, `draft` means pending review, `current` means currently valid, and `outdated` means code has changed and the doc now needs synchronization.

**Writing constraint**: when a sub-skill mentions fields, it should prefer to mention only the extra fields or the stage-specific status changes, and should not restate the full shared-field system again.

---

## 2. `{slug}-checklist.yaml` lifecycle

- it is the only execution checklist for the feature workflow
- it is generated once by `bt-feat-design` after design is approved, producing both `steps` and `checks`
- `bt-feat-ff` **does not generate** a checklist, and also does not produce design or acceptance; it is the ultra-light path that skips the spec flow and writes code directly. The only trace it leaves is the post-implementation `{slug}-ff-note.md`, which participates in scoped commit and can later be found by `bt-arch` or `bt-req` backfill

The granularity of `steps` is the **slice strategy along the orchestration-vs-computation dimension** — "orchestration skeleton first, then computation nodes, then persistence and testing", meaning minimal workflow first and then nodes one by one. It **must not** descend to `file:line` or function level. The actual file choices are decided by implement.

**Design is responsible for**:

- extracting `steps`, 4-8 steps, each with an independently verifiable exit signal; backend rhythm = orchestration skeleton → computation nodes one by one → connect persistence → test coverage; frontend = static structure → interaction logic → state integration → integration finish
- extracting `checks`: explicit non-goals in section 1 become scope guards; interfaces in section 2.1 become term contracts; main flow plus flow-level constraints in section 2.2 become orchestration-skeleton checks; mount points in section 2.3 become mount-point checks; scenario list in section 3 becomes acceptance-scenario checks

**Implement is responsible for**:

- executing `steps` in order, changing status from `pending` → `done` one step at a time
- when concrete file-level implementation requires splitting a step, or when a micro-refactor is discovered to be its prerequisite, see section 7 reflection checks, align with the user and then append or split the steps, **never silently**
- never rewriting `checks`

**Acceptance is responsible for**: only updating `checks[].status`, `pending` → `passed` / `failed`, and never rewriting `steps`.

**Writing constraint**: when sub-skills describe the checklist, they should explain only what this stage reads or writes, not redefine the whole lifecycle.

---

## 2.5 Roadmap ↔ feature handoff protocol

`.bytetrue/roadmap/{slug}/{slug}-items.yaml` is the only interface between the planning layer and the feature execution layer. The three skills all read and write it. Since they are all writing a project-shared artifact, this does not count as cross-skill coupling.

**State machine of `items.yaml`**:

```text
planned      → in-progress   (`bt-feat-design` changes it when the feature starts)
in-progress  → done          (`bt-feat-accept` changes it when acceptance completes)
planned      → dropped       (`bt-roadmap update` changes it when the user decides not to do it)
```

`done` and `dropped` are terminal states. When an item must be revisited later, add a new slug variant rather than changing a terminal state back.

**`bt-roadmap` is responsible for**: generating and maintaining the roadmap main doc plus `items.yaml`; changing `planned` → `dropped` when the user abandons it; and never writing `in-progress` or `done`, because feature skills own those transitions.

**`bt-feat-design` is responsible for**, when starting from roadmap:

1. adding `roadmap: {roadmap-slug}` and `roadmap_item: {sub-feature slug}` into design.md frontmatter
2. changing the corresponding item in `items.yaml` to `status: in-progress` and setting `feature: YYYY-MM-DD-{slug}`
3. validating yaml

When a feature starts directly and does not come from roadmap, both fields remain empty, and no roadmap write is triggered.

**`bt-feat-accept` is responsible for**:

1. reading `roadmap` and `roadmap_item` from design frontmatter
2. if empty, skipping roadmap write-back
3. if present, changing the corresponding item in `items.yaml` to `status: done`, synchronizing the display state of the sub-feature list in the main doc, and validating yaml

This write-back is an **actual file-writing action**, and the acceptance report must explicitly record its result.

**Minimal loop marker**: each `items.yaml` has exactly one `minimal_loop: true`, marking the narrowest end-to-end path that would actually run through once completed. When design starts a `minimal_loop` item, it gets the highest priority.

---

## 3. Stage close-out recommendations

Any item involving `bt-tracker` must follow the `sync_policy` in `.bytetrue/reference/project-management.md`: preview and ask only, never create, update, or close an external issue before explicit confirmation; when the provider is `local`, only explain that no external tracker is configured.

**roadmap** close-out should ask in this order:

1. `bt-tracker`: sync or bind the roadmap PRD and all syncable roadmap items touched this time, planned, in-progress, or done; dropped items only update already bound external issues

**feature-design** close-out should ask in this order:

1. `bt-tracker`: sync or bind the approved feature design; if the feature started from roadmap, also update or bind the corresponding roadmap item

**feature-acceptance** close-out should ask in this order:

1. `bt-learn`: capture the lessons
2. `bt-decide`: archive long-term constraints or choices
3. `bt-tracker`: update or bind the external task using feature design plus acceptance report or checklist; if the feature started from roadmap, also sync the done roadmap item state
4. `bt-guide`: developer or user guide
5. `bt-libdoc`: public API reference
6. `bt-note`: attention.md candidates
7. `scoped-commit`

**issue-report** close-out should ask in this order:

1. `bt-tracker`: sync or bind the confirmed bug issue

**issue-fix** close-out should ask in this order:

1. `bt-learn`: capture the pitfall
2. `bt-decide`: archive exposed long-term constraints
3. `bt-tracker`: update, bind, or request closure of the external bug issue; if it was never bound before, sync can still be added
4. `bt-note`: attention.md candidate
5. `scoped-commit`

**feature-ff** close-out should ask in this order, and by default it does not trigger tracker because it has no syncable source:

1. `bt-learn`: pitfalls exposed while doing the work
2. `bt-decide`: long-term constraints finalized during the work
3. `scoped-commit`

**Universal rule**: each prompt is one sentence; if the user says "no need", skip it immediately; it is never mandatory; upstream skills proactively suggest it and downstream skills execute it.

---

## 4. Close-out commit, `scoped-commit`

After acceptance or issue-fix completes, commit the artifacts of this run as one commit:

- **scope**: the code touched in this run + the related spec docs + the architecture docs actually updated this run + the roadmap `items.yaml` or main doc actually updated this run
- **must not include**: incidental changes unrelated to this run; expansions that belong in a later, separate feature or issue
- **confirm before commit**: if the user has not explicitly agreed, do not run `git commit`
- **commit message**: one sentence saying what was done, without pasting spec directory paths

Sub-skills describe only their stage-specific commit scope. The general rules live here.

---

## 5. Archive lookup rules

Before `feature-design`, `issue-analyze`, or `issue-fix` starts doing work, search `.bytetrue/compound/` for relevant prior capture:

- always search `architecture/` and `compound/` first
- inside `compound/`, filter by `doc_type`, learning / trick / decision / explore
- search hits are input hints only, not automatic instructions to apply blindly, because they may already be `outdated` or unsuitable for the current context
- if a search hit returns a decision that conflicts with the current direction, you **must** explicitly explain why the direction still stands, or adjust the direction

Each sub-skill only adds its stage-specific query commands. Full search syntax lives in `.bytetrue/reference/tools.md`.

---

## 6. Shared guard rules across archival sub-skills

The following rules are shared by `bt-learn`, `bt-trick`, `bt-decide`, and `bt-explore`. Their own skill bodies should mention only stage-specific anti-patterns; the shared rules are here:

1. **Append, do not delete** — once archived, a document is never deleted unless it is explicitly superseded with `status=superseded`; losing rationale is extremely expensive
2. **Better absent than low-quality** — if the user cannot explain a section, omit it rather than having the AI fabricate it
3. **Do not write substantive content on the user's behalf** — the AI is responsible for structure and connective wording; the substantive conclusion must come from the user or from traceable code evidence
4. **Check attention.md** — after writing, if the archive reveals one or two hard constraints that every startup should know, prompt the user to append them into `.bytetrue/attention.md` through `bt-note`; do not directly edit external AI entry files
5. **Check for overlap before drafting** — before writing, use `search-yaml.py --query` to search for semantically similar older docs. If there is a hit, list the candidates and let the user choose one of three paths:
   - **update existing**, the default priority — reuse the original filename and original creation date, **do not create a new file**; add `updated: YYYY-MM-DD` to frontmatter; for anything beyond a minor revision, add a one-line update note at the end
   - **supersede** — keep the old doc, set `status: superseded` plus `superseded-by: {new filename}`, add `**[Superseded]** see {new slug}` at the top of the old body, and put `supersedes: {old filename}` into the new frontmatter
   - **truly a different topic** — create a new file and list the old one under "related documents" at the end to explain the difference
6. **Recognize whether the user wants to update an existing thing or record a new one** — if the user says "change / update / revise / supplement {some item}", explicitly points to an existing file, or the topic is highly overlapping, default to updating the existing one. If you cannot tell, ask.

Each sub-skill recognizes only its own `doc_type` and never reads or writes another sub-skill's outputs.

---

## 7. Reflection checks while writing code

Shared by `bt-feat-impl` and `bt-issue-fix`. The AI naturally drifts toward large functions, large files, god classes, and special-case branches everywhere. This section cuts that drift off at the moment it starts.

**These are triggers, not thresholds** — hard numbers encourage splitting for its own sake and can shatter naturally cohesive code. Every line here means "when you encounter X, stop and ask yourself".

| Trigger scenario | Stop and ask yourself |
|---|---|
| about to append code into an already very long file | how many responsibilities does this file already carry? Is the new code a natural extension of the existing responsibility, or the N+1-th thing? If it is the latter, default to creating a new file |
| about to add another method into a class that already has many methods | is the new method a natural extension of the class's core duty, or is it pushing the class toward "can do everything"? |
| the function being written already exceeds one screen | how many different things is the function doing? Split by that count |
| about to add `if (special case) { special handling }` | is the abstraction dimension wrong? The correct solution may be to separate the special path and the generic path into different functions, strategies, or classes |
| about to copy-paste a block | can it be extracted into a shared thing, or is it only superficially similar? If it can be extracted, do it |
| about to add a fourth or later parameter to a function | is the function doing too many things? Parameter-list growth is an early signal of API decay |
| about to write a "universal tool class / helper" | does it really have no home, or are you only piling it into util because you cannot think of the right location? |

**After stopping**: the reflection check only surfaces the problem; the user decides the conclusion. Once the action needed after stopping, split, create a new file, rename, extract a shared layer, would exceed the current step scope, align with the user and then decide whether to include it now or record it as a while-here observation for later.

It is not allowed to silently split and continue, and it is not allowed to ignore the signal and brute-force through. The default action is stop, ask, then continue.
