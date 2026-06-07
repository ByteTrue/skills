---
name: bt-tracker
description: ByteTrue 外部 tracker 桥，融合 Matt to-prd / to-issues / triage。用于把 confirmed .bytetrue 产物发布/绑定/更新到 GitHub/GitLab/local tracker，或 triage 外部 incoming issues 后路由回 bt 生命周期。
---

# bt-tracker

`bt-tracker` 是 ByteTrue 的 external tracker bridge。

它吸收 Matt `to-prd`、`to-issues`、`triage`，但不替代 ByteTrue 主流程：

- 需求 / 规划 / feature / bug 的 canonical source 仍是 `.bytetrue/`。
- GitHub / GitLab / local tracker 只是团队可见 projection 和 incoming queue。
- 外部副作用必须先预览、再让用户确认。

> 项目管理配置看 `.bytetrue/reference/project-management.md`；术语看 `.bytetrue/reference/domain-context.md`。

---

## 启动检查

每次先做：

1. 读 `.bytetrue/attention.md`；缺失则提示先 `bt-onboard`。
2. 读 `.bytetrue/reference/project-management.md`；缺失则提示重跑 `bt-onboard` 补齐。
3. 读 `.bytetrue/reference/domain-context.md`（如果存在），外部 issue 标题/正文必须使用项目 canonical terms。
4. 判断 provider：`local | github | gitlab`。
5. provider 是 `github` 时检查 `gh`、`gh auth status`、`git remote -v`。
6. provider 是 `gitlab` 时检查 `glab`、`glab auth status`、`git remote -v`。

provider 是 `local` 时，不创建外部 issue；只说明当前未配置外部 tracker，并可帮助用户更新 `project-management.md` 或建议重跑 `bt-onboard`。

---

## 模式

| 用户想做什么 | 模式 |
|---|---|
| 把 confirmed roadmap / feature / bug 发布到 GitHub/GitLab | `publish` |
| 把 ByteTrue 产物绑定到已有外部 issue | `link` |
| 更新已绑定外部 issue 的 managed block / labels | `update` |
| 看外部 incoming issues / needs-triage / needs-info 回复 | `triage` |
| 查看当前 tracker 配置 | `status` |

如果用户没说模式，先根据话判断；仍不确定就问一个问题。

---

## 可同步源

只同步 confirmed / approved / accepted 的 ByteTrue 产物。

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

不要默认同步 standalone requirement；requirement 只作为 PRD / feature issue 的愿景输入。

---

## publish：ByteTrue → external tracker

### 1. 读取源产物

根据用户给的路径 / slug / roadmap 名称读取源产物：

- roadmap PRD：读 roadmap.md + items.yaml + 相关 requirement（如果 frontmatter 引用）。
- roadmap item：读 item + parent roadmap。
- feature design：读 design + 相关 brainstorm / requirement（如有）。
- bug issue：读 report / analysis / fix note（如有）。

如果源产物不是 confirmed / approved / accepted，停止并问用户是否先回对应 bt 流程确认。

### 2. 生成外部 issue 预览

发布前先给用户预览：

- external kind：`prd | task | bug`
- title
- labels
- body managed block
- 将回写到哪个 `.bytetrue` 源文件

PRD body 使用 Matt `to-prd` 的结构，但映射到 ByteTrue：

```md
## Problem Statement
## Solution
## User Stories
## Implementation Decisions
## Testing Decisions
## Out of Scope
## Further Notes
```

Task issue 使用 vertical slice / tracer bullet：

```md
## Parent
## What to build
## Acceptance criteria
## Blocked by
## ByteTrue Source
```

Bug issue 至少包含：

```md
## Problem
## Reproduction
## Expected vs Actual
## Diagnosis Status
## Acceptance / Regression
## ByteTrue Source
```

### 3. 用户确认后再执行

提供三个选择：

1. 创建新的外部 issue。
2. 绑定已有 issue URL / id。
3. 暂不同步。

用户确认前不要调用 `gh issue create` / `glab issue create` / edit 命令。

### 4. 创建或更新

GitHub：

```bash
gh issue create --title "$TITLE" --body-file "$BODY_FILE" --label "$LABELS"
gh issue edit "$ID" --body-file "$BODY_FILE" --add-label "$LABELS"
```

GitLab：

```bash
glab issue create --title "$TITLE" --description-file "$BODY_FILE" --label "$LABELS"
glab issue update "$ID" --description-file "$BODY_FILE" --label "$LABELS"
```

具体参数以本机 CLI help 为准；不确定时先运行 `gh issue create --help` 或 `glab issue create --help`。

### 5. 回写 metadata

成功后把 external metadata 写回源产物，不做中央 sync DB：

```yaml
external:
  provider: github
  kind: task
  id: 123
  url: https://github.com/org/repo/issues/123
  sync_mode: created | linked_existing
  synced_at: 2026-06-07T10:00:00Z
```

roadmap item 的 metadata 写在 `items.yaml` 对应 item 上；feature / issue / roadmap PRD 写在 frontmatter。

---

## managed block 更新规则

外部 issue body 中只管理 ByteTrue block：

```md
<!-- bytetrue:managed:start -->
Generated from .bytetrue source.
<!-- bytetrue:managed:end -->
```

更新时只替换 block 内内容，保留团队手写内容和评论。找不到 managed block 时，先问用户是插入 block、覆盖 body、还是取消。

---

## 状态和 labels

ByteTrue 使用 canonical keys，外部 label 名称来自 `project-management.md`：

- `prd`
- `task`
- `bug`
- `ready_for_agent`
- `needs_info`
- `ready_for_human`
- `wontfix`

非破坏性状态可以同步成 labels。关闭外部 issue 前必须询问用户；外部状态变化不自动回写 `.bytetrue/`。

---

## triage：external tracker → 人工判断 → ByteTrue

triage 只处理外部 incoming queue，不自动修改 `.bytetrue`。

### 1. 列出需要关注的 issue

按 oldest first 展示三桶：

1. unlabeled：从未 triage。
2. `needs-triage`：等待 maintainer 评估。
3. `needs-info` 且 reporter 有新回复：需要重新评估。

每个 issue 只列：id、title、labels、更新时间、一句话摘要。

### 2. triage 单个 issue

读取完整 body / comments / labels / reporter / dates；如果有历史 triage notes，先解析，避免重复问。

给出推荐：

- category：`bug | task | prd | question | out_of_scope`
- state：`needs_info | ready_for_agent | ready_for_human | wontfix | needs_triage`
- reasoning：为什么
- ByteTrue route：进入 `bt-issue` / `bt-feat` / `bt-roadmap` / `bt-grill` / 暂不进入

bug 必须先尝试复现或说明为什么无法复现；不要直接 grill reporter。

### 3. 用户确认后才改外部 tracker

任何 triage comment 都必须以这句开头：

> *This was generated by AI during triage.*

- `needs_info`：发 triage notes，问具体缺失信息。
- `ready_for_agent`：发 agent brief，说明可由 agent 独立处理。
- `ready_for_human`：说明为什么需要人类判断 / 权限 / 设计 review。
- `wontfix`：礼貌说明原因；关闭前再次确认。

### 4. 路由回 ByteTrue

用户确认某个外部 issue 应进入 ByteTrue 后：

- bug → `bt-issue-report`
- 小 feature / task → `bt-brainstorm` 或 `bt-feat`
- 大需求 / PRD → `bt-roadmap`
- 方案不清 → `bt-grill`

进入 ByteTrue 后，external issue 仍只是输入来源；`.bytetrue` 产物才是后续 canonical source。

---

## 退出条件

- [ ] 已读取 `project-management.md` 并确认 provider。
- [ ] 外部副作用前已展示预览并获得用户确认。
- [ ] publish/link/update 成功后已回写 external metadata。
- [ ] triage 模式没有自动修改 `.bytetrue`。
- [ ] 所有外部 comment 都带 AI triage disclaimer。

---

## 不做的事

- 不替代 `bt-roadmap` / `bt-feat` / `bt-issue` 的主流程。
- 不把外部 tracker 当 canonical source。
- 不从外部 issue 自动回写 `.bytetrue`。
- 不自动关闭外部 issue。
- 不设计 API / token / SDK adapter；只使用 `gh` / `glab` CLI。
