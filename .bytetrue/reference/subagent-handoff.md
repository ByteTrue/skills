# ByteTrue Subagent Handoff

This reference defines how a parent session delegates ByteTrue work to a subagent, or follows the same role contract inline when subagents are unavailable.
It is a prompt contract, not an automatic dispatcher, hook, breadcrumb, CLI, or agent definition.

## Active Work Block

Every delegated ByteTrue task starts with this block:

```text
Active ByteTrue work: .bytetrue/features/YYYY-MM-DD-{slug}
Role: implement | check | research
Design: .bytetrue/features/YYYY-MM-DD-{slug}/{slug}-design.md
Checklist: .bytetrue/features/YYYY-MM-DD-{slug}/{slug}-checklist.yaml
Context manifest: .bytetrue/features/YYYY-MM-DD-{slug}/{slug}-{impl|check}-context.jsonl
```

For research tasks that do not belong to one feature yet, replace design/checklist with a scoped question and the relevant `.bytetrue` evidence paths.

## Roles

### implement

Reads:

- approved design
- checklist
- `{slug}-impl-context.jsonl`

May write:

- implementation changes inside approved scope
- checklist `steps[].status`
- implementation completion report

Must not:

- mark acceptance checks passed
- change scope silently
- launch nested subagents unless the parent explicitly assigned a fanout task

### check

Reads:

- approved design
- checklist
- `{slug}-check-context.jsonl`
- current git diff / implementation report

May write:

- review findings
- optional fixes only when the parent explicitly authorizes a writer pass

Must check:

- spec compliance before code quality
- fresh verification evidence
- explicit non-goals and behavior delta evidence

Must not:

- declare final acceptance complete
- replace `bt-feat-accept`

### research

Reads:

- scoped question
- relevant project docs/code
- web or external docs when useful

Writes:

- `.bytetrue/compound/YYYY-MM-DD-explore-{slug}.md`

Must not:

- make final product or architecture decisions
- write feature design or implementation code

## Parent Orchestrator Rules

The parent session owns:

- user alignment and scope changes
- manifest/design/roadmap updates
- final synthesis
- lifecycle transitions into implementation or acceptance

Child reports are evidence, not final truth. If a child is blocked or says context is missing, update the manifest, design, or plan instead of retrying blindly.

## Role Source

These roles come from the absorbed workflows, not from any one tool's built-in agent taxonomy:

- Trellis contributes `implement`, `check`, and `research` separation.
- Superpowers reviewer discipline maps into `check`: spec compliance first, code quality second.
- OpenSpec does not add a separate execution role.

Do not add a `planner` child role in v1. Planning remains in ByteTrue roadmap, feature design, and checklist checkpoints.
