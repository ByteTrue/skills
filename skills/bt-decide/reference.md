# decisions reference templates

This file provides the frontmatter, body templates, and examples used by `bt-decide`.

## 1. frontmatter

```yaml
---
doc_type: decision
category: tech-stack | architecture | constraint | convention
date: YYYY-MM-DD
slug: {English description, hyphen-separated}
status: active | superseded | deprecated
superseded-by: {optional}
area: {affected area}
tags: []
---
```

Filename: `.bytetrue/compound/YYYY-MM-DD-decision-{slug}.md`.

## 2. Body Template

```markdown
## Background

## Decision

## Rationale

## Alternatives Considered

## Consequences

## Related Documents
```

`Alternatives Considered` and `Related Documents` are both optional sections.

## 3. Technology Choice Example

```markdown
---
doc_type: decision
category: tech-stack
date: 2026-04-11
slug: vite-as-bundler
status: active
area: frontend
tags: [vite, bundler, build-tool]
---

## Background

The project needed to choose a frontend build tool at startup.

## Decision

Use Vite as the development and production build tool.
```
