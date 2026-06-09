---
name: bt-grill
description: ByteTrue 方案拷问技能，默认读取 .bytetrue 项目文档和代码上下文来 stress-test plan/design/roadmap/refactor/architecture proposal；显式传 `--lite` / `--no-docs` / “纯 grill-me” 时退化为不读 ByteTrue 文档的轻量追问。Use when user says “grill me”、"拷问我"、"帮我追问"、"stress-test 方案"、"这个设计靠谱吗"、"把计划问透"，或需要在 bt-brainstorm / bt-roadmap / bt-feat-design 前挑战方案。
---

# bt-grill

`bt-grill` 是 ByteTrue 的“方案拷问 / 压测”技能：把一个计划、设计、路线图、重构方案或项目管理方案问到足够清楚，暴露隐藏假设、术语冲突、决策依赖和验证缺口。

它融合两种模式：

- **默认：with docs** —— 先读 `.bytetrue/` 里的项目上下文，再拿上下文挑战用户方案；共识形成后必须写入合适的 ByteTrue 文档。
- **轻量：grill-me** —— 用户显式说 `--lite` / `--no-docs` / “纯 grill-me” / “别读文档只问我” 时，只做对话式追问；仍然可以按需读代码回答事实问题，但不读写 `.bytetrue` 文档。

## 硬规则

1. **一次只问一个问题**，等用户回答后再继续。
2. **每个问题都给推荐答案**，不要把空白问题丢给用户。
3. **能通过读文档或代码回答的，不问用户**——先探索，再把证据带回对话。
4. **沿决策树推进**——先解决上游依赖问题，再问下游实现细节。
5. **不为追问而追问**——连续一轮拿不到新信息、用户说“差不多了”、或问题只能靠实现验证时，收束并给下一步。
6. **不直接替用户拍板**——可以强推荐，但最终要让用户确认。

## 模式选择

### 默认 with-docs 模式

除非用户显式要求轻量模式，否则按 with-docs 执行。

启动时先做最小上下文扫描：

1. 读 `.bytetrue/attention.md`；缺失则说明项目未完整接入 ByteTrue，停止并建议：
   - 先 `bt-onboard`；或
   - 用户重新触发 `bt-grill --lite` 跳过 ByteTrue 文档。
2. 如果存在，读 `.bytetrue/reference/system-overview.md`、`.bytetrue/reference/shared-conventions.md` 和 `.bytetrue/reference/domain-context.md` 的相关部分；项目管理话题还要读 `.bytetrue/reference/project-management.md`。
3. 根据用户计划里的关键词，查找相关：
   - `requirements/`：这个能力为什么存在、边界是什么。
   - `architecture/`：系统现状和约束。
   - `roadmap/`：是否已有大需求规划或子 feature 依赖。
   - `features/` / `issues/` / `refactors/`：是否是已有工作的续作。
   - `compound/`：已有 decision / learning / trick / explore 是否冲突或可复用。
4. 用户声称“代码现在是 X”时，按需读代码验证；发现冲突必须指出。
5. 共识形成时，不等到对话结束才提醒“建议沉淀”：按本文“文档写入规则”更新合适的 ByteTrue 文档。

### 轻量 grill-me 模式

触发条件：用户显式说 `--lite`、`--no-docs`、`mode=lite`、"纯 grill-me"、"别读文档"、"只问我"。

行为：

- 不要求 `.bytetrue/` 存在。
- 不主动读取 ByteTrue 文档。
- 不写 `.bytetrue` 文档。
- 仍遵守：一次一个问题、每题给推荐答案、能读代码回答的就读代码。
- 如果用户要求“记下来 / 落档”，明确说明这已经切换到 with-docs 模式；切换后先读 `.bytetrue/` 上下文，再写入对应 ByteTrue 文档。

## 拷问方法

先把用户计划压缩成一句话：

> 我理解你的计划是：{目标}，通过 {方案}，在 {约束} 下达成 {成功标准}。我先从最影响后续分支的点问起。

然后按下面顺序找“当前最高杠杆问题”，不要机械全问。

### 1. 目标与成功标准

问清楚：

- 真正要解决的问题是什么？
- 不做会怎样？
- 成功怎么外部验证？
- 这个目标属于 feature、roadmap、refactor、issue、docs，还是项目管理？

### 2. 术语与领域边界

with-docs 模式下，要拿 `.bytetrue/requirements/`、`.bytetrue/architecture/` 和 `compound/decision` 对照：

- 用户使用的词是否和现有文档冲突？
- 同一个词是否被拿来表示多个概念？
- 有没有应该统一的 canonical term？

发现冲突时直接指出：

> 这里有个术语冲突：现有文档里 `{term}` 指的是 X，但你刚才像是在说 Y。我的推荐是把 Y 叫 `{new_term}`，否则后面 design 会混。你接受吗？

### 3. 方案与替代路线

不要只顺着用户方案问细节。至少检查：

- 这个方案是不是在解真问题？
- 有没有更小、更轻、更可逆的路径？
- 有没有现有架构已经支持的路径？
- 有没有已有 decision 明确禁止或倾向某方向？


架构候选 / refactor 方案要额外拷问 Matt `improve-codebase-architecture` 的判断点：

- 这个模块是在变 **deep**（小接口隐藏更多复杂度），还是只是多了一层 **shallow** 转发？
- seam / adapter 边界在哪里？哪些复杂性被关在 adapter 后面？
- deletion test 结果是什么：删掉这个模块后，复杂度是消失，还是散回多个调用方？
- public interface 是否足以作为行为测试面？如果测试只能碰私有实现，说明 seam 可能没切对。
- 这属于行为等价 refactor、feature 目标态，还是 architecture 文档现状更新？三者不要混。
提问格式：

> 这里我看到两个路线：A 更快但会积累 X，B 慢一点但和现有 `{doc/code}` 更一致。我的推荐是 B，因为 {理由}。你要选 B，还是有必须走 A 的约束？

### 4. 依赖与顺序

把计划拆成依赖树，而不是任务列表：

- 哪个决定会改变后面所有问题？先问它。
- 哪些问题可以延后到实现中验证？标成 open question，不死磕。
- 哪些工作必须先进 `bt-roadmap`，不能塞进单个 feature？
- 哪些应该先 `bt-explore` / spike 验证事实？

### 5. 风险与反例场景

主动造具体场景压测：

- 最常见路径
- 边界路径
- 失败路径
- 迁移 / 回滚路径
- 老数据 / 旧接口 / 兼容路径
- 用户权限 / 多租户 / 并发 / 性能 / 安全等项目相关风险

每次只挑一个最可能推翻方案的场景问。

### 6. 文档写入规则

with-docs 模式下，重要结论不能只留在对话里，也不能只给“建议沉淀”。每次 grill 收束前必须完成一次文档归属判定，并在用户确认后最小写入合适的 ByteTrue 文档。

写入目标：

- 术语 / 语言共识 / domain glossary → 更新 `.bytetrue/reference/domain-context.md`。
- 项目管理 provider / label / sync / tracker 规则 → 更新 `.bytetrue/reference/project-management.md`。
- 能力愿景 / 用户故事 / 边界变清楚 → 走 `bt-req draft/update` 或直接更新对应 requirement。
- 系统现状或架构约束需要更新 → 走 `bt-arch update` 或更新对应 architecture 文档。
- 长期技术选择 / 约束 / convention 已拍板 → 走 `bt-decide`，写入 `.bytetrue/compound/` decision。
- 一两行启动必读注意事项 → 走 `bt-note`，写入 `.bytetrue/attention.md`。
- 调研事实或代码证据 → 走 `bt-explore`，写入 `.bytetrue/compound/` explore。
- 大需求拆解 ready → 走 `bt-roadmap`，写入 `.bytetrue/roadmap/{slug}/`。
- 单 feature ready → 走 `bt-feat-design`；必要时先落 feature brainstorm。

未拍板的分歧不要写成 decision。可以写入 roadmap / brainstorm / project-management 的“开放问题”区，但必须标明 `open` / `待确认`。

如果一次 grill 产生多个归属，按“最稳定、最上游”的文档先写：术语共识 → 长期决策 → 项目管理规则 → roadmap/feature/issue 计划。

## 每轮输出格式

每轮只输出一个问题，格式尽量稳定：

```md
我先问最影响后续分支的一点：{问题}

我看到的上下文：{来自文档/代码/对话的一两句证据；lite 模式可省略}
我的推荐答案：{明确推荐 + 理由}

你选 {推荐项}，还是有别的约束让我改判断？
```

如果需要给选项，最多 2-4 个，且每个选项必须有真实区别。

## 收束条件

出现任一情况就收束：

- 关键决策树已经走完，剩下只是实现细节。
- 用户说“够了 / 差不多 / 先这样”。
- 同一问题反复问不出新信息。
- 问题需要写代码、跑实验或看真实数据才能回答。

收束输出：

```md
我们现在的 shared understanding 是：
1. 已确认：...
2. 仍开放：...
3. 最大风险：...
4. 已写入 / 将写入的文档：...
5. 推荐下一步：`bt-xxx`，因为 ...
```

如果下一步是项目管理类能力，但 ByteTrue 还没有对应技能，明确说这是后续 additive 方向，暂时用 `bt-roadmap` / `bt-brainstorm` / 手工 issue 拆解承接。

## 常见错误

- 一次抛 5 个问题，把 grill 变成问卷。
- 用户说什么都复述接受，不挑战替代方案。
- with-docs 模式不读 `.bytetrue/` 就开始问。
- 发现文档 / 代码冲突但怕打断用户，不指出。
- 追问到实现细节，越过了 `bt-feat-design` / `bt-roadmap` 的职责。
- 把未拍板的讨论直接写成 decision。
- 用户明确要 lite，却仍强行读 ByteTrue 文档。
