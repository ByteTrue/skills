---
doc_type: requirement
slug: workflow-control-plane-contract
pitch: ByteTrue 需要把项目配置、统一状态词表、续接扫描、开放 brainstorm 目录、行为沉淀和 auto 模式边界收束成 skills-first control-plane 口径。
status: done
current: true
last_reviewed: 2026-06-12
implemented_by: [2026-06-12-workflow-control-plane-contract]
tags: [workflow, config, status, auto, brainstorm]
---

# Workflow Control Plane Contract

## 用户故事

- 作为 ByteTrue 用户，我希望 tracker、workflow mode、dispatch、ask-before 等配置值集中在 `.bytetrue/config.yaml`，而不是散在说明文档中。
- 作为 AI/人类维护者，我希望所有 ByteTrue artifact 的 `status` 只使用统一词表，避免每层发明 `approved/current/confirmed/completed` 等不同状态词。
- 作为用户，我希望新会话里说“bt 继续某个 feature”时，AI 能从少量 artifact 判断下一步，而不是误把已完成历史目录当成进行中任务。
- 作为 brainstorm 用户，我希望开放式大讨论有明确目录，不和 feature-local brainstorm note 混淆。
- 作为 feature 用户，我希望 Behavior Delta 在验收后沉淀回 ByteTrue 自己的 requirements / architecture，而不是只停在 acceptance 表格里。

## 为什么需要

AI workflow absorption 已经增加了 behavior delta、execution modes、implementation report、context manifest、subagent handoff、research-first 和 worklog。下一步需要控制面口径，让配置、状态、续接和行为沉淀更稳定，并让 auto / auto-preview 字段被 workflow skills 实际消费。

## 边界

- 不新增 `.bytetrue/specs/`。
- 不实现 hidden runtime、hook、daemon、background agent 或 custom dispatcher。
- 不做物理 archive 迁移。
- 不实现完整 CLI；auto mode 只作为 pure-skills 续跑语义，不新增 daemon / hook / background executor。
