---
doc_type: requirement
slug: optional-runtime-breadcrumb
pitch: ByteTrue 提供一个可选 runtime breadcrumb，让支持 runtime 注入的工具在每轮开始前看到当前 ByteTrue 阶段、活动产物、下一步和守卫规则，同时不让它成为新的事实源。
status: current
last_reviewed: 2026-06-11
implemented_by: [2026-06-11-optional-runtime-breadcrumb]
tags: [workflow, runtime, breadcrumb, pi-extension]
---

# Optional Runtime Breadcrumb

## 用户故事

- 作为使用 Pi 的 ByteTrue 用户，我希望每轮 agent 开始前自动看到当前 ByteTrue 阶段和下一步，减少长会话里跳错阶段的风险。
- 作为使用不支持 runtime hook 的工具用户，我希望同一套 breadcrumb 规则仍然能作为参考文档使用，而不是让核心流程依赖某个 harness。
- 作为维护者，我希望 breadcrumb 从已有 `.bytetrue` artifact 派生，而不是新增一个会漂移的状态文件。

## 为什么需要

ByteTrue 已经通过 design、checklist、context manifest 和 subagent handoff 固化了阶段边界，但这些规则仍需要 agent 主动读取。Trellis 的 workflow-state breadcrumb 提醒我们：在 runtime 层每轮注入“现在处于什么阶段、下一步做什么、不要做什么”，能降低长任务里的阶段漂移。

## 边界

- 不新增 canonical state 文件；breadcrumb 只从现有 `.bytetrue` artifact 派生。
- 不让 breadcrumb 覆盖文件事实；文件内容永远优先。
- 不把 hook / extension 设为核心流程硬依赖；无 runtime 注入的工具仍按 skills + artifacts 工作。
- 不实现 subagent dispatch、research-first、worklog 或 CLI。
