---
doc_type: feature-acceptance
feature: 2026-06-12-workflow-control-plane-contract
status: done
summary: Accepted workflow control-plane contract for config, canonical status, continuation routing, brainstorm paths, behavior writeback, and auto mode.
---

# workflow-control-plane-contract acceptance report

> Stage: stage 3, acceptance closure
> Acceptance date: 2026-06-12
> Related design doc: `.bytetrue/features/2026-06-12-workflow-control-plane-contract/workflow-control-plane-contract-design.md`

## 1. Interface-contract check

- [x] `Project Config`: `.bytetrue/config.yaml` exists and parses. Current tracker/workflow/dispatch/docs values now live there.
- [x] `Canonical Status`: shared conventions define `pending`, `active`, `done`, `dropped`, `archived` as the only status vocabulary for workflow artifacts.
- [x] `Continuation Scan`: `bt` may read minimal artifact state for named continuation requests, and `bt-feat` has a deterministic resume table.
- [x] `Open Brainstorm`: `.bytetrue/brainstorms/{slug}/brainstorm.md` is the open discussion path; feature-local brainstorm remains in the feature directory.
- [x] `Current Behavior / Observable Contract`: feature acceptance guidance names these as stable Behavior Delta writeback targets.

## 2. Behavior and decision check

- [x] Requirement summary satisfied: config, status, continuation routing, brainstorm path, Behavior Delta writeback, and auto mode consumption are all reflected in skills/references.
- [x] Non-goal guarded: no `.bytetrue/specs/`, CLI, hook, daemon, hidden runtime, background agent, custom dispatcher, or physical archive migration was added.
- [x] Volume-control policy guarded: shipped skills/references no longer hard-code a universal maintainer-only documentation guidance. Code/refactor heuristics about oversized components remain unrelated and valid.
- [x] Auto mode boundary and consumption: `.bytetrue/config.yaml` defines `workflow.mode: manual | auto` and `ask_before`; shared close-out rules and workflow skills now consume it for deterministic continuation while still stopping at ask-before / review boundaries. No daemon, hook, background executor, or CLI auto-runner is implemented.
- [x] Behavior Delta Materialization:

| Delta | Evidence | Writeback target | Status |
|---|---|---|---|
| ADDED: machine-readable config | `.bytetrue/config.yaml`, `.bytetrue/reference/config.md` | architecture + requirement | applied |
| ADDED: canonical status vocabulary | shared conventions current/onboard copies | architecture + requirement | applied |
| ADDED: deterministic continuation routing | `skills/bt/SKILL.md`, `skills/bt-feat/SKILL.md` | architecture + acceptance | applied |
| ADDED: open brainstorm path | `.bytetrue/brainstorms/.gitkeep`, `bt-brainstorm`, shared conventions | architecture + shared conventions | applied |
| MODIFIED: Behavior Delta writeback target | `bt-feat-accept` mentions Current Behavior / Observable Contract | acceptance + architecture | applied |
| MODIFIED: volume-control policy | AGENTS/CLAUDE/worklog reference wording | acceptance-only + maintainer guidance | applied |

## 3. Acceptance-scenario check

- [x] S1 machine-readable config: `.bytetrue/config.yaml` parses with `validate-yaml.py`.
- [x] S2 canonical status vocabulary: static audit covers shipped skills, current/onboard references, current PR requirements, PR feature/compound/roadmap artifacts, and the AI workflow absorption roadmap; legacy status-field values were removed or expressed through fields such as `current`, `validity`, `paused`, `review_result`, and `superseded_by`.
- [x] S3 continuation routing: `bt` and `bt-feat` contain explicit routing for named continuation requests and half-implemented features.
- [x] S4 open brainstorm path: `.bytetrue/brainstorms/` exists and `bt-brainstorm` uses plural `brainstorms/` for open records.
- [x] S5 behavior writeback: `bt-feat-accept` mentions `Current Behavior` and `Observable Contract`.
- [x] S6 volume-control policy: no hard-coded worklog maintainer-only artifact guidance remains in shipped skills/references.
- [x] S7 onboard sync: exact current/onboard parity passes for 7 package-managed contract reference files; the remaining 8 shared reference files are project-owned/localized or intentionally divergent, with the roadmap item state machine semantically aligned in both copies.

No frontend/browser verification is applicable.

## 4. Terminology consistency

- `Project Config`: consistent as `.bytetrue/config.yaml`.
- `Canonical Status`: consistent as `pending | active | done | dropped | archived`.
- `Continuation Scan`: used in design/acceptance and represented in `bt` / `bt-feat` routing.
- `Open Brainstorm`: consistent as `.bytetrue/brainstorms/` for large open discussions.
- `Current Behavior` / `Observable Contract`: used only as Behavior Delta stable writeback target terms.

## 5. Architecture merge

- [x] `.bytetrue/architecture/ARCHITECTURE.md`: added skills-first control plane as a current architecture decision: config values live in `.bytetrue/config.yaml`, workflow status uses canonical five-state vocabulary, continuation scan is status-aware, open brainstorms live in `.bytetrue/brainstorms/`, stable Behavior Delta writes back to existing fact layers, and no hidden runtime state is introduced.

## 6. Requirement write-back

- [x] `.bytetrue/requirements/workflow-control-plane-contract.md`: upgraded to `status: done`, added `current: true`, and set `implemented_by: [2026-06-12-workflow-control-plane-contract]`.
- [x] `.bytetrue/requirements/VISION.md`: moved `workflow-control-plane-contract` from Draft to Current.

## 7. Roadmap write-back

- [x] `.bytetrue/roadmap/ai-workflow-absorption/ai-workflow-absorption-items.yaml`: added `workflow-control-plane-contract` as a done PR-review-remediation item linked to this feature; `.bytetrue/roadmap/ai-workflow-absorption/ai-workflow-absorption-roadmap.md` now lists the item and control-plane contract.

## 8. attention.md candidate review

- [x] No attention.md candidate. This feature changed workflow contracts and shared references; it did not reveal an environment or command pitfall that every future session must know.

## 9. Leftovers

- Later optimization: `bt-tracker/SKILL.md` is close to this repository's skill/reference maintenance line threshold; future tracker changes should move detailed tables to a reference file.
- Known limitation: auto mode is implemented as pure skill continuation semantics only; no daemon, hook, background executor, or CLI auto-runner is implemented in this feature.
- While-here items: none.
