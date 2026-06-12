---
name: bt-note
description: Append project fragment knowledge that is "too short to deserve its own file, but every ByteTrue skill startup must know it" into the fixed sections of `.bytetrue/attention.md`, such as special compile flags, services that must be started first, path traps, command aliases, or environment-variable conventions. Trigger when the user says "make a note", "add it to attention.md", "the project needs X to compile", "every future session must know Y", or when a project-specific setup is discovered that can be explained in one sentence.
---

# bt-note

## Read Before Starting

Before making any judgment or taking any action, first check `.bytetrue/attention.md`: if it exists, read it; if `.bytetrue/` itself is missing, tell the user to run `bt-onboard` first; only when `attention.md` is missing may this skill create the fixed-section skeleton first and then write to it.

`bt-learn`, `bt-trick`, and `bt-decide` produce standalone markdown files that are found **through search**. `.bytetrue/attention.md` is the **mandatory read** context for ByteTrue skill startup. These two kinds of information have different destinations. This skill is dedicated to the latter: append fragment knowledge that is short, stable, and needed every time into the attention file.

It does not replace the archival skills. It fills a missing entry point.

---

## What Goes into bt-note, and What Does Not

**Decision rule: length + frequency + stability**. Only if all three pass does it belong in `bt-note`.

| Item | Goes into bt-note | Goes elsewhere |
|---|---|---|
| Length | can be explained in one or two lines | longer than half a screen or needing background → `bt-learn` |
| Frequency | useful in almost every session | only relevant to a certain class of task → `bt-trick` |
| Stability | long-lived hard project constraint | temporary workaround or short-term hack → write into issue spec or feature spec |
| Decision status | already a fact on the ground, not requiring a decision record | if the reason behind the choice or rejection must be recorded → `bt-decide` |

✅ **Typical things that should go in**:

- "Before compiling, run `pnpm run gen` to generate schema"
- "Before starting local services, you must `docker compose up redis`"
- "This project uses Yarn Berry, **do not** use `npm install`"
- "The test command is `bun test`, not `npm test`"
- "`src/legacy/` is historical code; ask before changing it"
- "`OPENAI_KEY` comes from 1Password; do not copy it from `.env.example`"

❌ **Typical things that should not go in**, because they would bloat `attention.md`:

- how to fix a certain bug → `bt-learn pitfall`
- how to use a certain library → `bt-trick library`
- an architecture explanation → `.bytetrue/architecture/`
- short-term state like "this week we are working on X" → do not record it; it will expire
- anything too large to explain clearly → `bt-learn knowledge`

If unsure, ask the user: "Will the AI need to know this in almost every future session?" If the answer is "not necessarily", then it is not for `bt-note`.

---

## Target File

The target file is always `.bytetrue/attention.md`.

- if `.bytetrue/` does not exist → this repository has not been onboarded to ByteTrue yet, so first ask the user to run `bt-onboard`
- if `.bytetrue/attention.md` does not exist → treat it as a missing skeleton, create the minimal skeleton first, then write into it

`attention.md` is ByteTrue's own startup-notes entry point. Its value comes from every ByteTrue skill explicitly requiring it, not from automatic injection by external tools.

---

## Fixed Section Structure

To keep the file from growing into another bloated document, the set of sections is **fixed**. Do not create a new section just because it is not in the list:

```markdown
## Project Fragment Knowledge

<!-- bt-note managed: maintain with bt-note; append new entries under the sections below -->

### Compile and Build

### Running and Starting Local Services

### Testing

### Command and Script Pitfalls

### Path and Directory Conventions

### Environment Variables and Credentials

### Other
```

**Rules**:

- append each new entry at the end of the matching section, one line per entry, at most two lines
- if no suitable section exists, put it under `Other`. If `Other` exceeds 5 items, stop and discuss with the user whether a new fixed section should be added; do not silently add one
- keep the section blocks even when empty; do not delete them, because their presence is meaningful for the AI
- the comment line `<!-- bt-note managed -->` is the anchor this skill uses to recognize the block. If it is missing, insert the whole structure at the end of the file
- **soft size limit for the whole block**. When it goes over, tell the user: "There is too much fragment knowledge here. Which items should be moved into `bt-learn` or `bt-decide`?"

---

## Flow

### 1. Decide whether it belongs here

Check it against the rule table above. If any criterion fails, route the user to the corresponding skill and end this run.

### 2. Confirm the attention file

Check `.bytetrue/attention.md`. If `.bytetrue/` is missing, stop and tell the user to run `bt-onboard` first. If only `attention.md` is missing, create the fixed-section skeleton for this skill.

### 3. Find the location: section classification + dedup

- read `.bytetrue/attention.md` and locate the `<!-- bt-note managed -->` anchor
- if the anchor is missing, append the entire "Project Fragment Knowledge" skeleton at the end of the file
- inside the "Project Fragment Knowledge" block, `grep` by keywords for duplicates. If a similar entry already exists, **do not create a second line**. Ask the user: "Should we update the existing one, or is this truly a different note?"
- choose the section; if none fits, use `Other`

### 4. Write one line

Each entry uses this format:

```
- {one-sentence fact + one-sentence reason only if needed}
```

Examples:

```
- Before compiling, run `pnpm run gen`, otherwise the schema types will not line up
- Do not use `npm install`; the project lockfile is for Yarn Berry
- `src/legacy/` is pre-2023 legacy code; confirm with @ldz before changing it
```

After writing, do one sentence of user review confirmation and exit. **Do not proactively write multiple lines at once**. One item per run prevents stuffing in unconfirmed material.

### 5. Trigger the soft-limit check

After writing, glance at the total line count of the "Project Fragment Knowledge" block:

- if it becomes too large, tell the user to move some items into `bt-learn` or `bt-decide`
- if `Other` has 5 items or more, tell the user to discuss whether a new fixed section should be added

These are only **prompts**. Do not decide for the user.

---

## When to Proactively Suggest It

Do not ask every time. Suggest it in one sentence only when one of these two explicit signals appears:

1. **The user says something in the conversation that clearly qualifies as fragment knowledge**, such as "oh right, this project needs X before Y" or "we use Z here, not W". Suggest: "Should we `bt-note` that? Then the AI will see it every session."
2. **The AI itself just stepped on a project-specific setup that can be explained in one sentence**, such as a build failure, wrong command, or wrong path. After resolving it, suggest: "Is this a general project rule? If yes, we can `bt-note` it so future sessions know immediately."

If the user says "no need", skip immediately and do not repeat the suggestion.

---

## Easy Pitfalls

- stuffing detailed background or multi-step instructions into `attention.md` — if it exceeds two lines, it should go to `bt-learn`
- silently adding new sections — the section list is fixed, and adding one must be discussed with the user first
- seeing one note and writing several related ones at the same time — one item per run
- recording short-term state such as "this week we are doing X" or "the current sprint goal is Y" — it will expire, nobody will delete it, and it will gradually become misleading
- appending without deduplication — once the same fact is recorded three times, the AI becomes less certain which one is correct
