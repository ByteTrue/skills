---
name: bt-guide
description: Write or update outward-facing guide documents, including `dev-guide` for developers and `user-guide` for end users, with artifacts under the project's `docs/` directory. These are task-oriented, "how to use X to do Y", and are different from libdoc's part-by-part reference style. Trigger when the user says "write docs", "developer guide", or "user guide", or when this is suggested at feature-acceptance closeout.
---

# bt-guide

## Read Before Starting

Before making any judgment or taking any action, read `.bytetrue/attention.md` first; if it is missing, treat the skeleton as incomplete and tell the user to fill it in or run `bt-onboard`.

Code solves problems. Documentation lets other people use that code to solve problems. Specs record "what was built" and "why it was built that way", but downstream developers and end users neither need nor should read specs. They need publishable guides written for their own role. `guidedoc` turns specs and code into guides that readers can actually use.

---

## Two Tracks

| Track | Target Reader | Typical Content | Output Path |
|---|---|---|---|
| `dev-guide` | contributors, integrators, downstream developers | local setup, architecture explanation, API usage, extension method | `docs/dev/{slug}.md` |
| `user-guide` | end users | feature overview, operation steps, concept explanation, FAQ | `docs/user/{slug}.md` |

**Track selection starts from "who will read it"**. The same feature often needs two documents: API changes go into the dev-guide, while the corresponding user-facing operations go into the user-guide.

> `docs/dev/` and `docs/user/` are the default conventions. If the project already has its own docs structure, follow the project and confirm it before starting.

---

## Trigger Timing

| Situation | Description |
|---|---|
| feature-acceptance has ended | proactively suggest: if section 2 of the design, interface contract, changed, ask "do we need to update the dev-guide?"; if section 1, user-visible behavior, changed, ask "do we need to update the user-guide?" |
| user triggers it directly | "write docs", "guidedoc", or "add a developer guide" |
| after onboard completes | a new repository can use this to fill in the base document skeleton |

One proactive sentence is enough. If the user says "no need", stop there. Repeating the suggestion makes the AI feel performative.

---

## Paths Involved

guidedoc artifacts **do not live under `.bytetrue/`**. Guides are publishable artifacts for external readers, so they stay separate from spec artifacts.

- dev-guide → `docs/dev/{slug}.md`
- user-guide → `docs/user/{slug}.md`

File naming is `{slug}.md`, lowercase English with hyphens and **no date prefix**. Guides are maintained by topic over time.

Search:

```
python .bytetrue/tools/search-yaml.py --dir docs/dev --filter doc_type=dev-guide --filter status=current
python .bytetrue/tools/search-yaml.py --dir docs/user --filter doc_type=user-guide --filter component={feature-slug}
```

---

## YAML frontmatter

```yaml
---
doc_type: dev-guide | user-guide
slug: {english-hyphenated}
component: {related module name or feature slug}
status: pending | done | archived
summary: {one-line description of what it covers}
tags: []
last_reviewed: YYYY-MM-DD
---
```

`status` is a three-state field: `draft` pending review, `current` currently valid, `outdated` where the code changed but the document did not keep up. Keep the original text, mark it, then push an update.

---

## Document Format

### dev-guide body structure

```markdown
## Overview
One paragraph describing the feature's role and applicable scenarios.

## Prerequisites
Environment, dependencies, or configuration needed to integrate the module, if any.

## Quick Start
Minimum runnable example. Code first, text second.

## Core Concepts
Optional. Key terminology and design decisions needed to understand the interface, API, or module behavior.

## Interface Reference
Main APIs, configuration options, events, or hooks. Use a table or per-item list.

## Common Scenarios
2-4 practical code examples covering the happy path and common edges.

## Known Limits and Notes
Optional. Boundaries, performance considerations, or workarounds for known bugs.

## Related Documents
Related user-guide, design doc, architecture doc, or external references.
```

### user-guide body structure

```markdown
## Feature Overview
One paragraph describing what the feature is and what problem it solves.

## Preconditions
Optional. What must already be true before using it, such as account permissions or prerequisite operations.

## How to Use
Step-by-step operations. One line per step. Important actions get screenshot placeholders, using `![description](./assets/xxx.png)` or a note saying "screenshot needed here".

## Frequently Asked Questions
Q: ...
A: ...

## Related Features
Optional. Links or explanations for related features.
```

---

## Workflow Steps

1. **Clarify scope** — track, dev / user / both, scope, new or update, and information sources. Do design docs already exist? Is there already a guide for the same component? What code needs to be read?
2. **Collect inputs** — read the design doc, especially section 0 terminology, section 2 interface contract, and section 1 user-visible behavior, then use `search-yaml.py` under `docs/` to confirm whether an existing guide already exists. If an existing guide is found and marked `outdated`, classify the task as an **update**
3. **Draft** — draft according to the track structure and set frontmatter `status: active`. Constraint: write only content for the target reader. **Do not move "implementation hints" or internal design straight out of the design doc.** Terminology must match section 0 of the design doc. Code examples must come from real code; do not invent interfaces.
4. **User review** — show the draft and confirm section by section whether the scope is covered, whether the descriptions are accurate, and whether any part would be hard for the intended reader to understand
5. **Write to disk** — after user approval, write to the chosen path, set `status: done` and `current: true`, and set `last_reviewed` to today. For updates, do direct edits for small changes. For major changes such as restructuring or a shift in reader positioning, first mark the old document `status: archived` + `validity: outdated` and keep it as reference, then write a new one

---

## Relationship with Other Workflows

| Source | Relationship |
|---|---|
| `bt-feat-accept` | after acceptance, proactively suggest: interface changes push dev-guide, user-visible changes push user-guide |
| `bt-feat-design` | section 2 of the design is the primary information source for dev-guide; section 1 is the primary information source for user-guide |
| `bt-onboard` | after a new repository is onboarded, this can fill in the base documentation skeleton |
| `bt-arch` in check mode | if design and code diverge, the corresponding guide should also be marked `outdated` |
| `bt-decide` | technology choices referenced by dev-guide must come from decisions rather than being invented independently |
| `bt-trick` | if dev-guide usage examples overlap with tricks, cross-reference instead of repeating |
| `bt-libdoc` | the guide cites libdoc entries for detailed reference; libdoc is part reference, guidedoc is task tutorial |

---

## Easy Pitfalls

- copying "implementation hints" from the design doc verbatim into the dev-guide — that belongs to the internal spec
- creating a new guide without checking whether an old one already exists — conflicts may result
- finishing the document while `status` is still `draft` — it must be changed to `current` when written
- the code changed but the related guide is still marked `current` — it should be marked `outdated` and an update should be pushed
- dev-guide and user-guide overlap too heavily — one of them is positioned incorrectly
- using the guide to store spec information such as invariants, test constraints, or root-cause analysis — that content belongs under `.bytetrue/`
