---
doc_type: decision
category: architecture
slug: context-manifest-contract
status: active
created: 2026-06-11
tags: [workflow, context-manifest, execution-context, handoff]
---

# Decision: Feature-local Context Manifests

## Context

ByteTrue feature design already produces a design document and checklist. Implementation and acceptance can read those files directly, but longer sessions, cross-stage recovery, and future subagent workflows need a more explicit handoff surface: which project facts, roadmap contracts, requirements, architecture docs, decisions, and explore evidence must be read before acting.

Trellis demonstrated the value of curated context injection through implement/check context files. ByteTrue should absorb that advantage without introducing a parallel facts layer or copying document bodies into another artifact.

## Decision

Standard approved ByteTrue feature designs now produce two feature-local JSONL manifests:

- `{slug}-impl-context.jsonl` for `bt-feat-impl`
- `{slug}-check-context.jsonl` for `bt-feat-accept` and future check roles

The shared contract lives in:

- `.bytetrue/reference/context-manifest.md`
- `skills/bt-onboard/reference/context-manifest.md`

Each row is one JSON object with `file` and `reason`, plus optional `required`, `section`, and `role` fields. `required` defaults to `true`. Missing required files block the stage until the manifest is fixed or the user explicitly downgrades the row.

Manifests contain paths and reasons only. They do not copy document bodies and do not become a source of truth. They normally reference `.bytetrue` docs, roadmap contracts, requirements, architecture, decisions, learning, or explore evidence; raw source files are not default rows because implement/check agents can read code as needed.

## Alternatives Considered

### One combined manifest

Rejected. Implementation and checking need different read sets. Keeping `impl-context` and `check-context` separate makes the later subagent handoff protocol easier and prevents check-only constraints from polluting implementation context.

### Extend checklist YAML with context rows

Rejected. The checklist is an action/status artifact. Context manifests are read-set artifacts. Combining them would blur lifecycle state with evidence/context selection.

### Add a resolver CLI or hook immediately

Rejected. The first version should be portable across Skill-capable tools. Runtime injection, hooks, and subagent dispatch are separate roadmap items.

### List raw code files by default

Rejected. Raw code is live implementation material and should be discovered by the stage doing the work. The manifest's job is to preserve curated project facts and constraints.

## Consequences

- New standard approved feature designs should include both context manifest files.
- `bt-feat-impl` and `bt-feat-accept` can fail fast when required contextual docs are missing.
- Future subagent handoff can consume the manifests instead of rebuilding context selection rules.
- Legacy feature directories without manifests remain readable; this is additive.
- Context manifests do not replace design, checklist, requirements, architecture, decisions, or acceptance reports.

## Related Documents

- `.bytetrue/features/2026-06-11-context-manifest-contract/context-manifest-contract-design.md`
- `.bytetrue/features/2026-06-11-context-manifest-contract/context-manifest-contract-acceptance.md`
- `.bytetrue/reference/context-manifest.md`
- `.bytetrue/roadmap/ai-workflow-absorption/ai-workflow-absorption-roadmap.md`
