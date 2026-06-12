---
doc_type: issue-analysis
issue: 2026-06-12-pr2-merge-blockers
status: done
root_cause_type: data-format
related: [pr2-merge-blockers-report.md]
tags: [pr-review, workflow-contract, auto-mode, evals, context-manifest]
---

# PR #2 Merge Blockers Root-Cause Analysis

## 1. Problem Location

| Key Location | Description |
|---|---|
| `.bytetrue/reference/config.md`, `skills/bt-onboard/reference/config.md`, workflow close-out skills | `workflow.mode: auto` and `tracker.sync_policy: auto_preview` existed as config values but stage close-out rules did not consume them. |
| `skills/bt-tracker/SKILL.md` | Tracker always described preview-and-confirm but did not define auto-preview or runtime revalidation of CLI/auth cache. |
| `evals/evals.json` | Eval 1 expected a pending roadmap-backed feature even though the current roadmap item list is terminal. |
| `skills/bt-feat-impl/SKILL.md`, `skills/bt-feat-accept/SKILL.md`, context-manifest references | Downstream stages only read manifests when present, so missing manifests could slip through. |
| `.bytetrue/features/2026-06-12-workflow-control-plane-contract/*`, `.bytetrue/roadmap/ai-workflow-absorption/*` | The control-plane feature was accepted as non-roadmap even though it closes a review gap in the AI workflow absorption PR. |
| `.bytetrue/config.yaml` | Committed CLI/auth cache contained local machine values (`gh` installed/auth ok, `glab` absent). |

## 2. Failure-Path Reconstruction

**Normal path**: Exposed config fields should have one shared interpretation, workflow stages should consume them at close-out, downstream manifest consumers should block missing required handoff artifacts, evals should run against valid fixtures or guard completed state, and roadmap/feature traceability should explain why each large feature belongs in the PR.

**Failure path**: The control-plane pass centralized fields and documentation but left several downstream readers passive. Review then found that future agents could infer their own auto semantics, live eval could route into a completed roadmap, context manifests could be skipped if design forgot them, control-plane work looked orphaned, and local CLI state looked project-owned.

**Split point**: the PR changed config/reference contracts faster than every consumer and traceability artifact was updated.

## 3. Root Cause

**Root-cause type**: data-format / workflow-contract drift.

**Root-cause description**: The workflow control plane added canonical fields and status vocabulary, but the initial implementation treated some fields as boundary documentation rather than executable pure-skill rules. The same drift appeared in fixture/eval state, manifest startup gates, roadmap traceability, and config cache semantics.

**Are there multiple root causes?**: yes, one common contract-drift class with five local manifestations.

**Complex bug diagnosis record**: not triggered. This is a stable static-artifact issue; root causes are visible by reading the affected files.

- **feedback loop**: static grep, YAML/JSON validation, `npx skills add . --list`, and diff checks.
- **ranked hypotheses**: not needed; review findings directly identify the affected artifacts.
- **instrumentation / measurement**: none.
- **regression seam**: no runtime seam; use contract greps and static validators.

## 4. Impact Surface

- **impact scope**: ByteTrue workflow skills, shared references, roadmap/eval artifacts, and current project config.
- **potential victim modules**: feature workflow, issue workflow, refactor workflow, tracker bridge, onboard templates, eval runner inputs.
- **data-integrity risk**: no product data risk; workflow traceability and future agent behavior risk.
- **severity re-evaluation**: keep P1 because unsafe or inconsistent auto semantics should block merge.

## 5. Repair Options

### Option A: Complete auto-mode integration plus static contract repair

- **what it does**: define auto/auto-preview in config/shared conventions, consume them in workflow close-outs and tracker, strengthen manifest blockers, fix eval prompt, connect control-plane to the roadmap, and neutralize CLI/auth cache.
- **advantages**: satisfies the user's explicit preference, preserves the config surface, and prevents freestyle agent behavior.
- **disadvantages / risks**: touches many skill/reference files, so validation must cover frontmatter parsing and YAML/JSON.
- **impact surface**: workflow docs and ByteTrue artifacts only; no runtime code.

### Option B: Mark auto and auto-preview reserved

- **what it does**: remove or reserve the fields instead of consuming them.
- **advantages**: smaller surface.
- **disadvantages / risks**: contradicts the user's instruction to fully implement auto mode.
- **impact surface**: config/reference docs only, but leaves less capability.

### Recommended Option

**Recommend option A**, because the user explicitly chose complete auto-mode implementation and the remaining findings are contract/traceability repairs around that choice.
