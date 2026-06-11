# ByteTrue Context Manifest

Context manifests are feature-local JSONL files that tell later stages which project facts and evidence must be read.
They do not replace design, checklist, requirements, architecture, or acceptance reports.

## File Names

For a standard approved feature design:

```text
.bytetrue/features/YYYY-MM-DD-{slug}/
├── {slug}-impl-context.jsonl
└── {slug}-check-context.jsonl
```

- `impl-context` is consumed by `bt-feat-impl`.
- `check-context` is consumed by `bt-feat-accept` and future check roles.
- `subagent-handoff` roles consume these files as their explicit read-set; see `.bytetrue/reference/subagent-handoff.md`.
- Legacy feature directories without manifests remain readable; new approved designs should create both files.

## Row Shape

Each non-empty line is one JSON object:

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

- `file` is a repo-relative path.
- `reason` explains why this context is needed.
- `required` defaults to `true` when omitted.
- `section` is an optional human hint.
- `role` is optional because the file name already implies role.

## Baseline Rows

`impl-context` should include, when present:

- the feature design and checklist
- the linked requirement
- roadmap main doc, items, and contract companion for roadmap-backed features
- architecture docs named in design section 4
- relevant references such as execution modes, implementation review, or this contract
- compound decisions, learnings, or explore docs explicitly cited by the design

`check-context` should include, when present:

- the feature design and checklist
- design acceptance contract and behavior delta source
- architecture merge targets from design section 4
- linked requirement and roadmap docs
- implementation review contract
- relevant decision/explore evidence needed for verification
- research-first explore artifacts cited by design, roadmap, or grill when they affect implementation or verification

Rows normally reference `.bytetrue` docs or explore/decision evidence, not raw source code files. Implement/check agents read code as needed.

## Blocking Semantics

- Missing required files block the stage until fixed or explicitly downgraded by the user.
- Missing optional files may be skipped, but the stage report should mention the skip when relevant.
- Paths outside the repository are invalid unless the user explicitly approved them for that run.
- Do not copy document bodies into the manifest.

## Static Validation

A quick smoke check is enough:

```bash
python3 - <<'PY'
import json, pathlib, sys
for path in sys.argv[1:]:
    for i, line in enumerate(pathlib.Path(path).read_text().splitlines(), 1):
        if not line.strip():
            continue
        row = json.loads(line)
        assert row.get('file') and row.get('reason'), (path, i)
PY .bytetrue/features/YYYY-MM-DD-{slug}/{slug}-impl-context.jsonl
```
