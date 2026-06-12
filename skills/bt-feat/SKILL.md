---
name: bt-feat
description: Sub-workflow entry for new feature development. Move "add capability X" from idea to acceptance closure. Trigger when the user says "build a new feature", "add X", or "implement XX". This skill only routes. It decides between `brainstorm` / `design` / `fastforward` / `implement` / `acceptance` based on existing artifacts. It does not handle bugs.
---

# bt-feat

## Read Before Starting

Before making any judgment or taking any action, read `.bytetrue/attention.md` first; if it is missing, treat the skeleton as incomplete and tell the user to fill it in or run `bt-onboard`.

The new-feature flow inserts a design document between "requirement" and "code" so that both sides have a handoff point. If the AI writes code directly from the requirement, three familiar problems appear: names do not line up with the existing code, scope keeps drifting during implementation, and no archive remains after the work is done.

```
(if the idea is still fuzzy, first go to bt-brainstorm for triage) → design plan (term layer + orchestration layer + acceptance contract + sliced rollout strategy) → stepwise implementation → acceptance closure
```

`brainstorm` is an independent entry for the discussion layer. It triages into case 1 (clear → go straight to design), case 2 (small need that still needs discussion → write a brainstorm note), or case 3 (large need → hand off to `bt-roadmap`). Only case 2 writes a brainstorm note under the feature directory.

This skill writes neither code nor documents. It does only one thing: look at which step the current feature has reached and tell the user which sub-skill should be triggered next.

---

## Where the Files Go

```
.bytetrue/features/{feature}/
├── {slug}-brainstorm.md       ← stage 0 artifact (written only for case 2)
├── {slug}-intent.md           ← optional stage 1 draft pre-input (a partial draft written by the user)
├── {slug}-design.md           ← stage 1 design document
├── {slug}-checklist.yaml      ← stage 1 generated steps + checks; statuses updated during stages 2 and 3
├── {slug}-impl-context.jsonl  ← implementation read-set
├── {slug}-check-context.jsonl ← acceptance/check read-set
├── {slug}-implementation-report.md ← stage 2 durable completion + review evidence
└── {slug}-acceptance.md       ← stage 3 acceptance report
```

The directory name is `YYYY-MM-DD-{english-slug}`. The date is fixed to the day of first creation and never changes. The slug uses lowercase letters, digits, and hyphens.

Why keep them together: later, when someone asks "how did we decide that CSV export feature back then?", the brainstorm, design, and acceptance are all in one place. Features and issues live separately under `.bytetrue/features/` and `.bytetrue/issues/` because their archival logic is different.

If you discover a bug while implementing a feature, record it as a new issue. **Do not quietly fix it inside the feature PR**. Otherwise acceptance cannot tell what scope was intended, and `git blame` cannot explain why the change happened.

---

## Four Stages

| Stage | Sub-skill | Output | Who Leads |
|---|---|---|---|
| 0 brainstorm (optional, independent entry) | `bt-brainstorm` | brainstorm note only for case 2 | AI as thinking partner, user decides |
| 1 design plan | `bt-feat-design` | `design.md` + `checklist.yaml` | AI drafts, user reviews as a whole |
| 2 stepwise implementation | `bt-feat-impl` | code + stage report | AI executes against the plan |
| 3 acceptance closure | `bt-feat-accept` | `acceptance.md` | AI checks layer by layer, user does final review |

There is a human checkpoint between stages by default. If `.bytetrue/config.yaml` has `workflow.mode: manual`, do not start the next stage without explicit user approval. If it has `workflow.mode: auto`, the next stage may continue after the current stage's own exit/review conditions are satisfied, but it must still stop at any `ask_before` boundary, missing artifact, ambiguity, semantic approval, or HUMAN verification gate defined in `.bytetrue/reference/shared-conventions.md`.

Stage 0 is optional and is an **external entry** to the feature flow. `bt-brainstorm` serves both feature and roadmap. Case 3, the large-demand discussion path, is handed off to `bt-roadmap` and does not return to the feature flow. After roadmap later splits out sub-features, they re-enter through the `bt-feat-design` entry "starting from a roadmap item".

### Fastforward Mode

When the requirement is clear and the scope is small, the full four-stage flow is too heavy. Fastforward compresses design into 4 sections: requirement summary, design plan, acceptance criteria, and rollout steps. After one user confirmation, implementation starts directly. Triggers include "fast mode", "fastforward", "just start coding", and "too many steps"; route those to `bt-feat-ff`.

**Do not use** fastforward when the work spans multiple subsystems, has terminology collision risk, or needs more than 4 rollout steps. In those cases, skipping design means the AI and user never confirmed the same plan, and only after implementation finishes do they discover that they meant different things.

---

## Routing: Which Sub-skill the User Should Use Now

When entering this skill, `Glob .bytetrue/features/` first and inspect the existing artifacts. **Do not rely only on the user's verbal claim**. For continuation requests, match the named slug/directory and read minimal frontmatter plus checklist statuses; do not infer activity from directory existence alone.

| Current State | Trigger Which Sub-skill |
|---|---|
| The idea is fuzzy, and the user cannot clearly state the real problem, boundary, or non-goals | `bt-brainstorm` |
| The idea is clear, meaning they know what to build, for whom, and what counts as success | `bt-feat-design` |
| The user says "open a new request / start a draft / create a new feature" and wants to write a partial draft themselves | `bt-feat-design` in "initialization mode" (create directory + empty intent, then return after the user fills it) |
| The user explicitly says "let's brainstorm first" or "I have an idea but haven't thought it through" | `bt-brainstorm` |
| `{slug}-intent.md` is already filled | `bt-feat-design` (read the intent as input) |
| The user says "fast mode / fastforward" | `bt-feat-ff` |
| `{slug}-brainstorm.md` exists and it is time to move into design | `bt-feat-design` |
| No design exists, or design exists with `status: active` | `bt-feat-design` |
| Acceptance exists with `status: done` | feature is already complete; do not continue unless the user asks for a new change, bug fix, or follow-up feature |
| Legacy acceptance exists without frontmatter but has substantive section-by-section acceptance content | `bt-feat-accept` in legacy reconstruction mode; do not route back to implementation solely because `{slug}-implementation-report.md` is missing |
| Design exists with `status: done` and `review_result: approved`, but checklist steps are missing, pending, or failed | `bt-feat-impl` |
| Checklist steps are all `done`, but `{slug}-implementation-report.md` is missing or not `status: done` | `bt-feat-impl` |
| Implementation report is `status: done`, but checklist checks are `pending` or `failed`, or acceptance is missing | `bt-feat-accept` |
| Fastforward note exists with `status: done` | fastforward feature is already complete; route new behavior changes to a new feature or issue |
| The user says "I want an X system" and it is a large demand | route to `bt-brainstorm` for triage, most likely case 3 → `bt-roadmap` |
| A sub-feature in roadmap is ready to start | `bt-feat-design` via the "starting from a roadmap item" entry |
| Not sure whether the design is complete | read it yourself and match it against the table above |

### Auto-mode routing note

When the routing table points to the next deterministic stage and config says `workflow.mode: auto`, say that the workflow may continue into that stage if the previous stage's artifact is already reviewed and no current `workflow.ask_before` operation or review/user-choice boundary is reached. Do not use auto mode to skip design review, implementation report review, acceptance final review, configured ask-before operations, or tracker confirmation rules.

### How to Decide Whether Stage 0 Is Needed

The signal is not "the user's description is short". The signal is whether the user can clearly state three things: the real problem to solve, the core behavior, and one explicit non-goal. If any one of the three is fuzzy, brainstorm is worth doing.

But do not force it. If the user clearly says "I have thought it through; go straight to design", respect that. If unsure, ask one question and let the user choose. **Better to under-classify than over-classify**. Forcing divergent discussion onto a user who already knows what they want is a waste.

### brainstorm vs intent

Both are pre-design inputs, but the difference is **who leads the convergence**:

- brainstorm: the user is fuzzy, the AI asks and the user answers. If triage lands on case 3, it is handed to `bt-roadmap` and does not return to feature. Only case 2 writes a brainstorm note.
- intent: the user already has a rough solution in mind, such as a 100-word description plus related data structures, and prefers writing `{slug}-intent.md` for the AI to read instead of explaining it verbally

When a fuzzy user asks to "open a new request", ask by default: "Do you want to talk it through first (`brainstorm`) or write a draft yourself (`intent`)?". Do not choose for them.

---

## Boundary with the Issue Workflow

- feature: something that never existed needs to be added, meaning a new feature or new capability
- issue: something that should already be working is broken, meaning a bug, abnormal behavior, or documentation error

Gray area: a bug discovered during feature implementation should be recorded as a new issue rather than fixed casually inside the feature PR.

---

## Related Documents

- `.bytetrue/reference/system-overview.md` — overview of the ByteTrue system
- `.bytetrue/reference/shared-conventions.md` — shared conventions across stages, directory structure, and checklist lifecycle
- `.bytetrue/attention.md` — startup notes and hard project constraints for ByteTrue
- the project architecture entry — needed during the design stage
