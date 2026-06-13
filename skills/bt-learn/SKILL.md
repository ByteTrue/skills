---
name: bt-learn
description: 'Turn encountered pitfalls or good practices into searchable learning documents, with two tracks: `pitfall` and `knowledge`. Trigger when the user says "capture this knowledge", "learning", "record what we learned this time", or when this is suggested at the end of an acceptance or fix flow.'
---

# bt-learn

## Read Before Starting

Before making any judgment or taking any action, read `.bytetrue/attention.md` first; if it is missing, treat the skeleton as incomplete and tell the user to fill it in or run `bt-onboard`.

Every feature or issue fix leaves behind spec files. But specs record "what was done" and "how it was done"; they **do not record "what pitfall we hit" or "what better practice we discovered"**. Teams that do not capture these lessons keep solving the same problem again and again.

Two tracks:

- **Pitfall track** (`pitfall`): record the problem, root cause, and solution so the same pitfall is not repeated next time
- **Knowledge track** (`knowledge`): record best practices, workflow improvements, and reusable patterns

Both are written into `.bytetrue/compound/` (for the shared directory, see section 1 "archival documents" in `.bytetrue/reference/shared-conventions.md`). This skill outputs frontmatter with `doc_type: learning` and uses the name `YYYY-MM-DD-learning-{slug}.md`.

---

## When to Trigger

| Situation | Description |
|---|---|
| Feature workflow completed | `bt-feat-accept` proactively asks "Do you want to record the lessons from this run?" |
| Issue workflow completed | `bt-issue-fix` proactively asks "Do you want to write this pitfall down?" |
| User initiates it | "record this", "capture knowledge", "learning", and similar |
| A one-off hard problem was solved | An engineering problem outside a feature or issue flow that still took substantial time to solve |

One proactive sentence is enough. If the user says "no need", skip immediately. Repeating the suggestion can make the AI feel performative.

---

## What Each Track Should Contain

**Pitfalls**: debugged bugs, configuration traps that had to be worked around, environment issues, failed integrations... anything that should have worked but did not.

**Knowledge**: discovered best practices, workflow improvements, architecture insights, reusable design patterns... anything that should become the default way to do it in the future.

For frontmatter, body templates, and full examples, see `reference.md` in the same directory.

---

## Workflow Phases

### Phase 1: Identify the Source (automatic)

Extract from the conversation context:

- **Source type**: feature workflow / issue workflow / standalone problem
- **Related artifacts**: feature directory or issue directory path, if any
- **Rough track split**: pitfall or knowledge. "Fixed something broken" = pitfall; "found a better way to do something" = knowledge. If both exist, split them into two entries

If the source is unclear, ask the user **one question** to clarify. Do not guess.

### Phase 1.5: Check for Overlap and Route Intent (required)

Follow items 5 and 6 in `.bytetrue/reference/shared-conventions.md` §6:

- If the request includes "change / update / supplement / a certain learning" or points to an old document, go directly to **update existing**
- Otherwise, use the search tool once with `--filter tags~=` or `--query`, and if you hit similar old documents, list the candidates for the user

**Update path**: read the old document → align with the user on which sections to change, commonly adding a newly discovered pitfall or a root cause that was unknown at the time → draft the diff → write back to the original file and add `updated: YYYY-MM-DD`; do not create a new file.

### Phase 2: Distill the Key Points (one question at a time)

For the **pitfall track**, ask:

1. "What was the first symptom you observed?"
2. "Which attempted fixes did you try that did not work?" Encourage this. Failed attempts are some of the most valuable information for future readers. Knowing which path does not work can save a large amount of time.
3. "How did you finally discover the real cause?"
4. "Could this be detected earlier next time? If so, how?"

For the **knowledge track**, ask:

1. "In what situation is this pattern most valuable?"
2. "What goes wrong if we do not do it this way?"
3. "Are there counterexamples where it does not apply?"

If the user says "nothing" or "skip it" for a question, skip it. A shorter document is better than filling sections with empty prose.

### Phase 3: Draft + User Review

The AI drafts the full document in one pass, including YAML frontmatter and all body sections. Show it to the user in one pass.

### Phase 4: Archive

- New document: write to `compound/YYYY-MM-DD-learning-{slug}.md` using the **archive date of the current day**, with frontmatter `doc_type: learning` and `status: active`
- Update: write back to the original file identified in Phase 1.5 and add `updated: YYYY-MM-DD`
- Supersede: handle it according to item 5 of `.bytetrue/reference/shared-conventions.md` §6

### Phase 5: Discoverability Check

After writing, if you notice one or two lines of hard project constraints that "every ByteTrue skill startup should know", suggest that the user add them to `.bytetrue/attention.md` via `bt-note`. Do not change `attention.md` on your own.

---

## Search Tools

> For the full syntax, see `.bytetrue/reference/tools.md`.

```bash
# Filter pitfall learnings by track

python .bytetrue/tools/search-yaml.py --dir .bytetrue/compound --filter doc_type=learning --filter track=pitfall --filter severity=high

# Find related learnings by component

python .bytetrue/tools/search-yaml.py --dir .bytetrue/compound --filter doc_type=learning --filter component~={component-name}

# Check for overlap after archiving

python .bytetrue/tools/search-yaml.py --dir .bytetrue/compound --filter doc_type=learning --filter tags~={primary-tag} --json
```

---

## Guard Rules

> For shared rules on archival documents, see section 6 of `.bytetrue/reference/shared-conventions.md`. Rules specific to this skill:

1. **Do not mix them into specs** — learning docs do not go into `features/` or `issues/`; specs do not go into `compound/`
2. **Only recognize your own `doc_type`** — only read and write `doc_type: learning`
