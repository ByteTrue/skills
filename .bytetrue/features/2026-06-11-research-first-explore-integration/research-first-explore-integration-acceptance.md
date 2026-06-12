---
doc_type: feature-acceptance
feature: 2026-06-11-research-first-explore-integration
status: done
summary: Accepted research-first integration through bt-explore spike evidence.
---

# Research-first Explore Integration Acceptance Report

> Stage: stage 3, acceptance closure
> Acceptance date: 2026-06-11
> Related design doc: `.bytetrue/features/2026-06-11-research-first-explore-integration/research-first-explore-integration-design.md`

## 1. Interface-contract check

**Interface examples**

- [x] Current and onboard `research-first.md`: both define trigger conditions, `bt-explore type=spike` output shape, citation format, workflow rule, and non-goals.
- [x] Citation contract: later artifacts cite explore paths instead of copying excerpts.

**Current state → change**

- [x] `bt-explore` now names research-first spike as a first-class applicable scenario.
- [x] `bt-brainstorm` and `bt-grill` now route direction-changing factual questions to `bt-explore spike`.
- [x] `bt-roadmap` and `bt-feat-design` now require or cite explore evidence when external facts shape contracts.
- [x] `context-manifest.md` now allows cited research-first explore artifacts as manifest evidence rows.

**Flow diagram landing**

- [x] Direction depends on fact → research-first trigger → explore spike → evidence artifact → cite in design/roadmap/grill/manifest → user-confirmed choice landed across the shared reference and stage pointers.

## 2. Behavior and decision check

**Requirement summary**

- [x] Shared research-first contract exists.
- [x] Explore supports research-first spike without final decisions.
- [x] Discussion, planning, and design layers route direction-changing factual questions to explore evidence.
- [x] Context manifests can carry research-first explore evidence.
- [x] Onboard releases and indexes the new reference.

**Explicit non-goals**

- [x] Research-first is not required for simple preference, copy, UI, or already-clear local changes.
- [x] Explore does not make final product, architecture, or roadmap decisions.
- [x] No `.bytetrue/research/` or parallel facts layer was created.
- [x] No web automation, background research loop, subagent dispatch, hook, breadcrumb, worklog, CLI, or runtime automation was added.
- [x] `bt-grill`, `bt-roadmap`, and `bt-feat-design` remain decision/planning gates; research-first only supplies evidence.

**Landing of key decisions**

- [x] Use `bt-explore type=spike`, not a new research directory.
- [x] Trigger only when facts can change direction.
- [x] Explore records evidence, not decisions.
- [x] Shared rule lives in `research-first.md`.
- [x] Context manifests can cite relevant explore artifacts.

**Behavior Delta Materialization**

| Delta | Evidence | Writeback target | Status |
|---|---|---|---|
| ADDED: shared research-first rule for direction-changing technical/external facts | current/onboard `research-first.md`, stage pointers | architecture + requirement + reference | applied |
| MODIFIED: brainstorm/grill/roadmap/design/explore now cite research-first evidence flow | affected skill guidance | architecture + acceptance report | applied |

**Mount points and removability**

- [x] `.bytetrue/reference/research-first.md`: current shared contract.
- [x] `skills/bt-onboard/reference/research-first.md`: onboard template copy.
- [x] `bt-explore`: research-first spike scenario.
- [x] `bt-brainstorm`: factual direction-changing question pointer.
- [x] `bt-grill`: with-docs factual check pointer.
- [x] `bt-roadmap`: external/comparable fact material rule.
- [x] `bt-feat-design`: external fact dependency startup rule.
- [x] `context-manifest.md`: research-first evidence rows.
- [x] `bt-onboard` plus current/onboard system overview: reference indexed.
- [x] Reverse grep found no active mount outside the planned list.
- [x] Removal sandbox: removing these mount points removes the feature's active behavior; remaining mentions are feature docs and roadmap history.

## 3. Acceptance-scenario check

- [x] **S1 shared contract exists**: current and onboard `research-first.md` define triggers, output path, citation shape, and non-goals.
- [x] **S2 explore supports research-first**: `bt-explore` names research-first spike and still records evidence without final decisions.
- [x] **S3 discussion routes facts**: `bt-brainstorm` and `bt-grill` point direction-changing factual questions to explore spike.
- [x] **S4 planning/design routes facts**: `bt-roadmap` and `bt-feat-design` require or cite explore evidence when external facts shape contracts.
- [x] **S5 manifest carries evidence**: `context-manifest.md` allows cited research-first explore artifacts as manifest rows.
- [x] **S6 no new facts layer**: grep confirms no `.bytetrue/research/`, automatic router, hook, subagent dispatch, worklog, or CLI behavior was introduced.
- [x] **S7 line budget**: all edited markdown files stay under 300 lines.

No frontend changes; browser verification is not applicable.

## 4. Terminology consistency

- `Research-first Trigger`: consistently means direction-changing factual dependency, not a universal research requirement.
- `Explore Spike Evidence`: consistently means `bt-explore type=spike` fact record, not a final decision.
- `Comparable Workflow Evidence`: consistently means external workflow evidence that informs ByteTrue, not wholesale copying.
- `Evidence Reference`: consistently means path citation, not duplicated excerpt text.
- Anti-conflict checks passed: no instruction lets explore decide final direction, no new facts layer, and no runtime automation.

## 5. Architecture merge

- [x] `.bytetrue/architecture/ARCHITECTURE.md`: added research-first as evidence-before-decision discipline for technical choices, external API/library/platform capability, and comparable workflow facts that can change design, roadmap, or grill direction. It explicitly remains `bt-explore type=spike` evidence plus user-confirmed final choice, not a new facts layer.

## 6. Requirement write-back

- [x] `.bytetrue/requirements/research-first-explore-integration.md`: upgraded from `draft` to `current` and set `implemented_by: [2026-06-11-research-first-explore-integration]`.
- [x] `.bytetrue/requirements/VISION.md`: moved `research-first-explore-integration` from Draft to Current.

## 7. Roadmap write-back

- [x] `.bytetrue/roadmap/ai-workflow-absorption/ai-workflow-absorption-items.yaml`: `research-first-explore-integration.status` changed from `active` to `done`; `feature` remains `2026-06-11-research-first-explore-integration`.
- [x] `.bytetrue/roadmap/ai-workflow-absorption/ai-workflow-absorption-roadmap.md`: sub-feature list synchronized to `status: done` and corresponding feature path.
- [x] YAML validation passed for roadmap items.

## 8. attention.md candidate review

- [x] No candidates. This feature added documented workflow contracts but did not expose a recurring environment, command, or setup pitfall that every future session must read from `attention.md`.

## 9. Leftovers

- Later optimization points: none.
- Known limitations: automatic research routing, background research, hooks/breadcrumbs, and subagent dispatch are intentionally out of scope.
- While-here observations: none.
