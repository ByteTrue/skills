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
  provider_status: unknown # unknown | configured | unavailable
  sync_policy: ask # ask | never | auto_preview
  sync_direction: outbound_only
  external_import: manual_only
  update_policy: update_managed_block
  repository:
    remote_url: null
    tracker_url: null
  cli:
    gh:
      installed: false
      auth: unknown # ok | missing | unknown
    glab:
      installed: false
      auth: unknown # ok | missing | unknown
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

- `provider`: configured collaboration backend, or `local` when no external tracker is used.
- `provider_status`: onboard detection result for the chosen provider.
- `sync_policy`: whether ByteTrue should ask, never suggest sync, or only prepare previews automatically.
- `sync_direction`: currently `outbound_only`; ByteTrue sources project to tracker, not the other way around.
- `external_import`: currently `manual_only`; external issues are triaged for human routing, not auto-imported.
- `update_policy`: currently `update_managed_block`; only ByteTrue-managed issue body blocks are rewritten.
- `repository.remote_url` / `repository.tracker_url`: detected repository and tracker URLs, if available.
- `cli.gh` / `cli.glab`: local CLI installation and auth detection results used by `bt-tracker`.

## Dispatch

Dispatch preference follows `.bytetrue/reference/subagent-handoff.md`: native subagent first when available, synchronous non-interactive child agent next when available, inline role execution otherwise.

## Docs

Line-limit settings are project policy. ByteTrue skills must not hard-code a universal markdown artifact line limit.
