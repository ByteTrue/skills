# bt-arch reference templates

`SKILL.md` keeps only the workflow skeleton. The concrete formats, coverage items, and report templates all live here.

---

## 1. Architecture Document Structure, Output for `backfill` or `update`

### 1.1 frontmatter

```yaml
---
doc_type: architecture
slug: {english-hyphenated; must match filename}
scope: {concise coverage scope}
summary: {concise summary of the key point}
status: done | pending | archived
last_reviewed: YYYY-MM-DD
tags: []
depends_on: []   # slugs of other architecture docs, optional
implements: []   # list of requirement slugs this doc carries; empty is normal for pure infrastructure or tooling layers
---
```

### 1.2 Body Sections

```markdown
## 0. Terms

Briefly define proprietary terms introduced for the first time, plus how they differ from nearby terms, for example "in this document, X means Y, and it is not the same as X' in the code". Omit the whole section if there are no new terms.

## 1. Positioning and Audience

- which part of the project this covers, such as a module, subsystem, or cross-module concern
- who will read it, such as feature-design, issue-analyze, or newcomer onboarding
- what the reader will be able to do afterward, such as locate code, understand external interfaces, or know the constraints

## 2. Structure and Interaction

- how the modules are divided, and the dependency directions
- external interfaces and internal interfaces
- cross-module contracts, such as data shape, call protocol, or state ownership
- if there are 2 modules or fewer, or the relationships are linear, do not draw a diagram; otherwise Mermaid is recommended

Attach a `file:line` anchor after every structured assertion, or collect them in a "code anchors" subsection at the end of the section.

## 3. Data and State

- key types and core data structures, with brief description plus definition location as `file:line`
- ownership, who writes and who reads
- persistence boundaries, such as memory, local storage, database, or external service

## 4. Key Decisions

This is not the full decision text. It is a **reference** section. Each item gets one or two lines: one-sentence conclusion + reference, such as `compound/YYYY-MM-DD-decision-{slug}.md` or the source user quote + why it is referenced in this doc.

If there is no archived decision yet, omit the section or record `TODO: this decision should be captured as a decision`.

## 5. Code Anchors

A "where to start in code" list: entry files, key functions, and key type definitions. Format: `{file}:{function/class} — one-line note`.

## 6. Known Constraints / Edge Cases

Hard constraints for this module, things that cannot be changed or must be changed carefully, plus the source, such as attention.md, decision, or learning.

## 7. Related Documents

Other architecture docs this depends on, carried requirements, related decision, learning, trick, explore, or representative feature designs using this module.

## Change Log, only in `update` mode

- YYYY-MM-DD: {one-line description}
```

---

## 2. `backfill` or `update` Self-Check List

Each item targets a default AI mistake:

1. **Can every structured assertion anchor to code?** If not, delete it or mark it `TODO: to be confirmed`
2. **Did you make decisions on the user's behalf?** In the "Key Decisions" section, are you quoting an existing decision or the user's actual words, or did the AI invent a rationale for a choice? The latter is never allowed
3. **Did it become code paraphrase?** Each section must contain at least one sentence of "why it is divided this way". Without that, the section is usually just `ls` in prose
4. **Did you do the terminology collision check?** For any new architecture term, grep it across code, all docs under `architecture/`, and `compound/`. If there is a conflict, rename it or explicitly distinguish it in section 0
5. **Does it conflict with existing architecture or decisions?** If you find a conflict, do not "write your own version". Either reference the existing one or stop and ask the user
6. **Section length** — if a section is longer than one screen, it should probably be cut down or split
7. **`update`-specific**: does every newly added or changed paragraph have code changes as evidence? "Add a description that sounds more complete" without code evidence is the start of drifting away from reality

---

## 3. Coverage Items for `check` Mode

Each of the three sub-goals covers 6 categories.

### 3.1 design-internal, consistency inside one design

1. **term consistency** — whether terms defined in section 0 are later replaced by synonyms or drift in meaning
2. **requirement alignment** — whether the summary in section 1 is self-consistent and stays aligned with the confirmed goal
3. **contract closure** — whether contract examples in section 2 correspond to an implementation-change plan in section 3
4. **example and decision consistency** — whether the behavior in contract examples conflicts with key decisions
5. **scope guard** — whether the implementation plan goes beyond the explicit non-goals
6. **rollout executability** — whether the rollout steps are verifiable, and whether there are no contradictions in dependency order

### 3.2 design-vs-code, consistency between design and code

1. **type consistency** — whether core types or fields defined in design exist in code and match semantically
2. **behavior consistency** — whether input→output behavior declared in design matches actual code behavior
3. **write-path consistency** — whether the write entry points declared in design have no extra side-write paths in code
4. **edge-behavior consistency** — whether exception and boundary rules in design are implemented in code
5. **change-boundary consistency** — whether code neither overreaches nor misses implementation promised by design
6. **rollout-result consistency** — whether the exit signal for each rollout step can be verified against the code state

### 3.3 architecture-folder-internal, consistency across multiple docs

1. **term consistency** — whether the same concept is named consistently, with no synonym drift or same-name-different-meaning
2. **module-boundary consistency** — whether if doc A says a responsibility belongs to module X, doc B says the same; whether two docs both claim ownership of the same responsibility
3. **cross-doc reference validity** — whether targets cited by `see xxx.md` or `defined in yyy.md` actually exist
4. **interface or contract alignment** — when multiple docs involve the same interface or type, whether signatures, fields, and semantics match
5. **dependency closure** — whether if A says it depends on a capability from B, B actually exposes it; whether there are one-way dangling dependencies
6. **same-type grouping and naming** — whether same-type docs follow `{type}-{slug}.md`, and whether a root directory still has 6 or more flat files of the same type, per `.bytetrue/reference/shared-conventions.md`

---

## 4. Report Template for `check` Mode

```markdown
# Architecture Consistency Check Report

> Target: design-internal | design-vs-code | architecture-folder-internal
> Scope: {feature}/{module}/{section range}
> Date: YYYY-MM-DD
> Conclusion: pass | pass-with-risk | fail

## 1. Check Summary

One-sentence summary.

## 2. Inconsistency List

| ID | Severity | Location | Symptom | Impact | Suggested Fix |
|---|---|---|---|---|---|
| AC-01 | high/medium/low | `{file}:{line}` or `design section X` | description | consequence | fix suggestion, without executing it |

## 3. Observations, out of scope, no action taken

Structural issues noticed while reading `architecture/`: a type still flattened in the root despite 6 or more files and therefore should trigger an `update` migration; filename not following `{type}-{slug}.md`; or any other incidental problem noticed on the way. Omit the section if there are none.

## 4. Things That Are Consistent

List 2-5 key checks that passed. A report containing only negative information makes the user lose confidence in the whole system.

## 5. Suggested Next Step

- **fail**: which items should be fixed first before rerunning
- **pass-with-risk**: which points should be focused on during implementation or acceptance
- **pass**: ready to move to the next stage
```

**Severity levels**:

- **high**: would send implementation in the wrong direction, or code has already materially drifted from design, such as missing a key contract, opposite behavior, or terms pointing to different things
- **medium**: intent is guessable but ambiguity remains, such as synonym drift, contract examples that look aligned with the decision on the surface but conflict in detail, or unclear exit signals
- **low**: awkward wording or readability issues that do not affect understanding

---

## 5. Compound Search Commands, for `backfill` and `update`

```bash
python .bytetrue/tools/search-yaml.py --dir .bytetrue/compound --filter "doc_type=decision|explore|learning" --query "{module keyword}"
python .bytetrue/tools/search-yaml.py --dir .bytetrue/compound --filter doc_type=decision --filter status=active --query "{module keyword}"
```
