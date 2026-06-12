# ByteTrue Project Config

`.bytetrue/config.yaml` stores machine-readable project choices. Reference documents explain semantics; config owns current values.

## Shape (schema example, not current values)

```text
version: 1
workflow:
  mode: manual | auto
  ask_before: [operation_key, ...]
tracker:
  provider: local | github | gitlab
  provider_status: unknown | configured | unavailable
  sync_policy: ask | never | auto_preview
  sync_direction: outbound_only
  external_import: manual_only
  update_policy: update_managed_block
  repository:
    remote_url: <url | null>
    tracker_url: <url | null>
  cli:
    gh:
      installed: true | false | null
      auth: ok | missing | unknown
    glab:
      installed: true | false | null
      auth: ok | missing | unknown
dispatch:
  preferred: auto | native_subagent | non_interactive_child | inline
  allow_non_interactive_child: true | false
  allow_background_agents: true | false
```

## Workflow Mode

- `manual`: default. Each workflow stage recommends the next step and waits for user confirmation before moving across stage boundaries.
- `auto`: workflow skills may continue deterministic, low-risk next-stage work once the current stage exit conditions are satisfied, until an `ask_before` boundary, ambiguity, user-choice gate, or human-verification gate is reached. `auto` is a pure-skills continuation rule, not a daemon, background executor, hook, or permission to skip review evidence.

## Ask-before Boundaries

`ask_before` is a project-owned list of operation keys in `.bytetrue/config.yaml`. A skill that is about to perform an operation whose key appears in the current list must stop, state the boundary, and ask the user. The keys are not owned by this reference document; onboard may seed a default list, but the YAML file is the source of truth.

## Tracker

Tracker values moved here from `project-management.md`. `project-management.md` defines provider semantics, syncable sources, labels, and managed-block rules.

- `provider`: configured collaboration backend, or `local` when no external tracker is used.
- `provider_status`: onboard detection result for the chosen provider.
- `sync_policy`: `ask` means suggest tracker sync and ask; `never` means skip tracker prompts; `auto_preview` means prepare the tracker preview automatically when a syncable source is reached, then stop before any external write that current config or tracker rules require confirming.
- `sync_direction`: first-version supported value is `outbound_only`; ByteTrue sources project to tracker, not the other way around.
- `external_import`: first-version supported value is `manual_only`; external issues are triaged for human routing, not auto-imported.
- `update_policy`: first-version supported value is `update_managed_block`; only ByteTrue-managed issue body blocks are rewritten.
- `repository.remote_url` / `repository.tracker_url`: detected repository and tracker URLs, if available.
- `cli.gh` / `cli.glab`: last detected local CLI installation and auth values, advisory only. `bt-tracker` must re-run CLI/auth/remote checks at startup and must not treat committed cache values as fact for another clone.

## Dispatch

Dispatch preference is config-owned. If `dispatch.preferred: auto`, follow the fallback ladder in `.bytetrue/reference/subagent-handoff.md`; otherwise try the configured preferred surface first. `allow_non_interactive_child` and `allow_background_agents` gate whether those execution surfaces may be used.
