---
doc_type: roadmap
slug: matt-skills-absorption
status: done
created: 2026-06-07
last_reviewed: 2026-06-07
tags: [bytetrue, matt-skills, additive, workflow-integration]
related_requirements: []
related_architecture: [ARCHITECTURE]
---

# Matt Skills Absorption Roadmap

## 1. 背景

本 roadmap 记录 ByteTrue 对 Matt Pocock skills 中 engineering + productivity 子集的吸收方案。

吸收不是复制 skill 并改名，而是把 Matt 的方法论、检查点、模板和执行纪律融入 ByteTrue 现有生命周期。只有 ByteTrue 没有承载点时，才新增独立入口。

ByteTrue 仍以 `.bytetrue/` 为 canonical source of truth。GitHub / GitLab / local tracker 只是外部协作 projection。

## 2. 范围

本次吸收 10 个技能：

| Matt skill | ByteTrue 承载点 | 结论 |
|---|---|---|
| `grill-me` | `bt-grill --lite` | 纯对话拷问，基本原样吸收 |
| `grill-with-docs` | `bt-grill` | 默认模式，读写 ByteTrue 文档 |
| `setup-matt-pocock-skills` | `bt-onboard` | 初始化 domain/project-management reference |
| `to-prd` | `bt-tracker` + `bt-roadmap` / `bt-feat-design` | 外部 PRD parent issue projection |
| `to-issues` | `bt-tracker` + `bt-roadmap` | external task issue 拆解与发布 |
| `triage` | `bt-tracker` | external incoming issue queue 分诊 |
| `diagnose` | `bt-issue-analyze` / `bt-issue-fix` | 复杂 bug 诊断纪律 |
| `tdd` | `bt-feat-design` / `bt-feat-impl` / `bt-issue-fix` | 实现纪律，不新增 skill |
| `improve-codebase-architecture` | `bt-audit` / `bt-refactor` / `bt-grill` / `bt-arch` / `bt-explore` | 架构判断语言与候选发现方法 |
| `zoom-out` | `bt-explore` / `bt-arch` / `bt` 路由 | module-overview 触发语 |

明确不吸收：`caveman`、`write-a-skill`、`prototype`、`handoff`。

## 3. 设计原则

1. 保持 additive，不重写 ByteTrue 已有核心流程。
2. 先找现有承载点；没有承载点才新增独立 skill。
3. 不新增 `.bytetrue/prds/`；PRD 是 external tracker 展示形态。
4. `.bytetrue/` 是主状态源；external tracker 不反向主导 ByteTrue。
5. with-docs grill 每次都要更新合适的 ByteTrue 文档，不能只停留在对话里。
6. gh / glab 集成只使用本地 CLI adapter，不设计 API / token / SDK。

## 4. 新增 / 更新的共享文档

### `.bytetrue/reference/domain-context.md`

ByteTrue 版 `CONTEXT.md`，承载：

- canonical terms。
- domain glossary。
- 术语边界。
- grill 过程中形成的语言共识。

`bt-grill` 默认 with-docs 模式必须读写它；`bt-grill --lite` 不读写它。

### `.bytetrue/reference/project-management.md`

承载 external tracker 配置和规则：

- provider：`local | github | gitlab`。
- `gh` / `glab` CLI 检测与 auth 状态。
- canonical labels 到团队 labels 的映射。
- sync policy / status sync / managed block。
- syncable sources 与 external metadata 存放位置。

## 5. `bt-tracker`

新增统一 external tracker bridge，吸收 Matt `to-prd`、`to-issues`、`triage`。

职责：

- `setup`：读取/维护 `project-management.md`。
- `publish`：把符合可同步源和可同步状态映射的 ByteTrue 产物发布到 GitHub/GitLab/local tracker。
- `link`：绑定已有 external issue。
- `triage`：读取 external incoming issues，给出分诊和路由建议。

不负责：

- 需求澄清：走 `bt-brainstorm` / `bt-grill`。
- 大需求拆解：走 `bt-roadmap`。
- bug 分析修复：走 `bt-issue`。

## 6. External tracker 映射

Syncable sources：

- roadmap PRD → external PRD parent issue。
- roadmap item → external task issue。
- feature design → external task issue。
- bug issue → external bug issue。

Standalone requirement 默认不单独同步，只作为 PRD / feature issue 的愿景输入材料。

External metadata 直接写回源产物，不做中央 sync DB。

## 7. 流程增强

### `bt-grill`

- 默认 with-docs：读 `.bytetrue/`，并把共识写入合适文档。
- lite：对应 Matt `grill-me`，不读写 `.bytetrue` 文档。
- 术语共识写 `domain-context.md`。
- 持久决策走 `bt-decide` / compound decision。

### `bt-onboard`

- 新项目创建 `domain-context.md`。
- 新项目创建 `project-management.md`。
- 询问 provider：local / github / gitlab。
- 对 gh / glab 做 CLI、auth、remote 检查。

### `bt-issue`

- 普通 bug 继续走现有 report → analyze → fix。
- 复杂 bug 吸收 `diagnose`：feedback loop、多可证伪假设、非确定性复现率、instrumentation 清理、regression test seam、post-mortem。

### `bt-feat`

- 吸收 `tdd`：行为测试优先、public interface、vertical slice / tracer bullet、one test → minimal code → repeat、never refactor while red。
- 不强制简单 UI / 配置变更走 TDD。

### `bt-audit` / `bt-refactor` / `bt-arch` / `bt-explore`

- 吸收 `improve-codebase-architecture` 的判断语言：deep module、shallow module、seam、adapter、deletion test、interface as test surface。
- `zoom-out` 融入 `bt-explore module-overview`。

## 8. 完成标准

- 10 个目标 Matt skills 均有明确承载点。
- 4 个排除 skill 明确记录不吸收理由。
- `bt-grill` with-docs 默认会更新文档。
- `bt-onboard` 会初始化 domain/project-management reference。
- `bt-tracker` 成为外部 tracker 唯一入口。
- 现有 ByteTrue 主流程仍以 `.bytetrue/` 为主状态源。
