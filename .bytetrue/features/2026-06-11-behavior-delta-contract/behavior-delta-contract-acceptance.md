---
doc_type: feature-acceptance
feature: 2026-06-11-behavior-delta-contract
status: done
summary: Accepted Behavior Delta contract across feature design, checklist extraction, and acceptance materialization.
---

# behavior-delta-contract Acceptance Report

> Stage: stage 3, acceptance closure
> Acceptance date: 2026-06-11
> Related design doc: .bytetrue/features/2026-06-11-behavior-delta-contract/behavior-delta-contract-design.md

## 1. Interface-contract check

**Check interface examples one by one**:

- [x] Example `### 3.2 Behavior Delta`: design expected future feature designs to show ADDED / MODIFIED / REMOVED / RENAMED behavior changes. Actual guidance exists in `skills/bt-feat-design/reference.md:37` and `skills/bt-feat-design/reference.md:220`.
- [x] Example checklist row with `source: behavior-delta`: actual checklist source union includes `behavior-delta` in `skills/bt-feat-design/reference.md:53`, and extraction guidance exists in `skills/bt-feat-design/reference.md:74`.

**Check "current state → change" in the term layer one by one**:

- [x] `skills/bt-feat-design/reference.md`: changed from no Behavior Delta anchor/source to explicit `3.2 Behavior Delta` and `behavior-delta` checklist source.
- [x] `skills/bt-feat-design/SKILL.md`: changed from generic section 3 reminder to requiring Behavior Delta for observable behavior changes or `Behavior Delta: none` for implementation-only changes.
- [x] `skills/bt-feat-accept/SKILL.md`: changed from no delta materialization to section 2 Behavior Delta Materialization checks.
- [x] `.bytetrue/reference/shared-conventions.md` and `skills/bt-onboard/reference/shared-conventions.md`: changed checklist extraction vocabulary to include section 3.2 Behavior Delta.

**Check the flow diagram**:

- [x] Design flow nodes map to real artifacts: design guidance (`bt-feat-design`), checklist source (`behavior-delta`), implementation checklist unchanged, acceptance section 2 (`Behavior Delta Materialization`), and writeback to existing ByteTrue layers.

No unresolved drift found.

## 2. Behavior and decision check

**Verify the requirement summary one by one**:

- [x] `bt-feat-design` tells designers where and how to write Behavior Delta: `skills/bt-feat-design/reference.md:37`, `skills/bt-feat-design/reference.md:220`, `skills/bt-feat-design/SKILL.md:207`.
- [x] `bt-feat-accept` verifies Behavior Delta and records materialization: `skills/bt-feat-accept/SKILL.md:110-112`, `skills/bt-feat-accept/SKILL.md:210`, `skills/bt-feat-accept/SKILL.md:216`.
- [x] checklist extraction can track behavior-delta checks: `skills/bt-feat-design/reference.md:53`, `.bytetrue/reference/shared-conventions.md:119`, `skills/bt-onboard/reference/shared-conventions.md:119`.
- [x] current project shared conventions and onboard templates are in sync: both copies mention section 3.2 Behavior Delta as `behavior-delta` checks.

**Check explicit non-goals one by one**:

- [x] No `.bytetrue/specs/` source-of-truth is created or targeted; occurrences in changed feature guidance are negative guardrails or architecture/requirement text stating that it must not exist.
- [x] No standalone `{slug}-delta.md` is introduced; occurrences are negative guardrails in design/checklist only.
- [x] No top-level feature design section renumbering: Behavior Delta is `3.2`, acceptance materialization stays inside section 2.
- [x] Risk modes, context manifest, subagent handoff, breadcrumb, and worklog remain out of scope; occurrences are only in the design/checklist scope guards.
- [x] Design-stage guidance does not instruct writing behavior deltas directly to requirements or architecture; materialization is an acceptance responsibility.

**Landing of key decisions**:

- [x] D1, place Behavior Delta inside design section 3: landed as `### 3.2 Behavior Delta` in `skills/bt-feat-design/reference.md`.
- [x] D2, place Delta Materialization inside acceptance section 2: landed under section 2 of `skills/bt-feat-accept/SKILL.md` without adding a tenth report section.
- [x] D3, add `behavior-delta` as checklist source: landed in feature-design reference and shared conventions.
- [x] D4, sync current project and onboard templates: `.bytetrue/reference/shared-conventions.md` and `skills/bt-onboard/reference/shared-conventions.md` both updated.

**Check "current state → change" in the orchestration layer one by one**:

- [x] Design now writes Behavior Delta in section 3.
- [x] Checklist extraction includes behavior-delta.
- [x] Implementation remains responsible only for implementation and step status.
- [x] Acceptance verifies deltas in section 2 and records materialization.
- [x] Acceptance can write stable outcomes back to existing layers or keep a delta acceptance-only.

**Check flow-level constraints**:

- [x] No new top-level source-of-truth directory introduced.
- [x] Acceptance is the only stage that can mark a delta materialized.
- [x] If design says `Behavior Delta: none`, acceptance must still check no behavior drift.
- [x] If acceptance finds a missing delta, it must fix code or backfill design before final report.

**Behavior Delta Materialization**:

| Delta | Evidence | Writeback target | Status |
|---|---|---|---|
| ADDED: feature design can declare Behavior Delta | `skills/bt-feat-design/reference.md:37`, `:220`, `skills/bt-feat-design/SKILL.md:207` | `requirements/behavior-delta-contract.md`, `architecture/ARCHITECTURE.md` | applied |
| ADDED: acceptance materializes deltas | `skills/bt-feat-accept/SKILL.md:110-112`, `:210`, `:216` | `requirements/behavior-delta-contract.md`, `architecture/ARCHITECTURE.md` | applied |
| ADDED: checklist source `behavior-delta` | `skills/bt-feat-design/reference.md:53`, `.bytetrue/reference/shared-conventions.md:119`, `skills/bt-onboard/reference/shared-conventions.md:119` | `requirements/behavior-delta-contract.md` | applied |

**Reverse-check the mount points, removability**:

- [x] `skills/bt-feat-design/reference.md`: contains the design template and source vocabulary mount point.
- [x] `skills/bt-feat-design/SKILL.md`: contains design workflow and exit-condition mount point.
- [x] `skills/bt-feat-accept/SKILL.md`: contains acceptance materialization mount point.
- [x] `.bytetrue/reference/shared-conventions.md`: current project checklist extraction vocabulary updated.
- [x] `skills/bt-onboard/reference/shared-conventions.md`: onboard template checklist extraction vocabulary updated.
- [x] Reverse grep check: `Behavior Delta`, `behavior-delta`, and `Behavior Delta Materialization` appear only in the intended skill/reference files, this feature's own design/checklist, architecture, and requirement writeback.
- [x] Removal sandbox thought experiment: reversing these five mount-point edits removes the active workflow behavior; removing architecture/requirement writeback only removes durable documentation, not the runtime guidance.

## 3. Acceptance-scenario check

- [x] S1, design template: opening `skills/bt-feat-design/reference.md` shows `### 3.2 Behavior Delta`, ADDED / MODIFIED / REMOVED / RENAMED wording, and explicit `Behavior Delta: none` guidance.
  - evidence source: grep/manual review
  - result: passed

- [x] S2, design workflow: reading `skills/bt-feat-design/SKILL.md` shows section 3 must include Behavior Delta or explicit no-behavior-change statement.
  - evidence source: grep/manual review
  - result: passed

- [x] S3, checklist extraction: both shared-conventions copies include section 3.2 Behavior Delta → `behavior-delta` checks.
  - evidence source: grep/manual review
  - result: passed

- [x] S4, acceptance template: `skills/bt-feat-accept/SKILL.md` section 2 includes Behavior Delta Materialization with evidence, writeback target, and status.
  - evidence source: grep/manual review
  - result: passed

- [x] S5, no source-of-truth drift: no instruction creates or targets `.bytetrue/specs`; positive occurrences are limited to stating that such a layer is not maintained.
  - evidence source: grep/manual review
  - result: passed

- [x] S6, line budget: all edited markdown files remain under 300 lines.
  - evidence source: `wc -l`
  - result: passed

No frontend changes; browser verification is not applicable.

## 4. Terminology consistency

- `Behavior Delta`: all relevant hits refer to the feature-design behavior delta block or durable architecture/requirement documentation.
- `Delta Materialization`: all relevant hits refer to acceptance evidence plus writeback target/status.
- `behavior-delta`: all relevant hits refer to checklist source vocabulary or this feature's own docs.
- Anti-conflict check: `.bytetrue/specs` and `{slug}-delta.md` only appear as negative guardrails or durable statements that ByteTrue does not add those layers.

Terminology is consistent.

## 5. Architecture merge

- [x] `.bytetrue/architecture/ARCHITECTURE.md`: added a key architecture decision stating that feature design may declare Behavior Delta, acceptance materializes deltas into existing requirements / architecture / compound layers or marks them acceptance-only, and ByteTrue does not maintain a separate `.bytetrue/specs/` behavior layer.

This satisfies design section 4: a reader who opens architecture can now see the new workflow shape without reading the feature design.

## 6. Requirement write-back

Design frontmatter had an empty `requirement`, but this feature added a user-perceivable ByteTrue workflow capability. Requirement backfill was therefore needed.

- [x] Created `.bytetrue/requirements/behavior-delta-contract.md` as `status: done` with `current: true`.
- [x] Updated `.bytetrue/requirements/VISION.md` under Current.
- [x] Requirement stays at capability-vision level and does not describe implementation details.

## 7. Roadmap write-back

Design frontmatter:

```yaml
roadmap: ai-workflow-absorption
roadmap_item: behavior-delta-contract
```

Write-back actions:

- [x] `.bytetrue/roadmap/ai-workflow-absorption/ai-workflow-absorption-items.yaml`: `behavior-delta-contract.status` changed from `active` to `done`; `feature` remains `2026-06-11-behavior-delta-contract`.
- [x] `.bytetrue/roadmap/ai-workflow-absorption/ai-workflow-absorption-roadmap.md`: section 5 sub-feature list synchronized to `status: done` and `corresponding feature: 2026-06-11-behavior-delta-contract`.
- [x] `validate-yaml.py` passed for roadmap items.

## 8. attention.md candidate review

No attention.md candidate from this implementation.

The feature exposed no new build command, local service requirement, credential convention, or environment pitfall that every future ByteTrue skill run must know at startup.

## 9. Leftovers

- Later optimization point: as more behavior-delta examples accumulate, consider adding a compact example to `bt-feat-design/reference.md`; not done now because the file is close to the 300-line cap.
- Known limitation: no automated markdown semantic test exists for Behavior Delta shape; current verification is grep/manual review.
- While-here observations: none outside the approved plan.
