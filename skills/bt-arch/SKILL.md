---
name: bt-arch
description: Maintain `.bytetrue/architecture/`, the system map that records only the current state, in three modes: `update`, `check`, and `backfill`. Trigger when the user says "refresh architecture", "do an architecture check", "backfill the architecture doc for this module", "does the plan match the code", or when a feature stage needs an architecture action first. This skill does not write future plans; future planning belongs to `bt-roadmap`.
---

# bt-arch

## Read Before Starting

Before making any judgment or taking any action, read `.bytetrue/attention.md` first; if it is missing, treat the skeleton as incomplete, tell the user to fill it in or run `bt-onboard`, and do not fall back to an external AI entry file.

`.bytetrue/architecture/` is the project's "map". Design reads it before writing a plan so it can locate itself. `issue-analyze` reads it to understand module boundaries during root-cause analysis. Newcomers read it to understand roughly what the system looks like. This skill is the unified entry for three jobs: drafting, refreshing, and health-checking.

**Architecture is the accumulated, self-sufficient system map**, not the detailed plan of a single feature. It is the "what the system looks like now" picture formed by every landed feature. A reader should be able to understand the overall structure without jumping back into historical design docs. Design is a temporary incremental draft. Acceptance extracts the stabilized terms, orchestration, and constraints back into architecture. Design files are archived and should be revisited only when someone needs to inspect concrete decision details.

**Record only the current state, never the plan**. By default, architecture is synchronized with code during acceptance, and when necessary this skill performs backfill or update proactively. **Do not write "we will add a new layer later" or "next we plan to split out module X"**. Those belong to `bt-roadmap`. If the user says "I want to refactor this into architecture X", send that first to roadmap and split it into features. Each acceptance then extracts the structure that actually landed back into architecture.

The level-of-detail rule is: **is this enough for the reader to understand the system without jumping away?** Write the stable, cross-feature-visible layer in full. Internal loops, helper functions, and one-off implementation decisions do not belong here.

The value of architecture docs is that they are **accurate, stable, and searchable**. The AI commonly damages those properties in a few ways:

- **inventing a system out of thin air** — the doc says `AuthManager` coordinates `TokenService`, but the code contains no `AuthManager`
- **deciding on the user's behalf** — quietly choosing a layering approach so readers mistake it for settled fact
- **paraphrasing code** — every section says only "what is here" but never "why it is split this way", so the informational value is no better than `ls -R`
- **glancing once during check mode and saying it looks fine** — without any positional evidence

> For shared paths and naming conventions, see `.bytetrue/reference/shared-conventions.md`. For the doc structure templates, check coverage items, and report formats, see `reference.md` in the same directory.

---

## Mode Routing

At startup, classify into one of three modes. Do not show the user a menu:

| What the user says | Mode |
|---|---|
| "refresh {a doc}", "the code changed, sync the architecture doc", "update it to the latest" | `update` |
| "check design consistency", "does the plan match the code", "are these docs fighting each other", "do an architecture health check" | `check` |
| "backfill an architecture doc", "this module never had architecture docs", "write down the structure of this subsystem that is already running" | `backfill` |

If you cannot tell, ask the user. If the user says "I want to refactor this into X" or "I plan to build module Y", that is not this skill. Route to `bt-roadmap`.

---

## Single-Target Rule

Each run uses only one mode and locks onto only one target:

- `backfill`: create one doc for a module that already exists but has never been documented, either `architecture/{type}-{slug}.md` or an update to `ARCHITECTURE.md`
- `update`: refresh one existing doc based on the latest code state plus user-provided material
- `check`: one of three sub-targets
  - `design-internal` — consistency within one design
  - `design-vs-code` — consistency between design and code
  - `architecture-folder-internal` — consistency across multiple docs inside `architecture/`

Why not do multiple things at once? During drafting, if multiple docs are produced at once the user cannot review them properly. During checking, the three sub-targets use completely different views and materials, so doing them together makes each one shallow. If the user asks for multiple targets, ask them to pick one.

---

## Shared Workflow Skeleton, Six Phases Across All Modes

```
Phase 1: lock the target
Phase 2: read the materials
Phase 3: execute, backfill and update mean drafting, check means checking
Phase 4: self-check, for backfill and update, or output report, for check
Phase 5: user review
Phase 6: write to disk, for backfill and update, or wait for the user's decision, for check
```

### Phase 1: Lock the target

Confirm mode, target object, and scope.

- backfill: new slug, audience, and scope, plus confirm that the module already exists in code
- update: the path of the existing document
- check: the sub-target plus the object to inspect, such as the feature name or the architecture sub-scope

If the scope is not converged, ask the user to narrow it. A "rewrite the whole module doc" usually means there are actually multiple independent subsystems underneath that should be split. A single check covering the whole `architecture/` folder usually produces a report too broad to be useful.

### Phase 2: Read the materials

**Required for all modes**: `shared-conventions.md`, `ARCHITECTURE.md`, and the other docs under `architecture/`.

**Additional inputs for backfill and update**, see the "reading checklist" in `reference.md`: the code entry points and core files of the target module, user-provided material, related compound artifacts such as decision, explore, and learning, and related existing feature designs. **Update-specific**: read the full current doc plus a rough `git log` scan of code changes since `last_reviewed`.

If the input comes from `bt-explore module-overview` or `zoom-out`, reuse its module boundary map, caller map, and evidence where possible, but still add `file:line` anchors according to this skill's rules.

**Additional inputs for check**, depending on sub-target:
- `design-internal` and `design-vs-code`: the full design doc plus relevant architecture docs
- `design-vs-code` additionally: the code directly corresponding to sections 2 and 3 of the design
- `architecture-folder-internal`: the user-selected docs, the index, and the referenced docs reached by following links, but do not expand into code

### Phase 3: Execute

**backfill and update**: write a **complete first draft** according to the "document structure" in `reference.md`. Do not emit partial pieces one batch at a time. If review happens in fragments, the user cannot see global consistency, and section 2 structure descriptions often conflict with section 4 decisions across sections.

**check**: execute each item in the "check coverage items" in `reference.md`, 6 categories for each of the three sub-targets. Every inconsistency must record a **locatable position**, either `file:line` or `design section X`, plus the symptom, impact, and suggested fix.

### Phase 4: Self-check or output report

**backfill and update**: run the 7-item "self-check list" in `reference.md` in place. Handle problems before review by deleting, marking TODO, or rewriting. Report the self-check result briefly. If you found a problem, say so. Do not perform a ceremonial pass.

**check**: output the full report according to the "report template" in `reference.md`, including the check summary, inconsistency list with severity, observations, items that are consistent, and suggested next step.

### Phase 5: User review

**backfill and update**: show the complete first draft to the user for review.
**check**: give the report to the user and wait for them to confirm the conclusion. This skill does not make the final call for them.

### Phase 6: Write to disk or finish

**backfill**:

- write to `architecture/{type}-{slug}.md`, following the naming rules in section 0 of `shared-conventions.md`, with frontmatter `status: current` and `last_reviewed` set to today
- **same-type grouping check**, mandatory before writing: according to the "architecture doc grouping rules", if after writing there would be 6 or more docs of the same type in the root directory, move the entire type into `architecture/{type}/`, remove the type prefix from filenames, and update the links in `ARCHITECTURE.md`; include the migration list in the Phase 5 review
- **index update**: add the new doc to `ARCHITECTURE.md`. Backfill **must** add this. Otherwise the doc exists but nobody will find it. This change is reviewed together, not changed silently

**update**: overwrite the existing file and update `last_reviewed` to today. If the structural change is large, add one line to the `Change Log` section at the end. Update `ARCHITECTURE.md` only when the scope or summary changes the index description.

**check**: finish without writing to disk. The user may decide to trigger backfill or update based on the report. That would be a separate next run.

---

## Hard Boundaries

1. **Anchor only to code, never invent the system**, backfill and update — every structured assertion must anchor to `file:line`; if it cannot, mark it `TODO: to be confirmed`. If the module does not exist in code yet, backfill should not be used. That is planning and belongs to `bt-roadmap`
2. **Do not make decisions for the user**, backfill and update — the substantive content of the key-decisions section must come from the user or a traceable decision. The AI only drafts the structure and connective wording
3. **Check only, do not fix**, check mode — do not edit design, code, or config. Keep checking separate from fixing so the user can see the full inconsistency list and then decide priorities
4. **Evidence-backed**, check mode — every inconsistency must have a locatable position
5. **Actionable suggestions**, check mode — be specific enough to say where to change and how to change it, but do not write it into the files
6. **Single target**, all modes
7. **Do not edit code or spec**, all modes — only write architecture docs or output a report. If code, design, or decision has a problem, record it as an observation
8. **Record only the current state, not target state** — candidates from `improve-codebase-architecture`, such as deep module, seam, or adapter, enter architecture only after they are actually landed in code. Unlanded target state belongs to `bt-roadmap`, `bt-refactor design`, or `bt-grill`
9. **Do not fan out** — do not expand beyond the chosen scope; record out-of-scope issues as observations

---

## Exit Conditions

**Shared**:
- [ ] one mode and one target have been locked
- [ ] the user explicitly approved the review in backfill and update, or confirmed the conclusion in check
- [ ] no code, design doc, or decision was modified on the side
- [ ] there were no out-of-scope document edits

**Additional for backfill and update**:
- [ ] the self-check list has been run item by item and the handling was reported
- [ ] frontmatter is complete, including `doc_type: architecture`, `status`, and `last_reviewed`
- [ ] every structured assertion has a `file:line` anchor or is marked `TODO: to be confirmed`
- [ ] before writing to disk, the same-type >= 6 grouping rule has been checked, and if triggered, the migration list has been reviewed
- [ ] **backfill**: `ARCHITECTURE.md` has a new link added, unless the user explicitly decided to delay that
- [ ] **update**: structural changes include a `Change Log` entry

**Additional for check**:
- [ ] the relevant check items for the chosen sub-target were covered
- [ ] the report contains the inconsistency list plus fix suggestions
- [ ] the report contains no actual fix actions

---

## Relationship with Other Workflows

| Direction | Relationship |
|---|---|
| works with `bt-req` | req writes "why this capability exists", while this skill writes "what structure implements it"; architecture frontmatter uses `implements: [req-slug]` to link back |
| upstream of `bt-feat-design` | design reads this skill's docs when it needs to state "which part of architecture this feature plugs into"; after design is written, `check` may be triggered for a health check |
| downstream of `bt-feat-accept` | acceptance is where these docs are actually updated, acceptance merges changes itself rather than calling back into this skill; when someone wants to confirm implementation vs design, trigger `check design-vs-code` |
| works with `bt-decide` | after an architecture decision is finalized, update mode adds the reference into section 4 of the relevant docs |
| reader of `bt-issue-analyze` | root-cause analysis reads these docs to locate module boundaries |
| created by `bt-onboard` | onboard creates the `ARCHITECTURE.md` placeholder, and this skill fills it in later |
| works with `bt-roadmap` | architecture records current state, roadmap records the plan. Roadmap reads these docs to understand current state, but does not modify them. Target-state architecture belongs in roadmap |
| works with `bt-explore` | `zoom-out` or `module-overview` first gives the module and caller map; this skill turns stable current state into a long-lived architecture doc |
| works with `bt-grill` | if an architecture candidate has not been challenged deeply enough, grill it first; after it is finalized and landed, this skill records only the actual current state |

---

## Common Mistakes

**backfill and update**:
- writing "what we plan to refactor it into" here — target state belongs in roadmap
- inventing a system — writing a coordination layer, central hub, or manager that does not exist in code
- making decisions on the user's behalf — the rationale is written by the AI rather than coming from traceable decision material
- paraphrasing code — each section lists only "what is there", never "why it is split this way"
- emitting partial drafts in batches — the user cannot catch cross-section contradictions
- terminology conflicts — the new term conflicts with code, other architecture docs, or existing compound artifacts
- conflicting with an existing decision and not stopping — quietly writing a contradictory version
- forgetting to add the `ARCHITECTURE.md` index entry after backfill, so the doc exists but is undiscoverable
- using backfill for a module that is not yet running in code — that is target state and should go to roadmap
- adding new content in update mode without code evidence — the start of drifting away from reality
- editing code or design docs on the side — out of bounds
- still flattening 6 or more docs of the same type at the root level — the grouping rule was triggered but ignored
- filenames not following `{type}-{slug}.md` — making the grouping rule meaningless

**check**:
- doing multiple sub-targets at once
- reading code during `architecture-folder-internal` — that belongs to `design-vs-code`
- finding a problem and then fixing code or docs on the side
- saying only "this part is not quite right" without positional evidence
- suggestions that are too abstract, like "optimize the architecture a bit"
- expanding from one target into a whole-repository audit
