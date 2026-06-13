# CLAUDE.md

> 面向 coding agent 的仓库工作说明。README 面向用户；本文件只写代理在本仓库动手时必须知道的工程规则。

## 项目概览

- 本仓库是 ByteTrue workflow skills 的源码包：一组独立安装的 Agent Skills，用于把需求、架构、路线图、特性、问题、重构、审计和知识沉淀串成 AI 编码工作流。
- 主要产物是 Markdown skill 与 reference 模板；少量 Python 脚本用于 `.bytetrue` YAML/frontmatter 检索与校验。
- 安装投影：`package.json` 的 `pi.skills`、`.claude-plugin/` 的 Claude Code plugin 元数据、以及标准 `npx skills add` 路径都指向 `skills/*/SKILL.md`。

## 仓库结构速览

- `skills/<skill-name>/SKILL.md`：每个 skill 的入口与触发说明。
- `skills/<skill-name>/reference*.md`：同一 skill 内按需读取的详细模板/参考。
- `skills/bt-onboard/reference/`：由 `bt-onboard` 复制到工作项目 `.bytetrue/reference/` 的共享模板源。
- `skills/bt-onboard/tools/`：由 `bt-onboard` 释放到工作项目 `.bytetrue/tools/` 的脚本源。
- `.bytetrue/`：本仓库作为一个工作项目时产生的 ByteTrue 产物；它是开发记录与当前项目配置，不等同于 skill 包源码。
- `docs/what-is-skills.md`：维护 skill 前必须先读的 Skill 机制 primer。
- `.claude-plugin/`、`package.json`、`README*.md`：发布与安装说明。

## 开始任何 skill 相关修改前

1. 先完整阅读 `docs/what-is-skills.md`，确认 frontmatter、description 触发、渐进式加载、目录引用和独立安装单元规则。只有纯粹非 skill 事务可跳过。
2. 明确这次改的是哪一层：
   - **skill 包源码**：`skills/**`、`package.json`、`.claude-plugin/**`、README 安装说明。
   - **本仓库的 ByteTrue 项目产物**：`.bytetrue/**`，用于记录本仓库自身的需求/设计/验收/决策。
3. 如果改共享口径，优先改 `skills/bt-onboard/reference/**` 模板；当前项目也需要立刻使用时，再同步 `.bytetrue/reference/**` 对应副本。不要把 A skill 的 SKILL.md 写成直接引用 B skill 包内文件。

## Skill 维护硬规则

- 不同 skill 默认互不耦合。A skill 运行时只能看到自己包内文件和工作项目文件；不能假设能读取 `../other-skill/reference.md`。
- 跨 skill 共享资料必须通过工作项目层 `.bytetrue/reference/` 暴露，由 `bt-onboard` 从 `skills/bt-onboard/reference/` 复制。
- `description` 是触发关键字段：写清楚“做什么 + 什么时候用 + 常见触发词”。包含 `: ` 的 description 必须加引号或用 YAML folded scalar，避免 `npx skills add` 静默跳过。
- 增加、更新一个 skill 时，检查入口路由 `skills/bt/SKILL.md`、相关阶段 skill、`bt-onboard/reference/system-overview.md`、README/安装投影是否也需要同步。
- 不要为单次需求添加抽象层、自动化 runtime、hook、CLI、跨 skill 共享父目录等能力；除非用户明确要求且设计已确认。

## Skill 文档体积边界

`300 行` 是本仓库维护 skill 包时的体积建议，用于控制会进入 agent 上下文的文档大小；它不是全仓库 Markdown 限制。

适用范围：

- `skills/*/SKILL.md`
- `skills/*/reference*.md`
- `skills/bt-onboard/reference/*.md` 这类发布给新项目的共享模板源
- 必要时包括维护 Skill 机制本身的短参考文档

不适用范围：

- `.bytetrue/features/**` 的 design / checklist / implementation-report / acceptance
- `.bytetrue/issues/**`、`.bytetrue/roadmap/**`、`.bytetrue/requirements/**`、`.bytetrue/architecture/**`、`.bytetrue/compound/**`、`.bytetrue/worklog/**`
- 当前项目副本 `.bytetrue/reference/**` 的独立历史内容（除非正在与 `skills/bt-onboard/reference/**` 做模板同步）
- README、评测、历史 asset、项目产物文档

对不适用范围，按该类文档自身约定和可读性决定是否拆分。skill 源码文件接近 300 行时，优先压缩入口指令，或移入同一 skill 的 `reference.md` / 同目录参考文件。

## 开发与校验命令

本仓库没有常规构建产物，修改多为 Markdown/YAML/Python。按改动选择最小校验：

```bash
# 列出/解析本地 skills，能发现 frontmatter YAML 解析问题
npx skills add . --list

# 校验某个 Markdown frontmatter 或 YAML 文件
python3 .bytetrue/tools/validate-yaml.py --file <path>
python3 .bytetrue/tools/validate-yaml.py --file <path> --yaml-only

# Python 脚本语法检查；脚本需兼容 macOS 默认 Python 3.9
python3 -m py_compile scripts/*.py .bytetrue/tools/*.py skills/bt-onboard/tools/*.py
```

说明：

- `package.json` 目前主要是 Pi package 元数据，没有 `npm test` / `build` 脚本。
- 非交互 shell 里的 `python3` 可能是 macOS/Xcode Python 3.9；脚本避免未延迟解析的 PEP 604 类型标注，或显式 `from __future__ import annotations`。
- 修改 `.claude-plugin/*.json` 或 `package.json` 后，用 JSON 解析或相关安装命令做最小验证。

## ByteTrue 自举开发注意事项

- 使用本仓库的 bt workflow 开发本仓库时，始终区分“正在生产的 workflow 产品源码”和“.bytetrue 下记录本次开发过程的项目产物”。
- `.bytetrue/attention.md` 是 ByteTrue 子技能启动必读入口；如果你手动走 bt 流程，先读它。
- `.bytetrue/config.yaml` 是当前项目配置源；不要从 prose reference 里反推当前 tracker/workflow/dispatch/doc policy 值。
- 历史已验收的 `.bytetrue/features/**` 文档通常不做回扫式改写；只有当前任务明确要求迁移历史产物时才动。
- 本地自举开发时，用 `python3 scripts/link-local-skills.py --dry-run` 预览，再运行 `python3 scripts/link-local-skills.py`，把本仓库 `skills/*` 按 skill 名逐个软链到 `~/.agents/skills`，同时保留其他个人 skills。

## 文风与编辑纪律

- 默认中文沟通；文件已有英文语境时保持英文。
- 变更要外科手术式：只改与请求直接相关的文件，不顺手重排无关内容。
- 先读再改；保持现有格式、frontmatter 字段顺序和路径命名风格。
- 修改模板时，避免只改当前项目副本而忘记 `skills/bt-onboard/reference/**`；也避免只改模板而当前项目马上运行仍读旧副本。
- 不要在未确认前执行 `git commit`、`git push`、外部 tracker 写入、破坏性命令或大范围目录迁移。

## PR / 提交前检查

- 汇报修改文件清单、动机、验证命令和结果。
- 若改 skill 触发/路由，说明触发词或路由表变化。
- 若改共享 reference，说明 template 与当前 `.bytetrue/reference` 是否需要/已经同步。
- 提交信息用一句话说明行为变化，不贴长路径清单。
