---
name: bt-feat-accept
description: Stage 3 of the feature workflow, acceptance closure. Verify the implementation against the design, write back architecture, requirement, and roadmap, and finally produce `{slug}-acceptance.md`. Trigger when the user says "the feature is done, let's accept it", "do the final check", "prepare to merge", or "produce the acceptance report". The prerequisite is that `bt-feat-impl` has completed.
---

# bt-feat-accept

## Read Before Starting

Before making any judgment or taking any action, read `.bytetrue/attention.md` first; if it is missing, treat the skeleton as incomplete and tell the user to fill it in or run `bt-onboard`.

The code may already be written, but the workflow is not finished. This stage does four things, and every one of them is mandatory:

1. **Check whether the implementation drifted from the design** — compare against `{slug}-design.md` layer by layer, and if a deviation is found, fix it immediately, **not just note it in the report**
2. **Merge the feature back into the overall architecture** — following section 4 of the design, actually update the relevant docs inside the architecture directory
3. **Write the capability back into requirement** — if the corresponding req was draft, upgrade it to current after the capability is implemented, preserving the original vision and appending a change log; if the capability never had a req, backfill one
4. **Write completion state back into roadmap** — if the design frontmatter has `roadmap` and `roadmap_item`, the corresponding item in `items.yaml` **must** be changed to `done`, and the main roadmap doc must also be synchronized

The cost of missing any one of these: architecture docs go stale and the next feature reads wrong information; req drifts away from the actual capability; roadmap drifts away from actual progress and the next advance repeats work.

**No report means the workflow is incomplete**. When future readers ask "which behaviors were confirmed during acceptance of this feature?", without a report they can only reconstruct it from git diff.

> For shared paths and naming conventions, see section 0 of `.bytetrue/reference/shared-conventions.md`.

> **After reading this section, jump to "After Exit" first and read the close-out checklist before coming back to fill the acceptance template** — the close-out checklist is easier to forget than the template itself, and you are required to ask all 7 items in one pass.

---

## Strong dependency on design section numbering

The entire comparison table of this skill is hardcoded against the current section numbering of design. **If design ever changes section names or section numbers, this skill must be updated in sync**, otherwise every pointer to "section X" below becomes wrong.

**Snapshot of standard design sections**:

- section 0: terminology
- section 1: decisions and constraints, requirement summary, complexity dimensions, key decisions, prerequisites
- section 2: terms and orchestration, 2.1 term layer, 2.2 orchestration layer, 2.3 mount points, 2.4 rollout strategy
- section 3: acceptance contract, key scenario list plus reverse-check items
- section 4: relationship with project-level architecture docs

**Fastforward design**: section 0 requirement summary, section 1 design plan, section 2 acceptance criteria, section 3 rollout steps

---

## Startup checks

1. **The code really has been implemented** — `git status` or recent commits must show the feature's code changes, otherwise send it back to implement
1a. **Implementation review gate evidence exists** — the implementation completion report must include `Implementation Review Gate` with separate spec compliance and code quality results; if missing, send it back to implement
2. **The design doc is complete** — frontmatter must have matching `doc_type=feature-design` and `feature`, `status=approved`, non-empty `summary`, and at least 2 tags; in standard design, sections 0, 1, 2, 3, and 4 must all be filled
3. **`{slug}-checklist.yaml`** — it must exist with a matching `feature`; all `steps` must already be `done`, any `pending` means send it back to implement; `checks` must be non-empty and all still `pending`
3a. **Check context manifest** — for new standard features with `{slug}-check-context.jsonl`, read every required row before acceptance; missing required files send the feature back to design or require explicit user downgrade
3b. **Optional check-role handoff** — if the parent delegates review to a subagent or inline role, use the `check` role in `.bytetrue/reference/subagent-handoff.md`; the role returns evidence/findings only and does not replace this acceptance stage
4. **Read the full context** — the full design doc, especially section 1 non-goals, section 2.1 interface examples, section 2.2 flow-level constraints, section 2.3 mount points, and section 3 scenarios, plus the checklist, `{slug}-check-context.jsonl` when present, all architecture docs named in section 4, and the code changes from this run, `git log` and `git diff`
5. **Resume support** — if `{slug}-acceptance.md` already exists and is partially filled, continue from the next unfinished section, skip checklist checks already marked `passed`, and report "last time we got to section X, continuing from section Y"

**Acceptance report mapping for fastforward design**:

| Acceptance-report section | Standard design mapping | Fastforward design mapping |
|---|---|---|
| 1 interface-contract check | section 2.1 interface examples | section 1 change points |
| 2 behavior and decision check, including mount points | section 1 + section 2.2 + section 2.3 | section 0, plus live mount-point inventory |
| 3 acceptance-scenario check | section 3 scenario list plus reverse checks | section 2 acceptance criteria |
| 4 terminology consistency | section 0 + naming in section 2.1 | check naming consistency in code |
| 5 architecture merge | section 4 | usually none; write "no architecture-scope change" |

---

## Acceptance report template

Fill it **section by section, do not skip sections**. The report path lives inside the feature directory, location defined in section 0 of `.bytetrue/reference/shared-conventions.md`.

```markdown
# {Feature Name} Acceptance Report

> Stage: stage 3, acceptance closure
> Acceptance date: YYYY-MM-DD
> Related design doc: {design doc path}

## 1. Interface-contract check

Check each item against the term layer in section 2.1 of the design:

**Check interface examples one by one**:
- [ ] Example A, `{file path + function name}`: example input→output → actual code behavior, consistent or drift description

**Check "current state → change" in the term layer one by one**:
- [ ] Term X: claimed change → actual code change, consistent or drift

**Check the flow diagram**, the Mermaid at the beginning of section 2.2:
- [ ] Every node and call relation in the diagram has a real landing point in code, confirmed by grep

If you find drift, **fix the code or backfill the design first**. Writing "known drift, not handling it for now" inside the report is an anti-pattern. The next person following the design to the code will stumble on it.

## 2. Behavior and decision check

Check against design section 1 and section 2.2:

**Verify the requirement summary one by one**:
- [ ] Behavior A: {description + actual observed result}

**Check explicit non-goals one by one**, using the reverse-check items in section 3:
- [ ] Out-of-scope item X was **indeed not built**, confirmed by grep or review

**Landing of key decisions**:
- [ ] Decision D1: {decision content} → where it appears in the code: {description}

**Check "current state → change" in the orchestration layer one by one**:
- [ ] Change V1: {which step it was inserted at / which branch changed} → actual landing point in code

**Check flow-level constraints**: error semantics, idempotency, concurrency, extension points, observability
- [ ] Constraint R1: {description} → how the code obeys it

**Behavior Delta Materialization** — if design section 3 contains Behavior Delta entries, check each one against evidence and record the writeback target:
- [ ] Delta `{ADDED|MODIFIED|REMOVED|RENAMED}: {name}` → evidence `{test/manual/code}` → writeback target `{requirements|architecture|compound|acceptance-only}` → status `{applied|not-needed|follow-up}`
- [ ] If design says `Behavior Delta: none`, confirm no observable behavior drift was introduced

**Reverse-check the mount points, removability** — against section 2.3, two things are mandatory:
- [ ] Mount point M1: list item → actual code landing point, consistent or drift
- [ ] **Reverse grep check**: do all references to this feature in the code fall inside the list? References outside the list mean omissions, and must be added back into section 2.3
- [ ] **Removal sandbox thought experiment**: if you reverse the mount-point list, does anything remain? If yes, record it under leftovers or add the missing mount point

Fastforward design has no mount-point list, so acceptance must inventory the mount locations live by grep based on the changes made this time.

## 3. Acceptance-scenario check

Against the key scenario list in section 3 of the design, verify each scenario using observable evidence:

- [ ] **S1**: {scenario, input / trigger → expected observable result}
  - evidence source: {type system / unit test / integration / manual / visual}
  - result: {passed / failed + reason + remedy}

**Frontend changes require browser-eye verification** — passing typecheck does not prove the user experience is correct:
- [ ] UI area X: browser verification OK / screenshot link

## 4. Terminology consistency

Against design section 0 and section 2.1 naming, grep the code:

- term X: all N code hits are consistent ✓
- anti-conflict: grep for forbidden alternative names finds no hits ✓

If inconsistency is found, change the code. Do not write "known difference" in the report.

## 5. Architecture merge

**Goal**: actually write the stable, system-visible part of this feature into architecture, so that a reader who only reads architecture can understand that the new capability now exists and what shape it has. **Adding a design link does not count.**

Against section 4 of the design, actually write three classes of content into the corresponding architecture docs:

- **term merge** ← new or changed entities, types, or outward contracts from section 2.1 → into architecture's structure and interaction / data and state sections
- **verb skeleton merge** ← main flows and key orchestration that are visible across modules from section 2.2 → into architecture diagrams and module-interaction sections
- **flow-level constraint merge** ← constraints from section 2.2 that are stable across features → into architecture's known-constraints section

Check each item:
- [ ] Architecture doc X, `{path}`: merged content `{description}`; written ✓ / not needed, with concrete reason

If section 4 of the design is empty or too thin, supplement the evaluation here:
- what modules were added, what interfaces changed, what cross-module disciplines were introduced
- whether the top-level architecture entry needs a new description, not just a link
- whether `.bytetrue/attention.md` needs new conventions or known pitfalls

**Decision rule**: after merging, a reader who never read the design should be able to open architecture and know "this capability now exists in the system, this is roughly what shape it has, and these are the rules for interacting with it".

## 6. Requirement write-back

Req is the capability-vision layer. This section is where draft → current upgrades and backfill are triggered. Compare the `requirement` field in design frontmatter with the requirement summary in section 1:

- [ ] `requirement` is empty and the design explicitly says "no new capability", pure refactor or technical debt → skip, and write "no requirement write-back"
- [ ] `requirement` is empty but a new user-perceivable capability was added → trigger `bt-req` in **backfill** mode and land it directly as `status: current`
- [ ] `requirement` points to a draft req → trigger `bt-req` in **update** mode, `draft` → `current`, refreshing user stories and boundaries according to the real implementation, while **preserving the original vision**, meaning the original vision is not overwritten and this run is recorded only in a change log at the end
- [ ] `requirement` points to a current req and this run changed its boundary, user stories, or pitch → trigger `bt-req` in **update** mode to refresh it
- [ ] `requirement` points to a current req but this run did not change the user-facing view → write "req-{slug} unchanged, no update needed"

This is an **actual file-writing action**, not a self-assessment of "probably not needed".

## 7. Roadmap write-back

Compare against the `roadmap` and `roadmap_item` fields in design frontmatter:

- [ ] both fields are empty, this feature did not start from roadmap → skip, and write "not started from roadmap"
- [ ] both fields have values:
  - open `.bytetrue/roadmap/{roadmap}/{roadmap}-items.yaml`
  - find `slug: {roadmap_item}`, and confirm its current state is `status: in-progress` plus `feature: {directory name}`; if not, stop and find out why
  - change `status` to `done`, and validate with `validate-yaml.py`
  - synchronize the corresponding sub-feature entry inside section 3 of `{roadmap}-roadmap.md`
- [ ] the two fields are inconsistent, only one is filled → stop and fix or clarify

See section 2.5 in `.bytetrue/reference/shared-conventions.md` for the handoff protocol. Like architecture merge and req write-back, this is an actual file-writing action.

## 8. attention.md candidate review

Look back at this implementation and inventory environment, tool, and workflow facts that "every future feature will step on once". Typical candidates include build commands, proxy configuration, local service startup steps, recurring environment pitfalls, or non-obvious workflow conventions inside the repository.

**Decision rule**: only record things that the next feature's AI would likely hit again. One-off pitfalls or details tightly coupled to a specific business case belong in learning or decision.

- [ ] no candidates: write "this feature did not expose anything that needs to be added into attention.md"
- [ ] candidates exist: list them, but **do not write them in on your own** — this section only registers them, and the decision to actually add them belongs to the user during "After Exit"
  - candidate 1: {description + recommended attention.md placement}

## 9. Leftovers

- later optimization points, already opened as issues or added to an issue list: {list}
- known limitations: {list}
- "while here I noticed" items from implementation: {list}
```

---

## Verification rhythm

Work section by section. After completing each section, **update the `checks` in `{slug}-checklist.yaml` one by one**: passed → `passed`, failed → `failed`, then after the code or design is fixed, change it back to `passed`. The report is not complete until every check is `passed`.

Sections 1 and 2 are the easiest places to expose drift, so do them first. Section 2 must include Behavior Delta Materialization when the design has Behavior Delta entries, or explicitly verify `Behavior Delta: none`. The reverse-check on mount points in section 2 **must** be done with actual grep plus a sandbox removal thought experiment. Do not check it by impression. Sections 5, 6, and 7 are file-writing actions, not self-assessment.
Before section 1, confirm that implementation review gate evidence exists. This is only an entry gate: acceptance must still verify every section independently and may reject a passed implementation review.
If a check-context manifest exists, verify required rows before section 1. A missing required row is a startup blocker, not a report footnote.

---

## Exit Conditions

- [ ] all 9 sections of the acceptance report are filled
- [ ] every item in sections 1 and 2 is checked off, with no unresolved drift, including behavior delta materialization, mount-point grep, and removal sandbox thought experiment
- [ ] implementation review gate evidence existed before acceptance started, and acceptance still performed independent verification
- [ ] every scenario in section 3 is checked off, and frontend changes have browser verification
- [ ] section 4 terminology consistency has no gaps
- [ ] section 5 architecture merge has a clear conclusion for every item, and every needed doc update has actually been written
- [ ] section 6 req write-back has a conclusion, skipped / unchanged / backfilled / draft→current / updated
- [ ] section 7 roadmap write-back has a conclusion, skipped because not from roadmap, or updated with `items.yaml` plus main doc sync and YAML validation passed
- [ ] every checklist check is `passed`
- [ ] the user has done final review confirmation

---

## After Exit

Tell the user: "The acceptance report is ready, the architecture docs have been merged, and the bt-feat workflow is complete. Future bugs go through the issue workflow."

Following section 3 of `.bytetrue/reference/shared-conventions.md`, give one-sentence close-out prompts in order, and skip immediately if the user says "no need":

1. reusable-value pitfalls or experience → "Do you want to capture it as learning? (`bt-learn`)"
2. long-term constraints or technology choices → "Do you want to archive the decision? (`bt-decide`)"
   - **special check**: if section 2.5 of the design contains a "suggested convention to capture" block, read that rule out to the user verbatim: "design 2.5 recommends capturing this convention: '{one-line rule}'. It now works. Do you want to archive it through `bt-decide`?" A stable pattern already identified in design deserves more proactive handling than a generic "want to record something?"
3. feature design plus acceptance report or checklist may need collaboration-state projection → "Do you want to update or bind an external tracker? (`bt-tracker`)" When the feature started from roadmap, also mention that the done roadmap item can be synced. `bt-tracker` follows `sync_policy` from `.bytetrue/reference/project-management.md`, meaning preview plus asking only, with no external issue creation or update before confirmation
4. interface changes or user-visible behavior changes → "Do you need to update the guide? (`bt-guide`)"
5. public library surfaces changed, components, functions, or commands → "Do you need to update the API reference? (`bt-libdoc`)"
6. if section 8 produced attention.md candidates → ask one by one, "Should candidate X be added to attention.md?" Once the user explicitly agrees, trigger `bt-note` so it can perform section classification, deduplication, and soft-limit checks. **One item at a time**. Do not handwrite it inside acceptance, or you will fork the rules from `bt-note`
7. finally ask whether you should do a scoped commit

For close-out commit rules, see section 4 of `.bytetrue/reference/shared-conventions.md`. The commit scope here is the feature code, the design doc, the acceptance report, and all architecture docs, req docs, roadmap `items.yaml`, and roadmap main doc that were actually updated this time.

---

## Easy Pitfalls

- "all tests pass" → passing tests is not the same thing as acceptance scenarios being satisfied; section 3 still has to be checked one by one
- "I looked at it with my eyes once" → follow the checklist and check it item by item
- writing "known drift" in the report for an interface mismatch without fixing code or backfilling design
- checking mount points only against the list and never grep-checking — missing mount points slip into the project and cannot later be cleanly removed
- in section 3, frontend changes passed only by typecheck and were never run in a browser
- section 5 architecture merge is reduced to one sentence like "overall no architecture impact", with no item-by-item verification
- a needed architecture update is written only as "recommend updating later" — merge is an action now, not a suggestion
- in section 7, only `items.yaml` is updated, and the main doc is left unsynchronized, so the two are inconsistent
- the design frontmatter has `roadmap`, but section 7 is written as skipped — if the value exists, the write-back is mandatory
- the report is finished without asking the user for final review confirmation
- running `git commit` without explicit user agreement
