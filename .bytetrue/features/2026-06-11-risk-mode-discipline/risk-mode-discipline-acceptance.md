# risk-mode-discipline Acceptance Report

> Stage: stage 3, acceptance closure
> Acceptance date: 2026-06-11
> Related design doc: .bytetrue/features/2026-06-11-risk-mode-discipline/risk-mode-discipline-design.md

## 1. Interface-contract check

**Check interface examples one by one**:

- [x] `execution_mode` YAML shape exists in `.bytetrue/reference/execution-modes.md` and `skills/bt-onboard/reference/execution-modes.md`.
- [x] Feature design can record mode: `skills/bt-feat-design/reference.md` documents `execution_mode.level`, `triggers`, and `required_evidence`.

**Check "current state → change" in the term layer one by one**:

- [x] `code-dimensions.md` still exists unchanged as code-quality dimensions; execution modes are a separate reference.
- [x] `bt-feat-design` changed from no mode vocabulary to requiring execution mode or standard-mode statement.
- [x] `bt-feat-impl` changed from local TDD trigger list to reading execution modes and treating `strict-evidence` as a TDD trigger.
- [x] `bt-issue-analyze` changed from local enhanced diagnose triggers to mapping them to `strict-evidence` or `break-loop`.
- [x] `bt-issue-fix` changed from log-debugging escalation only to break-loop after repeated failed fixes.
- [x] `bt-feat-ff` and `bt-refactor` now explicitly map light/standard/strict/break-loop boundaries.

**Check the flow diagram**:

- [x] Flow nodes map to real guidance: classify mode → light (`bt-feat-ff` / refactor ff), standard (existing staged flows), strict evidence (`bt-feat-impl`, issue workflows), break-loop (`bt-issue-fix`, `bt-refactor`).

No unresolved drift found.

## 2. Behavior and decision check

**Verify the requirement summary one by one**:

- [x] shared `execution-modes.md` exists under current project and onboard template.
- [x] feature design records execution mode guidance.
- [x] feature implementation reads and obeys the mode.
- [x] issue analyze/fix use strict-evidence and break-loop language.
- [x] fastforward and refactor workflows know when to stay light or route out.

**Check explicit non-goals one by one**:

- [x] No subagent review gates implemented.
- [x] No context manifests implemented.
- [x] No hook/breadcrumb enforcement implemented.
- [x] No global strict TDD requirement introduced.
- [x] `code-dimensions.md` was not renamed or replaced.
- [x] No CLI or runtime state file introduced.

**Landing of key decisions**:

- [x] D1, create `execution-modes.md`: landed in `.bytetrue/reference/` and `skills/bt-onboard/reference/`.
- [x] D2, record mode in feature design section 1: landed in `bt-feat-design` skill and reference.
- [x] D3, map issue strictness to analyze/fix: landed in `bt-issue-analyze` and `bt-issue-fix`.
- [x] D4, keep break-loop as escalation: landed in shared reference, issue fix, and refactor routing.

**Check "current state → change" in the orchestration layer one by one**:

- [x] Feature design now records `execution_mode` when non-standard.
- [x] Implementation reads `.bytetrue/reference/execution-modes.md` and applies `strict-evidence`.
- [x] Issue analysis records strict-evidence or break-loop when enhanced diagnose triggers.
- [x] Issue fix stops on break-loop instead of continuing patches.
- [x] Fastforward remains light-only.
- [x] Refactor maps ff/normal/architecture friction to light/standard/strict/break-loop.

**Check flow-level constraints**:

- [x] Mode selection does not bypass existing human checkpoints.
- [x] `strict-evidence` adds evidence requirements but does not authorize scope expansion.
- [x] `break-loop` stops implementation until plan/architecture is reconsidered.
- [x] Code dimensions remain implementation-quality guidance; execution modes choose workflow heaviness.

**Behavior Delta Materialization**:

| Delta | Evidence | Writeback target | Status |
|---|---|---|---|
| ADDED: ByteTrue workflows can classify execution mode | `.bytetrue/reference/execution-modes.md`, `skills/bt-onboard/reference/execution-modes.md` | `requirements/execution-modes.md`, `ARCHITECTURE.md` | applied |
| MODIFIED: feature workflow records and obeys execution mode | `bt-feat-design`, `bt-feat-impl` guidance | `requirements/execution-modes.md`, `ARCHITECTURE.md` | applied |
| MODIFIED: issue/refactor/ff workflows map to shared mode vocabulary | issue, ff, refactor skill guidance | `requirements/execution-modes.md`, `ARCHITECTURE.md` | applied |

**Reverse-check the mount points, removability**:

- [x] `.bytetrue/reference/execution-modes.md`: current project contract.
- [x] `skills/bt-onboard/reference/execution-modes.md`: onboard template contract.
- [x] `skills/bt-onboard/SKILL.md`: release inventory and managed-file list.
- [x] `skills/bt-onboard/reference/system-overview.md` and `.bytetrue/reference/system-overview.md`: reference index links.
- [x] `skills/bt-feat-design/SKILL.md` and `reference.md`: design-stage mode recording.
- [x] `skills/bt-feat-impl/SKILL.md`: implementation-stage mode reading.
- [x] `skills/bt-issue-analyze/SKILL.md`, `skills/bt-issue-fix/SKILL.md`, `skills/bt-feat-ff/SKILL.md`, `skills/bt-refactor/SKILL.md`: workflow consumers.
- [x] Removal sandbox thought experiment: removing these mount points removes execution mode from all active workflow guidance, while requirement/architecture would become stale but not active guidance.

## 3. Acceptance-scenario check

- [x] S1 Shared contract exists: both current and onboard `execution-modes.md` define all four modes.
  - evidence source: grep/manual review
  - result: passed

- [x] S2 Feature design records mode: `bt-feat-design` skill/reference require execution mode or standard statement.
  - evidence source: grep/manual review
  - result: passed

- [x] S3 Feature implementation obeys mode: `bt-feat-impl` reads execution modes and treats strict-evidence as a TDD trigger.
  - evidence source: grep/manual review
  - result: passed

- [x] S4 Issue workflow uses mode: issue analyze/fix map complex diagnose and repeated fixes to strict-evidence/break-loop.
  - evidence source: grep/manual review
  - result: passed

- [x] S5 Light routes stay light but bounded: fastforward is light-only, refactor maps ff/standard/strict/break-loop boundaries.
  - evidence source: grep/manual review
  - result: passed

- [x] S6 No unrelated infrastructure: context manifest, subagent handoff, hook/breadcrumb, worklog, CLI/runtime state appear only in design/checklist/requirement non-goals or unrelated existing wording.
  - evidence source: grep/manual review
  - result: passed

- [x] S7 Line budget: all edited markdown files remain under 300 lines.
  - evidence source: `wc -l`
  - result: passed

No frontend changes; browser verification is not applicable.

## 4. Terminology consistency

- `Execution Mode`: consistently means workflow heaviness selection, not code-quality dimensions.
- `light`: consistently maps to small/light flows and credible lightweight verification.
- `standard`: consistently maps to existing staged ByteTrue workflows.
- `strict-evidence`: consistently maps to fresh evidence, root-cause-first / red-first where testable.
- `break-loop`: consistently maps to stopping normal implementation and reconsidering plan/architecture.

Anti-conflict checks:

- `code-dimensions.md` remains separate.
- No guidance requires strict TDD for every task.
- No CLI/runtime state file was introduced.

Terminology is consistent.

## 5. Architecture merge

- [x] `.bytetrue/architecture/ARCHITECTURE.md`: added a key architecture decision stating that ByteTrue uses execution modes to decide workflow heaviness; `light` still needs credible verification, `strict-evidence` is trigger-based rather than global default, and `break-loop` stops implementation and routes back to planning or architecture discussion.

This satisfies design section 4: a reader who opens architecture can now see the execution-mode selector as part of ByteTrue workflow architecture.

## 6. Requirement write-back

Design frontmatter had an empty `requirement`, but this feature added a user-perceivable ByteTrue workflow capability. Requirement backfill was therefore needed.

- [x] Created `.bytetrue/requirements/execution-modes.md` as `status: current`.
- [x] Updated `.bytetrue/requirements/VISION.md` under Current.
- [x] Requirement stays at capability-vision level and does not describe implementation details.

## 7. Roadmap write-back

Design frontmatter:

```yaml
roadmap: ai-workflow-absorption
roadmap_item: risk-mode-discipline
```

Write-back actions:

- [x] `.bytetrue/roadmap/ai-workflow-absorption/ai-workflow-absorption-items.yaml`: `risk-mode-discipline.status` changed from `in-progress` to `done`; `feature` remains `2026-06-11-risk-mode-discipline`.
- [x] `.bytetrue/roadmap/ai-workflow-absorption/ai-workflow-absorption-roadmap.md`: section 5 sub-feature list synchronized to `status: done` and `corresponding feature: 2026-06-11-risk-mode-discipline`.
- [x] `validate-yaml.py` passed for roadmap items.

## 8. attention.md candidate review

No attention.md candidate from this implementation.

This feature adds workflow concepts that belong in `execution-modes.md`, architecture, and requirements, but it does not expose a one-line startup pitfall or local environment constraint that every future session must read in `attention.md`.

## 9. Leftovers

- Later optimization point: if future features make `bt-feat-design/SKILL.md` or `bt-feat-design/reference.md` approach 300 lines, split detailed examples into a separate reference file rather than continuing to append.
- Known limitation: execution mode is currently documented/enforced by skill text, not by hook/breadcrumb runtime enforcement; that is intentionally deferred to later roadmap items.
- While-here observations: none outside the approved plan.
