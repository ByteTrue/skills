---
doc_type: feature-acceptance
feature: 2026-06-11-context-manifest-contract
status: done
summary: Accepted feature-local implement/check context manifest contract.
---

# Context Manifest Contract Acceptance Report

> Stage: stage 3, acceptance closure
> Acceptance date: 2026-06-11
> Related design doc: `.bytetrue/features/2026-06-11-context-manifest-contract/context-manifest-contract-design.md`

## 1. Interface-contract check

**Interface examples**

- [x] Current and onboard `context-manifest.md`: both define `{slug}-impl-context.jsonl`, `{slug}-check-context.jsonl`, row fields `file`, `reason`, optional `required`, `section`, `role`, and static JSONL validation.
- [x] Current feature manifests: both `context-manifest-contract-impl-context.jsonl` and `context-manifest-contract-check-context.jsonl` parse as JSONL; every required row has `file` and `reason`, and every required file exists.

**Current state → change**

- [x] `bt-feat-design` changed from producing only design/checklist to producing design/checklist plus impl/check manifests for standard approved designs.
- [x] `bt-feat-impl` changed from inferring context only from skill rules to reading `impl-context` when present.
- [x] `bt-feat-accept` changed from inferring context only from skill rules to reading `check-context` when present.

**Flow diagram landing**

- [x] Approved design → checklist → impl/check manifests → implementation/acceptance startup landed in `bt-feat-design`, `bt-feat-impl`, and `bt-feat-accept` guidance.

## 2. Behavior and decision check

**Requirement summary**

- [x] Shared contract exists in current project and onboard template.
- [x] Design generation now creates two manifest files for standard approved designs.
- [x] Implementation reads `impl-context` and blocks missing required files.
- [x] Acceptance reads `check-context` and blocks missing required files.
- [x] Onboard releases and indexes the new reference file.

**Explicit non-goals**

- [x] No subagent dispatch or subagent prompt protocol was added.
- [x] No workflow-state breadcrumb or hook was added.
- [x] No research-first routing was added.
- [x] No context resolver script, CLI, worklog, or runtime state was added.
- [x] Raw code files are not default manifest rows.
- [x] Manifests contain paths/reasons only, not copied document bodies.

**Landing of key decisions**

- [x] Two files, not one: `impl-context` and `check-context` are separately defined and dogfooded by this feature.
- [x] JSONL, not YAML checklist extension: manifests are separate JSONL read-set files; checklist stays action/status.
- [x] Full contract lives in `context-manifest.md`; near-limit skill files only point to it.
- [x] Legacy features without manifests remain readable; rules apply to new standard approved designs.

**Behavior Delta Materialization**

| Delta | Evidence | Writeback target | Status |
|---|---|---|---|
| ADDED: feature design produces explicit implement/check context manifests | `bt-feat-design` guidance, current feature `*-context.jsonl` files | architecture + requirement + reference | applied |
| MODIFIED: implementation/acceptance read feature-local context manifests | `bt-feat-impl`, `bt-feat-accept` startup rules | architecture + acceptance report | applied |

**Mount points and removability**

- [x] `.bytetrue/reference/context-manifest.md`: current shared contract.
- [x] `skills/bt-onboard/reference/context-manifest.md`: onboard template copy.
- [x] `bt-feat-design` SKILL/reference: manifest generation guidance.
- [x] `bt-feat-impl`: `impl-context` startup read and required-row blocker.
- [x] `bt-feat-accept`: `check-context` startup read and required-row blocker.
- [x] `bt-onboard` plus current/onboard system overview: reference file indexed.
- [x] Reverse grep found no active mount outside the planned list.
- [x] Removal sandbox: removing the listed mount points removes the feature's active behavior; remaining mentions are historical design/checklist/roadmap text.

## 3. Acceptance-scenario check

- [x] **S1 shared contract exists**: current and onboard `context-manifest.md` define names, row shape, required semantics, and validation rules.
- [x] **S2 design produces manifests**: `bt-feat-design` requires both manifests after checklist generation; this feature includes both JSONL files.
- [x] **S3 implementation reads manifest**: `bt-feat-impl` reads `impl-context` and blocks missing required rows.
- [x] **S4 acceptance reads manifest**: `bt-feat-accept` reads `check-context` and blocks missing required rows.
- [x] **S5 onboard releases reference**: `bt-onboard` inventory and system overview include `context-manifest.md`.
- [x] **S6 no future features early**: subagent, hook, research-first, worklog, and CLI behavior remain out of scope.
- [x] **S7 validity**: YAML validation and JSONL smoke parse passed; edited markdown files stay under 300 lines.

No frontend changes; browser verification is not applicable.

## 4. Terminology consistency

- `Context Manifest`: consistently means feature-local JSONL read-set, not source of truth.
- `Implementation Context Manifest`: consistently uses `{slug}-impl-context.jsonl` and is consumed by `bt-feat-impl`.
- `Check Context Manifest`: consistently uses `{slug}-check-context.jsonl` and is consumed by `bt-feat-accept` / future check roles.
- `Manifest Row`: consistently means one JSON object with `file` and `reason`.
- Anti-conflict checks passed: no wording treats manifests as copied document bodies, a CLI, or a subagent prompt protocol.

## 5. Architecture merge

- [x] `.bytetrue/architecture/ARCHITECTURE.md`: added that standard approved feature designs produce feature-local Context Manifest files for implementation and acceptance, and that manifests are handoff read-sets rather than a new facts layer.

A reader of architecture now sees behavior delta, execution modes, implementation review, and context manifests as current ByteTrue workflow architecture facts.

## 6. Requirement write-back

- [x] `.bytetrue/requirements/context-manifest-contract.md`: upgraded from `draft` to `current` and set `implemented_by: [2026-06-11-context-manifest-contract]`.
- [x] `.bytetrue/requirements/VISION.md`: moved `context-manifest-contract` from Draft to Current.

## 7. Roadmap write-back

- [x] `.bytetrue/roadmap/ai-workflow-absorption/ai-workflow-absorption-items.yaml`: `context-manifest-contract.status` changed from `active` to `done`; `feature` remains `2026-06-11-context-manifest-contract`.
- [x] `.bytetrue/roadmap/ai-workflow-absorption/ai-workflow-absorption-roadmap.md`: sub-feature list synchronized to `status: done` and corresponding feature path.
- [x] YAML validation passed for roadmap items.

## 8. attention.md candidate review

- [x] No candidates. This feature added documented workflow contracts but did not expose an environment, command, or setup pitfall that every future session must read from `attention.md`.

## 9. Leftovers

- Later optimization points: none.
- Known limitations: subagent prompt protocol is intentionally deferred to `subagent-handoff-roles`; hooks/runtime adapters are intentionally deferred outside the core roadmap; research routing is intentionally deferred to `research-first-explore-integration`.
- While-here observations: none.
