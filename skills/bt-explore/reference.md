# explore reference templates

This file provides the frontmatter, body structure, and writing notes used by `bt-explore`.

## 1. frontmatter

```yaml
---
doc_type: explore
type: question | module-overview | spike
date: YYYY-MM-DD
slug: {English description, hyphen-separated}
topic: {one-line description of the exploration question}
scope: {exploration scope}
keywords: []
status: active | outdated
confidence: high | medium | low
---
```

Filename: `.bytetrue/compound/YYYY-MM-DD-explore-{slug}.md`.

## 2. Body Structure

```markdown
## Question and Scope
## Short Answer
## Key Evidence
## Detailed Expansion
## Open Questions
## Suggested Next Step
## Related Documents
```

## 3. Writing Notes

- `Short Answer` must lead with the conclusion
- Target 3-8 items in `Key Evidence`
- If the exploration involves collaboration across multiple modules, attach a Mermaid diagram in the `Short Answer` section
- Every conclusion must be supportable by evidence

## 4. Suggested Next Step

In the `Suggested Next Step` section, write one sentence hinting at a plausible direction the user may take next. The user decides the next step; this section does not enumerate candidate skills. If the user says "no need", skip it.
