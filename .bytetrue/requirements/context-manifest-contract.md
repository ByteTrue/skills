---
doc_type: requirement
slug: context-manifest-contract
pitch: ByteTrue 用显式 context manifest 告诉 implement 和 check 阶段必须读取哪些项目事实、设计约束和探索证据，减少后续阶段漏读上下文。
status: current
last_reviewed: 2026-06-11
implemented_by: [2026-06-11-context-manifest-contract]
tags: [workflow, context-manifest, implementation-context, check-context]
---

# Context Manifest Contract

## 用户故事

- 作为实现者，我希望 feature design 批准后能看到一份明确的 implement context 清单，而不是自己猜哪些 `.bytetrue` 文档必须读。
- 作为检查者，我希望 acceptance / check 阶段有一份独立的 check context 清单，覆盖设计契约、behavior delta、checklist、相关 decisions 和 explore 证据。
- 作为未来 subagent 调度能力的使用者，我希望上下文选择先被稳定成文件契约，后续 subagent 只消费这份契约，而不是重新发明提示词。

## 为什么需要

当前 `bt-feat-design` 会产出 design 和 checklist，`bt-feat-impl` / `bt-feat-accept` 依靠技能规则自行读取相关上下文。这个方式对主会话可用，但当工作变长、跨阶段恢复或未来引入 subagent 时，容易出现“实现者读了 design 但漏读 roadmap contract / decision / explore 证据”的问题。Trellis 的价值点之一是 curated context injection。ByteTrue 需要吸收这个机制，但保持 `.bytetrue` 现有事实分层，不新增 parallel spec 层。

## 边界

- 不实现 subagent dispatch；那属于 `subagent-handoff-roles`。
- 不实现 hook / breadcrumb；那属于 `optional-runtime-breadcrumb`。
- 不实现 research-first 路由；那属于 `research-first-explore-integration`。
- 不把 raw code files 作为 manifest 默认内容；manifest 优先引用 `.bytetrue` 文档和 explore / decision 证据。
- 不替代 design / checklist / acceptance report；manifest 只是读取清单。
