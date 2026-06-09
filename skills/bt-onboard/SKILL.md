---
name: bt-onboard
description: 把新仓库或有零散文档的仓库接入 ByteTrue 体系，两条路径自动判断：空仓库从零搭骨架，已有文档走审计 + 迁移映射。触发：用户说"在这个项目里用 ByteTrue"、"搭 ByteTrue 结构"、"初始化 ByteTrue"、"迁移到 ByteTrue"。
---

# bt-onboard

把仓库**接入 ByteTrue 工作流体系**——白纸或已有零散文档的都行。本技能做三件事：**搭骨架**、**归旧档**、**初始化项目管理 / tracker 配置**。骨架搭好后子工作流（feature / issue / compound 等）即可直接运行。

---

## 两条路径

| 路径 | 适用 | 产出 |
|---|---|---|
| **空仓库** | 仓库内无 spec 类文档，也没有 `.bytetrue/` | 完整骨架 + 必要骨架文件 |
| **迁移** | 仓库内有零散文档 / `docs/` / 部分 `.bytetrue/` 结构 | 审计报告 + 迁移映射方案（用户逐条确认）+ 落盘 |

启动后**先扫一次自动判断**，不要让用户选——TA 大概率不知道项目里现有哪些文档。扫描结果模糊（如只有 README）就明说判断依据并问用户。

---

## 标准骨架（目标状态）

> 共享路径与命名约定的权威版本是项目里的 `.bytetrue/reference/shared-conventions.md`——本技能从技能包复制过去。下面只列 onboard 创建 / 检查的骨架文件。

```
.bytetrue/
├── attention.md                ByteTrue 技能启动必读的项目注意事项
├── requirements/               需求聚合根（空目录 .gitkeep）
├── architecture/
│   └── ARCHITECTURE.md         架构总入口（首次创建为占位模板）
├── roadmap/                    规划层聚合根
├── features/                   feature 聚合根
├── issues/                     issue 聚合根
├── compound/                   沉淀类统一目录（learning / trick / decision / explore）
├── tools/                      跨工作流共享脚本（onboard 释放）
│   ├── search-yaml.py
│   └── validate-yaml.py
└── reference/                  跨子技能共享参考（onboard 释放）
    ├── shared-conventions.md
    ├── system-overview.md
    ├── domain-context.md       术语 / domain glossary / grill-with-docs 共识
    ├── project-management.md   external tracker / labels / sync policy
    ├── tools.md
    └── maintainer-notes.md
```


---

## 启动检查

**先检查一次现状**：

1. **检查 `.bytetrue/`**：不存在 → 空仓库候选；存在但不完整 → 迁移（部分补齐）
2. **旧 ByteTrue兼容** ByteTrue 经过多次改名，从 easysdd 到 bytetrue 再到 .bytetrue，如果遇到旧版的bytetrue目录，提示用户：

   > 检测到旧版bytetrue。建议直接 `git mv easysdd .bytetrue`，结构 / frontmatter 完全兼容，rename 后即用。要我执行吗？

   同意 → `git mv easysdd .bytetrue`，按迁移路径走（这时只需补齐可能缺失的 `attention.md`、`tools/` 和 `reference/`）。想保留旧目录 → 告诉他子技能只读 `.bytetrue/`，旧目录不会被读；按空仓库路径走新骨架

3. **Glob 全仓库 `.md`**（排除 `node_modules/` `.git/`）：根目录 `DESIGN.md` / `ARCHITECTURE.md` / `SPEC.md` / `README.md`；`docs/` `doc/` `design/` `spec/` `wiki/`；现有 `.bytetrue/` 下文件
4. **检查 `.bytetrue/attention.md`**：缺失则列为骨架待补齐项
5. **汇报扫描结论**：找到的相关文档（列路径）+ 走哪条路径 + 判断依据 + 不确定项

---

## 空仓库路径

**步骤 1：和用户确认范围**

- 项目名 / 简介（用于填 `ARCHITECTURE.md` 占位）
- attention.md 只建最小骨架；用户已经给出的项目硬约束才写入，不凭空代填

**步骤 2：创建目录骨架**

按下面顺序执行，**不等用户逐步确认**——骨架是整体一次性的：

- `.bytetrue/{requirements,roadmap,features,issues,compound}/.gitkeep`
- `.bytetrue/attention.md`（最小骨架模板见同目录 `reference.md`）
- `.bytetrue/architecture/ARCHITECTURE.md`（占位模板见同目录 `reference.md`）
- `.bytetrue/tools/`（用 `cp -rf` / `Copy-Item -Recurse -Force` 整目录拷贝技能包 `bt-onboard/tools/`，**不要 Read 再 Write**）
- `.bytetrue/reference/`（从技能包 `bt-onboard/reference/` 初始化；新项目可整目录复制）

> **落盘用 shell 拷贝**，不要 Read 再 Write——这些是共享资产 / 模板，Read+Write 会截断大文件、改缩进、吃空行，还慢费 token。迁移 / 重跑 onboard 时，`domain-context.md` 和 `project-management.md` 是项目自有配置，不允许无确认覆盖；具体命令见迁移路径步骤 4。

**步骤 3：project-management setup**

询问用户 external tracker provider：

1. `local`：只使用 `.bytetrue/`，不创建外部 issue。
2. `github`：使用本地 `gh` CLI。
3. `gitlab`：使用本地 `glab` CLI。

用户选择 `github` 时检查：

```bash
command -v gh
gh auth status
git remote -v
```

用户选择 `gitlab` 时检查：

```bash
command -v glab
glab auth status
git remote -v
```

把 provider、检测结果、用户选择的 label 映射写入 `.bytetrue/reference/project-management.md`。没有安装或未登录时不要中止 onboard；把状态写成 `not_configured`，告诉用户之后可重跑 `bt-onboard` 或手动更新 `project-management.md`。

**步骤 4：attention.md 提醒**

attention.md 已创建但默认只有空骨架。汇报时提醒用户：有编译前置、测试命令、目录禁区、凭证规则这类"每次 ByteTrue 技能启动都必须知道"的信息，后续用 `bt-note` 一条条追加。

**步骤 5：验收汇报**

列建了哪些文件：

> ByteTrue 骨架已就绪。现在可以：开始新功能 `bt-feat` / 报告问题 `bt-issue` / 沉淀知识 `bt-learn`；如需同步 GitHub/GitLab/local tracker，后续走 `bt-tracker`。

---

## 迁移路径

**步骤 1：生成审计报告**

| 现有文件 | 推测内容类型 | 建议归入 ByteTrue | 置信度 |
|---|---|---|---|
| `docs/DESIGN.md` | 项目架构 | `.bytetrue/architecture/ARCHITECTURE.md` | 高 |
| `docs/feature-auth.md` | 功能设计稿 | `.bytetrue/features/YYYY-MM-DD-auth/auth-design.md` | 中 |
| `SPEC.md` | 功能需求？ | 需用户确认 | 低 |

**置信度**：高 = 语义明确匹配；中 = 可推断有歧义；低 = 不明确或映射多个位置都合理。

**步骤 2：逐条对齐**

中 / 低置信度的用 `AskUserQuestion` 问：

- 中：给推断理由，问"按这个方式归位？"
- 低：描述文件内容，给 2-3 个候选位置 + "跳过"

高置信度不逐条问但要在汇报里列，给用户复审机会——逐条问会让节奏失控。

**步骤 3：处理已部分存在的 .bytetrue/**

- 命名不符规范（`YYYY-MM-DD-{slug}` 格式）但有内容 → 提示用户问是否重命名
- 空占位（`.gitkeep` / 空 `.md`）→ 直接补齐不问

**步骤 4：补齐缺失骨架**

对照标准骨架补齐**用户确认后仍缺失**的目录 / 文件。已有内容不覆盖。

**`.bytetrue/tools/` 一律用技能包新版本覆盖**——这是技能包维护的共享脚本，权威源在 `bt-onboard/tools/`。

**`.bytetrue/reference/` 分两类处理**：

- 技能包维护参考：`shared-conventions.md`、`system-overview.md`、`tools.md`、`maintainer-notes.md`、`code-dimensions.md`、`requirement-example.md` 等，可用技能包新版本覆盖。
- 项目自有配置：`domain-context.md`、`project-management.md`，只在缺失时从模板创建；已有内容不无确认覆盖。

覆盖前在汇报列出会覆盖的技能包维护文件；项目自有配置已有时列为“保留现有”。

**落盘命令**：

```bash
# macOS / Linux
cp -rf <技能包路径>/bt-onboard/tools/. .bytetrue/tools/

# reference：覆盖技能包维护文件，但保留项目自有配置
rsync -a \
  --exclude domain-context.md \
  --exclude project-management.md \
  <技能包路径>/bt-onboard/reference/. .bytetrue/reference/

test -e .bytetrue/reference/domain-context.md || \
  cp <技能包路径>/bt-onboard/reference/domain-context.md .bytetrue/reference/domain-context.md

test -e .bytetrue/reference/project-management.md || \
  cp <技能包路径>/bt-onboard/reference/project-management.md .bytetrue/reference/project-management.md

# Windows PowerShell
Copy-Item -Recurse -Force <技能包路径>\bt-onboard\tools\* .bytetrue\tools\
Get-ChildItem <技能包路径>\bt-onboard\reference\* | Where-Object { $_.Name -notin @('domain-context.md','project-management.md') } | Copy-Item -Destination .bytetrue\reference\ -Force
if (!(Test-Path .bytetrue\reference\domain-context.md)) { Copy-Item <技能包路径>\bt-onboard\reference\domain-context.md .bytetrue\reference\domain-context.md }
if (!(Test-Path .bytetrue\reference\project-management.md)) { Copy-Item <技能包路径>\bt-onboard\reference\project-management.md .bytetrue\reference\project-management.md }
```

不要：Read+Write 手工搬（截断 / 改缩进）、整目录覆盖 reference 导致项目术语 / tracker 配置丢失。

技能包路径一般是 skill 安装目录（`~/.claude/skills/bt-onboard/`、`~/.agents/skills/bt-onboard/` 或插件目录）。不确定先 `ls` 定位。拷完 `ls .bytetrue/tools/ .bytetrue/reference/` 验证。

**步骤 5：处理不迁移的文件**

用户选"跳过"的文件：**不移动 / 不删除 / 不重命名**，汇报标"保留原位（未纳入 ByteTrue）"。**绝不允许未经确认就动**——onboard 只允许 AI 整理不允许替用户做删除决定。

**步骤 6：project-management setup**

和空仓库路径相同，询问 `local | github | gitlab`，检测 `gh` / `glab` CLI、auth 状态和 `git remote -v`，把结果写入或合并到 `.bytetrue/reference/project-management.md`。

已有 `project-management.md` 时不覆盖 provider / labels / status_sync；只补缺失字段或在用户确认后更新。

**步骤 7：attention.md 提醒**（同空仓库路径步骤 4）

**步骤 8：验收汇报**

列：迁移文件清单（from → to）、新建骨架、project-management provider 状态、未迁移文件（保留原位）、下一步建议。

---

## 骨架文件模板

`ARCHITECTURE.md` 占位模板和 `attention.md` 最小模板见同目录 `reference.md`。

---

## 退出条件

- [ ] `.bytetrue/` 八个子目录都存在
- [ ] `.bytetrue/attention.md` 已建
- [ ] `.bytetrue/tools/` 已从技能包复制
- [ ] `.bytetrue/reference/` 技能包维护文件已同步
- [ ] `.bytetrue/reference/domain-context.md` 已存在，且未无确认覆盖已有内容
- [ ] `.bytetrue/reference/project-management.md` 已存在，provider / CLI / auth / remote 状态已记录
- [ ] `.bytetrue/architecture/ARCHITECTURE.md` 已建
- [ ] 迁移路径：每条映射都有明确处理结果（迁移 / 保留原位）
- [ ] 迁移路径：没有未经确认就移动的文件
- [ ] 验收汇报已给出

---

## 容易踩的坑

- **未经确认就移动 / 删除已有文件**——迁移核心原则是用户拍板
- **替用户填 attention.md 实质内容**——必须项目 owner 来定，AI 只提供模板
- **重新引入 `AGENTS.md` / `CLAUDE.md` 兼容路径**——ByteTrue 的启动注意事项入口固定为 `.bytetrue/attention.md`
- **建完骨架立刻开始 feature/issue**——onboard 是"搭环境"不是"开始干活"
- **低置信度直接执行**——低 = 必须问
- **`.bytetrue/tools/` 走“不覆盖”保守策略**——共享脚本必须用技能包新版本覆盖，否则升级后用户停留在过时工具
- **整目录覆盖 `.bytetrue/reference/`**——会覆盖 `domain-context.md` / `project-management.md` 这类项目自有配置，丢掉术语和 tracker 设置
- **用 Read + Write 手工搬**——工具目录和技能包维护 reference 必须 shell 拷贝
- **Glob 时忘记排除 `node_modules/` `.git/`**——会让扫描结果充斥噪声

---

## 相关文档

- `.bytetrue/reference/system-overview.md` — ByteTrue 体系总览
- `.bytetrue/reference/shared-conventions.md` — 目录结构和共享口径的权威版本
- `.bytetrue/reference/domain-context.md` — 项目术语 / domain glossary / grill-with-docs 共识
- `.bytetrue/reference/project-management.md` — external tracker provider / labels / sync policy
- `.bytetrue/attention.md` — ByteTrue 技能启动必读的项目注意事项
- `.bytetrue/architecture/ARCHITECTURE.md` — 架构总入口骨架
