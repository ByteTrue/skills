# ByteTrue Domain Context

本文档是 ByteTrue 版 `grill-with-docs` 的 CONTEXT.md 等价物，记录本项目的 canonical terms、领域语言和术语边界。

`bt-grill` 默认 with-docs 模式中，如果讨论澄清了术语或语言共识，必须更新本文档；`bt-grill --lite` 不读写本文档。

---

## Canonical Terms

- **ByteTrue**：本工作流体系的品牌名；面向严肃工程的 AI 编码工作流。
- **`bt`**：ByteTrue 根入口 skill，只负责路由和体系介绍，不替子技能做事。
- **`bt-*`**：ByteTrue 子技能命名空间。
- **`.bytetrue/`**：目标项目内的 ByteTrue canonical source of truth。
- **additive 增强**：在不重写既有 ByteTrue 主流程的前提下，新增能力、路由或阶段纪律。
- **with-docs grill**：`bt-grill` 默认模式；读取 `.bytetrue/` 文档和代码上下文，并把形成的共识写入合适 ByteTrue 文档。
- **lite grill / grill-me**：`bt-grill --lite` / `--no-docs`；纯对话拷问，不读写 `.bytetrue` 文档，但可按需读代码回答事实问题。
- **external tracker**：GitHub / GitLab / local tracker 等团队协作界面，不是 ByteTrue 的主状态源。
- **projection**：从 `.bytetrue` confirmed 产物同步到 external tracker 的展示/协作副本。

---

## Term Boundaries

### PRD

在 ByteTrue 中，PRD 不是本地独立实体，不新增 `.bytetrue/prds/`。

- 本地 canonical source：`requirements/`、`roadmap/`、`features/`。
- 外部展示形态：GitHub/GitLab 上的 parent PRD issue。
- 大需求 PRD 优先由 roadmap 生成；小需求可由 feature design 生成轻量 external issue。

### Issue

ByteTrue 本地 `.bytetrue/issues/` 只表示 bug / 异常 / 文档错误等修复流程。

External tracker 的 issue 是更宽的协作载体，可表示：

- PRD parent issue。
- roadmap item / feature design 对应的 task issue。
- ByteTrue bug issue 对应的 bug issue。

不要把 external tracker 上所有 issue 都映射成 `.bytetrue/issues/`。

### Sync vs Triage

- **publish / sync**：`.bytetrue` confirmed 产物 → external tracker。
- **triage**：external tracker incoming issue → 人工分类和路由建议。

二者统一由 `bt-tracker` 承载，但方向和副作用不同。

---

## Matt Skills Absorption Terms

- **absorb / 吸收**：把 Matt skill 的方法论、检查点、模板或纪律融入 ByteTrue 生命周期；不是复制 skill 改名。
- **engineering + productivity scope**：本次只吸收 Matt skills 中选定的 10 个能力：`grill-me`、`grill-with-docs`、`setup-matt-pocock-skills`、`to-prd`、`to-issues`、`triage`、`diagnose`、`tdd`、`improve-codebase-architecture`、`zoom-out`。
- **excluded skills**：`caveman`、`write-a-skill`、`prototype`、`handoff` 不进入本次吸收范围。

---

## Architecture Improvement Terms

- **deep module**：小而稳定的 public interface 背后隐藏较多复杂度，调用方不需要理解内部细节。
- **shallow module**：接口和实现一样复杂，常见表现是只转发、只改名、只增加一层无意义 wrapper。
- **seam**：行为可以被替换、测试、隔离的位置；好的 seam 能让测试通过 public interface 表达行为。
- **adapter**：seam 后面的具体实现，用来把外部系统或复杂细节关在边界内。
- **deletion test**：想象删掉某模块；复杂度若只是散回多个调用方，说明它可能承担真实职责；复杂度若直接消失，说明它可能是浅层包装。
- **architecture friction candidate**：架构改善候选。它只是候选，不等于可以直接改；先按 `bt-audit` / `bt-refactor` / `bt-grill` 判断是否进入对应流程。
- **zoom-out**：上升一层看模块边界、调用方地图、public interface 和依赖关系；在 ByteTrue 中由 `bt-explore module-overview` 承接。
