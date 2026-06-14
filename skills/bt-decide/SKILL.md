---
name: bt-decide
description: 'Record finalized technical choices, architecture decisions, long-term constraints, and coding conventions as permanent decision documents in four categories: `tech-stack`, `architecture`, `constraint`, and `convention`. Trigger when the user says "record this decision", "archive the technology choice", "ADR", "record this constraint", or "write down the convention", or after important choices are made in design or analysis. Archive only decisions that have already been finalized; do not archive proposals still under discussion.'
---

# bt-decide

## Read Before Starting

Before making any judgment or taking any action, read `.bytetrue/attention.md` first; if it is missing, treat the skeleton as incomplete and tell the user to fill it in or run `bt-onboard`.

In a project, "intentional choices" such as technology choices, architecture decisions, long-term constraints, and coding conventions are very easy to lose. Their disappearance triggers no error, and nobody notices when they are gone, but the cost is concrete:

- a newcomer, or yourself six months later, does not know the history behind the constraint and spends time re-debating a question that was already decided
- the AI gives a solution that seems reasonable but conflicts with project conventions because it lacks the decision context
- when the constraint needs to change, nobody can find the original rationale and therefore cannot evaluate the impact of changing it

This workflow makes sure every important "already decided" item has a complete archive: **what it is, why it was chosen, what alternatives were considered, and what consequences it has**.

> For shared paths and naming conventions, see `.bytetrue/reference/shared-conventions.md`. Artifacts are written to `.bytetrue/compound/` using the name `YYYY-MM-DD-decision-{slug}.md` and frontmatter `doc_type: decision`.

---

## Four Decision Types

Every decision belongs to one of four categories, stored in the frontmatter `category` field:

| Type | When to Use It | Example |
|---|---|---|
| `tech-stack` | Choice of technology, library, or framework | "Use Vite instead of Webpack", "Use Pinia for state management" |
| `architecture` | System structure, module split, or data-flow direction | "Frontend and backend are fully separated", "The event bus is used only at the top layer" |
| `constraint` | Hard constraints — things that are **not allowed** | "Do not introduce jQuery", "All API calls must go through the unified HTTP module" |
| `convention` | Soft conventions — things that are **done uniformly this way** | "Components use PascalCase names", "Side effects are centralized under composables/" |

Each category serves a different lookup purpose: "what tool do we use?" → `tech-stack`; "how is the system organized?" → `architecture`; "why can't this be changed here?" → `constraint`; "what is the standard way to do this?" → `convention`.

---

## Document Format

For frontmatter, body templates, and examples, see `reference.md` in the same directory. Workflow constraints for this skill:

- `category` only allows `tech-stack`, `architecture`, `constraint`, or `convention`
- `status` follows the canonical vocabulary: current decisions use `status: active`; replaced decisions use `status: archived` plus `superseded_by`; deprecated constraints use `status: archived` plus `validity: deprecated`
- "Alternatives Considered" and "Related Documents" are optional sections; if the user says "nothing there", omit them

---

## Workflow Phases

### Phase 1: Identify the Decision

Use **one question** to confirm the critical information rather than showing the user a big table:

1. "What is this decision about? Technology choice, architecture, constraint, or convention?" → determines `category`
2. "Has it already been finalized, or is it still under discussion?" → **this workflow archives only finalized decisions**, not proposals still being discussed. Reason: if a proposal under discussion is archived, later readers will mistake it for an already-made decision
3. If the description is unclear, ask: "Why was this chosen instead of something else?"

### Phase 1.5: Check for Overlap and Route Intent (required)

Execute items 5 and 6 in `.bytetrue/reference/shared-conventions.md` §6:

- If the user's wording includes "change / update / overturn / this decision / this technology choice" or explicitly points to an old decision document, go directly to **update or supersede**. Decision-document characteristic: **if the conclusion itself changed, it almost always needs `supersede`**, because the old conclusion must remain visible rather than being overwritten in place. Only when background, alternatives, or impact descriptions are being supplemented should you "update existing"
- Otherwise, use the search tool below to search once by category plus keywords, and if you hit similar old decisions, list the candidates for the user

**update vs supersede**: if the conclusion changed, use `supersede`; if the conclusion stayed the same and only supporting content changed, use `update`. If unsure, ask the user.

### Phase 2: Distill the Key Points (one question at a time)

The user can always say "nothing there" to skip:

1. "What background or problem was this decision responding to?"
2. "What exactly was the conclusion?" Skip if already clear
3. "Why choose this? What was the most important reason?"
4. "Were other options considered? Why were they not chosen?" Encourage this even if the answer is only intuition — future readers most want to know "why not X"
5. "What impact or constraints does this decision create for future work?"

### Phase 3: Draft + User Review

The AI drafts the complete document from the conversation, including YAML frontmatter and all body sections. Show it to the user in one pass for review. **Do not show it section by section and ask one section at a time**. Only the full document lets the user judge whether the logic across sections is coherent.

### Phase 4: Archive

- New document: write to `.bytetrue/compound/YYYY-MM-DD-decision-{slug}.md` with frontmatter `doc_type: decision`
- Update: write back to the original file identified in Phase 1.5 and add `updated: YYYY-MM-DD`
- Supersede: handle it according to item 5 of `.bytetrue/reference/shared-conventions.md` §6; old document gets `status: archived` plus `superseded_by`

### Phase 5: Related Workflow Update Prompts

After writing, check two things and prompt the user if applicable. **Do not change files on your own.**

1. Should the "Key Architecture Decisions" section in `architecture/ARCHITECTURE.md` reference this? Decisions in `architecture` or `tech-stack` usually should.
2. Should `.bytetrue/attention.md` gain a one-line startup summary? Decisions in `constraint` or `convention` usually should.

---

## Search Tools

> For the full syntax, see `.bytetrue/reference/tools.md`.

```bash
# List all currently active decisions

python .bytetrue/tools/search-yaml.py --dir .bytetrue/compound --filter doc_type=decision --filter status=active

# Filter by category + status

python .bytetrue/tools/search-yaml.py --dir .bytetrue/compound --filter doc_type=decision --filter category=constraint --filter status=active

# Check overlap after archiving

python .bytetrue/tools/search-yaml.py --dir .bytetrue/compound --filter doc_type=decision --query "{keyword}" --json
```

---

## Guard Rules

> For shared guard rules across archival workflows, such as append-only, better absent than low-quality, do not write in place for the user, discoverability, and post-archive overlap checks, see section 6 of `.bytetrue/reference/shared-conventions.md`. Rules specific to this skill:

1. **Archive only finalized decisions** — proposals still under discussion are not archived
2. **Superseding does not mean deletion** — keep the original text, add `status: archived` plus `superseded_by`, and add `**[Superseded]** see {new document slug}` at the top of the body
3. **Do not invent rationale for the user** — if the user cannot explain it, write "no systematic evaluation was performed" instead of making one up; fabricated rationale becomes misleading historical fact
4. **Do not proactively modify `attention.md` or `ARCHITECTURE.md`** — Phase 5 only prompts; the user decides. If something should be added to `attention.md`, hand it to `bt-note`
5. **Cross-skill consistency** — when the decision document and `attention.md` describe the same thing, the decision doc is the detailed version and `attention.md` is the summary version. They should link to each other and must not contradict each other
6. **Only recognize your own `doc_type`** — only read and write `doc_type: decision`
