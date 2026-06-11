---
doc_type: requirement
slug: research-first-explore-integration
pitch: ByteTrue 在技术选择、外部库/API 行为、平台能力或可比较工作流会影响设计方向时，先通过 bt-explore spike 留下证据，再进入设计、roadmap 或 grill 决策。
status: current
last_reviewed: 2026-06-11
implemented_by: [2026-06-11-research-first-explore-integration]
tags: [workflow, research-first, explore, evidence]
---

# Research-first Explore Integration

## 用户故事

- 作为设计者，我希望在技术选择或外部工作流吸收前先看到证据，而不是让用户凭印象给选项。
- 作为 roadmap 作者，我希望大需求拆解前引用已经归档的 explore spike，避免后续 feature 重新争论同一个事实。
- 作为未来实现/检查者，我希望 context manifest 能引用相关 explore 证据，让实现和验收不会漏读前期调研结论。

## 为什么需要

ByteTrue 已经有 `bt-explore`，但它更多是被用户显式触发。Trellis 的 research-first 思路提醒我们：当方向取决于外部工具行为、库/API 能力、行业惯例、平台 hook 能力或可比较工作流时，AI 应优先查证据并归档，再让用户做取舍。这样能减少“凭感觉设计”和重复调研。

## 边界

- 不新增 research 目录；继续使用 `.bytetrue/compound/YYYY-MM-DD-explore-{slug}.md`。
- 不让 explore 做最终决策；最终设计、roadmap、decision 仍需用户确认。
- 不强制所有需求都 research-first；只在事实会改变方向时触发。
- 不实现 subagent dispatch、hook、breadcrumb、worklog 或 CLI。