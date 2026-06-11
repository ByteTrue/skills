<div align="center">

# ByteTrue

![](./asset/PromotionalImage.png)

[English](./README.en.md) · **中文**

**面向严肃工程的 AI 编码工作流**

厌倦了 OpenSpec 的草台、Oh-My-OpenAgent 的过度设计、Superpowers 的散装——我从 0 写了一套简单轻巧、围绕**人在环**的 AI Harness。

<p>
  <img src="https://img.shields.io/badge/status-beta-F59E0B?style=flat-square" alt="Status"/>
  <img src="https://img.shields.io/badge/skills-28-6366F1?style=flat-square" alt="Skills"/>
  <img src="https://img.shields.io/badge/license-MIT-10B981?style=flat-square" alt="License"/>
</p>

</div>

---

## 安装

### Claude Code plugin

```bash
claude plugin marketplace add ByteTrue/skills
claude plugin install bytetrue@bytetrue-skills
```

安装后根入口：

```bash
/bytetrue:bt-onboard
/bytetrue:bt
```

### Pi package

```bash
pi install git:github.com/ByteTrue/skills
```

Pi package 会加载 ByteTrue 的全部 skills，并额外包含一个可选、只读的 workflow-state breadcrumb runtime extension；只支持标准 Agent Skills 的工具可继续使用下面的 `npx skills add` 路径。

临时试用 package（`-e` / `--extension` 会把 git package 加载到临时目录，仅当前这次 pi 进程生效，不写入 settings）：

```bash
pi -e git:github.com/ByteTrue/skills
```

### Agentskills / 多 Agent

```bash
npx skills add https://github.com/ByteTrue/skills
```

安装后开始工作：

```bash
/bt-onboard
```

之后日常使用时，不知道该用哪个技能就喊根入口：

```bash
/bt
```

`bt` 会读你的诉求，告诉你这次该走哪个 `bt-xxx`。

---

## 缘起

我在开发一套新的 Harness Agent（[MA](https://github.com/liuzhengdongfortest/MA)），一开始当然是 VibeCoding——我只写设计和需求，代码由 AI 来改。这样支撑了大部分特性的开发。直到有一天 Codex 反复解决不了一个我认为比较简单的问题，并且反复在同一个地方犯错。我就知道项目需要一套工作流来维持它继续进行。

我调研了 OpenSpec、SuperPowers、Oh-My-OpenAgent 这一类工具，没一个用着顺手：

- **OpenSpec** 太简单，没有复利工程，生成的 Spec 抽象到人类没法读
- **SuperPowers** 没有流程约束，不知道该用哪个
- **Oh-My-OpenAgent** 太重，且哲学上认为“人介入 = 失败”

ByteTrue 的目标是**解决严肃工程的软件实现和编码问题**，不是造一个新名词、追求热点。

---

## 与其他框架的核心区别

主流 AI 编码框架大多在做一件事：**如何把 Agent 编排得更好。**

ByteTrue 走的是另一个方向：**编排的不是 Agent，而是软件本身的生命周期。** 围绕的实体是需求、架构、路线图、特性、问题、重构、审计和知识沉淀。

| 维度 | Agent 编排派 | ByteTrue |
|------|--------------|----------|
| 核心实体 | Agent / Role / Team | Requirement / Architecture / Roadmap / Feature / Issue |
| 主线问题 | Agent 之间怎么分工、传递、协调？ | 需求、约束、决策怎么被记下来、被检索、被复用？ |
| 状态存在哪 | Session / 消息总线 / 队列 | 项目里的 `.bytetrue/` 文件树 |
| 对人的定位 | 少介入越好，理想是全自动 | 人在环，程序员对整体把控负责 |

![](./asset/ByteTrueVSAgent.png)

---

## 设计：8 个实体 + 3 个流程

ByteTrue 顺着软件编码的真实流程来设计，把开发活动建模成 **8 个实体** 和 **3 个流程**。

### 8 个实体

| 实体 | 英文 | 干什么 |
|------|------|--------|
| **需求** | requirements | 原始用户故事、痛点、边界和愿景 |
| **架构** | architecture | 系统现状长什么样、为什么这样组织 |
| **路线图** | roadmap | 大需求的事前规划、模块拆解、接口契约 |
| **特性** | features | 新能力的 design / impl / accept 执行闭环 |
| **问题** | issues | bug 的 report / analyze / fix 闭环 |
| **重构** | refactors | 行为不变的结构优化与拆分 |
| **审计** | audits | 主动扫描 bug 隐患、性能、可维护性、架构偏离 |
| **知识** | compound | learning / trick / decision / explore 的复利知识库 |

### 3 个流程

| 流程 | 关键技能链 | 说明 |
|------|------------|------|
| **特性引入** | `bt-feat` → `bt-feat-design` → `bt-feat-impl` → `bt-feat-accept` | 想清楚 → 设计 → 编码 → 验收 |
| **问题修改** | `bt-issue-report` → `bt-issue-analyze` → `bt-issue-fix` | 记录问题 → 分析根因 → 定点修复 |
| **代码重构** | `bt-refactor` / `bt-refactor-ff` | 行为不变的结构优化 |

---

## 技能总览

| 分组 | 技能 | 用途 |
|------|------|------|
| 根入口 | `bt` | 统一入口——介绍体系全貌 + 把开放式诉求路由到正确子技能 |
| 接入 | `bt-onboard` | 把 ByteTrue 接入到新仓库 / 已有零散文档的仓库 |
| 需求 & 架构 | `bt-req`, `bt-arch` | 沉淀能力愿景、维护系统现状架构 |
| 路线图 | `bt-roadmap` | 承载一块大需求的事前规划、接口契约和拆解清单 |
| 讨论入口 | `bt-brainstorm`, `bt-grill` | 模糊需求分诊、方案拷问 / stress-test |
| 特性流程 | `bt-feat`, `bt-feat-design`, `bt-feat-impl`, `bt-feat-accept`, `bt-feat-ff` | 新能力从设计到验收的闭环 |
| 问题流程 | `bt-issue`, `bt-issue-report`, `bt-issue-analyze`, `bt-issue-fix` | bug 从报告到修复的闭环 |
| 重构流程 | `bt-refactor`, `bt-refactor-ff` | 结构优化与轻量重构 |
| 审计 & 协作 | `bt-audit`, `bt-tracker` | 系统审计、外部 tracker 的 publish / link / triage |
| 知识沉淀 | `bt-learn`, `bt-trick`, `bt-decide`, `bt-note` | 踩坑、技巧、决定、项目注意事项 |
| 探索 & 文档 | `bt-explore`, `bt-guide`, `bt-libdoc` | 代码探索、开发者指南、库参考文档 |

---

## 继续阅读

更完整的工作流图、运行时目录树、设计哲学和后续 Roadmap 在这里：

- [ByteTrue Deep Dive（中文）](./docs/README.deep-dive.md)
- [ByteTrue Deep Dive（English）](./docs/README.deep-dive.en.md)

如果你已经安装并准备开始，直接运行：

```bash
/bt-onboard
```

---

## 当前状态

- `bt-grill` 已吸收 `grill-me` / `grill-with-docs`
- `bt-tracker` 已吸收 `to-prd` / `to-issues` / `triage`
- `bt-refactor` 仍在 beta，会继续强化
- 下一步更偏向团队协作收尾能力，比如 review / PR finishing

---

## Star History

[![Star History Chart](https://api.star-history.com/chart?repos=ByteTrue/skills&type=date&legend=top-left)](https://www.star-history.com/?repos=ByteTrue%2Fskills&type=date&legend=top-left)

<div align="center">

MIT License · 作者 [@liuzhengdong](https://github.com/liuzhengdongfortest)

</div>
