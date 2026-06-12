---
doc_type: requirement
slug: execution-modes
pitch: ByteTrue 可以按任务风险选择轻量、标准、严格证据或破循环工作流。
status: done
current: true
last_reviewed: 2026-06-11
implemented_by: [ARCHITECTURE]
tags: [workflow, execution-mode, risk, evidence]
---

# 执行模式分级

## 用户故事

- 作为 ByteTrue 用户，我希望简单任务不要被重流程拖慢，但高风险任务必须有足够证据。
- 作为功能设计者，我希望在设计阶段明确本次实现需要轻量、标准、严格证据还是破循环处理。
- 作为修 bug 的人，我希望重复修不好时系统提醒我质疑根因或架构，而不是继续堆补丁。

## 为什么需要

ByteTrue 已经有 feature、issue、refactor 和 fastforward 等不同路径，但过去这些路径之间缺少统一的“轻重选择”语言。Superpowers 的严格纪律很有价值，但如果全局强制会让简单任务过重；如果只当建议，又无法保护高风险任务。

## 怎么解决

ByteTrue 使用 `light`、`standard`、`strict-evidence`、`break-loop` 四档 execution mode。设计或分析阶段根据风险触发器选择档位；实现、修复、fastforward 和 refactor 阶段按档位执行相应证据要求或停止规则。

## 边界

- 不替代 `code-dimensions.md` 的代码质量档位。
- 不要求所有任务都走严格 TDD。
- 不实现 subagent review、context manifest、hook/breadcrumb 或 worklog。
- 不新增 CLI 或运行时状态文件。
