# ByteTrue 架构总入口

> 状态：骨架（待填充）
> 创建日期：2026-06-07

## 1. 项目简介

ByteTrue 是一个面向严肃工程的 AI 编码工作流。它不是单个 skill，而是一个多 skill bundle：仓库根目录下每个包含 `SKILL.md` 的一级目录都是一个独立 ByteTrue skill。

ByteTrue 的核心目标是编排软件生命周期，而不是编排 Agent。它围绕 requirement、architecture、feature、issue、decision、learning、trick、explore 等软件实体，把需求、约束、决策和实现过程沉淀到项目内 `.bytetrue/` 文件树。

## 2. 核心概念 / 术语表

- **ByteTrue**：工作流品牌与项目名。
- **`bt`**：ByteTrue 根入口 skill，只负责介绍体系和路由。
- **`bt-*`**：ByteTrue 子技能命名空间。
- **`.bytetrue/`**：使用 ByteTrue 的目标项目内的持久上下文目录。
- **skill bundle repo**：一个仓库包含多个 skill 目录，每个目录各有自己的 `SKILL.md`。
- **additive 增强**：第一阶段只新增能力或路由，不重写已有 `bt` 核心流程。

## 3. 子系统 / 模块索引

- `bt/`：根入口和路由。
- `bt-onboard/`：为项目创建 `.bytetrue/` 骨架，并释放共享 tools/reference。
- `bt-brainstorm/`：模糊想法分诊入口。
- `bt-grill/`：方案拷问 / stress-test，默认读取 `.bytetrue/` 与代码上下文。
- `bt-feat*/`：新功能 design → implement → accept 流程。
- `bt-issue*/`：bug report → analyze → fix 流程。
- `bt-refactor*/`：行为不变的重构流程。
- `bt-roadmap/`：大需求拆解与规划。
- `bt-req/`、`bt-arch/`：需求愿景与架构现状维护。
- `bt-learn/`、`bt-trick/`、`bt-decide/`、`bt-explore/`、`bt-note/`：知识沉淀类能力。
- `browser-bridge/`：真实浏览器控制辅助 skill。
- `asset/`：README 使用的图片资源。

## 4. 关键架构决定

- 当前保持 `bt-*` 命名和 `.bytetrue/` 项目目录。
- 第一阶段只做 additive 增强：新增能力、路由或阶段纪律优先，不重写现有核心流程。
- `bt-grill` 默认 with-docs 模式必须像 Matt `grill-with-docs` 一样写入项目文档；ByteTrue 版 CONTEXT.md 为 `.bytetrue/reference/domain-context.md`。
- Matt `to-prd` / `to-issues` / `triage` 吸收为统一 external tracker bridge：`bt-tracker`。`.bytetrue/` 仍是 canonical source of truth，GitHub/GitLab/local tracker 只是 projection / intake 扩展。
- 本地自举开发优先使用 symlink 安装；`npx skills` 本地路径安装可用于正式复制式安装和 CLI 管理。

## 5. 已知约束 / 硬边界

- 不把既有 README / AGENTS / CLAUDE 等文件移动进 `.bytetrue/`，除非用户明确确认迁移策略。
- 不把未拍板的讨论写成 decision。
- Matt skills 吸收不做复制改名；必须融入 ByteTrue 现有生命周期。
- 本次 Matt engineering/productivity 吸收范围排除 `caveman`、`write-a-skill`、`prototype`、`handoff`。
