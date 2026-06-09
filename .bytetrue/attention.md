# Attention

本文件是 ByteTrue 技能启动必读的项目注意事项入口。所有 ByteTrue 子技能开始工作前必须读取它。

## 项目碎片知识

<!-- bt-note managed: 用 bt-note 维护，新条目按下面分节追加 -->

### 编译与构建

### 运行与本地起服务

### 测试

### 命令与脚本陷阱

- 本仓库是一个多 skill bundle：`skills/` 下每个包含 `SKILL.md` 的一级目录都是一个独立 skill。
- 本地自举开发时推荐把 `/Users/byte/workspace/projects/skills/skills` symlink 安装到 `~/.agents/skills` / `~/.claude/skills`，这样改仓库内 `SKILL.md` 可立即反映到已安装 skill。
- `npx skills add /Users/byte/workspace/projects/skills --list` 可以识别本地路径并列出全部 skills；`npx skills add <local-path> -g --all` 更适合复制式正式安装，不适合边改边用。

### 路径与目录约定

- ByteTrue 自身工作流源码在 `/Users/byte/workspace/projects/skills`。
- Matt skills absorption 自举工作已合入 `main`；`.bytetrue/roadmap/matt-skills-absorption/` 已完成并归档。
- Matt skills absorption 阶段保持 additive 增强，不重写已有 `bt` 核心流程；后续改动仍优先保持 additive。

### 环境变量与凭证

### 其他

- Matt Pocock skills 的项目管理能力已吸收为 additive `bt-tracker` 能力；规则见 `.bytetrue/reference/project-management.md`。
