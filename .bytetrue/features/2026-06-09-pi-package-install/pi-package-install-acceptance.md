# pi package / Claude plugin 安装方式验收报告

> 阶段：阶段 3（验收闭环）
> 验收日期：2026-06-09
> 关联方案 doc：.bytetrue/features/2026-06-09-pi-package-install/pi-package-install-design.md

## 1. 接口契约核对

**接口示例逐项核对**：

- [x] `package.json`：方案要求新增 pi package metadata，`pi.skills` 为 `["./skills/*/SKILL.md"]`。实际已更新，JSON 解析通过，`keywords` 包含 `pi-package`。
- [x] `.claude-plugin/plugin.json`：方案要求新增 Claude Code plugin manifest。实际已新增，plugin name 为 `bytetrue`。
- [x] `.claude-plugin/marketplace.json`：方案要求新增 Claude Code marketplace catalog。实际已新增，marketplace name 为 `bytetrue-skills`，包含 `bytetrue` plugin。
- [x] `README.md` / `README.en.md`：方案要求新增 Claude plugin、pi 原生安装、临时试用，并保留 `npx skills add`。实际均已存在。

**名词层“现状 → 变化”逐项核对**：

- [x] 仓库从“根目录平铺 skill 目录”变为“`skills/` 作为 canonical skill 源码目录”。一致。
- [x] 仓库从“无 pi manifest”变为“根目录 package manifest 声明 skill resources”。一致。
- [x] 仓库从“无 Claude plugin metadata”变为“根目录 `.claude-plugin/` 声明 plugin 和 marketplace”。一致。
- [x] 安装说明从“只有 skills CLI”变为“Claude plugin / pi / agentskills 并列”。一致。

## 2. 行为与决策核对

**需求摘要逐项验证**：

- [x] `skills/` 下存在 28 个 `SKILL.md` 入口。
- [x] `package.json` 存在且 `pi.skills` 指向 `./skills/*/SKILL.md`。
- [x] Claude plugin manifest 和 marketplace catalog 存在。
- [x] README 中英文安装段都给出 Claude plugin、pi 原生安装和现有 `npx skills add`。
- [x] `npx skills add <repo-root> --list` 能从 `skills/` 下识别全部 28 个 skills。

**明确不做逐项核对**：

- [x] 未发布 npm 包，README 没有把 `pi install npm:@bytetrue/skills` 写成正式命令。
- [x] 未复制第二份 skill 内容；`skills/` 是 canonical 源码。
- [x] 未新增 pi runtime extension 文件。
- [x] 未改任何 `SKILL.md` 行为内容。
- [x] 未写入 `.pi/settings.json`、`.claude/settings.json` 或用户全局 settings。

**关键决策落地**：

- [x] D1：把 28 个 skill 目录迁移到标准 `skills/` 二级目录。已落地。
- [x] D2：pi manifest 使用 `./skills/*/SKILL.md`。已落地。
- [x] D3：Claude plugin 使用默认 `skills/` 结构。已落地。
- [x] D4：第一阶段以 git / local install 为主，不写 npm 安装命令。已落地。

**挂载点反向核对**：

- [x] `skills/`：canonical skill 源码目录。
- [x] 根目录 `package.json`：pi package manifest。
- [x] 根目录 `.claude-plugin/`：Claude Code plugin / marketplace metadata。
- [x] `README.md`：中文安装入口已更新。
- [x] `README.en.md`：英文安装入口已更新。
- [x] 拔除沙盘推演：删除 `.claude-plugin/`、`package.json` 并回退 README 安装段后，安装投影消失；删除 `skills/` 则 skill bundle 本体消失。

## 3. 验收场景核对

- [x] S1：读取 `package.json` → JSON 可解析，`keywords` 含 `pi-package`，`pi.skills` 等于 `["./skills/*/SKILL.md"]`。
- [x] S2：读取 `.claude-plugin/plugin.json` → JSON 可解析，`name` 为 `bytetrue`。
- [x] S3：读取 `.claude-plugin/marketplace.json` → JSON 可解析，`name` 为 `bytetrue-skills`，包含 `bytetrue` plugin。
- [x] S4：按 manifest glob 匹配仓库内 skills → 匹配结果为 28 个 `skills/*/SKILL.md`。
- [x] S5：`npx skills add <repo-root> --list` → 识别 28 个 skills。
- [x] S6：中文 README 安装段 → 包含 Claude plugin、pi install、pi -e、npx skills add。
- [x] S7：英文 README Install 段 → 包含同等英文安装入口。
- [x] S8：范围守护 → 未出现 npm 安装命令、未新增 runtime extension 目录、未改 `SKILL.md` 内容。

## 4. 术语一致性

- `pi package`：指 pi 原生 package 安装单元，由 `package.json` 声明。
- `Claude plugin`：指 Claude Code plugin / marketplace 机制，由 `.claude-plugin/` 声明；安装后使用 `/bytetrue:*` 命名空间。
- `skills/`：本仓库 canonical skill 源码目录；npx、pi、Claude plugin 都从这里读取同一份 `SKILL.md`。
- `pi extension`：本 feature 没有新增 runtime extension；实现未新增 `extensions/` 目录。

## 5. 架构归并

- [x] `.bytetrue/architecture/ARCHITECTURE.md`：已更新为 `skills/` canonical 目录结构，并记录 `package.json` / `.claude-plugin/` 两个安装投影。
- [x] `.bytetrue/attention.md`：已更新本地开发 symlink 建议，从 repo root 改为 repo/skills。

## 6. requirement 回写

- [x] 已有 `.bytetrue/requirements/pi-package-install.md` 表达“pi 用户可以用原生 package 命令安装 ByteTrue”。
- [x] 本次扩展到 Claude plugin 后，该 requirement 仍覆盖“按 harness 原生入口安装 ByteTrue”的能力；无需新建第二份 requirement。
- [x] `.bytetrue/requirements/VISION.md` 已包含 `pi-package-install` current 条目。

## 7. roadmap 回写

- [x] 非 roadmap 起头：design frontmatter 无 `roadmap` / `roadmap_item`，无需回写 roadmap。

## 8. attention.md 候选盘点

- [x] 已更新 attention：本地自举开发 symlink 应指向 `/Users/byte/workspace/projects/skills/skills`。

## 9. 遗留

- 后续优化点：若未来发布 npm 包，再把 README 增加 `pi install npm:@bytetrue/skills`，并补 npm 发布 / gallery 验收。
- 已知限制：本次只做静态与 CLI discovery 验证，未擅自执行真实 `pi install` 或 `claude plugin install` 写入用户 settings。
- 顺手发现：`npx skills` 支持真实 `skills/` 二级目录；早先 symlink 实验失败是因为 discovery 没跟随临时 symlink 目录。
