# AGENTS.md

本仓库是 ByteTrue 的 standalone Agent Skills 集合，不是 ByteTrue workflow。

## 核心边界

- `ByteTrue/workflow` 承载 `bt-*` 生命周期工作流。
- 本仓库只承载“一人成军”的独立 skills。
- 新增 skill 放在 `skills/<skill-name>/SKILL.md`。
- 不要让 standalone skill 依赖 `bt-*`、`.bytetrue/` 或其他 skill 包内文件。
- 如果某个 skill 开始需要工作流生命周期、共享 reference 或 `.bytetrue` 状态，优先考虑迁移到 `ByteTrue/workflow`，不要在这里隐式耦合。

## Skill 维护规则

- `name` 与目录名保持一致，使用小写字母、数字和连字符。
- `description` 是触发关键字段：写清楚“做什么 + 什么时候用 + 常见触发词”。包含 `: ` 的 description 必须加引号或用 YAML folded scalar。
- `SKILL.md` 保持短小；长模板、示例、参考材料放同目录 `reference.md` / `examples.md`。
- 脚本放同一 skill 目录下的 `scripts/`，避免跨 skill 共享父目录。
- 新增或修改具体 skill 后至少运行：`npx skills add . --list`。空仓库阶段没有 `SKILL.md` 时该命令会报告 `No skills found`，这是预期状态。

## 文风

默认中文沟通；文件已有英文语境时保持英文。
