# libdoc reference templates

This file provides the `manifest`, entry-document templates, and source-extraction checklist used by `bt-libdoc`.

## 1. `manifest.yaml` Format

```yaml
project: {project name}
entry_type: component | function | endpoint | command
source_root: {source root path}
last_scanned: YYYY-MM-DD

entries:
  - {entry: button, category: base component, source_files: [src/components/Button.vue], doc_path: docs/api/button.md, status: pending, note: ""} # status: pending | active | done | dropped | archived
```

`status` semantics: `pending` waits to be documented, `active` is generated but still under review, `done` is generated and reviewed, `dropped` is intentionally not documented, and `archived` is stale or retained historical reference. Use `note` to explain `dropped` or `archived`.

## 2. Entry Document Frontmatter

```yaml
---
doc_type: lib-api-ref
entry: {entry}
category: {category}
status: active | done | archived
current: true        # only when status: done and the entry is currently valid
validity: outdated  # only when status: archived because source code changed
source_files: [{source_files}]
summary: {summary}
tags: []
last_reviewed: YYYY-MM-DD
---
```

## 3. Entry Document Template

```markdown
## Overview

## API Reference

## Basic Usage

## Typical Scenarios

## Notes

## Related Entries
```

This template is the superset. Trim it according to the actual shape of the entry.

## 4. Source Extraction Checklist

Before generating an entry, you must extract from source code:

1. Interface signatures
2. Type definitions
3. Default values
4. Existing comments
5. Export style
6. Project-type-specific additional surfaces such as slots, events, flags, or schema

Rules:

- Use source code as the source of truth; do not invent interfaces
- If comments are missing, you may infer from types and naming, but you must say so
- If source code and the plan disagree, document according to source code
