---
name: bt-onboard
description: 'Bring a new repository, or a repository with scattered existing docs, into the ByteTrue system. It auto-chooses between two paths: build the skeleton from scratch for an empty repo, or do audit plus migration mapping for an existing repo with docs. Trigger when the user says "use ByteTrue in this project", "set up ByteTrue structure", "initialize ByteTrue", or "migrate to ByteTrue".'
---

# bt-onboard

Bring the repository **into the ByteTrue workflow system** — whether it is a blank slate or already has scattered documentation. This skill does three things: **build the skeleton**, **rehome old docs**, and **initialize project-management / tracker configuration**. Once the skeleton is ready, the sub-workflows, feature, issue, compound, and so on, can run directly.

---

## Two paths

| Path | Applies when | Output |
|---|---|---|
| **Empty repo** | no spec-like docs in the repo, and no `.bytetrue/` | full skeleton + required skeleton files |
| **Migration** | scattered docs already exist, under `docs/`, or partial `.bytetrue/` structure already exists | audit report + migration mapping plan, confirmed with the user item by item, + write-to-disk |

After startup, **do one scan first and choose the path automatically**. Do not ask the user to choose, because in most cases they themselves do not know what kinds of documentation are already in the repo. If the scan result is ambiguous, for example only a README exists, say so explicitly, explain your basis, and ask the user.

---

## Standard skeleton, target state

> The authoritative version of shared paths and naming conventions is the project's own `.bytetrue/reference/shared-conventions.md`, copied there by this skill. The list below only covers the skeleton files that onboard creates or checks.

```text
.bytetrue/
├── attention.md                project notes that every ByteTrue skill must read at startup
├── requirements/               requirement aggregate root, empty directory with .gitkeep
├── architecture/
│   └── ARCHITECTURE.md         architecture entry point, initially created as a placeholder template
├── roadmap/                    planning-layer aggregate root
├── features/                   feature aggregate root
├── issues/                     issue aggregate root
├── compound/                   unified directory for captured learning / trick / decision / explore
├── worklog/                    lightweight report-feed / handoff / recovery records
├── tools/                      shared scripts across workflows, released by onboard
│   ├── search-yaml.py
│   └── validate-yaml.py
└── reference/                  shared references across sub-skills, released by onboard
    ├── shared-conventions.md
    ├── system-overview.md
    ├── domain-context.md       terminology / domain glossary / grill-with-docs consensus
    ├── project-management.md   external tracker / labels / sync policy
    ├── tools.md
    ├── execution-modes.md     workflow heaviness / evidence discipline
    ├── implementation-review.md implementation review gate / readiness discipline
    ├── context-manifest.md      feature-local implement/check read-set contract
    ├── subagent-handoff.md     implement/check/research handoff role contract
    ├── research-first.md       evidence-before-decision trigger and citation rule
    ├── worklog-report-feed.md lightweight worklog / report-feed contract
    └── maintainer-notes.md
```

---

## Startup checks

**Check the current state first**:

1. **Check `.bytetrue/`**: if it does not exist, that is a candidate for the empty-repo path; if it exists but is incomplete, that is migration, partial completion
2. **Glob all `.md` files in the repo**, excluding `node_modules/` and `.git/`: look at root-level `DESIGN.md`, `ARCHITECTURE.md`, `SPEC.md`, `README.md`; also `docs/`, `doc/`, `design/`, `spec/`, `wiki/`; and existing files under `.bytetrue/`
3. **Check `.bytetrue/attention.md`**: if it is missing, list it as a skeleton item that needs to be filled
4. **Report the scan conclusion**: list the relevant docs found, the path chosen, the reason for that judgment, and any remaining uncertainties

---

## Empty-repo path

**Step 1: confirm the scope with the user**

- project name / summary, to fill the `ARCHITECTURE.md` placeholder
- `attention.md` gets only the minimal skeleton; only project hard constraints already given by the user should be written, nothing should be invented on their behalf

**Step 2: create the directory skeleton**

Execute the following in order, **without waiting for step-by-step user confirmation** — the skeleton is one whole unit:

- `.bytetrue/{requirements,roadmap,features,issues,compound,worklog}/.gitkeep`
- `.bytetrue/attention.md`, using the minimal template in `reference.md` in the same directory
- `.bytetrue/architecture/ARCHITECTURE.md`, using the placeholder template in `reference.md` in the same directory
- `.bytetrue/tools/`, copied by shell using `cp -rf` or `Copy-Item -Recurse -Force` from `bt-onboard/tools/` in the skill package, **not Read then Write**
- `.bytetrue/reference/`, initialized from `bt-onboard/reference/` in the skill package; for new projects, copying the whole directory is fine

> **Use shell copy for writing to disk**, not Read then Write — these are shared assets and templates, and Read+Write truncates large files, changes indentation, eats blank lines, and wastes tokens. On migration or rerunning onboard, `.bytetrue/reference/domain-context.md` and `.bytetrue/reference/project-management.md` are project-owned configuration and must never be overwritten without confirmation. See step 4 of the migration path for concrete commands.

**Step 3: project-management setup**

Ask the user for the external tracker provider:

1. `local`: use only `.bytetrue/`, create no external issues
2. `github`: use the local `gh` CLI
3. `gitlab`: use the local `glab` CLI

If the user chooses `github`, check:

```bash
command -v gh
gh auth status
git remote -v
```

If the user chooses `gitlab`, check:

```bash
command -v glab
glab auth status
git remote -v
```

Write the provider, detection result, and the user's chosen label mapping into `.bytetrue/reference/project-management.md`. If the CLI is not installed or not logged in, do not stop onboarding. Write the state as `not_configured` and tell the user they can rerun `bt-onboard` later or update `.bytetrue/reference/project-management.md` manually.

**Step 4: remind about attention.md**

`attention.md` has been created, but it contains only the empty skeleton by default. In the close-out report, remind the user that if there are compile prerequisites, test commands, forbidden directories, or credential rules that "every ByteTrue skill startup must know", those should later be appended one by one through `bt-note`.

**Step 5: acceptance-style summary**

List which files were created:

> The ByteTrue skeleton is ready. You can now: start a new feature with `bt-feat`, report a problem with `bt-issue`, or capture knowledge with `bt-learn`; if you need to sync GitHub, GitLab, or a local tracker, use `bt-tracker` later.

---

## Migration path

**Step 1: generate the audit report**

| Existing file | Guessed content type | Recommended ByteTrue destination | Confidence |
|---|---|---|---|
| `docs/DESIGN.md` | project architecture | `.bytetrue/architecture/ARCHITECTURE.md` | high |
| `docs/feature-auth.md` | feature design draft | `.bytetrue/features/YYYY-MM-DD-auth/auth-design.md` | medium |
| `SPEC.md` | feature requirement? | needs user confirmation | low |

**Confidence**: high means the meaning clearly matches; medium means it is inferable but ambiguous; low means it is unclear or multiple destinations are equally plausible.

**Step 2: align item by item**

Use `AskUserQuestion` for medium- and low-confidence items:

- medium: give the inference and the reason, then ask "should it be placed this way?"
- low: describe the file content, give 2-3 candidate destinations plus "skip"

Do not ask every high-confidence item one by one, but do list them in the report so the user still has a chance to review. Asking everything individually destroys the rhythm.

**Step 3: handle partially existing `.bytetrue/`**

- if naming violates convention, such as not following `YYYY-MM-DD-{slug}`, but the content exists, ask the user whether they want to rename it
- empty placeholders such as `.gitkeep` or empty `.md` files can be filled directly without asking

**Step 4: fill the missing skeleton**

Against the standard skeleton, fill any directory or file that is still missing **after user-confirmed migration decisions**. Do not overwrite existing content.

**Always overwrite `.bytetrue/tools/` with the fresh skill-package version** — these are shared scripts maintained by the skill package, and the authoritative source is `bt-onboard/tools/`.

**Handle `.bytetrue/reference/` in two categories**:

- project-owned configuration files, namely `.bytetrue/reference/domain-context.md` and `.bytetrue/reference/project-management.md`, should only be created from template when missing; if they already exist, they must not be overwritten without explicit confirmation

Before overwriting, list the skill-package-managed files that will be overwritten in the report; when project-owned configuration already exists, list it as "keep existing".

**Write-to-disk commands**:

```bash
# macOS / Linux
cp -rf <skill-package-path>/bt-onboard/tools/. .bytetrue/tools/

# reference: overwrite skill-package-managed files, but preserve project-owned config
rsync -a \
  --exclude domain-context.md \
  --exclude project-management.md \
  <skill-package-path>/bt-onboard/reference/. .bytetrue/reference/

test -e .bytetrue/reference/domain-context.md || \
  cp <skill-package-path>/bt-onboard/reference/domain-context.md .bytetrue/reference/domain-context.md

test -e .bytetrue/reference/project-management.md || \
  cp <skill-package-path>/bt-onboard/reference/project-management.md .bytetrue/reference/project-management.md

# Windows PowerShell
Copy-Item -Recurse -Force <skill-package-path>\bt-onboard\tools\* .bytetrue\tools\
Get-ChildItem <skill-package-path>\bt-onboard\reference\* | Where-Object { $_.Name -notin @('domain-context.md','project-management.md') } | Copy-Item -Destination .bytetrue\reference\ -Force
if (!(Test-Path .bytetrue\reference\domain-context.md)) { Copy-Item <skill-package-path>\bt-onboard\reference\domain-context.md .bytetrue\reference\domain-context.md }
if (!(Test-Path .bytetrue\reference\project-management.md)) { Copy-Item <skill-package-path>\bt-onboard\reference\project-management.md .bytetrue\reference\project-management.md }
```

Do not use Read+Write to move them manually. That truncates and reformats files. Do not overwrite the whole reference directory, because doing so would wipe project terminology and tracker configuration.

The skill-package path is usually the installed skill directory, such as `~/.claude/skills/bt-onboard/`, `~/.agents/skills/bt-onboard/`, or a plugin directory. If uncertain, locate it with `ls` first. After copying, verify with `ls .bytetrue/tools/ .bytetrue/reference/`.

**Step 5: handle files that are not being migrated**

For files the user chooses to skip: **do not move them, do not delete them, and do not rename them**. In the report, mark them as "kept in place, not brought into ByteTrue". **Never move anything without confirmation** — onboard is allowed to organize, but not to make deletion decisions for the user.

**Step 6: project-management setup**

Same as in the empty-repo path. Ask for `local | github | gitlab`, detect `gh` / `glab`, auth status, and `git remote -v`, then write or merge the result into `.bytetrue/reference/project-management.md`.

If `.bytetrue/reference/project-management.md` already exists, do not overwrite provider, labels, or status sync. Only fill in missing fields, or update after user confirmation.

**Step 7: attention.md reminder**, same as step 4 in the empty-repo path

**Step 8: acceptance-style summary**

List: migration file map, from → to; new skeleton files; project-management provider status; non-migrated files, still kept in place; and recommended next steps.

---

## Skeleton file templates

The placeholder template for `ARCHITECTURE.md` and the minimal template for `attention.md` are in `reference.md` in the same directory.

---

## Exit Conditions

- [ ] all required `.bytetrue/` subdirectories exist, including `worklog/`, `tools/`, and `reference/`
- [ ] `.bytetrue/attention.md` has been created
- [ ] `.bytetrue/tools/` has been copied from the skill package
- [ ] the skill-package-managed files under `.bytetrue/reference/` have been synchronized
- [ ] `.bytetrue/reference/domain-context.md` exists, and any pre-existing content was not overwritten without confirmation
- [ ] `.bytetrue/reference/project-management.md` exists, and provider, CLI, auth, and remote status have been recorded
- [ ] `.bytetrue/architecture/ARCHITECTURE.md` has been created
- [ ] on the migration path, every mapping item has an explicit result, migrated or kept in place
- [ ] on the migration path, no file was moved without confirmation
- [ ] the acceptance-style summary has been given

---

## Easy Pitfalls

- **moving or deleting existing files without confirmation** — the core migration rule is that the user decides
- **filling substantive content into attention.md on the user's behalf** — the AI provides only the skeleton; project owners decide the real content
- **starting feature or issue work immediately after creating the skeleton** — onboard is environment setup, not feature execution
- **executing low-confidence mappings directly** — low confidence always means you must ask
- **treating `.bytetrue/tools/` conservatively and not overwriting it** — shared scripts must be refreshed from the skill package, otherwise users are left on stale tooling after upgrades
- **overwriting the whole `.bytetrue/reference/` directory** — that wipes project-owned config such as `.bytetrue/reference/domain-context.md` and `.bytetrue/reference/project-management.md`
- **moving files manually through Read + Write** — the tools directory and skill-package-managed reference files must be copied through shell commands
- **forgetting to exclude `node_modules/` and `.git/` in the Glob** — the scan gets flooded with noise

---

## Related documents

- `.bytetrue/reference/system-overview.md` — overview of the ByteTrue system
- `.bytetrue/reference/shared-conventions.md` — the authoritative version of directory structure and shared conventions
- `.bytetrue/reference/domain-context.md` — project terminology, domain glossary, and grill-with-docs consensus
- `.bytetrue/reference/project-management.md` — external tracker provider, labels, and sync policy
- `.bytetrue/attention.md` — project notes that every ByteTrue skill must read at startup
- `.bytetrue/architecture/ARCHITECTURE.md` — architecture entry skeleton
