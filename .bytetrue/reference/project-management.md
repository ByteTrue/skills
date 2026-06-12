# ByteTrue Project Management Bridge

本文档记录 ByteTrue 与外部 tracker（GitHub / GitLab / local）的项目管理集成规则。

核心原则：`.bytetrue/` 是 canonical source of truth；external tracker 是团队协作 projection，不反向主导 ByteTrue 主流程。

---

## Provider

项目 onboard 时由用户选择：

```yaml
provider: local | github | gitlab
sync_policy: ask | never | auto_preview
```

- `local`：只使用 `.bytetrue/`，不创建外部 issue。
- `github`：通过本地 `gh` CLI 操作 GitHub Issues。
- `gitlab`：通过本地 `glab` CLI 操作 GitLab Issues。

`bt-onboard` 需要检测：

- CLI 是否安装。
- CLI auth 状态。
- 当前 repo remote 是否匹配 provider。

本次不设计 API / token / SDK adapter。

---

## Current Project Configuration

Current provider, sync policy, repository, and advisory CLI detection cache live in `.bytetrue/config.yaml`. This document defines provider semantics, syncable sources, labels, and writeback rules; `bt-tracker` still revalidates CLI/auth/remote state at runtime.

---

## External Tracker Role

external tracker 只承载团队可见的协作对象：

- PRD parent issue。
- roadmap item / feature design 对应的 task issue。
- ByteTrue bug issue 对应的 bug issue。
- incoming issue queue 的 triage 状态。

external tracker 不直接成为 requirement、roadmap、feature、issue 的主状态源。

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
    reason: requirement 是愿景输入材料，默认不单独发布外部 tracker
```

可同步状态映射：

- `roadmap_prd`：`status: active | done` 视为已 review 的规划口径，可 publish / update；`pending` 不同步。
- `roadmap_item`：`status: pending | active | done` 可 publish / update；`dropped` 只更新已绑定外部 issue 的状态，不默认新建。
- `feature_design`：`status: done` 且 `review_result: approved` 可 publish / update。
- `bug_issue`：`status: done` 可 publish / update。

PRD 不作为新的本地实体；本地不新增 `.bytetrue/prds/`。

---

## Actions

`bt-tracker` 统一承载 Matt `to-prd`、`to-issues`、`triage` 的外部 tracker 能力。

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

当前 sync 值只从 `.bytetrue/config.yaml` 读取；本节不设置当前值。`bt-tracker` 只处理符合 `syncable_sources` 和可同步状态映射的 ByteTrue 产物：

- `sync_policy: ask`：进入 tracker / preview 前询问。
- `sync_policy: never`：跳过 tracker preview 和外部同步建议。
- `sync_policy: auto_preview`：可自动准备 preview；外部 issue 创建 / 更新 / 绑定 / 关闭或 external metadata 写回仍按当前 `workflow.ask_before` 和 `bt-tracker` 确认规则处理。
- `sync_direction` 第一版支持 `outbound_only`；`external_import` 第一版支持 `manual_only`；`update_policy` 第一版支持 `update_managed_block`。如果 config 出现未支持值，`bt-tracker` 应停下说明并要求用户确认配置。

外部 issue body 推荐使用 ByteTrue managed block：

```md
<!-- bytetrue:managed:start -->
Generated from .bytetrue source.
<!-- bytetrue:managed:end -->
```

同步更新时只改 managed block，保留团队手写内容和评论。

---

## External Metadata

external metadata 直接写回对应源产物，不做中央 sync DB。

示例：

```yaml
external:
  provider: github
  kind: task
  id: 123
  url: https://github.com/org/repo/issues/123
  sync_mode: created | linked_existing
  synced_at: 2026-06-07T10:00:00Z
```

roadmap item 的 external metadata 写在 `items.yaml` 的 item 上；feature / issue / roadmap PRD 写在各自文档 frontmatter 中。

---

## Canonical Labels

ByteTrue 使用稳定 canonical keys；onboard 时允许映射到团队已有 external labels。

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
    meaning: Blocked on more user/team information
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

非破坏性状态可同步成 labels；关闭外部 issue 前必须询问用户。外部状态变化不自动回写 `.bytetrue/`。
