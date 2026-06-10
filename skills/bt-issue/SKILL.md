---
name: bt-issue
description: Sub-workflow entry for fixing bugs. Move from "problem discovered" to a verified fix loop, leaving behind `report`, `analysis`, and `fix-note` documents. Trigger when the user says "fix a bug", "there is a problem", or "fix XX". This skill only routes. It decides between `report` / `analyze` / `fix` based on existing artifacts. Simple issues use the fast path.
---

# bt-issue

## Read Before Starting

Before making any judgment or taking any action, read `.bytetrue/attention.md` first; if it is missing, treat the skeleton as incomplete, tell the user to fill it in or run `bt-onboard`, and do not fall back to an external AI entry file.

The instinctive way to fix a bug is "find the wrong place and patch it", but that instinct keeps recreating the same problems:

1. The issue description exists only in someone's head and gets forgotten after the fix — when the bug reappears three months later, there is no reproduction trail
2. Code changes happen before root-cause analysis — the surface symptom changes, but the deeper problem survives until next time
3. The fix scope expands — one bug leads to five side changes, introducing new problems and making traceability impossible
4. There is no verification loop — how do you know it is fixed, and what exactly was fixed? Nothing is recorded

The issue workflow inserts a buffer between "seeing the problem" and "editing code":

```
problem discovered → clear report → root-cause analysis → pinpoint fix + verification
```

This skill writes nothing. It only checks which step the current issue has reached and decides which sub-skill to trigger.

---

## Where the Files Go

```
.bytetrue/issues/{YYYY-MM-DD}-{slug}/
├── {slug}-report.md           ← stage 1 issue report
├── {slug}-analysis.md         ← stage 2 root-cause analysis
└── {slug}-fix-note.md         ← stage 3 fix record (mandatory artifact)
```

The date is fixed to the **day the problem was discovered or reported** and never changes. The slug should make the problem obvious at a glance, such as `auth-token-leak` or `null-pointer-on-empty-list`.

`{slug}-fix-note.md` is a **mandatory artifact** for stage 3, no matter whether the fix is simple or complex. It is not ceremony; it is traceability evidence. Without it, next time a similar issue appears you can only reconstruct it from `git log`.

All issue documents carry YAML frontmatter with `doc_type` values `issue-report`, `issue-analysis`, and `issue-fix` so that `search-yaml.py` can search them by `severity`, `tags`, and `status`. The finished state across all three issue stages is uniformly `status: confirmed`; `draft` only means that this stage has not completed review or verification yet.

---

## Two Paths

### Standard Path (complex issue or unclear root cause)

| Stage | Sub-skill | Lead | Output |
|---|---|---|---|
| 1 Issue report | `bt-issue-report` | User describes, AI guides | `{slug}-report.md` |
| 2 Root-cause analysis | `bt-issue-analyze` | AI reads code and analyzes, user confirms | `{slug}-analysis.md` |
| 3 Fix + verification | `bt-issue-fix` | AI applies a pinpoint fix from the analysis, user verifies | code + `{slug}-fix-note.md` + scoped commit |

There is a human checkpoint between stages. The user explicitly signs off at the end of each stage so the AI does not run from the problem statement straight to code and only discover the drift afterward.

### Fast Path (simple issue with an obvious root cause)

Use this only when **all** of the following are true:

1. After reading the code, the AI has high confidence in the root cause and can point to an exact `file:line` plus reason
2. The fix is very small, 1-2 changes
3. There is no cross-module impact risk

The flow compresses into: AI reads code → directly tells the user the root cause and fix plan → user confirms → AI fixes → user verifies success → AI writes `{slug}-fix-note.md`. Only one `fix-note.md` is produced, skipping `report` and `analysis`.

**Decision rule**: whether to use the fast path is formally decided only once in the startup checks of `bt-issue-report`. Once the standard path has started, do not keep re-deciding the route in later stages. Otherwise the three stages can contradict one another.

**Must not** use the fast path when there are multiple root-cause candidates, the fix spans multiple modules, reproduction is required before diagnosis, or the user explicitly wants a full analysis record.

---

## Routing

When entering this skill, `Glob .bytetrue/issues/` first. Read the existing files so you know the current state.

| Current State | Trigger Which Sub-skill |
|---|---|
| Problem just discovered, no files yet | `bt-issue-report` (it decides standard vs fast path) |
| `report.md` exists, but no `analysis.md` | `bt-issue-analyze` |
| `analysis.md` exists, code not changed yet | `bt-issue-fix` |
| Code is already changed, but no fix verification record yet | `bt-issue-fix` (verification flow) |
| `fix-note.md` exists and `status: confirmed` | the issue is already closed; do not re-enter fix flow. If collaboration projection is needed, suggest `bt-tracker` |
| `fix-note.md` exists but `status: draft` | first inspect the verification record in the body, related commits, and worktree. If the evidence is complete, say only that the fix note needs to be changed to `status: confirmed`; do not directly declare the fix incomplete |
| Not sure | read the existing files yourself and match them against the table above |

If the user's description is actually a **new feature request rather than a bug**, tell them to use `bt-feat`.

---

## Boundary with the Feature Workflow

- issue: something that should already be working is broken — bug in existing code, abnormal behavior, documentation error, performance problem
- feature: something that never existed needs to be added — new feature or new capability

Gray area: during an issue fix, you discover that a new capability is required to truly solve it. In that case, **finish the issue workflow record and analysis first, then open a feature if needed**. Do not quietly build a new feature inside the issue workflow, for the same reason you should not quietly fix bugs inside a feature PR: once mixed together, nobody can tell what scope this change was really supposed to cover.

---

## Related Documents

- `.bytetrue/reference/system-overview.md` — overview of the ByteTrue system
- `.bytetrue/reference/shared-conventions.md` — shared conventions across stages
- `.bytetrue/attention.md` — startup notes and hard project constraints for ByteTrue
- `.bytetrue/architecture/ARCHITECTURE.md` — may be needed during root-cause analysis
