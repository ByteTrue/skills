# ByteTrue Skills

一组成熟后可以独立安装、独立运行的 Agent Skills。

> ByteTrue 工作流已经独立到 [`ByteTrue/workflow`](https://github.com/ByteTrue/workflow)。本仓库只放“一人成军”的 standalone skills。

## 安装

查看可用 skills：

```bash
npx skills add https://github.com/ByteTrue/skills --list
```

当前仓库刚初始化，暂时没有收录具体 skill；空仓库阶段该命令会报告 `No skills found`。

安装某个 skill：

```bash
npx skills add https://github.com/ByteTrue/skills --skill <skill-name>
```

安装全部 standalone skills：

```bash
npx skills add https://github.com/ByteTrue/skills --all
```

## 仓库结构

```text
skills/
  <skill-name>/
    SKILL.md
    reference.md      # optional
    scripts/          # optional
```

## 收录规则

每个 skill 必须能独立工作：

- 不依赖 `bt-*` workflow skills 已安装；
- 不要求目标项目存在 `.bytetrue/`；
- 不引用其他 skill 目录里的文件；
- `description` 写清楚触发场景和常见触发词；
- 可以通过 `npx skills add ... --skill <skill-name>` 单独安装。
