---
doc_type: decision
category: architecture
slug: implementation-review-gate
status: active
created: 2026-06-11
tags: [workflow, implementation-review, spec-compliance, code-quality]
---

# Decision: Implementation Review Gate Before Acceptance

## Context

ByteTrue already required `bt-feat-impl` to output a completion report and `bt-feat-accept` to independently verify implementation against the approved design. However, implementation readiness was still spread across reflection checks, changed-file lists, and acceptance-scenario self-checks. That made it too easy for an implementation to look complete while still mixing two different questions:

1. did it implement the approved design and avoid extra behavior?
2. is the resulting code or workflow change clean enough to hand to acceptance?

Superpowers provides a useful discipline here: review spec compliance before code quality. ByteTrue needs the same separation, but it must remain inline and tool-agnostic until the later subagent handoff feature exists.

## Decision

ByteTrue feature implementation now has a named **Implementation Review Gate** before acceptance.

The gate has two ordered dimensions:

1. **Spec Compliance Review** — checks behavior delta satisfaction, acceptance scenario evidence, absence of design-extra behavior, and explicit non-goal guards.
2. **Code Quality Review** — checks fresh verification, no debug/temp code, no unplanned refactor, reflection checks, naming, and module boundaries.

Spec compliance must pass before code quality is meaningful. A clean implementation of the wrong behavior is still a failed implementation.

The shared contract lives in:

- `.bytetrue/reference/implementation-review.md`
- `skills/bt-onboard/reference/implementation-review.md`

`bt-feat-impl` must include `Implementation Review Gate` evidence in its completion report. `bt-feat-accept` must check that this evidence exists before proceeding, but acceptance remains independent and may reject a passed implementation review.

## Alternatives Considered

### Put the full review checklist directly into `bt-feat-impl` and `bt-feat-accept`

Rejected. Both skill files are already close to the repository's 300-line markdown limit. A focused shared reference keeps the workflow reusable and keeps skill files readable.

### Wait until subagent review exists

Rejected. The inline gate is useful immediately and works in every Skill-capable tool. Subagents can strengthen it later, but should not be required for the first version.

### Let acceptance handle all review

Rejected. Acceptance is still mandatory, but implementation should not hand over work without first checking readiness. The gate reduces preventable drift before acceptance starts.

## Consequences

- Future feature implementations must report spec compliance and code quality separately.
- Acceptance startup can reject missing implementation-review evidence before doing the full acceptance pass.
- `spec-compliance-review` and `code-quality-review` are now execution-mode evidence vocabulary items.
- This does not introduce subagent dispatch, context manifests, hooks, worklog, or runtime state.
- This does not weaken acceptance; it adds an entry gate before acceptance.

## Related Documents

- `.bytetrue/features/2026-06-11-implementation-review-gate/implementation-review-gate-design.md`
- `.bytetrue/features/2026-06-11-implementation-review-gate/implementation-review-gate-acceptance.md`
- `.bytetrue/reference/implementation-review.md`
- `.bytetrue/roadmap/ai-workflow-absorption/ai-workflow-absorption-roadmap.md`
