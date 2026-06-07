---
name: bt-issue-fix
description: issue 流程阶段 3——按已确认根因和方案定点修复、验证、写 {slug}-fix-note.md 落档。两个入口：标准路径从 analyze 来，快速通道从 report 直接来。触发：用户说"开始修 bug"、"按分析修"、"动手改代码"。只动方案声明的文件，不顺手优化。
---

# bt-issue-fix

## 启动必读

开始任何判断或动作前，先读取 `.bytetrue/attention.md`；缺失则视为骨架不完整，提示先补齐或运行 `bt-onboard`，不要回退到外部 AI 入口文件。

根因和方案已经确定（标准路径在 analysis、快速通道在 report 阶段口头确认过），你的活是按方案改代码、验证效果、写下修复记录。

fix 阶段最容易出问题的不是改代码本身，而是**改的过程中冒出的"顺手"冲动**——顺手优化、顺手重构、顺手加抽象。每项单独看说得通，但合在一个 PR 里让别人分不清"这次到底为了修 bug 改了什么"。

> 共享路径与命名约定看 `.bytetrue/reference/shared-conventions.md` 第 0 节和 `bt-issue` 的"文件放哪儿"。

---

## 两种入口

### 标准路径（有 analysis）

1. **方案已确认**——读 analysis，确认 `doc_type=issue-analysis` 且 `status=confirmed`，第 5 节用户选定了哪个方案
2. **上下文读全**：analysis 全文 + report 全文 + analysis 第 1 节定位的所有代码 + `.bytetrue/attention.md` + 沉淀目录搜索：
   - `python .bytetrue/tools/search-yaml.py --dir .bytetrue/compound --filter doc_type=trick --filter status=active --query "{关键词}"`——确认修复方式不违背已有库用法 / 模式
   - 同样命令换 `--filter doc_type=explore`——确认修复点和已有证据不冲突
3. **确认起点**——告诉用户"我将按方案 X 修改 {文件列表}，开始修复"，等用户确认才动手

### 快速通道（无 analysis，从 report 直接触发）

进入这个入口时 AI 在 report 阶段已读过代码并对根因有把握。

1. **明确陈述根因**："`{文件}:{行号}` 的 {具体代码} 存在 {问题描述}"，让用户确认根因判断准确
2. **给修复方案**——改哪里、怎么改（一两句话，不写完整分析文档）
3. **等用户明确说"对，就这样改"才动手**——不允许"我觉得对，直接改了"
4. 读 `.bytetrue/attention.md`
5. **补搜沉淀目录**——快速通道也要查一遍 `compound/`（trick + explore），避免误把已知边界条件当新问题

---

## 实现期间的约束

### 只改 analysis 里声明的文件

修复范围来自 analysis 第 5 节"推荐方案"的"影响面"。超出范围的文件——哪怕顺眼——**不动**。

发现范围外值得改的记一条"顺手发现"不改代码：

```markdown
> 顺手发现：{文件:行号} {问题简述}。不在本次修复范围，可后续另开 issue。
```

为什么这么严：顺手改的代码不在分析里，验收对不上，git blame 分不清哪些改动是为这个 bug。

### 改动最小化

修复只针对根因，**不引入新抽象、新接口、新模式**。如果发现"要把这个改好得先重构 X"——停下来跟用户确认是否在这个 issue 里做重构，还是拆成独立工作。

为什么：bug 修复天然窄场景，引入新抽象意味着只有这一个使用点支撑——典型过早抽象。

### 代码质量反射检查

修 bug 看似动作小但 AI 写修复代码一样会漂——大文件再塞特殊处理、大类再加方法、为绕开边界加 `if` 分支。反射检查见 `shared-conventions.md` 第 7 节。

issue-fix 比 feature-implement 更谨慎：**触发反射信号但结论是"该拆"时默认不在本次 PR 做**——按"改动最小化"记成顺手发现。唯一例外是"不拆就没法干净修这个 bug"，那停下来跟用户确认"修这个 bug 的前置是 {重构动作}，合进来还是拆出去单独做"。


### regression seam 优先

如果 analysis / 快速通道判断里存在合适的行为 seam，优先先写一个失败的 regression test，再修 bug。规则：

- 测 public interface / 可观察行为，不测私有实现细节。
- 选最高层、最接近用户行为的 seam；不要为了测试方便新增低层专用接口。
- 先确认 test 能复现 bug（red），再写最小修复让它通过（green）。
- 当前 regression test 变绿前不做 refactor；红灯时只做让测试通过的最小修复，全部相关测试绿灯后才允许整理代码。
- 没有合适 seam 时不要硬造脆弱测试；在 `{slug}-fix-note.md` 里说明原因，并可把“缺少 seam”记为后续 `bt-refactor` / `bt-arch` 候选。

简单 bug / 纯配置 / 纯文案修复可以不写 regression test，但必须在验证结果里说明用什么证据代替。
### 每完成一处改动必须汇报

修复汇报模板见同目录 `reference.md`，**不允许含糊汇报**。汇报后停下等用户回复。

---

## 验证清单

修复改完后逐项核对：

- [ ] **复现步骤验证**——按 report 第 2 节走一遍，问题不再出现
- [ ] **期望行为验证**——report 第 3 节"期望行为"现在确实发生
- [ ] **影响面回归**——analysis 第 4 节"潜在受害模块"每个走一遍最基本的冒烟路径
- [ ] **前端改动浏览器验证**（如涉及）——按 `.bytetrue/attention.md` 的硬要求执行，不能只 typecheck
- [ ] **相关测试通过**——有测试覆盖到修复区域就跑一遍
- [ ] **regression 覆盖**——有合适 seam 时先写失败 regression test 再修复；没有 seam 时在 fix-note 说明原因

---

## 修复未生效时：日志调试升级

走完验证清单仍**问题复现**或行为与期望不符——**别在原有猜测上反复试错**，切换到日志调试模式重新收集运行时证据。

为什么切换：反复试错本质是猜测在原假设下还有什么可能性，但如果原假设就错了再猜也是绕圈。日志强制看实际运行时数据，往往一眼看出原假设哪里偏了。

日志调试步骤、用户取日志提示词、循环限制见同目录 `reference.md`。

日志 / instrumentation 约束：

- 临时日志必须带唯一前缀，如 `[DEBUG-{slug}]`，便于 grep 清理。
- 性能问题优先 baseline / profiler / query plan；不要靠随意日志猜。
- 修复提交前必须 grep 前缀确认临时日志已清理；保留的正式日志必须说明理由。

---

## 写 {slug}-fix-note.md

验证通过后在 issue 目录建 `{slug}-fix-note.md`（位置见 `bt-issue` 的"文件放哪儿"），记录完整闭环。标准路径模板和快速通道模板都在同目录 `reference.md`。

fix-note 必须额外记录：

- regression coverage：新增了哪个测试 / 用哪个现有测试覆盖 / 为什么没有合适 seam。
- instrumentation cleanup：是否加入过临时日志 / debugger / profiler 记录，如何确认已清理。
- mini post-mortem：这类 bug 未来靠什么避免（测试、类型、约束、架构 seam、review checklist 等）。

---

## 退出条件

- [ ] 所有改动文件已提交或列清单
- [ ] 验证清单全部勾选
- [ ] `{slug}-fix-note.md` 已建并填写完整
- [ ] regression coverage / 无 seam 原因已写入 fix-note
- [ ] 临时 instrumentation 已清理或明确说明保留理由
- [ ] mini post-mortem 已写入 fix-note
- [ ] 没有未处理的"顺手发现"（都进后续 issue 列表）
- [ ] 没有范围外改动（或已和用户确认）
- [ ] 用户明确确认修复完成

---

## 收尾提交

按 `shared-conventions.md` 第 4 节"scoped-commit"规则执行。本阶段：

- **提交范围**：修复代码 + `{slug}-fix-note.md` + 本次一并更新的 report / analysis
- 修复闭环后告诉用户"修复验证已完成，`{slug}-fix-note.md` 已落盘"，紧接着问是否需要 commit

---

## 退出后

告诉用户："issue 修复完成，工作流闭环。report + analysis + fix-note 已存档。"

按 `shared-conventions.md` 第 3 节"issue-fix"收尾推荐顺序各问一句（用户"不用"立即跳过）：

1. 暴露了值得复用的坑点 → "沉淀 learning？（`bt-learn`）"
2. 沉淀出长期约束 / 规约 / 技术决定 → "归档决定？（`bt-decide`）"
3. 这个 bug 暴露了项目通用的硬约束 / 命令陷阱 / 环境设置（一两行能讲清、ByteTrue 技能每次启动都该知道）→ "记到 attention.md？（`bt-note`）"
4. 最后问是否代为提交。同意时按收尾提交规则执行

建议：把 issue 目录文件和代码改动放同一次提交方便追溯；"顺手发现"另开 `bt-issue-report` 处理别塞这个 PR。

修复中发现问题实际是功能缺失（不是 bug）→ 建议另开 `bt-feat`，别在 issue 工作流里偷偷做新功能。

---

## 容易踩的坑

- 修完没走验证清单就宣告"修好了"
- 顺手改了 analysis 范围外的代码
- 修复引入新抽象 / 接口但没停下来确认
- `{slug}-fix-note.md` 没建就宣告完成
- 发现影响面回归有问题但写"轻微影响可忽略"——要修到干净
- 前端改动只 typecheck 就报通过
- 用户没明确说"修复完成"就结束
- 修复未生效继续原假设上反复猜测试错，不切换到日志调试
- 日志调试结束后没清理临时 log 就提交
- 有合适 seam 却不写 regression test，也不说明原因
- 临时 debug 前缀没 grep 清理
- fix-note 只写“已修复”，没有 regression coverage 和 mini post-mortem
- regression test 还红着就顺手重构——先 green，再 refactor，再重跑测试
- 收尾时没问用户是否代为 commit
- 用户没明确同意就 `git commit`
