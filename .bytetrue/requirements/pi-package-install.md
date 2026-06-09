---
doc_type: requirement
slug: pi-package-install
pitch: pi 和 Claude Code 用户可以用各自原生安装入口接入 ByteTrue
status: current
last_reviewed: 2026-06-09
implemented_by: [ARCHITECTURE]
tags: [install, pi-package, claude-plugin, skills]
---

# 原生安装 ByteTrue

## 用户故事

- 作为 pi 用户，我希望直接用 pi 熟悉的 package 命令接入 ByteTrue，而不是切换到另一套 skills 安装工具。
- 作为 Claude Code 用户，我希望通过 plugin marketplace 安装 ByteTrue，并获得清晰的插件命名空间。
- 作为想先试用 ByteTrue 的用户，我希望能临时加载整套 skills，而不是马上写入长期配置。
- 作为 ByteTrue 维护者，我希望新增原生安装入口时仍保留现有 agentskills / 多 Agent 安装路径。

## 为什么需要

ByteTrue 是一组技能工作流，用户能否顺利开始使用，很大程度取决于安装入口是否贴近他们正在使用的 harness。pi 用户如果只能看到 `npx skills add`，会误以为 ByteTrue 不是 pi 原生可安装资源；Claude Code 用户如果只能看到普通 skills 安装，会错过 plugin marketplace 的版本化和命名空间能力。

## 怎么解决

ByteTrue 维护一份 canonical `skills/` 源码，并对不同 harness 暴露对应安装入口：pi 通过 package manifest 安装，Claude Code 通过 plugin / marketplace 安装，agentskills / 多 Agent 继续通过 `npx skills add` 安装。用户按自己的 harness 选择路径。

## 边界

- 不承诺当前已经发布 npm 包。
- 不新增 pi runtime extension 或 Claude hook / MCP / agent 能力。
- 不改变 ByteTrue 既有 skill 名称或工作流行为。
- 不替用户写入全局 settings；是否安装由用户主动执行命令决定。
