---
doc_type: requirement
slug: implementation-review-gate
pitch: ByteTrue 在进入验收前先分开检查规格符合度和代码质量，避免把实现漂移或低质量改动推给 acceptance 才发现。
status: current
last_reviewed: 2026-06-11
implemented_by: [2026-06-11-implementation-review-gate]
tags: [workflow, implementation-review, spec-compliance, code-quality]
---

# Implementation Review Gate

## 用户故事

- 作为功能实现者，我希望在宣布实现完成前先明确检查是否符合设计，而不是只报告“代码改完了”。
- 作为验收者，我希望看到规格符合度和代码质量是两个独立结论，这样不会用“代码看起来不错”掩盖行为漂移。
- 作为未来接手的 AI 或开发者，我希望 implementation report 能留下可审计证据，说明非目标没有被偷偷实现、临时代码没有留下、反射检查已经处理。

## 为什么需要

当前 `bt-feat-impl` 已有 completion report、reflection self-audit 和 acceptance-scenario self-check，但缺少一个命名的 review gate。Superpowers 的强项是先做 spec compliance review，再做 code quality review。ByteTrue 需要吸收这个纪律，但不能依赖 subagent；第一版必须 inline 可执行，后续再由 subagent 强化。

## 边界

- 不实现 subagent 分派；那属于 `subagent-handoff-roles`。
- 不实现 context manifest；那属于 `context-manifest-contract`。
- 不替代 `bt-feat-accept`；acceptance 仍然独立验收和写回 architecture / requirement / roadmap。
- 不做通用代码审查系统，只定义 ByteTrue feature implementation 进入 acceptance 前的最低 review gate。
