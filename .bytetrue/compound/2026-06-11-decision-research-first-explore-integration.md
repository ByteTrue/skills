---
doc_type: decision
category: architecture
slug: research-first-explore-integration
status: active
created: 2026-06-11
tags: [workflow, research-first, explore, evidence]
---

# Decision: Research-first Explore Integration

## Context

ByteTrue already had `bt-explore`, but it was mostly a user-triggered evidence archive. During the OpenSpec / Superpowers / Trellis absorption work, Trellis highlighted a stronger discipline: when a decision depends on external facts or comparable workflow behavior, gather and archive evidence before asking the user to choose.

Without this rule, agents can ask users to invent options, rely on memory, or design around unverified assumptions about libraries, APIs, platform hooks, performance, costs, or external workflow behavior.

## Decision

ByteTrue uses **research-first** as an evidence-before-decision discipline.

When a factual question can materially change design, roadmap, or grill direction, the workflow first produces or reuses a `bt-explore` artifact with `type: spike`, then cites that artifact in the later design, roadmap, grill summary, decision, or context manifest.

The shared contract lives in:

- `.bytetrue/reference/research-first.md`
- `skills/bt-onboard/reference/research-first.md`

Research-first applies only when the answer can change direction, such as:

- external tool behavior
- library or API capability
- platform hook or integration capability
- comparable workflow behavior
- industry convention
- performance, cost, or reliability claims

Explore records observed facts, confidence, tradeoffs, and sources. It does not make final product, architecture, roadmap, or technology decisions. Final choices still require user-confirmed design, roadmap, grill convergence, or `bt-decide`.

## Alternatives Considered

### Create `.bytetrue/research/`

Rejected. ByteTrue already has `.bytetrue/compound/` with `doc_type: explore`. A new research directory would create another evidence/facts layer and weaken searchability.

### Make research-first mandatory for every feature

Rejected. That would add process tax for simple preference, copy, UI, or already-clear local changes. The trigger is intentionally limited to facts that can change downstream direction.

### Let explore make the final decision

Rejected. Explore is an evidence artifact. Decisions still belong to user-confirmed planning and decision workflows.

### Implement automatic research routing or background research now

Rejected. This feature defines the workflow contract only. Runtime automation, hooks, subagent dispatch, and background research loops are separate concerns.

## Consequences

- Brainstorm, grill, roadmap, and feature-design now have a shared rule for direction-changing factual questions.
- `bt-explore type=spike` becomes the standard evidence artifact for technical choices and comparable workflow facts.
- Context manifests can include cited research-first explore artifacts so implementation and acceptance do not rediscover the same facts.
- No new facts layer, research directory, runtime router, hook, CLI, worklog, or subagent behavior is introduced.

## Related Documents

- `.bytetrue/features/2026-06-11-research-first-explore-integration/research-first-explore-integration-design.md`
- `.bytetrue/features/2026-06-11-research-first-explore-integration/research-first-explore-integration-acceptance.md`
- `.bytetrue/reference/research-first.md`
- `.bytetrue/reference/context-manifest.md`
- `.bytetrue/roadmap/ai-workflow-absorption/ai-workflow-absorption-roadmap.md`
