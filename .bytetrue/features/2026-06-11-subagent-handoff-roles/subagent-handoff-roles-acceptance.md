---
doc_type: feature-acceptance
feature: 2026-06-11-subagent-handoff-roles
status: done
summary: Accepted implement/check/research handoff role contract.
---

# Subagent Handoff Roles Acceptance Report

> Stage: stage 3, acceptance closure
> Acceptance date: 2026-06-11
> Related design doc: `.bytetrue/features/2026-06-11-subagent-handoff-roles/subagent-handoff-roles-design.md`

## 1. Interface-contract check

**Interface examples**

- [x] Current and onboard `subagent-handoff.md`: both define the Active Work Block with active work, role, design, checklist, and context manifest paths.
- [x] Role contract summary: both define `implement`, `check`, and `research` roles with distinct reads, writes, and must-not boundaries.

**Current state → change**

- [x] `bt-feat-impl` now points optional delegated implementation to the `implement` role and keeps parent ownership of lifecycle transitions.
- [x] `bt-feat-accept` now points optional delegated review to the `check` role and says it does not replace acceptance.
- [x] `bt-explore` now states the `research` role still only writes evidence-backed explore records and must not make final decisions.

**Flow diagram landing**

- [x] Parent orchestrator → active work block → context manifest → implement/check/research role → parent synthesis lands in shared handoff contract and stage-specific pointers.

## 2. Behavior and decision check

**Requirement summary**

- [x] Shared handoff protocol exists for native subagent, non-interactive child agent, and inline fallback modes.
- [x] Implementation, checking, and research roles are defined.
- [x] Parent orchestrator retains scope, user alignment, final synthesis, and lifecycle transitions.
- [x] Onboard releases and indexes the new reference.

**Explicit non-goals**

- [x] No automatic subagent dispatch was implemented.
- [x] No `.pi/agents`, `.claude/agents`, chains, or custom runtime agent definitions were created.
- [x] No hook / breadcrumb injection was implemented.
- [x] No research-first routing was implemented.
- [x] No child role is allowed to mark acceptance complete.
- [x] Subagents are not required; inline fallback remains valid.
- [x] No `planner` child role was introduced.

**Landing of key decisions**

- [x] Full protocol lives in `subagent-handoff.md`; skill files only add concise role pointers.
- [x] Role names are workflow-derived: Trellis implement/check/research, Superpowers reviewer → check, OpenSpec no extra execution role.
- [x] Planning stays in roadmap/design/checklist checkpoints; no child planner role.
- [x] Children receive active work + manifest rather than relying on parent memory.
- [x] Research role writes explore evidence, not final product decisions.

**Behavior Delta Materialization**

| Delta | Evidence | Writeback target | Status |
|---|---|---|---|
| ADDED: shared handoff protocol for implement/check/research roles | current/onboard `subagent-handoff.md`, stage pointers | architecture + requirement + reference | applied |
| MODIFIED: delegation rules are explicit and support subagent or inline fallback | `bt-feat-impl`, `bt-feat-accept`, `bt-explore` guidance | architecture + acceptance report | applied |

**Mount points and removability**

- [x] `.bytetrue/reference/subagent-handoff.md`: current shared handoff contract.
- [x] `skills/bt-onboard/reference/subagent-handoff.md`: onboard template copy.
- [x] `bt-feat-impl`: implement role pointer.
- [x] `bt-feat-accept`: check role pointer.
- [x] `bt-explore`: research role boundary.
- [x] `bt-onboard` plus current/onboard system overview: reference file indexed.
- [x] `.bytetrue/reference/context-manifest.md`: manifest relationship to handoff roles recorded.
- [x] Reverse grep found no active mount outside the planned list.
- [x] Removal sandbox: removing the listed mount points removes the feature's active behavior; remaining mentions are design/checklist/roadmap history.

## 3. Acceptance-scenario check

- [x] **S1 shared contract exists**: current and onboard `subagent-handoff.md` define Active Work Block, roles, parent authority, and stop rules.
- [x] **S2 implementation role integrated**: `bt-feat-impl` mentions optional `implement` handoff and keeps checklist/code/report boundaries.
- [x] **S3 check role integrated**: `bt-feat-accept` mentions optional `check` handoff and preserves independent acceptance.
- [x] **S4 research role integrated**: `bt-explore` can serve research role and still writes explore evidence without final decisions.
- [x] **S5 manifest relationship exists**: `context-manifest.md` says handoff roles consume context manifests.
- [x] **S6 no runtime dispatch**: grep confirms no `.pi/agents`, `.claude/agents`, chain, hook, breadcrumb, worklog, or CLI behavior was introduced.
- [x] **S7 line budget**: all edited markdown files stay under 300 lines.

No frontend changes; browser verification is not applicable.

## 4. Terminology consistency

- `Subagent Handoff Protocol`: consistently means prompt contract, not automatic dispatcher or runtime hook.
- `Handoff Role`: consistently limited to `implement`, `check`, and `research`.
- `Parent Orchestrator`: consistently owns scope, synthesis, and lifecycle transitions.
- `Child Agent`: consistently bounded and forbidden from final acceptance decisions.
- `Active Work Block`: consistently a prompt prefix, not workflow-state breadcrumb.
- Anti-conflict checks passed: no `planner` child role, no mandatory subagents, no reliance on parent chat history instead of context paths.

## 5. Architecture merge

- [x] `.bytetrue/architecture/ARCHITECTURE.md`: added that subagent handoff is optional execution infrastructure; parent session keeps scope/user alignment/final synthesis/lifecycle transitions, while child or inline roles execute bounded `implement`, `check`, or `research` tasks using Active Work Block plus context manifest.

A reader of architecture now sees context manifests and subagent handoff as connected execution-infrastructure facts.

## 6. Requirement write-back

- [x] `.bytetrue/requirements/subagent-handoff-roles.md`: upgraded from `draft` to `current` and set `implemented_by: [2026-06-11-subagent-handoff-roles]`.
- [x] `.bytetrue/requirements/VISION.md`: moved `subagent-handoff-roles` from Draft to Current.

## 7. Roadmap write-back

- [x] `.bytetrue/roadmap/ai-workflow-absorption/ai-workflow-absorption-items.yaml`: `subagent-handoff-roles.status` changed from `active` to `done`; `feature` remains `2026-06-11-subagent-handoff-roles`.
- [x] `.bytetrue/roadmap/ai-workflow-absorption/ai-workflow-absorption-roadmap.md`: sub-feature list synchronized to `status: done` and corresponding feature path.
- [x] YAML validation passed for roadmap items.

## 8. attention.md candidate review

- [x] No candidates. This feature added documented workflow contracts but did not expose a recurring environment, command, or setup pitfall that every future session must read from `attention.md`.

## 9. Leftovers

- Later optimization points: none.
- Known limitations: automatic subagent dispatch, hooks/breadcrumbs, and research-first routing are intentionally deferred to their own roadmap items.
- While-here observations: none.
