---
doc_type: decision
category: architecture
slug: optional-runtime-breadcrumb
status: active
created: 2026-06-11
tags: [workflow, runtime, breadcrumb, pi-extension]
---

# Decision: Optional Runtime Breadcrumb

## Context

ByteTrue's core workflow is artifact-driven: design, checklist, context manifest, roadmap, requirement, and architecture files are the source of truth. This works across all Skill-capable tools, but long sessions and multi-stage work still suffer from stage drift: the agent may forget whether it is designing, implementing, accepting, or advancing a roadmap item.

Trellis shows the value of workflow-state breadcrumb injection. Pi packages can bundle extensions, and Pi extensions can use `before_agent_start` to modify the system prompt for a turn. Claude plugin support in this repository is currently metadata/skills-only; no verified packaged Claude hook path exists yet.

## Decision

ByteTrue adds an **optional runtime breadcrumb** layer.

The shared contract lives in:

- `.bytetrue/reference/workflow-state-breadcrumb.md`
- `skills/bt-onboard/reference/workflow-state-breadcrumb.md`

The first concrete runtime path is a Pi package extension:

- `extensions/bytetrue-breadcrumb.ts`
- `package.json` now keeps `pi.skills` and adds `pi.extensions: ["./extensions/bytetrue-breadcrumb.ts"]`

The extension derives a compact `<bytetrue-workflow-state>` block from existing `.bytetrue` artifacts and injects it before the agent turn. It no-ops outside ByteTrue projects and writes no files.

Derived state is best-effort and conservative. It may point to:

- draft feature design → `feature-design`
- approved design with pending checklist steps → `feature-impl`
- done steps with pending checks → `feature-accept`
- in-progress roadmap item without a clearer feature state → `roadmap`

The breadcrumb is a runtime aid only. File contents always win.

## Alternatives Considered

### Add a canonical `.bytetrue/state` file

Rejected. It would create a new state source that can drift from design, checklist, roadmap, and acceptance artifacts.

### Make breadcrumb mandatory for all ByteTrue workflows

Rejected. ByteTrue must continue working in any Skill-capable tool. Runtime injection is enhancement, not a dependency.

### Implement Claude plugin hooks now

Rejected. The current Claude plugin files in this repository are metadata/skills projection. A packaged hook path has not been locally verified, so claiming automatic Claude hook behavior would be misleading.

### Add a standalone CLI or background watcher

Rejected. This feature only needs per-turn derived hints. CLI, watcher, worklog, and automation loops are separate concerns.

## Consequences

- Pi users get the first real runtime breadcrumb path through the package extension.
- Non-Pi and non-hook tools still have the same manual contract in shared reference docs.
- The resolver is read-only and creates no `.bytetrue/state` or `.bytetrue/runtime` files.
- `package.json` now exposes both skills and extension resources.
- Future Claude hook support can be added later after its packaging path is verified.

## Related Documents

- `.bytetrue/features/2026-06-11-optional-runtime-breadcrumb/optional-runtime-breadcrumb-design.md`
- `.bytetrue/features/2026-06-11-optional-runtime-breadcrumb/optional-runtime-breadcrumb-acceptance.md`
- `.bytetrue/reference/workflow-state-breadcrumb.md`
- `extensions/bytetrue-breadcrumb.ts`
- `.bytetrue/roadmap/ai-workflow-absorption/ai-workflow-absorption-roadmap.md`
