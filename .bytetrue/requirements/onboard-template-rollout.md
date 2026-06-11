---
doc_type: requirement
slug: onboard-template-rollout
pitch: ByteTrue 在完成 AI workflow absorption 后，需要一次最终模板发布和安装投影同步，确保新项目 onboard 能拿到完整 reference、worklog、README 安装说明和一致的 skill-package-managed 文件清单。
status: current
last_reviewed: 2026-06-11
implemented_by: [2026-06-11-onboard-template-rollout]
tags: [onboard, templates, rollout, install]
---

# Onboard Template Rollout

## 用户故事

- 作为新项目用户，我希望 `bt-onboard` 创建的 `.bytetrue/` 骨架包含本轮 roadmap 新增的所有共享 reference 和目录。
- 作为维护者，我希望当前项目 `.bytetrue/reference/` 与 `skills/bt-onboard/reference/` 的 skill-package-managed 文件口径一致，同时不覆盖 project-owned 配置。
- 作为安装用户，我希望 README 和 package/plugin metadata 明确 ByteTrue core 是 skills-only，不暗示包含 runtime extension。

## 为什么需要

`behavior-delta-contract` 到 `worklog-report-feed` 已经逐项落地，但这些改动跨越 feature skills、onboard templates、current `.bytetrue/reference/`、README 和 architecture/requirements。最后一个 roadmap item 的价值是做一次分发层收尾：验证所有新增 workflow contract 都能通过 onboard 进入新项目，并更新安装/维护说明，避免新项目拿到半旧模板。

## 边界

- 不重新设计前面 8 个 feature 的 workflow contract。
- 不覆盖 project-owned `domain-context.md` / `project-management.md` 内容。
- 不新增新的 workflow 能力；只做模板、索引、安装投影和文档一致性收尾。
- 不发布 npm / marketplace，也不 push。
