---
name: bt-req
description: 'Maintain the capability vision documents under `.bytetrue/requirements/` in three modes: `draft`, `backfill`, and `update`. Trigger when a vision is first drafted during design, archived during acceptance, or when the user says "refresh requirements", "backfill a req", or "write down the vision first".'
---

# bt-req

## Read Before Starting

Before making any judgment or taking any action, read `.bytetrue/attention.md` first; if it is missing, treat the skeleton as incomplete and tell the user to fill it in or run `bt-onboard`.

`.bytetrue/requirements/` is the project's "capability catalog". Each document describes **what problem created one capability, how the capability solves it, and where its boundaries are**, written in plain language that non-technical readers can also understand. Architecture docs explain "how it is built". Requirement docs explain "why it should exist".

**A req is the system's capability-vision layer**. It describes "what the user needs" and "what capability the system provides to satisfy that need". Three levels of time depth are represented by a single `status` field:

- `draft`: the user needs this capability, but the system has not implemented it yet, future vision
- `current`: the system is currently satisfying it, present capability
- `outdated`: the system once satisfied it, but it has since been removed or is no longer maintained, past trace

**A draft req can exist independently from implementation**. If the user says "I want capability X" but has not decided when it will be built, a `status: active` req can still be written first to lock down the vision. Then roadmap scheduling and design alignment both have a stable reference. **Not doing roadmap planning does not mean a vision doc should not exist.**

**The main path from draft to current is feature-acceptance**. After the capability is implemented and accepted, acceptance triggers `bt-req update` to change `status` from `draft` to `current`, and at the same time refreshes the user stories and boundaries according to the real implementation, while keeping the original vision intact and only adding a change log at the end.

**The backfill path remains valid**: for capabilities that are already running but never got a req, backfill writes them directly as `status: done` and `current: true`.

**Do not record how implementation should be phased**. That is what `bt-roadmap` is for. Req answers only "what is wanted and why", not "in which sprint it will be built" or "how many sub-features it will be split into".

The value of a requirement doc is that **the point is clear at a glance**. User stories go first, the pain point and solution each fit in a short paragraph, and boundaries are listed. Common AI failure modes that damage this:

- writing it in PRD form, as a pile of fields, so the reader must reconstruct the meaning cell by cell
- sounding overly explanatory, as if lecturing rather than introducing
- giving it a fancy title or metaphor, so the reader must read half a page before understanding what the capability is
- stuffing implementation details into it, such as "through service XXX calling interface YYY"

> For shared paths and naming conventions, see `.bytetrue/reference/shared-conventions.md`. For a sample, read `.bytetrue/reference/requirement-example.md` before drafting so the tone stays aligned.

---

## Applicable Scenarios

- triggered during brainstorm: after discussion, the vision becomes clear → use `draft` to write the vision and land it as `status: active`, so design and roadmap later have a stable alignment baseline
- triggered during feature-design: a new capability is being designed for the first time → use `draft` to write the vision, user stories, pain point, solution, and boundaries, as `status: active`
- triggered from section 6 of feature-acceptance: the capability corresponding to a draft req is now implemented → use `update` to upgrade it to `current`, keep the original vision and append a change log; for an existing capability that never had a req, use `backfill` and write it directly as `current`; if a capability that already has a current req changes its boundary, user story, or pitch, use `update` to refresh it
- proactive user inventory: a capability is already running but never had a req, use `backfill`
- proactive user revision: the capability evolved and needs refreshing, use `update`
- proactive user vision drafting: a future need has not even been scheduled yet, but a `draft` req can still be written to lock the positioning first

Not applicable: if the job is to write "how it is built technically", use `bt-arch`; if it is to write a one-off feature plan, use `bt-feat-design`; if it is to finalize a long-term convention or technical choice, use `bt-decide`; if it is to write outward-facing "how to use it", use `bt-guide`; if it is to split a large demand across multiple rounds, use `bt-roadmap`.

---

## Single-Target Rule

Each run touches only one document:

- **draft**: draft the vision for a new capability that has not been implemented yet, user story, pain point, solution, and boundaries, with `status: active`
- **backfill**: backfill a capability that already exists but was never documented, with `status: done` and `current: true`
- **update**: refresh one existing document based on new material or implementation changes

Why not allow multiple docs at once? The value of req lies in **each document actually being read**. If several are emitted at once, the user cannot review each one deeply, and the result is either rough merges or docs nobody reads.

### Features that are allowed to have no requirement

Pure internal refactors, technical-debt cleanup, or tooling changes that **do not add any user-perceivable capability** do not require a req. Feature-design can simply mark "this run does not add a new capability". Do not force one just to fill the shape.

---

## Workflow

### Phase 1: Lock the target

Mode, target doc, and scope.

**Draft mode**: the capability does not exist yet, so the vision is drafted from user material such as spoken need, product idea, or user feedback. User stories and pain points must feel real. The boundaries must clearly say what it does not cover. The value of a vision doc is precisely in drawing the line between what will be done and what will not.

One req describes **one capability**. If the user says "write all the requirements for this module", ask first: how many independent outward-facing capabilities does the module provide? Each independent capability gets its own document; do not stuff them together.

### Phase 2: Read the materials

**Required for all modes**: `VISION.md`, the requirements index, the other reqs under `requirements/`, to judge whether there should be cross-links or whether duplication exists, and user material such as spoken descriptions, product ideas, user feedback, or scattered feature-level requirement notes.

**Read as needed**: the architecture docs that may implement this capability, used for `implemented_by`; related existing feature designs; compound artifacts, via `python .bytetrue/tools/search-yaml.py --dir .bytetrue/compound --query "{capability keyword}"`.

**Draft-specific**: glance at roadmap. If a roadmap already mentions this capability, read it once to understand the expected decomposition direction, but the req itself must not be bound to roadmap items.
**Update-specific**: read the full current doc plus a rough `git log` scan of relevant implementation changes after `last_reviewed`, especially in the code modules pointed to by `implemented_by`.

### Phase 3: Draft in one pass

Write the **complete first draft** according to the "document structure" below. Do not emit it in pieces. The user-story, pain-point, solution, and boundary sections often contradict each other across sections, and only a full draft reveals that.

### Phase 4: Self-check list

Run this once yourself before review. Each item targets a default AI mistake:

1. **Does the tone sound like human language?** Read a paragraph out loud. Does it sound like you are introducing it to a friend, or like a lecture or PRD? If it sounds like the latter, rewrite it
2. **Is the title flat and literal?** Say directly what the capability is. No metaphor, no fancy wording. "Explore and analyze before fixing bugs" is better than "Let AI be your first reader"
3. **Are the user stories concrete enough?** Each one should let a reader imagine a real scene. "As a user, I hope the system is easy to use" is useless
4. **Did implementation detail get stuffed in?** There should be no "through interface X" or "using algorithm Z". If present, move it to architecture
5. **Did you write the boundaries?** A requirement without boundaries will be misused
6. **Can the pitch work as a promotional line?** It should be non-technical, one sentence, and understandable without extra context
7. **Update-specific**: do the new or changed paragraphs in this revision each have material or implementation evidence behind them? Adding "sounds more complete" prose without evidence is the start of drift
8. **Draft-specific**: is the vision clear enough? Can someone unfamiliar with the project retell why this capability is needed after reading it?

Report the self-check result briefly. If problems were found, say how they were handled, delete, rewrite, or supplement. Do not make it ceremonial.

### Phase 5: User review

Show the complete first draft to the user. Keep iterating until the user explicitly says "this is good".

### Phase 6: Write to disk and update the index

- draft: write to `requirements/{slug}.md`, with `status: active` and `last_reviewed` set to today
- backfill: write to `requirements/{slug}.md`, with `status: done` and `current: true` and `last_reviewed` set to today
- update: overwrite the existing doc and set `last_reviewed` to today; if the structural change is large, add one line to the `Change Log` section at the end; draft → current is a structural state change and **must** have a change-log entry
- **index update**: update `requirements/VISION.md`, grouping all reqs by status and listing each one with its one-line pitch plus status marker

---

## Document Structure

### frontmatter

```yaml
---
doc_type: requirement
slug: {english-hyphenated; must match filename}
pitch: {one non-technical sentence that makes the capability clear and could be used as promotional copy}
status: done | pending | archived
last_reviewed: YYYY-MM-DD
implemented_by: []   # list of architecture doc slugs that carry it, may be empty
tags: []
---
```

### Body sections

```markdown
# {title — say directly what the capability is, no metaphor}

## User Stories

- As a {specific role or situation}, I want to {do what}, instead of {how it feels painful now}
- ... 2-4 items, one line each

## Why It Is Needed

One short paragraph describing the pain point when this capability does not exist. A non-technical reader should still understand it. It should work directly as promotional copy. The more real the pain-point description, the more useful it becomes when explaining what problem the system solves.

## How It Solves It

One short paragraph describing roughly how the capability works. **Do not write implementation detail**. Do not mention module names, interfaces, or algorithms. Only describe what happens in the user experience.

## Boundaries

- what it does not cover, including things that look related but are not its responsibility
- when not to use it
- prerequisites, meaning what the user must do first
```

### Change Log, only in `update` mode

```markdown
## Change Log

- YYYY-MM-DD: {one-line description}
```

---

## Hard Boundaries

1. **Human tone, not PRD tone** — no field piles, no lecture voice, no fancy title
2. **No implementation detail** — only explain what it is, why it exists, and what it solves; any implementation content belongs in architecture
3. **Do not invent user stories for the user** — they must come from user material or traceable scenarios, such as an existing feature, user feedback, or explore. Do not fabricate a "plausible sounding" usage scene
4. **Single target** — one doc per run
5. **Do not edit code or architecture docs** — this skill writes only req. If architecture has a problem, record it as an observation
6. **Do not fan out** — out-of-scope issues become observations

---

## Exit Conditions

- [ ] one mode and one target have been locked
- [ ] the Phase 4 self-check list has been run item by item and the handling was reported
- [ ] frontmatter is complete, including `doc_type: requirement`, `pitch`, `status`, and `last_reviewed`
- [ ] the four body sections are complete, user stories, why it is needed, how it solves it, and boundaries
- [ ] each user story suggests a concrete scene, with no useless lines like "I hope the system is easy to use"
- [ ] no implementation detail was stuffed into the doc
- [ ] the `pitch` reads like a direct promotional line, and in draft mode it still reads like a direct promotional line, because a vision must also be sellable
- [ ] in draft mode, status is `draft`, implementation detail has not been invented, and the boundaries are clearly drawn
- [ ] in update mode, structural changes have a `Change Log`, including draft → current transitions
- [ ] the user review passed
- [ ] no code, architecture, or other spec was edited on the side
- [ ] there were no out-of-scope document edits

---

## Relationship with Other Workflows

| Direction | Relationship |
|---|---|
| works with `bt-arch` | req writes "why this should exist", architecture writes "how it is built"; architecture frontmatter uses `implements: [req-slug]` as the back-link |
| may be triggered by `bt-brainstorm` | once the vision becomes clear after discussion, `draft` mode can be used to write the req vision |
| may be written during `bt-feat-design` | design reads existing reqs to align user stories and boundaries; when a new capability is being designed for the first time, it triggers `draft` mode to write the req vision |
| main path is `bt-feat-accept` | acceptance handles req archival in a unified way: when the capability behind a draft req is implemented, it triggers `update`, draft → current, keeping the original vision and appending a change log; when an existing capability never had a req, it triggers `backfill`, directly as current; when an existing current req changes, it triggers `update` to refresh it |
| works with `bt-roadmap` | req records "what is wanted and why", roadmap records "how to implement it step by step". Roadmap items may reference req slugs, but req is not bound to a specific roadmap. A draft req does not pressure the roadmap; the vision may exist before scheduling |
| created by `bt-onboard` | onboard creates the empty `requirements/` directory and the empty `VISION.md` skeleton |

---

## Common Mistakes

- treating a draft req like a backfill — the capability is not implemented yet, but the doc is marked `status: done
current: true`, or implementation details are invented as if it already exists
- during backfill, not confirming that the capability is really running in code — writing a "sounds plausible" req from one user sentence
- stuffing implementation detail into a draft req — deciding how to implement it before the design phase
- drawing draft boundaries too wide — the value of vision is to draw the line; wanting everything means saying nothing
- writing it as a PRD field pile, lecture tone, metaphorical title, too-abstract user stories, implementation detail inside, or missing boundaries
- putting technical jargon into `pitch` — then it cannot be pulled into promotional material
- drafting multiple docs in one run — the user's review becomes shallow
- stuffing multiple independent capabilities into one oversized scope — split them
- adding paragraphs during update without evidence — the content will drift farther and farther from reality
