---
name: bt-tracker
description: ByteTrue's external tracker bridge, combining Matt `to-prd`, `to-issues`, and `triage`. It publishes, binds, and updates `.bytetrue` artifacts that satisfy the syncable-source and syncable-status mapping into GitHub, GitLab, or a local tracker, and it can also triage external incoming issues and route them back into the bt lifecycle.
---

# bt-tracker

`bt-tracker` is ByteTrue's external tracker bridge.

It absorbs ideas from Matt `to-prd`, `to-issues`, and `triage`, but it does not replace the main ByteTrue workflows:

- the canonical source for requirements, planning, features, and bugs remains `.bytetrue/`
- GitHub, GitLab, or a local tracker are only team-visible projections and incoming queues
- every external side effect must be previewed first, then explicitly confirmed by the user

> Current tracker configuration lives in `.bytetrue/config.yaml`; project-management semantics live in `.bytetrue/reference/project-management.md`; terminology comes from `.bytetrue/reference/domain-context.md`.

---

## Startup checks

Do this every time first:

1. read `.bytetrue/attention.md`; if missing, tell the user to run `bt-onboard` first
2. read `.bytetrue/config.yaml` for provider/sync values and `.bytetrue/reference/project-management.md` for semantics; if either is missing, tell the user to rerun `bt-onboard` or repair the skeleton
3. read `.bytetrue/reference/domain-context.md`, if it exists; titles and bodies of external issues must use the project's canonical terms
4. determine the provider: `local`, `github`, or `gitlab`
5. if the provider is `github`, check `gh`, `gh auth status`, and `git remote -v`
6. if the provider is `gitlab`, check `glab`, `glab auth status`, and `git remote -v`

If the provider is `local`, do not create any external issue. Simply explain that no external tracker is configured yet, and offer to help update `.bytetrue/config.yaml` or recommend rerunning `bt-onboard`.

---

## Modes

| What the user wants to do | Mode |
|---|---|
| publish roadmap, feature, or bug artifacts that satisfy the syncable-source and status mapping into GitHub or GitLab | `publish` |
| bind a ByteTrue artifact to an existing external issue | `link` |
| update the managed block or labels of an already bound external issue | `update` |
| inspect incoming external issues, needs-triage, or needs-info replies | `triage` |
| inspect the current tracker configuration | `status` |

If the user did not explicitly name the mode, infer it from the wording; if still uncertain, ask one question.

---

## Syncable sources

Only sync ByteTrue artifacts that satisfy both the syncable-source rule and the syncable-status mapping.

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
```

Syncable-status mapping:

- `roadmap_prd`: `status: active | done` counts as reviewed planning content and may be published or updated; `pending` does not sync
- `roadmap_item`: `status: pending | active | done` may be published or updated; `dropped` only updates the state of an already bound external issue and does not create one by default
- `feature_design`: `status: done` with `review_result: approved` may be published or updated
- `bug_issue`: `status: done` may be published or updated

Do not sync standalone requirements by default. Requirement is only a vision input to PRD or feature issues.

---

## `publish`, ByteTrue → external tracker

### 1. Read the source artifact

Based on the path, slug, or roadmap name provided by the user, read the source artifact:

- roadmap PRD: read `roadmap.md`, `items.yaml`, and related requirements if they are referenced in frontmatter
- roadmap item: read the item plus its parent roadmap
- feature design: read the design plus checklist; if `{slug}-acceptance.md` already exists, also read the acceptance report as input for task completion status or acceptance-result updates
- bug issue: read the report, analysis, and fix note, if present

If the source artifact does not satisfy the syncable-source rule and syncable-status mapping, stop and ask the user whether they want to go back through the corresponding bt workflow and confirm it first.

### 2. Generate an external-issue preview

Before publishing, show the user a preview containing:

- external kind: `prd`, `task`, or `bug`
- title
- labels
- body managed block
- which `.bytetrue` source file it will write metadata back into

PRD body uses Matt `to-prd` structure, but mapped into ByteTrue:

```md
## Problem Statement
## Solution
## User Stories
## Implementation Decisions
## Testing Decisions
## Out of Scope
## Further Notes
```

Task issue uses the vertical-slice / tracer-bullet structure:

```md
## Parent
## What to build
## Acceptance criteria
## Blocked by
## Status / Acceptance
## ByteTrue Source
```

Bug issue contains at least:

```md
## Problem
## Reproduction
## Expected vs Actual
## Diagnosis Status
## Acceptance / Regression
## ByteTrue Source
```

### 3. Execute only after user confirmation

Offer the user three choices:

1. create a new external issue
2. bind an existing issue URL or ID
3. do not sync for now

Before the user confirms, do not call `gh issue create`, `glab issue create`, or any edit command.

### 4. Create or update

GitHub:

```bash
gh issue create --title "$TITLE" --body-file "$BODY_FILE" --label "$LABELS"
gh issue edit "$ID" --body-file "$BODY_FILE" --add-label "$LABELS"
```

GitLab:

```bash
glab issue create --title "$TITLE" --description-file "$BODY_FILE" --label "$LABELS"
glab issue update "$ID" --description-file "$BODY_FILE" --label "$LABELS"
```

Use the local CLI help as the source of truth for exact flags. If uncertain, first run `gh issue create --help` or `glab issue create --help`.

### 5. Write back metadata

After success, write external metadata back into the source artifact. Do not create a central sync database:

```yaml
external:
  provider: github
  kind: task
  id: 123
  url: https://github.com/org/repo/issues/123
  sync_mode: created | linked_existing
  synced_at: 2026-06-07T10:00:00Z
```

For roadmap items, write metadata into the matching item in `items.yaml`. For feature, issue, or roadmap PRD, write it into frontmatter.

---

## Managed block update rules

Only the ByteTrue block inside the external issue body is managed:

```md
<!-- bytetrue:managed:start -->
Generated from .bytetrue source.
<!-- bytetrue:managed:end -->
```

During updates, only replace the content inside that block. Keep all team-written content and comments intact. If the managed block is missing, ask the user whether to insert the block, overwrite the whole body, or cancel.

---

## Statuses and labels

ByteTrue uses canonical keys; external label names and sync semantics come from `.bytetrue/reference/project-management.md`:

- `prd`
- `task`
- `bug`
- `ready_for_agent`
- `needs_info`
- `ready_for_human`
- `wontfix`

Non-destructive state may be synchronized as labels. Before closing an external issue, ask the user. External state changes never write back into `.bytetrue` automatically.

---

## `triage`, external tracker → human judgment → ByteTrue

Triage handles only external incoming queues and does not automatically modify `.bytetrue`.

### 1. List issues that need attention

Show three buckets, oldest first:

1. unlabeled, never triaged
2. `needs-triage`, waiting for maintainer evaluation
3. `needs-info` with a new reporter reply, meaning it needs re-evaluation

For each issue, show only id, title, labels, updated time, and a one-sentence summary.

### 2. Triage one issue

Read the full body, comments, labels, reporter, and dates. If there are historical triage notes, parse them first to avoid asking the same question twice.

Give a recommendation:

- category: `bug | task | prd | question | out_of_scope`
- state: `needs_info | ready_for_agent | ready_for_human | wontfix | needs_triage`
- reasoning: why
- ByteTrue route: whether it should enter `bt-issue`, `bt-feat`, `bt-roadmap`, `bt-grill`, or not enter ByteTrue yet

For bugs, you must first try to reproduce them, or explain clearly why reproduction is not possible. Do not go straight into grilling the reporter.

### 3. Change the external tracker only after user confirmation

Every triage comment must begin with this line:

> *This was generated by AI during triage.*

- `needs_info`: post triage notes and ask for the specific missing information
- `ready_for_agent`: post the agent brief and explain that an agent can process it independently
- `ready_for_human`: explain why it needs human judgment, permissions, or design review
- `wontfix`: explain the reason politely, and confirm again before closing

### 4. Route back into ByteTrue

Once the user confirms that an external issue should enter ByteTrue:

- bug → `bt-issue-report`
- small feature or task → `bt-brainstorm` or `bt-feat`
- large demand or PRD → `bt-roadmap`
- unclear proposal → `bt-grill`

After it enters ByteTrue, the external issue is still only an input source. `.bytetrue` artifacts remain the later canonical source.

---

## Upstream trigger points

Once the following stage outputs satisfy the syncable-source and syncable-status mapping, upstream skills should suggest in one sentence whether to enter `bt-tracker`; this skill still must follow the preview-and-confirmation rules of publish, link, or update:

| Upstream stage | Trigger content |
|---|---|
| after `bt-roadmap` | roadmap PRD plus any syncable roadmap items touched in this change, pending / active / done, with dropped items only updating already bound external issues |
| after `bt-feat-design` | feature design with `status: done` and `review_result: approved`; if started from roadmap, also the corresponding roadmap item |
| after `bt-feat-accept` | task completion-state updates for the feature design plus acceptance report or checklist; if started from roadmap, also the done roadmap item |
| after `bt-issue-report` | bug issue with `status: done` |
| after `bt-issue-fix` | updates to managed block, labels, or close-on-done for an already bound bug issue; if it was never bound before, publish or link may still be added |

---

## Exit Conditions

- [ ] `.bytetrue/config.yaml` and `.bytetrue/reference/project-management.md` have been read and the provider has been confirmed
- [ ] before any external side effect, a preview was shown and user confirmation was obtained
- [ ] after publish, link, or update succeeded, external metadata was written back
- [ ] triage mode did not automatically modify `.bytetrue`
- [ ] every external comment contains the AI triage disclaimer

---

## Things this skill does not do

- It does not replace the main workflows of `bt-roadmap`, `bt-feat`, or `bt-issue`
- It does not treat the external tracker as the canonical source
- It does not write back into `.bytetrue` automatically from external issues
- It does not automatically close external issues
- It does not design APIs, tokens, or SDK adapters; it only uses `gh` and `glab` CLI
