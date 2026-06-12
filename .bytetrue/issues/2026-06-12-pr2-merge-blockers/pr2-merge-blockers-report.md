---
doc_type: issue-report
issue: 2026-06-12-pr2-merge-blockers
status: done
severity: P1
summary: PR #2 follow-up review found auto/config, eval, context-manifest, roadmap-traceability, and CLI-cache issues before merge.
tags: [pr-review, workflow-contract, auto-mode, evals, context-manifest]
---

# PR #2 Merge Blockers Issue Report

## 1. Problem Symptom

A follow-up PR review found five workflow-contract problems:

1. `workflow.mode: auto` and `tracker.sync_policy: auto_preview` were exposed in config/reference files but not consumed by workflow skills.
2. The first live eval prompt tried to start the next `ai-workflow-absorption` roadmap-backed feature even though the roadmap has no pending item left.
3. Downstream context-manifest consumers treated manifests as "when present" instead of blocking missing manifests for new standard features.
4. `workflow-control-plane-contract` was a large feature inside the PR but was not traceable through the AI workflow absorption roadmap/eval notes.
5. `.bytetrue/config.yaml` committed local CLI/auth detection values that could mislead other clones.

## 2. Reproduction Steps

1. Inspect `.bytetrue/reference/config.md`, `skills/*`, `bt-tracker`, and shared close-out rules.
2. Inspect `evals/evals.json` against `.bytetrue/roadmap/ai-workflow-absorption/ai-workflow-absorption-items.yaml`.
3. Inspect `skills/bt-feat-impl/SKILL.md` and `skills/bt-feat-accept/SKILL.md` startup gates.
4. Inspect `workflow-control-plane-contract` feature frontmatter and roadmap item list.
5. Inspect `.bytetrue/config.yaml` tracker CLI cache fields.

Reproduction frequency: stable static artifact review.

## 3. Expected vs Actual

**Expected behavior**: Config fields should have deterministic pure-skill semantics, eval prompts should match current fixtures, new standard context manifests should be mandatory downstream, large PR remediation should be roadmap-traceable, and committed config should not present one machine's CLI/auth state as project fact.

**Actual behavior**: The review found passive config fields, a stale eval prompt, optional downstream manifest wording, orphan control-plane traceability, and local CLI/auth values in committed config.

## 4. Environment Information

- module / feature involved: PR #2 AI workflow absorption / workflow control plane / feature issue and tracker workflows
- related files / functions: `.bytetrue/reference/config.md`, `skills/bt-*`, `skills/bt-tracker/SKILL.md`, `.bytetrue/reference/context-manifest.md`, `evals/evals.json`, `.bytetrue/roadmap/ai-workflow-absorption/`, `.bytetrue/config.yaml`
- runtime environment: local repository branch under review
- other context: user explicitly chose the complete fix for auto mode rather than marking it reserved

## 5. Severity

**P1** — auto-mode mismatch can mislead future agents into unsafe freestyle continuation; the remaining P2/P3 findings should be fixed before merge for traceability and repeatable evals.

## Notes

The user instructed: "修复这里所有问题，第一个直接完整实现 auto 模式".
