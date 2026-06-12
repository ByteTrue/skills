---
doc_type: requirement
slug: subagent-handoff-roles
pitch: ByteTrue 用统一 handoff 协议把 implement / check / research 工作交给子代理或内联角色，确保子代理拿到 active work、design、checklist 和 context manifest，而不是依赖父会话记忆。
status: done
current: true
last_reviewed: 2026-06-11
implemented_by: [2026-06-11-subagent-handoff-roles]
tags: [workflow, subagent, handoff, execution-context]
---

# Subagent Handoff Roles

## 用户故事

- 作为主会话编排者，我希望把实现、检查或研究工作交给子代理时，有一个固定 prompt contract，而不是每次临场拼接上下文。
- 作为子代理执行者，我希望一开始就知道 active work、角色、design、checklist、context manifest、可写边界和停止规则。
- 作为不支持 subagent 的工具使用者，我希望同一套 role contract 仍可内联执行，而不会把 ByteTrue 变成 Pi-only 或 Claude-only。

## 为什么需要

`context-manifest-contract` 已经定义了 implement/check 两个 read-set。下一步需要定义谁消费这些 read-set，以及交接时必须给出哪些固定字段。Trellis 的经验是：子代理 prompt 必须有稳定的 active-task/manifest 前缀；Pi subagents 的经验是父会话必须保留编排权，孩子只执行具体角色任务，不能自行继续 fanout 或替父会话做最终验收判断。

## 边界

- 不实现 hook / breadcrumb；runtime adapter 不属于 ByteTrue core。
- 不实现 research-first 触发路由；那属于 `research-first-explore-integration`。
- 不创建 project-specific `.pi/agents` 或 `.claude/agents`；本 feature 只定义 handoff prompt protocol。
- 不要求所有工具都支持 subagent；无 subagent 的工具按同一 role contract 内联执行。
- 不允许子代理绕过 design / checklist / context manifest 做最终验收。