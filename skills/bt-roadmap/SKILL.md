---
name: bt-roadmap
description: 'Turn a demand that is too large to fit into a single feature into complete up-front planning: conceptual design, interface contracts, and a sub-feature decomposition list, stored under `.bytetrue/roadmap/{slug}/`. Two modes: `new` and `update`. Trigger when the user says "I want an X system", "help me break this demand down", "open a roadmap", or when feature-design discovers that the request is actually too large.'
---

# bt-roadmap

## Read Before Starting

Before making any judgment or taking any action, read `.bytetrue/attention.md` first; if it is missing, treat the skeleton as incomplete and tell the user to fill it in or run `bt-onboard`.

`.bytetrue/roadmap/` is the project's planning layer. Each subdirectory carries one larger demand, and its main document consists of three parts:

1. **Conceptual design**: how this larger demand should be structured, which modules or components it should split into, and the responsibility of each
2. **Detailed architecture layer**: interface contracts between modules, shared data structures, and protocols spanning multiple features
3. **Sub-feature decomposition**: a sequence of sub-feature seeds with dependency relationships, consumed one by one by the feature workflow

These three parts are the **shared constraints** for all sub-features under this larger demand. When a sub-feature enters `bt-feat-design`, the interface contracts in part 2 of the roadmap become its **hard-constraint input**. It must not violate them. If they need to change, the change must go back through `roadmap update` first.

**Why roadmap carries the architecture plan instead of `architecture/`**: `bt-arch` protects the rule "record only the current state, not the plan". A forward-looking architecture plan belongs to pre-implementation planning: it has not landed yet and may still change. Putting it into architecture would pollute the system map. Once sub-features actually land, `bt-feat-accept` extracts the corresponding interfaces back into `architecture/`. The roadmap then completes its transitional role and becomes archive.

**Why it needs a dedicated layer**: requirements record "what is wanted", the vision; architecture records "how it is built", the structure; roadmap records "how to implement it step by step", the execution plan. If execution planning is stuffed into the vision or structure documents, "what is wanted" becomes mixed with "how we currently plan to build it", and then nobody can clearly see the system's real capabilities. One plan change would also force edits in two document layers.

**Why a directory instead of a single file**: during decomposition there will be drafts, investigation notes, solution comparisons, and whiteboard-style transcription. Stuffing all of that into one md file becomes chaotic and hard to trim. Each roadmap has one subdirectory. The main document is the outward-facing statement, and `drafts/` next to it can hold whatever working material it needs.

> **After reading this section, jump to "After Exit" first and read the close-out checklist before coming back to write the roadmap** — the first step after exit is tracker sync, and you are required to ask it in one pass.

> For shared paths and naming conventions, see `.bytetrue/reference/shared-conventions.md`. The full templates for the main doc and items live in `reference.md` in the same directory.

---

## Applicable Scenarios

- the user describes a larger demand that is obviously too large to fit in one feature, for example "add a permission system", "build a notification center", or "integrate SSO"
- `bt-brainstorm` classifies it as case 3 and hands it here. Brainstorm does triage, not decomposition
- an existing roadmap needs a new sub-feature, reordered dependencies, changed sequence, or a dropped item
- feature-design discovers that what looked like one feature is actually a set of multiple features, and should be sent back here first

Not applicable: if one feature can already hold it, use `bt-feat`; if the task is to describe what a capability is and where its boundary lies, use `bt-req`; if the task is to describe how the system is structured, use `bt-arch`; if the task is to finalize long-term conventions or technology choices, use `bt-decide`.

---

## Mode Routing

| What the user says | Mode |
|---|---|
| "break down X", "open a roadmap for X", "I want an X system" | `new` |
| "add a sub-feature to {existing roadmap}", "reorder the sequence", "mark this dropped" | `update` |

If you cannot tell, ask the user.

---

## Single-Target Rule

Each run touches only one roadmap. If the user says "I want X and Y", ask them to pick one first and leave the other for next time. The reason is the same as req and arch: if multiple roadmaps are emitted at once, the user cannot review them properly.

---

## Directory Structure

```text
.bytetrue/roadmap/{slug}/
├── {slug}-roadmap.md       main document: background / scope / module split, conceptual design / interface contracts, detailed architecture / sub-feature list / scheduling
├── {slug}-items.yaml       machine-readable list, read by feature-design and written back by feature-acceptance
└── drafts/                 optional, for investigation, discussions, and drafts
```

`{slug}` uses lowercase letters, digits, and hyphens, matching the larger demand, for example `permission-system` or `notification-center`. Keep them flat, with no epic or sub-epic nesting. `drafts/` is created as needed; the AI does not force archival there.

---

## Workflow

### Phase 1: Lock the target

Lock mode, target, and scope. In `new` mode, first settle on an English slug, following the style of existing req and arch slugs.

### Phase 2: Read the materials

**Required for all modes**: `.bytetrue/attention.md`, the user material, other roadmaps under `roadmap/` to avoid duplication, relevant reqs under `requirements/`, and relevant docs under `architecture/`.

**Read as needed**:
- related compound artifacts: `python .bytetrue/tools/search-yaml.py --dir .bytetrue/compound --query "{larger-demand keyword}"`
- related existing feature designs
- if roadmap decomposition, interface contracts, or sequencing depend on external tool behavior, library/API capability, platform hooks, comparable workflows, industry convention, or performance/cost claims, require or create a `bt-explore` spike first and cite it; see `.bytetrue/reference/research-first.md`

**Update-specific**: the full current main doc, the current state of `items.yaml`, and the design and acceptance of sub-features that have already started or completed.

### Phase 3: Decompose and draft

Write the **complete first draft** according to the "main document structure" and "`items.yaml` format" in `reference.md`. Do not emit it in pieces.

**Decomposition discipline**:

0. **Do the architecture plan first, then split features** — order: first think through the module split, section 3 conceptual design → then inter-module interfaces, data structures, and protocols, section 4 detailed design → only then decompose into sub-features, section 5. **If the architecture plan is unclear and you force feature splitting first, each feature will reinvent the wheel and the interfaces will not line up**
1. **Write interface contracts down to the level that feature can treat them as hard constraints** — function signatures, data structures, protocol fields, and error codes. If you cannot write at that level, go back and think. If there is no cross-module interface, such as pure frontend style work, explicitly write "no cross-module interface"
2. **Each sub-feature must be able to complete a full feature workflow independently** — it must be independently designable, implementable, and acceptable. If it cannot, the decomposition grain is wrong
3. **The dependency graph must be a DAG** — if A depends on B, say it explicitly; no cycles
4. **Every dependency must have a concrete reason** — "B depends on A because A provides XX table schema", not just "A goes first"
5. **List one minimal loop first** — the narrowest end-to-end path that can actually run through once it is done should be marked as the first item
6. **Write explicit non-goals** — the user's mental picture of a "permission system" may include audit logs or data masking. If those are not covered, write them into "explicitly not covered"
7. **Do not decide product priority for the user** — beyond hard technical dependency, ordering is the user's call

### Phase 4: Self-check list

Run this once yourself and report the handling before review:

1. Is the module split clear? Can each module's responsibility be said in one sentence?
2. Are the interface contracts executable enough? After reading them, can feature-design implement directly without having to come back and ask again?
3. Are all sub-feature slugs compliant and non-conflicting, checked with `grep .bytetrue/features/`?
4. Does each item's one-line description stand on its own? If it does not, the split is probably too coarse or the scope too fuzzy
5. Is the dependency relation a DAG, with no self-reference and no A→B→A loops?
6. Is the minimal loop truly minimal? After the first item is done, what exactly can be demonstrated end to end?
7. Are the explicit non-goals written down? If not, write "no explicit non-goals"
8. Does it conflict with existing req or architecture? If yes, write "conflicts with req-X, user must decide", and do not quietly choose a side
9. **Update-specific**: does every new or changed item have source material behind it? Adding one "to make it look more complete" is drift
10. **Update-specific**: if the interface contracts changed, do already in-progress or done sub-features get affected? List them under observations so the user can see the impact

### Phase 5: User review

Show the main doc and `items.yaml` to the user in full. Keep iterating until the user explicitly says "this is good".

### Phase 6: Write to disk

**new**: create `.bytetrue/roadmap/{slug}/`; write the main doc with `status: active`, `created`, and `last_reviewed` set to today; write `items.yaml` with every entry `status: pending` and `feature: null`; validate with `validate-yaml.py`.

**update**: modify the main doc with `last_reviewed` set to today, and add a change-log line at the end when the structural change is large; modify the corresponding items in `items.yaml`, and for dropped items do not delete them, set `status: dropped` and leave the reason; then validate yaml again.

**Do not modify requirements or architecture** — roadmap is the planning layer, and those two layers describe current state. If req or architecture is outdated, write one sentence under observations in the main doc and let the user decide, rather than changing them on the side.

---

## Hand-off to the Feature Workflow

### Starting a feature from roadmap

When the user says "start working on sub-feature {X} in the roadmap":

1. `bt-feat-design`, or ff or brainstorm if appropriate, creates the feature directory
2. the design frontmatter carries `roadmap: {slug}` and `roadmap_item: {sub-slug}`
3. the corresponding item in `items.yaml` is updated to `status: active` and `feature: YYYY-MM-DD-{slug}`

This responsibility belongs to `bt-feat-design`, not this skill.

### feature-design must treat roadmap interface contracts as hard constraints

**Section 4, "interface contracts", of the roadmap main doc is a hard-constraint input for the feature**. It is not a suggestion. It must not be violated. If it needs to change, it must go back through `bt-roadmap update` first. This is why roadmap must settle the architecture plan before splitting features: so that multiple features, built in parallel or sequence, line up at the external interfaces.

If feature-design discovers that an interface contract is unreasonable, missing, or inaccurate, it **must go back to `bt-roadmap update`, fix it there, and then continue**. Do not quietly route around it in the feature. If you do, the next feature touching the same module will receive the old contract and create a second conflict.

### acceptance writes back automatically

At close-out, if design frontmatter contains a `roadmap` field, `bt-feat-accept` will update the corresponding `roadmap_item` to `status: done`, and will also synchronize the checkmark state in the sub-feature list of the main doc. That responsibility belongs to `bt-feat-accept`, not this skill.

### lifecycle of roadmap itself

- when all items are `done`, `dropped`, or `archived`, the main doc `status` becomes `completed`, and the directory stays as historical archive
- if there is no progress for a long time, set `status: paused` and add the reason in the main doc

---

## Hard Boundaries

1. **Do not write single-feature internal implementation detail** — roadmap stops at module boundaries, interface contracts, and shared protocols. How a single module is implemented internally belongs to feature-design. Rule of thumb: if **multiple features will obey it together**, it belongs in roadmap; if **only one feature uses it internally**, it belongs in feature-design
2. **Do not change vision or structure archives** — do not touch requirements, architecture, code, or existing feature files on the side. Record issues under observations
3. **Do not decide product priority for the user** — ordering beyond technical dependency belongs to the user
4. **Single target** — one roadmap per run
5. **Do not fan out** — anything outside user scope goes into observations, not expansion
6. **Interface contracts must be either executable-level or explicitly "no cross-module interface"** — "TBD" or "discuss later" is not allowed. A vague contract will be re-invented separately by each feature-design and inevitably diverge

---

## Exit Conditions

- [ ] one mode and one target have been locked
- [ ] the main doc frontmatter is complete, including `doc_type: roadmap`, `slug`, `status`, `created`, `last_reviewed`, and `tags`
- [ ] the main doc contains background, scope and explicit non-goals, **module split**, **interface contracts**, sub-feature list, scheduling, and observations
- [ ] in the module-split section, every module's responsibility is stated clearly in one sentence
- [ ] the interface-contracts section is written to a level where feature-design can treat it as hard constraints, function signatures, data structures, protocol fields, and error codes, or it explicitly states "no cross-module interface"
- [ ] every item in `items.yaml` has `slug`, `description`, `depends_on`, `status`, and `feature`
- [ ] the dependency graph is a DAG, with no cycles
- [ ] the minimal-loop item is marked
- [ ] `items.yaml` passes `validate-yaml.py`
- [ ] the Phase 4 self-check list has been run item by item and the handling was reported
- [ ] the user review passed
- [ ] there were no side edits to req, arch, code, or existing features

---

## After Exit

Tell the user: "The roadmap is ready. Each sub-feature later goes through `bt-feat-design`, and the interface contracts inside the roadmap are hard-constraint input."

Following section 3 `roadmap` in `.bytetrue/reference/shared-conventions.md`, give one-sentence close-out prompts in this order, and skip immediately if the user says "no need":

1. a roadmap PRD or any syncable roadmap items touched in this change, planned, in-progress, or done; dropped items only update already-bound external issues, may need collaboration projection → "Do you want to sync or bind an external tracker? (`bt-tracker`)" Do not create or update an external issue before explicit confirmation
2. if the roadmap session should be visible in reports or handoff context → "Do you want to add a concise worklog/report-feed entry for this roadmap update?" (`.bytetrue/reference/worklog-report-feed.md`)

---

## Relationship with Other Workflows

| Direction | Relationship |
|---|---|
| works with `bt-req` | req records "why this capability exists", while roadmap records "how we plan to build it step by step". One larger demand may involve multiple reqs. If req is missing, prompt the user to use `bt-req` first |
| works with `bt-arch` | architecture records current state, roadmap records multiple steps forward. It reads architecture to understand current state but does not modify it |
| downstream to `bt-feat` | each sub-feature is a seed for one future feature workflow; when it starts, design frontmatter carries `roadmap` and `roadmap_item` |
| written back by `bt-feat-accept` | acceptance automatically updates `items.yaml` to `done`; this skill defines the format but does not do the write-back |
| created by `bt-onboard` | onboard creates the empty `roadmap/` directory |
| upstream from `bt-brainstorm` | case 3 hands it over here, carrying a one-sentence summary of the real problem, rough scope, and possible sub-modules; this skill does not re-triage, it goes straight into decomposition |

---

## Common Mistakes

- **skipping the architecture plan and splitting tasks first** — listing sub-features immediately without thinking through module boundaries or interfaces, so each feature reinvents the wheel
- **writing vague interface contracts** — phrases like "the two sides will discuss it", "TBD", or "use a unified event bus", without getting down to fields, signatures, or protocol level. Feature-design cannot use these as hard constraints
- writing single-feature internal detail into roadmap, such as how one module is split into files or which library it uses — that belongs to feature-design
- unbalanced decomposition grain — one item contains three independent capabilities while another only changes one config
- dependency relationships that rely on intuition, with no concrete explanation
- deciding product priority for the user
- finding conflicts with existing req or architecture and not stopping, quietly choosing one side and hiding the real disagreement
- trying to do multiple roadmaps in one run
- modifying req or arch on the side
- deleting dropped items outright, losing history
- letting roadmap drift into a detailed design for one sub-feature
- changing interface contracts in update mode without assessing existing impact, so already in-progress or done features never see the contract change
