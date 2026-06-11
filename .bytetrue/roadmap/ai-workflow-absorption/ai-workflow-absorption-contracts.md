# AI Workflow Absorption Contracts

This companion document is part of `ai-workflow-absorption-roadmap.md`. It is split out only to keep each markdown file under the repository 300-line limit.

Feature-design must treat these contracts as hard constraints. If a contract needs to change, update the roadmap first.

## 1. Behavior Delta Block

**Direction**: Workflow Semantics → Feature Design / Feature Acceptance
**Form**: Markdown block embedded in feature design and acceptance report

Feature design adds:

```markdown
### Behavior Delta

#### ADDED
- Requirement: {new observable behavior}
- Scenario: GIVEN {precondition} WHEN {trigger} THEN {observable result}

#### MODIFIED
- Source: {requirements/slug.md | architecture/slug.md | existing feature behavior}
- Before: {old observable behavior}
- After: {new observable behavior}
- Scenario: GIVEN ... WHEN ... THEN ...

#### REMOVED
- Source: {source behavior}
- Reason: {why removed}
- Migration / Compatibility: {existing users/data/callers handling}

#### RENAMED
- From: {old term / behavior name}
- To: {new term / behavior name}
- Reason: {why rename}
```

Acceptance report adds:

```markdown
### Behavior Delta Materialization

| Delta | Evidence | Writeback target | Status |
|---|---|---|---|
| ADDED / MODIFIED / REMOVED / RENAMED: {name} | {test/manual/code evidence} | {requirements / architecture / compound / acceptance-only} | applied / not-needed / follow-up |
```

Constraints:
- Describes observable behavior and contract changes, not implementation steps.
- If no behavior-level change exists, design writes: `Behavior Delta: none; implementation-only change`.
- `MODIFIED` references known prior behavior or says `source: historical feature behavior / code-observed behavior`.
- Acceptance may classify a delta as `acceptance-only` if it is too specific for long-lived docs.
- No `.bytetrue/specs/` target is allowed.

## 2. Risk Mode Classification

**Direction**: Workflow Semantics → Design / Implement / Issue Fix / Acceptance
**Form**: Markdown/YAML-compatible classification embedded in design or fix plan

```yaml
execution_mode:
  level: light | standard | strict-evidence | break-loop
  triggers:
    - simple-ui-or-copy
    - config-only
    - normal-feature
    - regression-sensitive
    - complex-business-logic
    - cross-boundary-contract
    - bugfix
    - repeated-fix-failure
    - architecture-friction
  required_evidence:
    - tests
    - manual-check
    - red-green
    - root-cause
    - spec-compliance-review
    - code-quality-review
    - architecture-question
```

| Mode | When | Required behavior |
|---|---|---|
| `light` | copy, docs, small config, simple UI adjustment | keep scope small; manual/lint/build verification can be enough |
| `standard` | normal feature work | existing ByteTrue design/checklist/implementation/acceptance discipline |
| `strict-evidence` | regression-sensitive, bugfix, complex logic, cross-boundary contract | red-first where testable, root-cause-first for bugs, fresh verification before completion |
| `break-loop` | 2-3 failed fixes, patch branches spreading, architecture friction | stop normal implementation; ask whether architecture/pattern is wrong |

Constraints:
- `strict-evidence` is trigger-based, not global default.
- `light` still requires explicit non-goal verification and no silent behavior drift.
- `break-loop` routes back to design, roadmap, refactor, or issue analysis instead of continuing patches.

## 3. Implementation Review Gate

**Direction**: Workflow Semantics + Execution Context → Feature Implementation / Acceptance
**Form**: review checklist and optional subagent roles

```yaml
implementation_review:
  spec_compliance:
    required: true
    checks:
      - behavior_delta_satisfied
      - acceptance_scenarios_have_evidence
      - no_extra_behavior_outside_design
      - explicit_non_goals_guarded
  code_quality:
    required: true
    checks:
      - tests_or_manual_checks_fresh
      - no_debug_or_temp_code
      - no_unplanned_refactor
      - reflection_checks_handled
      - naming_and_module_boundaries_consistent
```

Constraints:
- Spec compliance runs before code quality.
- Review may run inline or through subagents.
- Subagent review is enhancement, not required for tools without subagent support.
- Evidence is cited in the implementation completion report or acceptance report.

## 4. Context Manifest Files

**Direction**: Feature Design → Feature Implementation / Check / Optional Subagents
**Form**: JSONL files in feature directory

```text
.bytetrue/features/YYYY-MM-DD-{slug}/
├── {slug}-impl-context.jsonl
└── {slug}-check-context.jsonl
```

Example row:

```json
{"file": ".bytetrue/reference/shared-conventions.md", "reason": "Feature implementation must follow checklist lifecycle and reflection checks.", "required": true}
```

Allowed row shape:

```typescript
type ByteTrueContextManifestRow = {
  file: string;
  reason: string;
  required?: boolean;
  section?: string;
  role?: "implement" | "check" | "both";
}
```

Rules:
- `impl-context`: design, checklist, relevant requirement/architecture/reference/explore/decision docs.
- `check-context`: design acceptance contract, behavior delta, checklist checks, conventions, previous decisions.
- Rows normally reference `.bytetrue` docs or explore artifacts, not raw code files.
- Seed/example rows are ignored unless they have a real `file` field.
- Missing required files block the stage until fixed or explicitly downgraded by user confirmation.

## 5. Subagent Handoff Protocol

**Direction**: Execution Context → Pi / Claude / other subagent-capable tools
**Form**: prompt prefix + role contract

Every ByteTrue subagent dispatch prompt starts with:

```text
Active ByteTrue work: .bytetrue/features/YYYY-MM-DD-{slug}
Role: implement | check | research
Design: .bytetrue/features/YYYY-MM-DD-{slug}/{slug}-design.md
Checklist: .bytetrue/features/YYYY-MM-DD-{slug}/{slug}-checklist.yaml
Context manifest: .bytetrue/features/YYYY-MM-DD-{slug}/{slug}-{impl|check}-context.jsonl
```

Role responsibilities:

```yaml
roles:
  implement:
    reads: [design, checklist, impl-context manifest]
    writes: [code, checklist steps status, implementation completion report]
    must_not: [mark acceptance checks passed, change scope without updating design or asking user]
  check:
    reads: [design, checklist, check-context manifest, git diff]
    writes: [review findings, optional fixes only if explicitly allowed]
    must_check: [spec compliance, code quality, fresh verification evidence]
  research:
    reads: [scoped question, relevant project docs/code/web docs]
    writes: [.bytetrue/compound/YYYY-MM-DD-explore-{slug}.md]
    must_not: [make final product decision]
```

Constraints:
- Tools without subagents use the same role contract inline.
- If a subagent is blocked or needs context, update the manifest or plan rather than retrying blindly.
- Subagent success reports are not sufficient evidence; check/acceptance verifies independently.

## 6. Research-first Integration

**Direction**: Brainstorm / Grill / Roadmap / Feature Design → Explore / Context Manifest
**Form**: routing rule plus explore artifact references

When a decision depends on external tool behavior, library choice, industry convention, platform hook capability, or comparable workflow design, prefer evidence before asking the user to invent options.

Research output:

```text
.bytetrue/compound/YYYY-MM-DD-explore-{slug}.md
frontmatter: doc_type=explore, type=spike, confidence=high|medium|low
```

Reference format:

```markdown
Related evidence:
- `.bytetrue/compound/2026-06-11-explore-ai-workflow-comparison.md`
```

Constraints:
- Explore records observed facts and tradeoffs, not final decisions.
- Durable choices still go through user confirmation and `bt-decide` when appropriate.
- Context manifests may include explore artifacts if implement/check agents need them.

## 7. Optional Workflow-state Breadcrumb

**Direction**: Optional Runtime → Agent prompt / hook / extension
**Form**: derived context block, not a new canonical state layer

```typescript
type ByteTrueWorkflowState = {
  mode: "none" | "roadmap" | "feature-design" | "feature-impl" | "feature-accept" | "issue" | "refactor";
  artifact: string | null;
  status: string | null;
  next_action: string;
  guardrails: string[];
}
```

Rendered block:

```text
<bytetrue-workflow-state>
Mode: feature-impl
Artifact: .bytetrue/features/2026-06-11-example/example-design.md
Status: checklist step 3 pending
Next action: continue the next pending checklist step; do not enter acceptance yet
Guardrails:
- read design + checklist + impl-context
- do not change scope without design update
</bytetrue-workflow-state>
```

Constraints:
- Breadcrumb is optional enhancement only.
- No core skill may require breadcrumb to function.
- First concrete runtime path: Pi package extension.
- Claude/plugin-capable tools use the documented manual contract until a verified packaged hook path exists.
- If breadcrumb state conflicts with file contents, file contents win.

## 8. Worklog / Report-feed Record

**Direction**: Work Record → Human reporting / handoff / recovery
**Form**: lightweight markdown record, not full transcript

First version target:

```text
.bytetrue/worklog/YYYY-MM.md
```

Entry shape:

```markdown
## YYYY-MM-DD · {short title}

- **Actor**: {human/agent/tool if known}
- **Scope**: {feature | issue | roadmap | refactor | explore | decision}
- **Artifacts**: `.bytetrue/...`
- **Summary**: {1-3 sentences}
- **Commits**: `{hash}` / none
- **Verification**: {commands or manual checks}
- **Status**: done | partial | blocked | follow-up
- **Next steps**: ...
```

Constraints:
- Worklog is secondary background, not a replacement for formal artifacts.
- Completed feature/issue/refactor closeout should offer a worklog entry.
- Partial sessions may record a worklog entry when useful for continuation.
- Raw chat transcripts are not stored by default.
