# Optional Runtime Breadcrumb Acceptance Report

> Stage: stage 3, acceptance closure
> Acceptance date: 2026-06-11
> Related design doc: `.bytetrue/features/2026-06-11-optional-runtime-breadcrumb/optional-runtime-breadcrumb-design.md`

## 1. Interface-contract check

**Interface examples**

- [x] Current and onboard `workflow-state-breadcrumb.md`: both define `ByteTrueWorkflowState`, rendered block shape, resolver order, mode guardrails, runtime contract, and hard boundaries.
- [x] Pi extension registration: `package.json` preserves `pi.skills` and adds `pi.extensions: ["./extensions/bytetrue-breadcrumb.ts"]`.
- [x] Extension behavior: `extensions/bytetrue-breadcrumb.ts` registers `before_agent_start`, derives state from existing files, and appends a compact `<bytetrue-workflow-state>` block.

**Current state → change**

- [x] Before: ByteTrue package exposed skills only and runtime reminders were manual.
- [x] After: ByteTrue package also exposes a read-only Pi extension; non-Pi tools can still use the shared reference manually.
- [x] No `.bytetrue/state`, `.bytetrue/runtime`, or other state artifact was created.

**Flow diagram landing**

- [x] User prompt → Pi `before_agent_start` → `.bytetrue/attention.md` check → derive state from feature/roadmap artifacts → render breadcrumb → files remain source of truth. This flow is implemented in `extensions/bytetrue-breadcrumb.ts` and described in current/onboard reference docs.

## 2. Behavior and decision check

**Requirement summary**

- [x] Shared breadcrumb contract exists.
- [x] Pi package registers the extension while preserving skills.
- [x] Extension no-ops outside ByteTrue projects.
- [x] Extension derives feature-design, feature-impl, feature-accept, and roadmap states from fixtures.
- [x] Extension writes no workflow artifact and runs no project command.
- [x] Onboard releases and indexes the new reference.

**Explicit non-goals**

- [x] No canonical state file or runtime state directory was created.
- [x] No Claude hook implementation was claimed or added.
- [x] Core ByteTrue skills do not require breadcrumb support.
- [x] Breadcrumb does not make product decisions.
- [x] No subagent dispatch, worklog, background watcher, research routing, or standalone CLI was added.

**Landing of key decisions**

- [x] Pi extension is the first real runtime path: package manifest and extension file are present.
- [x] Claude plugin gets contract only: no `.claude-plugin` hook behavior was modified.
- [x] No canonical state file: resolver reads existing artifacts only.
- [x] Resolver is conservative: ambiguous/no ByteTrue state returns no injection.
- [x] Extension is read-only: only filesystem read/existence/list operations are used.

**Behavior Delta Materialization**

| Delta | Evidence | Writeback target | Status |
|---|---|---|---|
| ADDED: optional Pi workflow-state breadcrumb injection | `extensions/bytetrue-breadcrumb.ts`, fixture behavior test | architecture + requirement + reference | applied |
| MODIFIED: package exposes optional extension as well as skills | `package.json` manifest check | architecture + acceptance report | applied |

**Mount points and removability**

- [x] `.bytetrue/reference/workflow-state-breadcrumb.md`: current shared contract.
- [x] `skills/bt-onboard/reference/workflow-state-breadcrumb.md`: onboard template copy.
- [x] `extensions/bytetrue-breadcrumb.ts`: Pi runtime injection extension.
- [x] `package.json`: `pi.extensions` entry.
- [x] `skills/bt-onboard/SKILL.md`: skeleton and managed reference list.
- [x] `.bytetrue/reference/system-overview.md` and onboard copy: reference index.
- [x] Reverse grep found active behavior only in planned mount points.
- [x] Removal sandbox: removing the above mount points removes the runtime breadcrumb behavior; remaining mentions are feature docs and roadmap history.

## 3. Acceptance-scenario check

- [x] **S1 shared contract exists**: current/onboard `workflow-state-breadcrumb.md` define state shape, resolver order, rendered block, and file-wins rule.
- [x] **S2 Pi package registers extension**: `package.json` keeps `pi.skills` and adds `pi.extensions`.
- [x] **S3 extension no-ops outside ByteTrue**: fixture without `.bytetrue/attention.md` returned no injection.
- [x] **S4 extension derives known states**: fixtures passed for draft design, pending implementation step, pending acceptance check, and in-progress roadmap item.
- [x] **S5 extension is read-only**: scope guard found no artifact writes, commands, state file, subagent dispatch, worklog, CLI, or watcher behavior.
- [x] **S6 onboard/index sync**: current and onboard system overview plus `bt-onboard` inventory reference the contract.
- [x] **S7 line and syntax checks**: package JSON parse, extension syntax check, YAML/JSONL validation, and line counts passed.

No frontend changes; browser verification is not applicable.

## 4. Terminology consistency

- `Workflow-state Breadcrumb`: consistently means a derived prompt block, not a source of truth.
- `Breadcrumb Resolver`: consistently means read-only derivation from artifacts, not a state writer.
- `Optional Runtime Layer`: consistently means enhancement only, not core workflow requirement.
- `Pi Breadcrumb Extension`: consistently means the first concrete runtime implementation, not a CLI or dispatcher.
- `Manual Breadcrumb Contract`: consistently means documented fallback for non-injection tools, not a claimed Claude hook.
- Anti-conflict checks passed: no canonical state file, no required core dependency, no fabricated Claude hook, and no subagent dispatch.

## 5. Architecture merge

- [x] `.bytetrue/architecture/ARCHITECTURE.md`: added optional runtime breadcrumb as a current ByteTrue workflow architecture fact. It states Pi package can load `extensions/bytetrue-breadcrumb.ts`, derives state from existing `.bytetrue` artifacts, injects mode/artifact/next action/guardrails, and remains runtime aid rather than source of truth or core dependency.

A reader of architecture now sees behavior delta, execution modes, implementation review, context manifests, subagent handoff, research-first, and optional breadcrumb as current ByteTrue workflow architecture facts.

## 6. Requirement write-back

- [x] `.bytetrue/requirements/optional-runtime-breadcrumb.md`: upgraded from `draft` to `current` and set `implemented_by: [2026-06-11-optional-runtime-breadcrumb]`.
- [x] `.bytetrue/requirements/VISION.md`: moved `optional-runtime-breadcrumb` from Draft to Current.

## 7. Roadmap write-back

- [x] `.bytetrue/roadmap/ai-workflow-absorption/ai-workflow-absorption-items.yaml`: `optional-runtime-breadcrumb.status` changed from `in-progress` to `done`; `feature` remains `2026-06-11-optional-runtime-breadcrumb`.
- [x] `.bytetrue/roadmap/ai-workflow-absorption/ai-workflow-absorption-roadmap.md`: sub-feature list synchronized to `status: done` and corresponding feature path.
- [x] YAML validation passed for roadmap items.

## 8. attention.md candidate review

- [x] No candidates. This feature added an optional package extension and reference contract, but did not expose a recurring command, environment, credential, or setup pitfall that belongs in `attention.md`.

## 9. Leftovers

- Later optimization points: none.
- Known limitations: Claude hook packaging is intentionally not implemented until a verified package path exists; subagent dispatch, worklog, research routing, and standalone CLI remain out of scope.
- While-here observations: none.
