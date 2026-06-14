---
doc_type: issue-fix
issue: 2026-06-12-pr2-merge-blockers
status: done
path: standard
fix_date: 2026-06-12
related: [pr2-merge-blockers-analysis.md]
tags: [pr-review, workflow-contract, auto-mode, evals, context-manifest]
---

# PR #2 Merge Blockers Fix Record

## 1. Actual Solution Used

Used analysis Option A, complete auto-mode integration plus static contract repair:

1. Implemented pure-skills `workflow.mode: auto` semantics in config references, shared close-out rules, `bt`, feature/issue/refactor stage close-outs, and `bt-tracker`.
2. Implemented `tracker.sync_policy: auto_preview` as automatic preview only; external issue writes and external metadata writeback are governed by current `workflow.ask_before` plus `bt-tracker` confirmation rules, not by a hardcoded Markdown-owned boundary list.
3. Strengthened context-manifest startup gates so new standard features missing impl/check manifests return to design unless legacy, fastforward, or explicitly exempt.
4. Replaced the stale eval prompt with a completed-roadmap guard and clarified benchmark/review docs as historical static artifact review.
5. Added `workflow-control-plane-contract` to the `ai-workflow-absorption` roadmap/items/contracts and linked the accepted feature back to that roadmap.
6. Neutralized committed CLI/auth values in `.bytetrue/config.yaml` and documented CLI/auth fields as advisory cache that `bt-tracker` must revalidate at runtime.

## 2. Changed Files List

- Workflow skills: `skills/bt/SKILL.md`, `skills/bt-feat/SKILL.md`, `skills/bt-feat-design/SKILL.md`, `skills/bt-feat-impl/SKILL.md`, `skills/bt-feat-accept/SKILL.md`, `skills/bt-issue-report/SKILL.md`, `skills/bt-issue-analyze/SKILL.md`, `skills/bt-issue-fix/SKILL.md`, `skills/bt-roadmap/SKILL.md`, `skills/bt-refactor/SKILL.md`, `skills/bt-tracker/SKILL.md`, `skills/bt-onboard/SKILL.md`.
- Current/onboard references: `.bytetrue/reference/config.md`, `.bytetrue/reference/shared-conventions.md`, `.bytetrue/reference/context-manifest.md`, `.bytetrue/reference/project-management.md`, and matching `skills/bt-onboard/reference/*` template copies where applicable.
- Current project config and architecture/requirement: `.bytetrue/config.yaml`, `.bytetrue/architecture/ARCHITECTURE.md`, `.bytetrue/requirements/workflow-control-plane-contract.md`.
- Control-plane feature traceability: `.bytetrue/features/2026-06-12-workflow-control-plane-contract/*` design/checklist/acceptance/context manifests.
- AI workflow absorption roadmap: `.bytetrue/roadmap/ai-workflow-absorption/ai-workflow-absorption-roadmap.md`, `ai-workflow-absorption-items.yaml`, `ai-workflow-absorption-contracts.md`.
- Eval docs: `evals/evals.json`, `evals/ai-workflow-absorption/benchmark.md`, `evals/ai-workflow-absorption/review.md`.
- Issue artifacts: this issue report, analysis, and fix note.

## 3. Regression Coverage

- **New regression test**: no runtime test seam; this is a static workflow-contract repair.
- **Static regression guards**:
  - config and roadmap YAML validation;
  - issue artifact frontmatter validation;
  - eval JSON parse;
  - context JSONL parse;
  - skill frontmatter discovery through `npx skills add . --list`;
  - Python script syntax check;
  - `git diff --check`.

## 4. Verification Result

Commands run after the fix:

```text
python3 .bytetrue/tools/validate-yaml.py --file .bytetrue/issues/2026-06-12-pr2-merge-blockers/pr2-merge-blockers-report.md
python3 .bytetrue/tools/validate-yaml.py --file .bytetrue/issues/2026-06-12-pr2-merge-blockers/pr2-merge-blockers-analysis.md
python3 .bytetrue/tools/validate-yaml.py --file .bytetrue/features/2026-06-12-workflow-control-plane-contract/workflow-control-plane-contract-checklist.yaml --yaml-only
python3 .bytetrue/tools/validate-yaml.py --file .bytetrue/roadmap/ai-workflow-absorption/ai-workflow-absorption-items.yaml --yaml-only
python3 .bytetrue/tools/validate-yaml.py --file .bytetrue/config.yaml --yaml-only
python3 -m json.tool evals/evals.json
python3 JSONL smoke check for workflow-control-plane context manifests
npx skills add . --list
python3 -m py_compile scripts/*.py .bytetrue/tools/*.py skills/bt-onboard/tools/*.py
git diff --check
```

Results:

- YAML/frontmatter validation passed for the new issue artifacts, control-plane checklist, roadmap items, and current config.
- `evals/evals.json` parsed as JSON.
- Control-plane `*-context.jsonl` files parsed and every row had `file` and `reason`.
- `npx skills add . --list` reported `Found 28 skills` and listed updated skills including `bt-feat-accept` and `bt-tracker`.
- Python syntax compile passed for repository scripts and onboard tools.
- `git diff --check` passed.

## 5. Instrumentation Cleanup

- **Temporary instrumentation**: none.
- **Cleanup evidence**: no debug logs, temporary runtime hooks, or generated preview files were added.
- **Retained logs**: none.

## 6. Mini Post-mortem

When adding config fields to a pure-skills workflow, the field definition is not enough. The same PR must update the consuming stage close-outs, tracker semantics, fixture/eval prompts, and downstream startup blockers; otherwise future agents will invent semantics locally.

## 7. Follow-up Items

- If PR body updates are still desired, ask explicitly before running `gh pr edit`; external tracker/PR writes remain outside the autonomous fix scope.
- Future live evals for feature-design should use a dedicated fixture with a pending roadmap item rather than the completed current project roadmap.
