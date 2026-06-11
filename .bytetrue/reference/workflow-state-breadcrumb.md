# ByteTrue Workflow-state Breadcrumb

Workflow-state breadcrumb is an optional runtime hint derived from existing `.bytetrue` artifacts.
It is not a source of truth and must never override design, checklist, roadmap, requirement, or architecture files.

## State Shape

```typescript
type ByteTrueWorkflowState = {
  mode: "none" | "roadmap" | "feature-design" | "feature-impl" | "feature-accept" | "issue" | "refactor";
  artifact: string | null;
  status: string | null;
  next_action: string;
  guardrails: string[];
}
```

## Rendered Block

```text
<bytetrue-workflow-state>
Mode: feature-impl
Artifact: .bytetrue/features/2026-06-11-example/example-design.md
Status: checklist step pending
Next action: continue the next pending checklist step; do not enter acceptance yet
Guardrails:
- read design + checklist + impl-context
- do not change scope without design update
</bytetrue-workflow-state>
```

The block should be compact. It should point to paths, not paste document bodies.

## Resolver Order

A conservative resolver should:

1. no-op when `.bytetrue/attention.md` is missing;
2. inspect recent feature directories first;
3. return `feature-design` when the design frontmatter says `status: draft`;
4. return `feature-impl` when design is approved and checklist steps still include `pending` or `failed`;
5. return `feature-accept` when all steps are `done` and checklist checks still include `pending` or `failed`;
6. ignore accepted/done features unless no better state exists;
7. return `roadmap` when a roadmap item is `status: in-progress` and no active feature is clearer;
8. return no breadcrumb or `mode: none` when state is ambiguous.

## Guardrails by Mode

- `feature-design`: read the roadmap/design inputs; do not implement; finish review before checklist generation.
- `feature-impl`: read design, checklist, and `{slug}-impl-context.jsonl`; follow pending steps in order; do not enter acceptance.
- `feature-accept`: read design, checklist, and `{slug}-check-context.jsonl`; verify independently; write back architecture, requirement, and roadmap.
- `roadmap`: read the roadmap main doc and items; do not mark items `in-progress` or `done` outside the feature workflow.
- `none`: do not infer a workflow stage.

## Runtime Contract

- Breadcrumb is optional runtime enhancement.
- It may be injected by a supported harness, such as the Pi package extension.
- Tools without runtime injection can still read this reference and apply the same block manually.
- Core ByteTrue skills must remain valid without breadcrumb support.

## Hard Boundaries

- Do not create `.bytetrue/state`, `.bytetrue/runtime`, or another canonical state file.
- Do not write workflow artifacts from the resolver.
- Do not run project commands just to derive breadcrumb state.
- Do not implement subagent dispatch, research routing, worklog, or CLI behavior here.
- If breadcrumb conflicts with file contents, file contents win.
