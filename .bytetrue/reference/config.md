# ByteTrue Project Config

`.bytetrue/config.yaml` stores machine-readable project choices. Reference documents explain semantics; config owns current values.

## Shape

```yaml
version: 1
workflow:
  mode: manual # manual | auto
  ask_before: [git_commit, git_push, external_tracker_write, destructive_command, scope_change]
tracker:
  provider: local # local | github | gitlab
  sync_policy: ask # ask | never | auto_preview
dispatch:
  preferred: auto # auto | native_subagent | non_interactive_child | inline
  allow_non_interactive_child: true
  allow_background_agents: false
docs:
  line_limit_scope: skill-docs-only # none | skill-docs-only | all-markdown
  max_skill_doc_lines: 300
```

## Workflow Mode

- `manual`: default. Each workflow stage recommends the next step and waits for user confirmation.
- `auto`: ByteTrue may continue low-risk next steps until an `ask_before` boundary is reached.

## Ask-before Boundaries

`ask_before` lists operations that must never happen automatically, including commits, pushes, external tracker writes, destructive commands, and scope changes.

## Tracker

Tracker values moved here from `project-management.md`. `project-management.md` defines provider semantics, syncable sources, labels, and managed-block rules.

## Dispatch

Dispatch preference follows `.bytetrue/reference/subagent-handoff.md`: native subagent first when available, synchronous non-interactive child agent next when available, inline role execution otherwise.

## Docs

Line-limit settings are project policy. ByteTrue skills must not hard-code a universal markdown artifact line limit.
