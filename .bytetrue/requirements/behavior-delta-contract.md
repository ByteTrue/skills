---
doc_type: requirement
slug: behavior-delta-contract
pitch: ByteTrue 用户可以在功能设计中明确行为变化，并在验收时把它们写回正确的事实层。
status: current
last_reviewed: 2026-06-11
implemented_by: [ARCHITECTURE]
tags: [feature-workflow, behavior-delta, acceptance, openspec]
---

# 行为变更契约

## 用户故事

- 作为 ByteTrue feature design 的读者，我希望一眼看出本次功能新增、修改、移除或重命名了哪些可观察行为，而不是从散落的验收场景里重组。
- 作为 feature acceptance 的执行者，我希望每个行为变化都有证据和写回目标，这样验收不会只停留在“看起来完成”。
- 作为后续功能的设计者，我希望稳定行为已经回到 requirements、architecture 或 compound，而不是只能翻历史 feature report。

## 为什么需要

ByteTrue 原本已经有 design、checklist 和 acceptance，但行为变化分散在需求摘要、场景清单和架构归并里。随着工作流吸收 OpenSpec 的 delta 思想，如果没有一个轻量契约，后续 agent 容易漏掉“这次到底改变了什么行为”，也容易在验收时只写报告而不把稳定结果沉淀回现有事实层。

## 怎么解决

Feature design 增加 Behavior Delta，用 ADDED、MODIFIED、REMOVED、RENAMED 描述可观察行为变化；feature acceptance 增加 Delta Materialization，用证据确认每条 delta，并决定写回 requirements、architecture、compound，或只保留在 acceptance report 中。

## 边界

- 不新增 `.bytetrue/specs/` 行为事实层。
- 不新增独立 `{slug}-delta.md` 文件。
- 不要求 implementation 直接更新 requirements 或 architecture；实际写回发生在 acceptance。
- 不覆盖 risk mode、context manifest、subagent handoff、hook/breadcrumb 或 worklog，这些由后续 roadmap item 处理。
