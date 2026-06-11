---
doc_type: decision
slug: pure-skills-core
status: accepted
decision_type: architecture
tags: [bytetrue, skills, runtime, subagent]
---

# Decision: Keep ByteTrue Core Pure Skills

## Decision

ByteTrue core remains a portable Skill bundle plus `.bytetrue` artifacts. Runtime adapters, hooks, background processes, and custom dispatchers are outside the core unless planned as separate optional integrations.

## Rationale

ByteTrue values minimal context and broad harness compatibility. Pure skills work across more agents and keep the core workflow understandable. Subagent and hook capabilities are useful, but they should be consumed when a harness already provides them rather than implemented as mandatory ByteTrue infrastructure.

## Consequences

- `package.json` exposes `pi.skills` only.
- The previously planned `optional-runtime-breadcrumb` item is dropped from the core roadmap.
- `subagent-handoff` documents a fallback ladder: native subagent, non-interactive child agent, inline role execution.
- Future runtime adapters may be designed separately if they are implemented fully and transparently.
