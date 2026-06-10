# tricks reference templates

This file provides the trick-document templates and examples used by `bt-trick`.

## 1. frontmatter

```yaml
---
doc_type: trick
type: pattern | library | technique
date: YYYY-MM-DD
slug: {English description, hyphen-separated}
topic: {one-line description of the problem this trick solves}
language: {optional}
framework: {optional}
tags: []
status: active | superseded
superseded-by: {optional}
---
```

Filename: `.bytetrue/compound/YYYY-MM-DD-trick-{slug}.md`.

## 2. Body Template

```markdown
## Applicable Scenarios

## Approach

## Why It Works

## Example

## When It Does Not Apply

## Known Pitfalls

## Related Documents
```

`When It Does Not Apply`, `Known Pitfalls`, and `Related Documents` are all optional sections.

## 3. Pattern Example

```markdown
---
doc_type: trick
type: pattern
date: 2026-04-11
slug: repository-pattern-data-access
topic: Use the Repository pattern to separate data-access logic from business logic, making unit testing easier and future ORM replacement easier
language: typescript
tags: [repository, orm, testability, architecture]
status: active
---

## Applicable Scenarios

Business-layer code calls the ORM directly, which makes unit tests hard to write and increases the cost of switching ORMs.

## Approach

Create a Repository interface and implementation for each aggregate root. The business layer depends only on the interface and does not import the ORM directly.
```
