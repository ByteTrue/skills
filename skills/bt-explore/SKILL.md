---
name: bt-explore
description: Perform targeted code exploration in the repository and turn "question → read code → reach conclusion" into searchable evidence, with three types: `question`, `module-overview`, and `spike`. Trigger when the user says "explore first", "how is X implemented in this repo", "help me get familiar with this module quickly", "zoom out / step up one level and look at the whole thing", or "archive the exploration result".
---

# bt-explore

## Read Before Starting

Before making any judgment or taking any action, read `.bytetrue/attention.md` first; if it is missing, treat the skeleton as incomplete and tell the user to fill it in or run `bt-onboard`.

If the first time a question is asked it takes two hours to inspect the code, then the second time the answer should be findable within five minutes, provided that the first pass left behind an evidence-backed record. `bt-explore` turns "question → read code → reach conclusion" into a searchable exploration document.

---

## Applicable Scenarios

- a newcomer needs to quickly understand module boundaries, call chains, or entry points in the repository
- the user says "zoom out", "step up one level", "I am not familiar with this area, explain the overall relationships first", or "give me a map of the module and its callers"
- the user asks a concrete question but does not yet want a direct plan or fix
- a round of evidence-backed exploration is needed before `feature-design`, `issue-analyze`, or `issue-fix`
- the technical direction is still being discussed and only a lightweight spike is needed, exploration without final decision

This skill is responsible only for evidence-backed recording of "what was observed". If the user's intent is something else, such as making a decision, writing a prescription, or fixing a bug, route them to the appropriate skill.

> For shared paths and naming conventions, see `.bytetrue/reference/shared-conventions.md`. Artifacts are written to `.bytetrue/compound/` using the name `YYYY-MM-DD-explore-{slug}.md` and frontmatter `doc_type: explore`.

---

## Three Exploration Types

The frontmatter `type` field:

| Type | When to Use It |
|---|---|
| `question` | inspect code around one concrete question and provide a conclusion |
| `module-overview` | quickly map a module's structure, boundaries, entry points, dependencies, and caller map; this is the ByteTrue home for Matt `zoom-out` |
| `spike` | do lightweight technical investigation across multiple possible directions, without making the final decision |

---

## Document Format

For frontmatter, body structure, section-writing instructions, and examples, see `reference.md` in the same directory. Process constraints:

- **Short answer must appear before evidence** — the reader should see the conclusion first and then decide whether to continue into the evidence
- every conclusion must be traceable back to evidence; pure guessing is not allowed
- when evidence is insufficient, `confidence` must be lowered to `medium` or `low`
- when old exploration is outdated, mark the old document `outdated` and create a new current version

---

## Workflow Phases

### Phase 1: Narrow the Exploration Question

At most two questions:

1. "What is the one question you most want answered first?"
2. "Which module or directory do you want to focus on?"

If the user's description is already clear, go directly to Phase 1.5.

### Phase 1.5: Check for Overlap and Route Intent (required)

Follow items 5 and 6 in `.bytetrue/reference/shared-conventions.md` §6:

- If the request includes "update / revisit / a previous explore / we explored this module before" or points to an old explore document, go to **update or supersede**. Characteristic of explore: when code has changed and the old conclusion is no longer valid, the old document gets `status: outdated` and a new one is created as the superseding current version. If only evidence is being supplemented or the short answer is being tightened while the core conclusion remains the same, then update the existing document.
- Otherwise, use the search tool to search once by keywords or module. If you hit a similar old explore, read it first. If it already answers the question directly, tell the user "there is already one at {path}; reuse it or re-explore from scratch?"

**Update path**: read the old document → supplement evidence according to Phase 2 → rewrite the short answer section → write back and add `updated: YYYY-MM-DD`.

### Phase 2: Evidence-Backed Exploration

- Use Glob, Grep, and Read to **actually read code**, not guess
- Accumulate evidence while reading, and **simultaneously think about which conclusion each piece of evidence supports**. Evidence that supports no conclusion should not be recorded
- Keep 3-8 key evidence items, each annotated with `file:line`
- If multiple modules collaborate, or the type is `module-overview` or `spike`, prepare one Mermaid diagram and place it in the short answer section
- `module-overview` must additionally answer: who are the upstream callers, who are the downstream dependencies, what is the public interface, and which seams or adapters define the boundaries. Describe only the current state; do not design the target state for the user.
- Once a preliminary conclusion forms, proactively check: would the current evidence convince a skeptical reader? If yes, stop. There is no need to keep widening the search.

Why "stop when enough": exploration is not exhaustive enumeration. It is building an evidence chain until the reader can trust it. Expanding further usually only makes the document longer, not more credible.

### Phase 3: Draft and Confirm

- **Write the short answer section first, then backfill key evidence**. This order matters. Having a conclusion first forces you to verify whether the evidence actually supports it.
- The AI drafts the full document in one pass, and the user reviews it before confirmation
- If there are changes, revise based on feedback and then write it to disk

### Phase 4: Archive

- New document: write to `.bytetrue/compound/YYYY-MM-DD-explore-{slug}.md` with frontmatter `doc_type: explore`
- Update: write back to the original file identified in Phase 1.5 and add `updated: YYYY-MM-DD`
- Supersede: follow item 5 of `.bytetrue/reference/shared-conventions.md` §6; the old document gets `status: outdated` plus `superseded-by`

### Phase 5: Provide a Suggested Next Step

Once the evidence is complete, give a one-sentence hint for a plausible next direction, such as "do you want to design a plan based on this explore?" If the user says "no need", skip it. The next step is the user's decision.

---

## Search Tools

> For the full syntax, see `.bytetrue/reference/tools.md`.

```bash
# Filter by type

python .bytetrue/tools/search-yaml.py --dir .bytetrue/compound --filter doc_type=explore --filter type=module-overview --filter status=active

# Check overlap after archiving

python .bytetrue/tools/search-yaml.py --dir .bytetrue/compound --filter doc_type=explore --query "{keyword}" --json
```

---

## Exit Conditions

- [ ] The exploration question and scope are clear
- [ ] The short answer section states the core conclusion up front
- [ ] There are 3-8 key evidence items, each marked with `file:line` and explaining which conclusion it supports
- [ ] For multi-module or `module-overview` / `spike` work, the short answer section includes a Mermaid diagram
- [ ] The document has been archived to `compound/`
- [ ] A next-step suggestion has been given

---

## Guard Rules

> For shared rules on archival workflows, see section 6 of `.bytetrue/reference/shared-conventions.md`. Anti-patterns specific to this skill:

- giving conclusions without reading the code
- writing evidence as "it looks like" without `file:line`
- placing the conclusion after the evidence — the short answer section must come before key evidence
- making the evidence section several times longer than the short answer — trim evidence; delete anything that does not support a conclusion
- describing a cross-module flow only with text and no Mermaid diagram
- making the decision too early — explore records only "what was observed", not "what should be done in the future"
- giving prescriptions without an evidence chain — every conclusion must trace back to `file:line`
- continuing to cite an expired historical explore without marking its `status`
- reading or writing documents whose `doc_type` is not `explore` — this skill handles only explore documents
