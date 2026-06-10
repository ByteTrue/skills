# ByteTrue Project Management Bridge

This document records the project-management integration rules between ByteTrue and external trackers, GitHub, GitLab, or local.

Core principle: `.bytetrue/` is the canonical source of truth; the external tracker is a team-collaboration projection and must not drive the main ByteTrue workflow in reverse.

---

## Provider

Chosen by the user during onboarding:

```yaml
provider: local | github | gitlab
sync_policy: ask
```

- `local`: use only `.bytetrue/`, create no external issues
- `github`: operate GitHub Issues through the local `gh` CLI
- `gitlab`: operate GitLab Issues through the local `glab` CLI

`bt-onboard` needs to detect:

- whether the CLI is installed
- the CLI auth status
- whether the current repo remote matches the provider

This layer does not design any API, token, or SDK adapter.

---

## Current Project Configuration

`bt-onboard` maintains this section. The YAML in the rule sections expresses default semantics; this section is the current project's actual choice.

```yaml
provider: local # local | github | gitlab
provider_status: not_configured # configured | not_configured
sync_policy: ask

repository:
  remote_url: TODO
  tracker_url: TODO

cli:
  gh:
    installed: unknown # true | false | unknown
    auth: unknown # ok | failed | unknown
  glab:
    installed: unknown # true | false | unknown
    auth: unknown # ok | failed | unknown
```

If the user chooses `github` or `gitlab` but the CLI is not installed or not logged in, keep the provider selection, but mark `provider_status` as `not_configured`; do not stop onboarding.

---

## External Tracker Role

The external tracker carries only team-visible collaboration objects:

- PRD parent issues
- task issues corresponding to roadmap items or feature designs
- bug issues corresponding to ByteTrue bug issues
- triage state of the incoming issue queue

The external tracker never becomes the primary state source for requirement, roadmap, feature, or issue.

---

## Syncable Sources

```yaml
syncable_sources:
  roadmap_prd:
    source: .bytetrue/roadmap/{slug}/{slug}-roadmap.md
    external_kind: prd

  roadmap_item:
    source: .bytetrue/roadmap/{slug}/{slug}-items.yaml
    external_kind: task

  feature_design:
    source: .bytetrue/features/{feature}/{slug}-design.md
    external_kind: task

  bug_issue:
    source: .bytetrue/issues/{issue}/{slug}-report.md
    external_kind: bug

not_syncable_by_default:
  standalone_requirement:
    reason: requirement is vision input material and is not published to external tracker by default
```

Syncable-status mapping:

- `roadmap_prd`: `status: active | completed | paused` counts as reviewed planning content and may be published or updated; `draft` does not sync
- `roadmap_item`: `status: planned | in-progress | done` may be published or updated; `dropped` only updates the state of an already bound external issue and does not create one by default
- `feature_design`: `status: approved` may be published or updated
- `bug_issue`: `status: confirmed` may be published or updated

PRD is not added as a new local entity. No `.bytetrue/prds/` directory is introduced.

---

## Actions

`bt-tracker` is the unified home for the external-tracker capabilities inspired by Matt `to-prd`, `to-issues`, and `triage`.

```yaml
actions:
  publish:
    direction: bytetrue_to_tracker
    effects:
      - create_new_issue
      - link_existing_issue
      - update_managed_block
      - write_external_metadata_back_to_source

  triage:
    direction: tracker_to_human_decision
    effects:
      - read_external_issue_queue
      - recommend_labels_or_route
      - update_external_labels_or_comments_after_confirmation
    does_not:
      - auto_import_to_bytetrue
      - auto_modify_bytetrue_sources
```

---

## Sync Policy

Default policy: only sync ByteTrue artifacts listed in `syncable_sources` and satisfying the syncable-status mapping, and always ask before performing any external side effect.

```yaml
sync_policy: ask
sync_direction: outbound_only
external_import: manual_only
update_policy: update_managed_block
```

Recommended external issue bodies use a ByteTrue managed block:

```md
<!-- bytetrue:managed:start -->
Generated from .bytetrue source.
<!-- bytetrue:managed:end -->
```

During sync updates, only the managed block is changed. Team-authored body content and comments are preserved.

---

## External Metadata

External metadata is written directly back into the corresponding source artifact. There is no central sync DB.

Example:

```yaml
external:
  provider: github
  kind: task
  id: 123
  url: https://github.com/org/repo/issues/123
  sync_mode: created | linked_existing
  synced_at: 2026-06-07T10:00:00Z
```

For roadmap items, external metadata is written onto the item inside `items.yaml`. For feature, issue, or roadmap PRD, it is written into the document frontmatter.

---

## Canonical Labels

ByteTrue uses stable canonical keys. During onboarding, they may be mapped onto the team's existing external labels.

```yaml
labels:
  prd:
    meaning: ByteTrue PRD parent issue
    external: bt:prd

  task:
    meaning: Implementation task from roadmap item or feature design
    external: bt:task

  bug:
    meaning: Bug issue from bt-issue
    external: bug

  ready_for_agent:
    meaning: Agent can pick this up without more human clarification
    external: ready-for-agent

  needs_triage:
    meaning: Incoming external issue still waiting for maintainer triage
    external: needs-triage

  needs_info:
    meaning: Blocked on more user or team information
    external: needs-info

  ready_for_human:
    meaning: Requires human judgement or review
    external: ready-for-human

  wontfix:
    meaning: Deliberately not accepted into ByteTrue work
    external: wontfix
```

---

## Status Sync

```yaml
status_sync:
  labels: true
  close_on_done: ask
  import_external_state: false
```

Non-destructive state may be synchronized into labels. Before closing an external issue, the user must be asked. External state changes never write back into `.bytetrue/` automatically.
