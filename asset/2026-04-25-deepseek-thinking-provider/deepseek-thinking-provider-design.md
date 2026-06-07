---
doc_type: feature-design
feature: 2026-04-25-deepseek-thinking-provider
requirement:
status: approved
summary: 将 DeepSeek 官方 OpenAI-compatible API 正式接入 March，覆盖普通对话、Thinking Mode 与工具调用中的 reasoning_content 轮内回传
tags: [provider, deepseek, reasoning, tool-calls]
---

# DeepSeek Thinking Provider Design

> Stage 1 | 2026-04-25 | 上游：[deepseek-thinking-provider-brainstorm.md](deepseek-thinking-provider-brainstorm.md)

## 拆分说明

原 design 文档已按自然章节拆成 3 份，保留本页作为总入口和导航页。

## 阅读顺序

1. [术语与决策](./deepseek-thinking-provider-design-01-decisions.md)
2. [接口契约](./deepseek-thinking-provider-design-02-interface-contracts.md)
3. [实现提示与架构回写](./deepseek-thinking-provider-design-03-implementation.md)

## 章节映射

| 原章节 | 位置 |
|---|---|
| 0. 术语约定 | [design-01-decisions](./deepseek-thinking-provider-design-01-decisions.md) |
| 1. 决策与约束 | [design-01-decisions](./deepseek-thinking-provider-design-01-decisions.md) |
| 2. 接口契约 | [design-02-interface-contracts](./deepseek-thinking-provider-design-02-interface-contracts.md) |
| 3. 实现提示 | [design-03-implementation](./deepseek-thinking-provider-design-03-implementation.md) |
| 4. 与项目级架构文档的关系 | [design-03-implementation](./deepseek-thinking-provider-design-03-implementation.md) |
