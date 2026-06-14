---
doc_type: issue-fix
issue: 2026-06-12-pr2-review-findings
status: done
path: standard
fix_date: 2026-06-12
related: [pr2-review-findings-analysis.md]
tags: [pr-review, yaml, workflow-contract, skills]
---

# PR #2 Review Findings Fix Record

## 1. Actual Solution Used

Used analysis Option A, the minimal direct contract repair:

1. Removed the duplicate top-level `checks:` key from the workflow-control-plane checklist.
2. Changed `bt-onboard` startup prose from the out-of-contract value `not_configured` to the already-defined `provider_status: unavailable`.
3. Changed `bt-explore` supersede prose from `superseded-by` to canonical `superseded_by`.
4. Changed `bt-arch` backfill prose to require only `status: done` and `last_reviewed`, matching the existing architecture reference template instead of adding a redundant prose-only `current: true` field.

## 2. Changed Files List

- `.bytetrue/features/2026-06-12-workflow-control-plane-contract/workflow-control-plane-contract-checklist.yaml` — removed duplicate `checks:` line.
- `skills/bt-onboard/SKILL.md` — aligned provider status fallback wording with `.bytetrue/config.yaml` contract.
- `skills/bt-explore/SKILL.md` — aligned supersede auxiliary field spelling with shared conventions.
- `skills/bt-arch/SKILL.md` — aligned architecture backfill prose with `skills/bt-arch/reference.md`.
- `.bytetrue/issues/2026-06-12-pr2-review-findings/pr2-review-findings-report.md` — issue report artifact.
- `.bytetrue/issues/2026-06-12-pr2-review-findings/pr2-review-findings-analysis.md` — root-cause analysis artifact.
- `.bytetrue/issues/2026-06-12-pr2-review-findings/pr2-review-findings-fix-note.md` — this closure record.

## 3. Regression Coverage

- **New regression test**: none; this is a static workflow-documentation/schema repair with no runtime code seam.
- **Reused existing test**: `npx skills add . --list` confirms skill frontmatter is still parseable and finds 28 skills.
- **No suitable seam**: no product/runtime behavior exists for these Markdown/YAML artifacts. Verification used targeted YAML/frontmatter validation, top-level duplicate-key smoke checking, grep contract guards, skill listing, and diff whitespace checks.

## 4. Verification Result

Commands run after the fix:

```text
python3 .bytetrue/tools/validate-yaml.py --file .bytetrue/features/2026-06-12-workflow-control-plane-contract/workflow-control-plane-contract-checklist.yaml --yaml-only
python3 .bytetrue/tools/validate-yaml.py --file .bytetrue/issues/2026-06-12-pr2-review-findings/pr2-review-findings-report.md
python3 .bytetrue/tools/validate-yaml.py --file .bytetrue/issues/2026-06-12-pr2-review-findings/pr2-review-findings-analysis.md
python3 top-level duplicate-key smoke check for workflow-control-plane-contract-checklist.yaml
! git grep -n 'not_configured' -- skills .bytetrue/reference .bytetrue/config.yaml
! git grep -n 'superseded-by' -- skills .bytetrue/reference
npx skills add . --list
git diff --check
```

Results:

- targeted YAML/frontmatter validation passed for the checklist, report, and analysis files.
- top-level duplicate-key smoke check passed for the checklist.
- contract grep guards passed: no `not_configured` remains in shipped skills/current references/config, and no `superseded-by` remains in shipped skills/current references.
- `npx skills add . --list` reported `Found 28 skills`.
- `git diff --check` passed.

## 5. Instrumentation Cleanup

- **Temporary instrumentation**: none.
- **Cleanup evidence**: no debug logs or temporary instrumentation were added.
- **Retained logs**: none.

## 6. Mini Post-mortem

This class of issue is best prevented by pairing the existing YAML/frontmatter checks with small static contract guards during PR review: top-level duplicate-key smoke checks for edited YAML and grep guards for deprecated auxiliary field names or enum values in shipped skills/references.

## 7. Follow-up Items

- Optional future hardening: enhance `.bytetrue/tools/validate-yaml.py` to detect duplicate mapping keys when PyYAML is unavailable, or document a duplicate-key smoke check in maintainer notes.
- No while-here code changes were made outside the analysis scope.
