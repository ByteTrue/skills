---
doc_type: issue-report
issue: 2026-06-12-pr2-review-findings
status: done
severity: P1
summary: PR #2 review found four workflow-contract inconsistencies that should be fixed before merge.
tags: [pr-review, yaml, workflow-contract, skills]
---

# PR #2 Review Findings Issue Report

## 1. Problem Symptom

A comprehensive review of PR #2 found four concrete defects in the changed workflow artifacts and skill instructions:

1. `workflow-control-plane-contract-checklist.yaml` contains a duplicate top-level `checks:` key.
2. `bt-onboard` tells agents to write `provider_status: not_configured`, but the config reference only allows `unknown | configured | unavailable`.
3. `bt-explore` still uses the old auxiliary field spelling `superseded-by` instead of canonical `superseded_by`.
4. `bt-arch` backfill instructions require `current: true` in prose, while the architecture reference template does not include that field.

## 2. Reproduction Steps

1. Inspect the PR #2 branch `feat/onboard-template-rollout`.
2. Read the changed files listed in the review findings.
3. Observe the duplicate YAML key and the three wording/schema mismatches.

Reproduction frequency: stable; the findings are static file-content issues.

## 3. Expected vs Actual

**Expected behavior**: PR #2 workflow artifacts and skill instructions should use one consistent schema and canonical field vocabulary, so future agents generate valid ByteTrue artifacts.

**Actual behavior**: Four changed artifacts/instructions contain schema drift or malformed YAML that can mislead future workflow runs.

## 4. Environment Information

- module / feature involved: PR #2 AI workflow absorption / workflow control-plane contract / bt-onboard, bt-explore, bt-arch skills
- related files / functions: `.bytetrue/features/2026-06-12-workflow-control-plane-contract/workflow-control-plane-contract-checklist.yaml`, `skills/bt-onboard/SKILL.md`, `skills/bt-explore/SKILL.md`, `skills/bt-arch/SKILL.md`, `skills/bt-onboard/reference/config.md`, `.bytetrue/reference/config.md`, `skills/bt-arch/reference.md`
- runtime environment: local repository branch `feat/onboard-template-rollout`
- other context: found during local review of GitHub PR #2; no runtime service is involved

## 5. Severity

**P1** — these issues do not break runtime code, but they should block merging PR #2 because they affect canonical workflow contracts and future generated artifacts.

## Notes

The user asked to fix all four findings through the ByteTrue issue workflow. The issue uses the standard path because the combined fix spans multiple skill/reference artifacts, even though each root cause is individually small and static.
