---
doc_type: roadmap
slug: ai-workflow-absorption
status: done
created: 2026-06-11
last_reviewed: 2026-06-12
tags: [bytetrue, openspec, superpowers, trellis, workflow-integration, execution-infrastructure]
related_requirements: []
related_architecture: [ARCHITECTURE]
---

# AI Workflow Absorption Roadmap

> Detailed executable interface contracts are split into `ai-workflow-absorption-contracts.md` to keep the roadmap documents focused. Feature-design must treat that companion file as part of this roadmap's hard constraints.

## 1. Background

本 roadmap 规划 ByteTrue 对 OpenSpec、Superpowers、Trellis 三套 AI coding workflow 的深度吸收。

这不是复制三个项目的目录或命令，而是把它们的优势融入 ByteTrue 现有 lifecycle：

- OpenSpec 的强项：behavior contract delta / archive discipline。
- Superpowers 的强项：风险场景下的强执行纪律、TDD/debug/review gate。
- Trellis 的强项：context manifest、subagent handoff、hook/breadcrumb、worklog/journal 等执行基础设施。

ByteTrue 的硬约束保持不变：`.bytetrue/` 是 canonical source of truth；不新增 `.bytetrue/specs/`；不重写既有 `bt-*` 主流程；所有改动优先 additive，并保持所有支持 Skill 的工具可用。更强的 hook / breadcrumb 体验作为可选增强层，优先服务 Claude plugin 与 Pi package；若成本可控，再扩展到 Trellis 已支持的其他工具。

## 2. Scope and Explicit Non-goals

### Covered by this roadmap

- 在 feature design / acceptance 中嵌入 OpenSpec-style behavior delta，不新增独立 specs 层或 delta 文件。
- 建立 4 档风险分级执行模型，让轻任务走轻流程，重任务启用 Superpowers-style 严格证据纪律。
- 增强 TDD / debug / architecture 判断语言，融合 Matt 与 Superpowers，而不是默认某一套更优。
- 引入 implementation review gate：spec compliance 与 code quality 分开检查。
- 引入 ByteTrue context manifest，让 implement / check / subagent 明确知道该读哪些 `.bytetrue` 产物和探索证据。
- 引入 subagent handoff 协议，让 Pi/Claude 等支持 subagent 的工具能更稳定地分派 implement / check / research 工作。
- 将 research-first 机制接入 `bt-explore`，技术选择先查证据再问用户。
- 将 hook / workflow-state breadcrumb 从 core scope 中移出；runtime adapter 只作为未来可选方向，不进入本次 pure-skills core。
- 设计轻量 worklog / report-feed，用于周报、handoff、跨 session 恢复和 AI 工作审计。
- 更新 `bt-onboard` 共享模板，让新项目获得新的 shared conventions / reference / optional infrastructure 入口。
- 补入 workflow control-plane remediation：让 `.bytetrue/config.yaml` 的 auto / tracker preview 语义被 workflow skills 明确消费，而不是只存在于配置说明里。

### Explicitly not covered

- 不新增 `.bytetrue/specs/`。相关决策见 `.bytetrue/compound/2026-06-11-decision-no-separate-specs-layer.md`。
- 不新增独立 `{slug}-delta.md`；behavior delta 第一版嵌入 feature design 与 acceptance。
- 不做完整 Trellis-style per-developer journal；第一版只做轻量 worklog/report-feed。
- 不新增完整 ByteTrue CLI；第一版继续通过 skill bundle、Claude plugin、Pi package、`bt-onboard` 模板和项目脚本承载。Pi package 保持 skills-only，不内置 runtime extension。
- 不实现 hook/breadcrumb runtime；如果未来要做 runtime adapter，需要另开能力并完整实现，不以半文档形式留在 core。
- 不重写 Matt skills absorption 的既有成果；后续只补充、修正和增强。
- 不在本 roadmap 中实现跨 repo workspace / initiative 系统；可在观察项中保留为未来方向。

## 3. Module Split, conceptual design

```text
AI Workflow Absorption
├── Workflow Semantics Module: 行为契约、风险分级、TDD/debug/architecture/review 纪律
├── Execution Context Module: context manifest、subagent handoff、research-first 证据接入
├── Optional Runtime Module: deferred runtime adapters outside pure-skills core
├── Work Record Module: lightweight worklog / report-feed
└── Template Rollout Module: bt-onboard 模板、reference 同步、安装投影文档
```

### Workflow Semantics Module

- **Responsibility**: 定义 ByteTrue 在“想法 → design → implement → acceptance”中的新语义规则：behavior delta 怎么写、风险等级怎么判、什么时候启用严格 TDD/debug、review gate 如何判断完成。它只定义流程和文档契约，不负责具体平台 hook 或 subagent 运行。
- **Sub-features carried**: `behavior-delta-contract`, `risk-mode-discipline`, `implementation-review-gate`, `workflow-control-plane-contract`
- **Existing code or modules touched**: `skills/bt-feat-design/`, `skills/bt-feat-impl/`, `skills/bt-feat-accept/`, `skills/bt-issue-analyze/`, `skills/bt-issue-fix/`, `skills/bt-refactor*`, `skills/bt-audit/`, `skills/bt-grill/`, `.bytetrue/reference/shared-conventions.md`, `bt-onboard/reference/shared-conventions.md`

### Execution Context Module

- **Responsibility**: 把“实现 / 检查需要读什么”从隐性要求变成显式 artifact。它定义 context manifest 文件、manifest 行格式、subagent handoff prompt 协议、research-first 与 `bt-explore` 的连接方式。
- **Sub-features carried**: `context-manifest-contract`, `subagent-handoff-roles`, `research-first-explore-integration`
- **Existing code or modules touched**: `skills/bt-feat-design/`, `skills/bt-feat-impl/`, `skills/bt-feat-accept/`, `skills/bt-explore/`, `skills/bt-brainstorm/`, `skills/bt-grill/`, `skills/bt-roadmap/`, `.bytetrue/reference/shared-conventions.md`, `.bytetrue/reference/tools.md`, `bt-onboard/reference/`

### Optional Runtime Module

- **Responsibility**: 本路线在 PR review 中确认不进入 ByteTrue core；runtime adapters / hooks should be separate future work if built fully. Core ByteTrue remains portable skills plus artifacts.
- **Sub-features carried**: `optional-runtime-breadcrumb` (dropped)
- **Existing code or modules touched**: none in core after this item was dropped; future runtime adapters should use a separate roadmap/feature.

### Work Record Module

- **Responsibility**: 提供轻量工作记录层，记录 session/work interval 的摘要、关联 artifact、commit、验证、状态、next steps，用于周报、handoff、恢复背景和 AI 工作审计。它不保存完整聊天记录，不替代 feature/issue/roadmap/compound。
- **Sub-features carried**: `worklog-report-feed`
- **Existing code or modules touched**: `.bytetrue/reference/shared-conventions.md`, `skills/bt-feat-accept/`, `skills/bt-issue-fix/`, `skills/bt-refactor/`, `skills/bt-roadmap/`, `skills/bt-onboard/`

### Template Rollout Module

- **Responsibility**: 把上面模块固化到新项目和当前项目都能读到的共享口径中，维护 `bt-onboard/reference/` 模板、当前项目 `.bytetrue/reference/` 副本、README / maintainer notes / install projection 文档。它只负责分发和同步，不重新定义业务规则。
- **Sub-features carried**: `onboard-template-rollout`
- **Existing code or modules touched**: `skills/bt-onboard/`, `bt-onboard/reference/`, `.bytetrue/reference/`, `README.md`, `CLAUDE.md` / `AGENTS.md` if needed, package/plugin metadata if needed

## 4. Inter-module Interface Contracts / Shared Protocols, detailed architecture layer

The executable contracts are defined in `ai-workflow-absorption-contracts.md`. This section is the index of contracts and their owning modules.

| Contract | Owner | Consumers | Purpose |
|---|---|---|---|
| Behavior Delta Block | Workflow Semantics | `bt-feat-design`, `bt-feat-accept` | Express OpenSpec-style ADDED/MODIFIED/REMOVED/RENAMED behavior deltas without adding `.bytetrue/specs/`. |
| Risk Mode Classification | Workflow Semantics | feature / issue / refactor workflows | Route light, standard, strict-evidence, and break-loop work to the right discipline level. |
| Implementation Review Gate | Workflow Semantics + Execution Context | `bt-feat-impl`, `bt-feat-accept`, optional check subagent | Separate spec compliance from code quality. |
| Context Manifest Files | Execution Context | implement/check roles | Make required `.bytetrue` docs and evidence explicit for implementation and verification. |
| Subagent Handoff Protocol | Execution Context | Pi/Claude/other subagent-capable tools | Provide active work, role, design/checklist, and manifest context to child agents. |
| Research-first Integration | Execution Context | `bt-brainstorm`, `bt-grill`, `bt-roadmap`, `bt-feat-design`, `bt-explore` | Route technical choices through evidence-backed explore artifacts. |
| Worklog / Report-feed Record | Work Record | closeout workflows and humans | Record concise cross-session work summaries for reports, handoff, and recovery. |
| Workflow Control Plane | Workflow Semantics | `bt`, feature / issue / refactor close-out, `bt-tracker` | Consume `.bytetrue/config.yaml` for manual/auto continuation, ask-before boundaries, and auto-preview tracker behavior. |

Hard rule: if a future feature-design needs one of these contracts, it must read `ai-workflow-absorption-contracts.md` together with this roadmap. If the contract proves wrong, update this roadmap first rather than routing around it inside one feature.

## 5. Sub-feature List

1. **behavior-delta-contract** — Add OpenSpec-style behavior delta blocks into feature design and acceptance, with acceptance materialization rules.
   - module: Workflow Semantics Module
   - dependencies: none
   - status: done
   - corresponding feature: 2026-06-11-behavior-delta-contract
   - notes: minimal loop; demonstrates OpenSpec absorption without adding `.bytetrue/specs/`

2. **risk-mode-discipline** — Define the 4 execution modes and integrate Matt + Superpowers TDD/debug/architecture strictness rules into design, implementation, issue, and refactor workflows.
   - module: Workflow Semantics Module
   - dependencies: none
   - status: done
   - corresponding feature: 2026-06-11-risk-mode-discipline
   - notes: key design task to keep Superpowers strengths without imposing global heaviness

3. **implementation-review-gate** — Add spec compliance and code quality review dimensions before feature implementation can enter acceptance.
   - module: Workflow Semantics Module
   - dependencies: behavior-delta-contract, risk-mode-discipline
   - status: done
   - corresponding feature: 2026-06-11-implementation-review-gate
   - notes: can work inline first; subagent execution later strengthens it

4. **context-manifest-contract** — Introduce `{slug}-impl-context.jsonl` and `{slug}-check-context.jsonl` plus shared manifest row schema and lifecycle rules.
   - module: Execution Context Module
   - dependencies: behavior-delta-contract
   - status: done
   - corresponding feature: 2026-06-11-context-manifest-contract
   - notes: first execution-infrastructure minimal loop

5. **subagent-handoff-roles** — Define ByteTrue implement/check/research subagent handoff protocol using active work path, design/checklist, and context manifest.
   - module: Execution Context Module
   - dependencies: context-manifest-contract, implementation-review-gate
   - status: done
   - corresponding feature: 2026-06-11-subagent-handoff-roles
   - notes: first target is Pi/Claude; tools without subagents use the same contract inline

6. **research-first-explore-integration** — Route technical-choice and comparable-workflow questions through `bt-explore spike` before design/roadmap decisions, and allow manifests to reference explore evidence.
   - module: Execution Context Module
   - dependencies: context-manifest-contract
   - status: done
   - corresponding feature: 2026-06-11-research-first-explore-integration
   - notes: absorbs Trellis research-first without creating a new research directory

7. **optional-runtime-breadcrumb** — Dropped from the core roadmap because runtime hooks/adapters are outside the pure-skills ByteTrue core.
   - module: Optional Runtime Module
   - dependencies: context-manifest-contract, subagent-handoff-roles
   - status: dropped
   - corresponding feature: not started
   - notes: future runtime adapters may be planned separately if implemented fully

8. **worklog-report-feed** — Add lightweight `.bytetrue/worklog/` report-feed for session/work interval summaries, weekly reports, handoff, and recovery background.
   - module: Work Record Module
   - dependencies: implementation-review-gate, context-manifest-contract
   - status: done
   - corresponding feature: 2026-06-11-worklog-report-feed
   - notes: deliberately not full Trellis per-developer journal

9. **onboard-template-rollout** — Update `bt-onboard` templates, current shared references, README/maintainer docs, and install projections so new and existing projects receive the new conventions.
   - module: Template Rollout Module
   - dependencies: behavior-delta-contract, risk-mode-discipline, implementation-review-gate, context-manifest-contract, subagent-handoff-roles, research-first-explore-integration, worklog-report-feed
   - status: done
   - corresponding feature: 2026-06-11-onboard-template-rollout
   - notes: final integration and distribution pass

10. **workflow-control-plane-contract** — Add the skills-first control plane for project config, canonical statuses, continuation routing, brainstorm paths, behavior writeback, and auto-mode consumption.
   - module: Workflow Semantics Module
   - dependencies: onboard-template-rollout
   - status: done
   - corresponding feature: 2026-06-12-workflow-control-plane-contract
   - notes: PR review remediation after the initial roadmap close-out; included here so config/auto behavior is traceable to the AI workflow absorption PR rather than appearing as an orphan feature.

**Minimal loop**: after item 1 `behavior-delta-contract` is done, a ByteTrue feature design can declare explicit behavior deltas and acceptance can materialize them back into existing ByteTrue layers, demonstrating the core OpenSpec absorption without introducing a new facts directory.

## 6. Scheduling Rationale

The first item is `behavior-delta-contract` because it delivers the smallest externally visible improvement: OpenSpec's most valuable mechanism becomes usable in the existing feature lifecycle without waiting for subagents or hooks. `risk-mode-discipline` and `implementation-review-gate` then define when Superpowers-style heaviness applies and how completion is checked. Only after those semantics are clear should `context-manifest-contract` and `subagent-handoff-roles` formalize execution infrastructure; otherwise manifests and subagents would optimize an unstable workflow. `optional-runtime-breadcrumb` was dropped before merge because hooks/runtime adapters should not enter the pure-skills core. `worklog-report-feed` comes late because it records workflow outcomes; its shape should reflect the preceding execution model. `onboard-template-rollout` distributes the integrated model, and `workflow-control-plane-contract` was added as PR review remediation to make config/auto/continuation semantics actually consumable before merge.

## 7. Observations

- The existing Matt skills absorption roadmap is completed and remains valid, but this roadmap may supersede some of its first-pass TDD/debug/architecture wording with a more nuanced Matt + Superpowers fusion.
- `architecture/ARCHITECTURE.md` is still skeletal. After this roadmap lands, `bt-feat-accept` or `bt-arch update` should backfill current architecture for any newly introduced runtime/infrastructure pieces.
- Optional hook/breadcrumb support may eventually require a richer package/runtime model, but this roadmap intentionally avoids a new ByteTrue CLI in the first version.
- Worklog/report-feed should be evaluated against Magic Context and existing `.bytetrue` artifacts during implementation; it must not become a noisy duplicate of chat history.
