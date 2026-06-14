# learning reference templates

This file provides the templates and examples for the two `bt-learn` tracks. Output documents are written to `.bytetrue/compound/` with the filename `YYYY-MM-DD-learning-{slug}.md`.

## 1. Pitfall Track (`pitfall`)

### frontmatter

```yaml
---
doc_type: learning
track: pitfall
status: active
date: YYYY-MM-DD
slug: {English description, hyphen-separated}
component: {affected module/layer}
severity: low | medium | high
tags: []
---
```

### Body Structure

1. Problem
2. Symptoms
3. Approaches That Did Not Work
4. Solution
5. Why It Works
6. Prevention

## 2. Knowledge Track (`knowledge`)

### frontmatter

```yaml
---
doc_type: learning
track: knowledge
status: active
date: YYYY-MM-DD
slug: {English description, hyphen-separated}
component: {applicable module/domain}
tags: []
---
```

### Body Structure

1. Background
2. Guiding Principles
3. Why It Matters
4. When It Applies
5. Example

## 3. Examples

Full examples can be added gradually as the repository needs them; the current skill body keeps only the workflow and no longer embeds long examples.
