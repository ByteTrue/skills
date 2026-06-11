---
doc_type: decision
category: architecture
slug: subagent-handoff-roles
status: active
created: 2026-06-11
tags: [workflow, subagent, handoff, execution-context]
---

# Decision: Subagent Handoff Roles

## Context

ByteTrue now has context manifests that make implement/check read-sets explicit. The next problem is how a parent session should hand work to child agents, or how to run the same role contract inline when a tool does not support subagents.

The absorbed workflow sources point to three role concepts:

- Trellis contributes `implement`, `check`, and `research` separation.
- Superpowers contributes reviewer discipline, especially spec compliance before code quality.
- OpenSpec contributes behavior contracts, but not another execution role.

Pi's subagent system has its own built-in agent taxonomy, but ByteTrue's workflow contract should not depend on Pi-specific agent names. The same protocol must remain usable in every Skill-capable tool.

## Decision

ByteTrue defines a shared **Subagent Handoff Protocol** in:

- `.bytetrue/reference/subagent-handoff.md`
- `skills/bt-onboard/reference/subagent-handoff.md`

The protocol has three roles:

1. **implement** — reads design, checklist, and impl-context; may write implementation changes and checklist step status; must not mark acceptance checks passed or change scope silently.
2. **check** — reads design, checklist, check-context, and diff/report evidence; performs Superpowers-style reviewer work: spec compliance before code quality; must not replace `bt-feat-accept`.
3. **research** — reads a scoped question and relevant project/external evidence; writes `.bytetrue/compound/YYYY-MM-DD-explore-{slug}.md`; must not make final product or architecture decisions.

Every delegated ByteTrue task starts with an Active Work Block containing the active work path, role, design, checklist, and context manifest. For tools without subagents, the parent session follows the same role contract inline.

The parent orchestrator always owns user alignment, scope changes, final synthesis, and lifecycle transitions. Child reports are evidence, not final truth.

## Alternatives Considered

### Use Pi built-in agent names directly

Rejected. Pi's `worker`, `reviewer`, `researcher`, and other built-ins are useful runtime choices, but ByteTrue needs a cross-tool workflow contract. Handoff role names should come from the absorbed workflow semantics, not from one runtime implementation.

### Add a `planner` child role now

Rejected. Planning in ByteTrue belongs to roadmap, feature design, and checklist review, each with human checkpoints. A child planner role in v1 would risk bypassing those checkpoints before implementation.

### Implement automatic dispatch now

Rejected. Automatic dispatch, hooks, breadcrumbs, project agent files, and runtime chains are later infrastructure concerns. This feature defines the prompt contract they can consume later.

### Let children own acceptance

Rejected. `check` can provide findings and evidence, but `bt-feat-accept` remains the independent acceptance and writeback gate.

## Consequences

- Future subagent-capable workflows have a stable prompt prefix and role boundary.
- Tools without subagents can still use the same role contract inline.
- The `check` role absorbs Superpowers reviewer discipline without adding a separate `reviewer` role.
- The `research` role reuses ByteTrue `bt-explore` / `doc_type: explore` rather than creating a new research directory.
- No runtime dispatch, hook, breadcrumb, worklog, CLI, or project-specific agent definition is introduced by this decision.

## Related Documents

- `.bytetrue/features/2026-06-11-subagent-handoff-roles/subagent-handoff-roles-design.md`
- `.bytetrue/features/2026-06-11-subagent-handoff-roles/subagent-handoff-roles-acceptance.md`
- `.bytetrue/reference/subagent-handoff.md`
- `.bytetrue/reference/context-manifest.md`
- `.bytetrue/roadmap/ai-workflow-absorption/ai-workflow-absorption-roadmap.md`
