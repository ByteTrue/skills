# ByteTrue 架构总入口

> 状态：骨架（待填充）
> 创建日期：2026-06-07

## 1. 项目简介

ByteTrue 是一个面向严肃工程的 AI 编码工作流。它不是单个 skill，而是一个多 skill bundle：仓库 `skills/` 下每个包含 `SKILL.md` 的一级目录都是一个独立 ByteTrue skill。

ByteTrue 的核心目标是编排软件生命周期，而不是编排 Agent。它围绕 requirement、architecture、feature、issue、decision、learning、trick、explore 等软件实体，把需求、约束、决策和实现过程沉淀到项目内 `.bytetrue/` 文件树。

## 2. 核心概念 / 术语表

- **ByteTrue**：工作流品牌与项目名。
- **`bt`**：ByteTrue 根入口 skill，只负责介绍体系和路由。
- **`bt-*`**：ByteTrue 子技能命名空间。
- **`.bytetrue/`**：使用 ByteTrue 的目标项目内的持久上下文目录。
- **skill bundle repo**：一个仓库包含多个 skill 目录；本仓库 canonical skill 源码位于 `skills/{skill-name}/SKILL.md`。
- **additive 增强**：第一阶段只新增能力或路由，不重写已有 `bt` 核心流程。

## 3. 子系统 / 模块索引

- `skills/bt/`：根入口和路由。
- `skills/bt-onboard/`：为项目创建 `.bytetrue/` 骨架，并释放共享 tools/reference。
- `skills/bt-brainstorm/`：模糊想法分诊入口。
- `skills/bt-grill/`：方案拷问 / stress-test，默认读取 `.bytetrue/` 与代码上下文。
- `skills/bt-feat*/`：新功能 design → implement → accept 流程。
- `skills/bt-issue*/`：bug report → analyze → fix 流程。
- `skills/bt-refactor*/`：行为不变的重构流程。
- `skills/bt-roadmap/`：大需求拆解与规划。
- `skills/bt-req/`、`skills/bt-arch/`：需求愿景与架构现状维护。
- `skills/bt-learn/`、`skills/bt-trick/`、`skills/bt-decide/`、`skills/bt-explore/`、`skills/bt-note/`：知识沉淀类能力。
- `skills/browser-bridge/`：真实浏览器控制辅助 skill。
- `asset/`：README 使用的图片资源。

## 4. 关键架构决定

- 当前保持 `bt-*` 命名和 `.bytetrue/` 项目目录。
- 第一阶段只做 additive 增强：新增能力、路由或阶段纪律优先，不重写现有核心流程。
- `bt-grill` 默认 with-docs 模式必须像 Matt `grill-with-docs` 一样写入项目文档；ByteTrue 版 CONTEXT.md 为 `.bytetrue/reference/domain-context.md`。
- Matt `to-prd` / `to-issues` / `triage` 吸收为统一 external tracker bridge：`bt-tracker`。`.bytetrue/` 仍是 canonical source of truth，GitHub/GitLab/local tracker 只是 projection / intake 扩展。
- 本地自举开发优先使用 symlink 安装；`npx skills` 本地路径安装可用于正式复制式安装和 CLI 管理。
- 根目录 `package.json` 是 pi package manifest；`pi.skills` 注册 `skills/*/SKILL.md`，让现有多 skill bundle 可通过 `pi install git:github.com/ByteTrue/skills` 安装。根目录 `.claude-plugin/` 同时声明 Claude Code plugin / marketplace，复用同一套 `skills/` 源码。
- Feature design 可以声明 Behavior Delta；feature acceptance 负责用证据 materialize 这些 delta 到既有 requirements / architecture / compound 层，或标记为 acceptance-only。ByteTrue 不维护独立 `.bytetrue/specs/` 行为事实层。
- ByteTrue 使用 execution modes 决定工作流轻重：`light` 保持轻量但仍需可信验证，`standard` 使用常规阶段流，`strict-evidence` 是触发式严格证据模式而非全局默认，`break-loop` 会停止继续实现并回到计划或架构讨论。
- Feature implementation 进入 acceptance 前必须经过 Implementation Review Gate：先检查 spec compliance，再检查 code quality；这个 gate 只是验收入口条件，不能替代 `bt-feat-accept` 的独立验收与文档写回。
- Feature design 批准后会为标准功能生成 feature-local Context Manifest：`{slug}-impl-context.jsonl` 给 implementation 读，`{slug}-check-context.jsonl` 给 acceptance / check 读；manifest 只是阶段 handoff read-set，不是新的事实层，也不复制文档正文。
- ByteTrue 的 subagent handoff 是可选执行基础设施：父会话保留 scope、用户对齐、最终 synthesis 和 lifecycle transition；子代理或内联角色只执行 bounded `implement` / `check` / `research` 任务，并通过 Active Work Block + context manifest 获得上下文。
- ByteTrue 使用 research-first 作为 evidence-before-decision 纪律：当技术选择、外部 API / library / platform 能力或可比较工作流事实会改变设计、roadmap 或 grill 方向时，先通过 `bt-explore` 的 `type: spike` 归档证据，再由用户确认最终选择；这不新增事实层。

## 5. 已知约束 / 硬边界

- 不把既有 README / AGENTS / CLAUDE 等文件移动进 `.bytetrue/`，除非用户明确确认迁移策略。
- 不把未拍板的讨论写成 decision。
- Matt skills 吸收不做复制改名；必须融入 ByteTrue 现有生命周期。
- 本次 Matt engineering/productivity 吸收范围排除 `caveman`、`write-a-skill`、`prototype`、`handoff`。
