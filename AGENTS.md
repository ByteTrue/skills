0. 开发、修改或 review 本仓库的 skill 前，先阅读 `docs/what-is-skills.md`，确认 Skill 机制、frontmatter、description 触发、渐进式加载和目录引用规则；只有纯粹的非 skill 事务可跳过。

1. 不同的技能之间不要相互耦合，即 A 技能在非必须情况下不要看 B 技能。
2. skill 是独立安装单元，运行时每个 skill 只能看到自己包内的文件。A 技能的 SKILL.md 里写 `B-skill/reference/xxx.md` 这种引用在运行时**根本读不到**——skill 之间没有共享的文件系统父目录。跨 skill 共享的参考文档必须走"工作项目"这一层：由 `bt-onboard` 从技能包复制到项目的 `.bytetrue/reference/`，其他 skill 用项目相对路径 `.bytetrue/reference/xxx.md` 读取。要改共享口径时改 `bt-onboard/reference/` 下的模板，新项目 onboard 时带上新版本。

增加、更新技能时注意更新其他相关技能中的表述。


单md文档不能超过300行，超过必须拆分。


### 核心原则
言简意赅