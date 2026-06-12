---
doc_type: feature-implementation-report
feature: 2026-06-12-workflow-control-plane-contract
status: done
summary: Implemented ByteTrue control-plane contract for config, canonical status, continuation routing, brainstorm paths, behavior writeback, and line-limit policy.
---

# workflow-control-plane-contract implementation report

## Implementation Completion Report

### Which files were changed

Implementation changed the workflow skill/source references and current `.bytetrue` project copies needed by the approved design:

- `.bytetrue/config.yaml`
- `.bytetrue/reference/config.md`
- `.bytetrue/reference/shared-conventions.md`
- `.bytetrue/reference/project-management.md`
- `.bytetrue/reference/system-overview.md`
- `.bytetrue/reference/worklog-report-feed.md`
- `.bytetrue/reference/context-manifest.md`
- `.bytetrue/reference/implementation-review.md`
- `.bytetrue/reference/tools.md`
- `.bytetrue/reference/requirement-example.md`
- `.bytetrue/reference/domain-context.md`
- `.bytetrue/brainstorms/.gitkeep`
- `AGENTS.md`
- `CLAUDE.md`
- `skills/bt/SKILL.md`
- `skills/bt-feat/SKILL.md`
- `skills/bt-feat-design/SKILL.md`
- `skills/bt-feat-design/reference.md`
- `skills/bt-feat-impl/SKILL.md`
- `skills/bt-feat-accept/SKILL.md`
- `skills/bt-brainstorm/SKILL.md`
- `skills/bt-tracker/SKILL.md`
- `skills/bt-onboard/SKILL.md`
- `skills/bt-onboard/reference/config.md`
- `skills/bt-onboard/reference/shared-conventions.md`
- `skills/bt-onboard/reference/project-management.md`
- `skills/bt-onboard/reference/system-overview.md`
- `skills/bt-onboard/reference/worklog-report-feed.md`
- other workflow skill/reference files whose status examples needed canonicalization.

### Which functions / types changed, grouped by step

This feature is a workflow-contract / documentation implementation; no runtime functions or code types changed.

**Step 1: Config and status contract**

- Added `.bytetrue/config.yaml`.
- Added `.bytetrue/reference/config.md` and `skills/bt-onboard/reference/config.md`.
- Updated shared conventions to define canonical status values: `pending`, `active`, `done`, `dropped`, `archived`.
- Replaced old status field examples in shipped skills/references with canonical status plus explicit auxiliary fields such as `review_result`, `current`, `validity`, and `superseded_by`.

**Step 2: Continuation and brainstorm routing**

- Updated `skills/bt/SKILL.md` so root routing may read minimal status/frontmatter/checklist rows for named continuation requests.
- Updated `skills/bt-feat/SKILL.md` with deterministic resume routing for half-finished features.
- Standardized open brainstorm path as `.bytetrue/brainstorms/{slug}/brainstorm.md` in `bt-brainstorm` and shared conventions.

**Step 3: Behavior writeback and project line-policy**

- Updated `bt-feat-accept` to name `Current Behavior` and `Observable Contract` as stable Behavior Delta writeback targets.
- Clarified `AGENTS.md` and `CLAUDE.md`: the 300-line rule is a repository skill/reference maintenance heuristic, not a universal ByteTrue artifact rule.
- Removed the hard-coded worklog 300-line artifact rule from current/onboard worklog references.

**Step 4: Onboard/index sync and validation**

- Updated `bt-onboard` skeleton to include `.bytetrue/config.yaml`, `.bytetrue/brainstorms/`, and the config reference.
- Moved current tracker values to `.bytetrue/config.yaml`; `project-management.md` now owns semantics, syncable sources, and labels.
- Updated current/onboard system overview and managed reference parity.

### Did this touch files outside the plan?

No. The touched files match the approved design mount points: config, shared conventions, root/feature routing, brainstorm path, feature acceptance behavior writeback, tracker/onboard config location, current/onboard reference copies, and repository agent guidance.

### Did this introduce any new concept or abstraction not present in the design doc?

No. All introduced concepts were in the approved design:

- Skills-first Control Plane
- Project Config
- Canonical Status
- Continuation Scan
- Open Brainstorm
- Current Behavior / Observable Contract
- Auto Mode

### Implementation Review Gate

**Spec compliance**: passed

- `ADDED`: `.bytetrue/config.yaml` exists and parses.
- `ADDED`: canonical status vocabulary is documented and old status field values were removed from shipped skills/references.
- `ADDED`: `bt` / `bt-feat` can route continuation requests by artifact state.
- `ADDED`: `.bytetrue/brainstorms/` is now the canonical open discussion path.
- `MODIFIED`: Behavior Delta writeback now names `Current Behavior` and `Observable Contract`.
- `MODIFIED`: line-limit policy is project-scoped, not a ByteTrue universal artifact rule.

**Code quality**: passed

- No runtime code or hidden state was added.
- Validation passed: YAML, JSON, JSONL, Ruby frontmatter parse, skill listing, managed reference parity, skill/reference line counts, and `git diff --check`.
- No background process, hook, daemon, runtime adapter, or custom dispatcher was introduced.

### Reflection-check self-audit

- **Scope-growth signal**: status canonicalization touched many skill/reference files. Handled by limiting changes to status field examples and routing rules, without adding runtime behavior.
- **Line-limit signal**: `bt-tracker/SKILL.md` remains close to this repo's skill-doc maintenance threshold. Future tracker changes should move details into a reference file rather than expanding the skill.
- **Artifact vs product signal**: `.bytetrue` historical artifacts are development records, not the product itself. Historical feature artifacts were not broadly rewritten; current implementation updated only current feature artifacts and shared/runtime-facing templates.

### Exit-signal verification for rollout order

All implementation steps are `done`:

```yaml
steps:
  - Config and status contract: done
  - Continuation and brainstorm routing: done
  - Behavior writeback and project line-policy: done
  - Onboard/index sync and validation: done
```

Validation commands/results:

```text
validate-yaml .bytetrue/config.yaml: passed
validate-yaml workflow-control-plane-contract-checklist.yaml: passed
all .bytetrue/**/*.yaml: passed
package/evals JSON parse: passed
Ruby frontmatter parse: 28 skills passed
npx skills add . --list: found 28 skills
reference parity: ok, 15 files
JSONL smoke parse: ok
skill/reference docs over 300: none
git diff --check: passed
```

### Acceptance-scenario self-check

1. **Machine-readable config**: satisfied by `.bytetrue/config.yaml` and current/onboard `config.md`.
2. **Canonical status vocabulary**: satisfied by shared conventions and shipped skill/reference grep checks; old status field values no longer appear in shipped skills/references.
3. **Continuation routing**: satisfied by `bt` and `bt-feat` continuation/resume routing rules.
4. **Open brainstorm path**: satisfied by `.bytetrue/brainstorms/.gitkeep`, `bt-brainstorm`, and shared conventions.
5. **Behavior writeback**: satisfied by `bt-feat-accept` mentioning `Current Behavior` and `Observable Contract`.
6. **No universal 300-line artifact rule**: satisfied by AGENTS/CLAUDE clarification and worklog reference update.
7. **Onboard sync**: satisfied by `bt-onboard` and current/onboard reference parity.

### TDD / red-green evidence

TDD was not enabled. This is a workflow-contract/documentation feature with no runtime logic. Verification used static checks and artifact review.
