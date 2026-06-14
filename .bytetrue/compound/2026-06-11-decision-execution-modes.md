---
doc_type: decision
category: architecture
status: active
decision_result: accepted
date: 2026-06-11
tags: [execution-mode, workflow-discipline, tdd, debugging, superpowers]
related_feature: 2026-06-11-risk-mode-discipline
related_roadmap: ai-workflow-absorption
---

# Decision: ByteTrue uses four execution modes

## Decision

ByteTrue uses four workflow-level execution modes:

- `light`
- `standard`
- `strict-evidence`
- `break-loop`

These modes choose workflow heaviness and evidence discipline. They do not replace `code-dimensions.md`, which remains about implementation quality dimensions.

## Rationale

Superpowers-style strictness is valuable for high-risk work, but making every task strict would make small work too heavy. ByteTrue therefore keeps a trigger-based model:

- simple copy/config/UI/local work can stay `light`;
- normal feature/issue/refactor work stays `standard`;
- bugfixes, regression-sensitive behavior, complex business logic, cross-boundary contracts, and security/data risk can upgrade to `strict-evidence`;
- repeated failed fixes, patch-branch spread, and architecture friction upgrade to `break-loop`.

## Consequences

- Feature design records `execution_mode` when the mode matters, or explicitly says standard mode is sufficient.
- Feature implementation reads `.bytetrue/reference/execution-modes.md` and treats `strict-evidence` as a TDD/evidence trigger.
- Issue analysis and fix use `strict-evidence` for root-cause and regression evidence, and stop on `break-loop` rather than continuing patches.
- Fastforward paths are light-mode only.
- Refactor routing uses execution modes to decide when to stay small, use the standard flow, or stop for architecture discussion.
