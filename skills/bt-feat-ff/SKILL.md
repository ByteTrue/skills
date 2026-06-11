---
name: bt-feat-ff
description: Ultra-light path for the feature workflow. Skip design and checklist and go directly to implementation, but first point the AI at the existing ByteTrue knowledge base before starting. Trigger when the user says "fast mode", "fastforward", "too many steps", or "just start coding", and the request is small enough that a full design flow would not be worth it.
---

# bt-feat-ff

## Read Before Starting

Before making any judgment or taking any action, read `.bytetrue/attention.md` first; if it is missing, treat the skeleton as incomplete and tell the user to fill it in or run `bt-onboard`.

When the user asks for a small feature, the AI would normally start coding directly anyway. This skill **does not change that**. It does only one thing: before coding, point the AI at the ByteTrue knowledge already captured inside the project, search it as needed, and give the resulting code one extra layer of protection beyond bare coding; after implementation, write back the **minimal `{slug}-ff-note.md`** so this work remains traceable, visible to `bt-arch` and `bt-req` backfill, and eligible for a scoped commit.

Very light: no design doc, no checklist, no acceptance checklist, and no user confirmation before implementation. After reading the guidance, read code when needed, write code when needed, and write back a short note after the work is done.

---

## Before Coding, Scan `.bytetrue/` Once

Glob `.bytetrue/`, discover the available directories and documents, and use them as needed:

- **`architecture/`** — the `ARCHITECTURE.md` entry plus subsystem docs. Before changing cross-module behavior, glance here to avoid violating boundaries
- **`compound/`** — the four captured types, learning, trick, decision, and explore:
  ```bash
  python .bytetrue/tools/search-yaml.py --dir .bytetrue/compound --filter doc_type=learning --query "keyword"
  python .bytetrue/tools/search-yaml.py --dir .bytetrue/compound --filter doc_type=decision --query "keyword"
  python .bytetrue/tools/search-yaml.py --dir .bytetrue/compound --filter doc_type=trick --query "keyword"
  ```
- **`requirements/`** — read boundaries if there is a relevant requirement
- **`features/`** — if there is a similar feature, refer to its design
- **`reference/`** — `.bytetrue/reference/shared-conventions.md` and `.bytetrue/reference/tools.md`

---

## How to Use It

Before coding, ask two questions:

1. **Has anyone stumbled on this part of the code before?** → search learning in `compound/`
2. **Are there already finalized constraints for how this part should be written?** → search decisions in `compound/` and check the relevant subsystem under `architecture/`

If there is a hit, fold the conclusion into the implementation, **write according to the constraint**, not by copying. If there is no hit, writing by your own judgment is normal. If search comes up empty, try a few different keywords and search again.

---

## Guard These Rules While Coding

These are the compressed versions of the hard constraints from design and implement. No design doc does not mean no discipline. These rules exist to stop the default AI failure modes while "just start coding" is in effect.

This path is `execution_mode.level: light` only. If strict-evidence or break-loop triggers appear, such as regression-sensitive behavior, complex business logic, cross-boundary contracts, or repeated failed fixes, stop and route back to the standard feature or issue workflow. See `.bytetrue/reference/execution-modes.md`.

### Think "where should this live?" before you write

Spend 30 seconds answering: **where in the project structure does this new thing belong?**

- if an existing module should naturally carry it → extend there; do not invent a new home
- if it spans multiple modules → extract a shared layer or make one side the clear owner
- if existing modules use a different name for the same idea → grep synonyms
- if it does not look like any existing place → it probably should fall back to the full design flow

Default pitfall: **adding it to the most convenient file in front of you without thinking**. That is how files become catch-all buckets.

### Take one look at the file you plan to change

Before writing, look once: how long is the file? How many responsibilities does it already carry? How many methods does the class have? Is your new change a natural extension, or does it push the file or class further toward "does everything"?

If it looks healthy, add the code directly. If it needs cleanup first, such as splitting a long file or extracting repeated logic, **clean first, then add**, while locking the cleanup scope to "move only, no behavior change". If the issue is structural, such as responsibility repartition or module split and merge, stop and return to the full design flow.

### By default, write the least code possible

Write only what the user explicitly asked for. Do not add extras "while here":

- configuration items, parameter switches, abstraction layers, interfaces, or factories for some hypothetical future
- defensive fallbacks or `try-catch` blocks that nobody asked for
- edge handling the user never mentioned

Decision rule: after writing, if you think "should I also add X?" ask whether X is something the user can actually perceive. If not, do not add it. Extra code is not neutral; it becomes maintenance burden for the next person.

### Touch only what should be touched

Only change the functions that need changing. If other functions in the same file are ugly or badly named, **do not touch them unless they directly conflict with this work**. Match the existing style of the file. If you see another place worth improving, record it as "While here I noticed: {file:line} {problem}", and let the user decide.

### New logic goes to a new file by default

If it will be used elsewhere, create a new file. If it is only a small helper used in one place, keep it nearby.

### Do not patch with special-case branches

If you are about to write `if (special case) { special handling }`, **stop**. A branch like this usually means the current thinking did not cover that scenario, and forcing it in produces "special logic added just to make the code run". Either change the data structure so no special handling is needed, or explicitly admit it is a real edge case and comment why it is special.

### Stop when reflection signals fire

- appending to a file over 300 lines, or adding another method to a class with more than 10 methods
- a function growing until it no longer fits on one screen
- writing a second block that is "basically the same as the one above except for two variables"
- adding a fourth function parameter
- dumping more things into a universal `utils.ts` or `helpers.ts`
- before inventing a new concept name, grep the same name and near-synonyms first

See section 7 of `.bytetrue/reference/shared-conventions.md` for the full list.

---

## After Coding, Write Back `{slug}-ff-note.md`

Do this **only after** the code is written, verified, and the user confirms the effect is OK. Creating the shell in advance breaks the light feel of ff.

### Generate the slug automatically

Do not ask the user. Rules:

- extract 2-4 English kebab-case words from the user's original request to summarize the action or target, such as `rename-cwd-helper`, `add-export-button`, or `fix-toolbar-layout`
- do not use business abbreviations, do not transliterate Chinese, and keep lowercase with hyphens
- if unsure, be conservative. `tweak-{object}` or `small-{action}` is better than forcing false precision

Final path: `.bytetrue/features/YYYY-MM-DD-{slug}/{slug}-ff-note.md`, with today's date.

### Template

```markdown
---
doc_type: feature-ff-note
feature: {slug}
date: YYYY-MM-DD
requirement: {req-slug or empty}
tags: [...]
---

## What Was Done
{1-3 sentences: what need was solved and what capability was added, from the business perspective}

## What Changed
- {file:line range or function name} — {one sentence saying what changed}
- ...

## How It Was Verified
{1-2 sentences: what checks were run, which browser path was walked through, or what tests were run}

## While Here I Noticed, optional, non-blocking
- {file:line} {short problem summary} — outside the scope of this run
```

**Keep it truly light**: each section is only a few lines. Do not turn it into a mini design or mini acceptance report. The goal of this document is "six months later, someone can jump in from git log and understand in 30 seconds what this change did", not to replace the standard flow.

After writing it, tell the user: "`{slug}-ff-note.md` has been written, and this fastforward run is closed."

---

## What Not to Do

- **Do not write a design doc, checklist, or acceptance report** — that is exactly why fastforward exists. If those are needed, go to `bt-feat-design`
- **Do not ask the user to confirm the plan up front** — the whole point of a user asking for a small feature is that they do not want a meeting first
- **Do not leave new files in `.bytetrue/` other than `{slug}-ff-note.md`** — unless you discover a pitfall or technique worth preserving, in which case start a separate conversation and use `bt-learn` or `bt-trick`

---

## When to Exit Fastforward

If any of the following appears halfway through, **stop and tell the user "this is more complex than expected; recommend switching back to the full flow"**:

- the change touches more than 3 subsystems
- a new term must be introduced, or it conflicts with existing terminology
- an established module boundary in `.bytetrue/architecture/` must be changed
- the user's added requirements double the scope

To switch back, trigger `bt-feat-design`. Code already written can simply be marked in design as "partially implemented".

---

## Exit Conditions

- [ ] the code is written and the user confirms the effect is OK
- [ ] `{slug}-ff-note.md` has been written and all four sections are filled, with "while here I noticed" optional
- [ ] there are no unresolved "while here I noticed" items, meaning they are all recorded in the last section of the ff note for later follow-up

---

## Close-Out Commit

Follow the "scoped-commit" rules in section 4 of `.bytetrue/reference/shared-conventions.md`. For this path:

- **commit scope**: this code change plus `{slug}-ff-note.md`
- after the ff note is written, tell the user "it is ready; do you want me to commit it?" and only execute after explicit approval

Following section 3 `feature-ff` of `.bytetrue/reference/shared-conventions.md`, give one-sentence close-out prompts in this order, and skip immediately if the user says "no need":

1. if it exposed a pitfall → "Capture it as learning? (`bt-learn`)"
2. if it finalized a long-term constraint → "Archive the decision? (`bt-decide`)"
3. finally ask whether they want a scoped commit

---

## Easy Pitfalls

- skipping knowledge lookup entirely and just writing code — the only reason this skill exists is to make you search once before coding
- treating the learning or decision you found as "reference" rather than a constraint — once a decision is finalized, either follow it or reopen the decision; do not quietly violate it
- starting to write a design doc — fastforward exists precisely to avoid that
- discovering the task is becoming complex and still forcing it through fastforward — the cost of switching back is far lower than carrying a wrong plan all the way through
- **creating an empty ff-note shell before coding** — this breaks the light feel of fastforward; code and verification must come first, and only then write back
- **turning the ff-note into a mini design or mini acceptance** — the four sections together should only be around a dozen lines; if it needs more, it probably should not have used fastforward
- **committing without the ff-note** — for the same reason issue fast path requires a fix note, future readers need a trace
