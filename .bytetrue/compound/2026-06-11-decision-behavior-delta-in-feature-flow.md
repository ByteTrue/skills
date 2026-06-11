---
doc_type: decision
category: architecture
date: 2026-06-11
slug: behavior-delta-in-feature-flow
status: active
area: bytetrue-feature-workflow
tags: [behavior-delta, feature-design, acceptance, openspec, workflow]
---

## Background

ByteTrue is absorbing OpenSpec's delta/archive discipline without adding a separate `.bytetrue/specs/` layer. The first feature in that roadmap implemented the behavior-delta contract inside the existing feature workflow.

## Decision

Behavior Delta belongs inside the standard feature flow:

- feature design writes Behavior Delta under section 3 as `### 3.2 Behavior Delta`;
- feature acceptance verifies and materializes those deltas inside acceptance report section 2;
- checklist extraction uses `behavior-delta` as a check source;
- stable accepted outcomes are written back to existing ByteTrue layers such as `requirements/`, `architecture/`, or `compound/`, or marked `acceptance-only`.

Do not create standalone `{slug}-delta.md` files for the first version.

## Rationale

Section 3 already owns acceptance-facing behavior scenarios, so placing Behavior Delta there keeps behavior contracts close to acceptance evidence. Acceptance section 2 already verifies behavior and decisions, so placing materialization there avoids adding a tenth top-level acceptance section.

This preserves the current feature design and acceptance section numbering while still gaining OpenSpec-style explicit behavior deltas.

## Alternatives Considered

### Standalone `{slug}-delta.md`

Rejected for the first version. It would be clearer as an isolated artifact, but it would add another file that design, implementation, and acceptance must keep synchronized.

### New top-level design or acceptance section

Rejected. The acceptance skill has hardcoded assumptions about design section numbering. Top-level renumbering would create unnecessary workflow drift.

## Consequences

Future feature-design work must either write Behavior Delta entries for observable behavior changes or explicitly state `Behavior Delta: none`. Future acceptance work must record materialization evidence and writeback target before completing the feature.

This decision builds on, but is narrower than, `.bytetrue/compound/2026-06-11-decision-no-separate-specs-layer.md`.

## Related Documents

- `.bytetrue/compound/2026-06-11-decision-no-separate-specs-layer.md`
- `.bytetrue/features/2026-06-11-behavior-delta-contract/behavior-delta-contract-acceptance.md`
- `.bytetrue/roadmap/ai-workflow-absorption/ai-workflow-absorption-roadmap.md`
