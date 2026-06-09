# issue-fix 参考模板

本文件提供 `bt-issue-fix` 使用的修复汇报模板、日志调试脚手架和 `{slug}-fix-note.md` 模板。

## 1. 修复汇报模板

```markdown
## 修复汇报

### 动了哪些文件
{git status 输出或文件列表}

### 具体改了什么
- `{文件}:{行号}` — {改动描述，原来是 X，现在是 Y}

### 是否触碰到分析范围外的文件?
{是 / 否}

### 是否引入了分析中没有提到的新概念/新结构?
{是 / 否}

### 复现步骤走一遍
{按 {slug}-report.md 第 2 节复现步骤走一遍，结果是否符合期望行为?}
```

## 2. 日志调试升级

当修复未生效时：

1. 宣告当前方案未解决问题
2. 确定打点位置
3. 获取日志
4. 分析日志并修订根因假设
5. 清理日志打点

临时日志 / instrumentation 必须带唯一前缀（如 `[DEBUG-{slug}]`）。提交前用 grep 确认清理；若保留正式日志，必须在 fix-note 说明理由。
6. 以修订后的根因重新进入修复流程

如果经过 2 轮日志调试仍未定位到根因，建议回到 `bt-issue-analyze`。

### 用户取日志提示词

```text
请按以下步骤复现问题并粘贴日志:
1. {具体复现操作}
2. 复制控制台/日志文件里从 [打点标记 A] 到 [打点标记 B] 的输出
```

## 3. `{slug}-fix-note.md` 标准路径模板

```markdown
---
doc_type: issue-fix
issue: {issue 目录名}
path: standard
fix_date: YYYY-MM-DD
related: [{slug-analysis.md 相对路径}]
tags: []
---

# {问题简述} 修复记录

## 1. 实际采用方案

## 2. 改动文件清单

## 3. Regression 覆盖

- **新增 regression test**：{测试文件 / 测试名 / red→green 证据}
- **复用现有测试**：{测试命令 / 覆盖到的行为}
- **无合适 seam**：{原因；是否建议后续 bt-refactor / bt-arch}

## 4. 验证结果

## 5. Instrumentation 清理

- **临时打点**：{无 / 有，前缀是什么}
- **清理证据**：{grep 命令或说明}
- **保留日志**：{无 / 有，保留理由}

## 6. Mini post-mortem

这类 bug 未来靠什么避免：{测试 / 类型 / 约束 / 架构 seam / review checklist / 其他}

## 7. 遗留事项
```

## 4. `{slug}-fix-note.md` 快速通道模板

```markdown
---
doc_type: issue-fix
issue: {issue 目录名}
path: fast-track
fix_date: YYYY-MM-DD
tags: []
---

# {问题简述} 修复记录

## 1. 问题描述

## 2. 根因

## 3. 修复方案

## 4. 改动文件清单

## 5. Regression 覆盖

- **新增 regression test**：{测试文件 / 测试名 / red→green 证据}
- **复用现有测试**：{测试命令 / 覆盖到的行为}
- **无合适 seam**：{原因；是否建议后续 bt-refactor / bt-arch}

## 6. 验证结果

## 7. Instrumentation 清理

- **临时打点**：{无 / 有，前缀是什么}
- **清理证据**：{grep 命令或说明}
- **保留日志**：{无 / 有，保留理由}

## 8. Mini post-mortem

这类 bug 未来靠什么避免：{测试 / 类型 / 约束 / 架构 seam / review checklist / 其他}

## 9. 遗留事项
```