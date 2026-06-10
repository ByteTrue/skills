---
name: bt-trick
description: 'Organize reusable programming patterns, library usage, and technical techniques into a prescriptive reference library, with three types: `pattern`, `library`, and `technique`. Trigger when the user says "record a trick", "this usage is worth remembering", "tricks", or "record this library usage", or when a worthwhile technique surfaces during design or analysis and should be captured.'
---

# bt-trick

## Read Before Starting

Before making any judgment or taking any action, read `.bytetrue/attention.md` first; if it is missing, treat the skeleton as incomplete and tell the user to fill it in or run `bt-onboard`.

`bt-trick` is a problem-oriented **prescriptive reference library**. It answers: **when you need to do X, what is the validated correct way to do it?** It does not need a specific trigger event. Any time a pattern or usage worth preserving is discovered, it can be written directly.

Typical contents: the standard project-specific form of a design pattern, the core API usage plus known pitfalls of a library, or a command recipe for a class of operations.

> For shared paths and naming conventions, see `.bytetrue/reference/shared-conventions.md`. Artifacts are written to `.bytetrue/compound/` using the name `YYYY-MM-DD-trick-{slug}.md` and frontmatter `doc_type: trick`.

---

## Three Types

The frontmatter `type` field:

| Type | When to Use It | Example |
|---|---|---|
| `pattern` | design patterns, architecture patterns, or programming idioms | "Use the Repository pattern to isolate the data access layer", "Use Builder to construct complex configuration" |
| `library` | usage, configuration style, or common pitfalls of a library or framework | "The correct way to write Prisma transactions", "Error handling for Pinia store actions" |
| `technique` | concrete operational techniques, tool usage, or command recipes | "Use jq to extract nested fields from JSON", "Use git bisect to find the commit that introduced a bug" |

Query purpose: "how should the code be organized?" → `pattern`; "how is this library or framework API used?" → `library`; "how do I perform this class of operation?" → `technique`. If you cannot tell, pick the closest one. `type` does not affect search usability.

---

## Document Format

For frontmatter, body templates, and long examples, see `reference.md` in the same directory. Process constraints:

- `type` only allows `pattern`, `library`, or `technique`
- examples should prefer real project code or actual commands
- "When It Does Not Apply", "Known Pitfalls", and "Related Documents" are optional sections and should be omitted if the user says "nothing there"

---

## Workflow Phases

### Phase 1: Identify the Type

At most two questions:

1. "Is this about a pattern or structure, a library or framework usage, or an operational technique or command?" → determines `type`
2. "In one sentence: in what situation would someone use this?" → determines `topic`

If the user's description is already clear, skip directly to Phase 1.5.

### Phase 1.5: Check for Overlap and Route Intent (required)

Follow items 5 and 6 in `.bytetrue/reference/shared-conventions.md` §6:

- If the request contains "change / update / revise / supplement / a certain trick" or points to an old document, go directly to **update existing** rather than creating a new one
- Otherwise, use the search tool with `--query` to search once by `topic`, and list similar hits for the user if found

**Update flow**: read the old document → align with the user on which sections need to change → skip the full Phase 2 code investigation, though any code touched by the changed sections still must be reread to confirm it has not gone stale → draft the diff for user review → write back and add `updated: YYYY-MM-DD`.

### Phase 2: Code Investigation (required and cannot be skipped)

Tricks are reflected through code. **The user not pasting code does not mean you can skip looking at code.** The AI must proactively investigate the repository.

Why this is mandatory: a "trick" written without reading the code stays abstract. The next person following it will not be able to find a real corresponding example in the codebase and will lose trust in it.

1. **Search the repository based on `topic` + `type`** — grep by keywords such as function name, class name, library import, or pattern signature; search relevant files; add semantic search if needed
2. **Read the key files** — the code locations where the trick is actually used or implemented: for `library`, find imports and call sites; for `pattern`, find structural code such as interface definitions, inheritance, or composition; for `technique`, find the script or config corresponding to the operational steps
3. **Output** — record file paths and key code snippets. If nothing is found at all, such as a purely experience-based trick or an external tool usage, then Phase 3 must state "this trick currently has no in-repo code example"

Supplement: even if the user already attached a file, you must still search the repository once to see whether there are other usage points. If search results are empty, you may continue, but the document must say so. If the found code contradicts the user's description, proactively confirm with the user.

### Phase 3: Distill the Key Points (one question at a time)

Ask questions **based on the code found in Phase 2**. Do not ask the user for information that is already visible in the code:

1. "What is the standard way to do this?" If the implementation is already visible, state your understanding directly and ask the user to confirm
2. "Why is this effective? What is the principle behind it?"
3. "When should this not be used?" optional
4. "Any pitfalls or things to watch for?" optional, but especially important for `library`
5. "Any code or command example?" If you already found real code, skip asking and use the real code directly as the example

If the user says "nothing there" or "skip it", skip it. It is better to leave out a section than fill it with empty prose.

### Phase 4: Draft + User Review

The AI drafts the full document in one pass, including YAML frontmatter and body. Example code should prefer real project code found in Phase 2, possibly simplified. Do not invent examples. Show it to the user.

### Phase 5: Archive

- New document: write to `compound/YYYY-MM-DD-trick-{slug}.md` with frontmatter `doc_type: trick`
- Update: write back to the original file identified in Phase 1.5 and add `updated: YYYY-MM-DD`
- Supersede: handle it according to item 5 of `.bytetrue/reference/shared-conventions.md` §6

### Phase 6: Discoverability Check

After writing, if you notice one or two lines of hard project constraints that "every ByteTrue skill startup should know", suggest that the user append them to `.bytetrue/attention.md` via `bt-note`. Do not change `attention.md` on your own.

---

## Search Tools

> For the full syntax, see `.bytetrue/reference/tools.md`.

```bash
# Filter by type + framework

python .bytetrue/tools/search-yaml.py --dir .bytetrue/compound --filter doc_type=trick --filter type=library --filter framework~={library-name}

# Browse by stack

python .bytetrue/tools/search-yaml.py --dir .bytetrue/compound --filter doc_type=trick --filter language=typescript --filter status=active

# Check overlap after archiving

python .bytetrue/tools/search-yaml.py --dir .bytetrue/compound --filter doc_type=trick --query "{keyword}" --json
```

---

## Guard Rules

> For shared rules on archival workflows, see section 6 of `.bytetrue/reference/shared-conventions.md`. Rules specific to this skill:

1. **Archive only validated practices** — "maybe this should be done like this" does not qualify; the user or AI must have confirmed that it works
2. **You must investigate the repository** — Phase 2 cannot be skipped. Example code should prefer real project code rather than invented snippets
3. **Do not invent the principle for the user** — if the user cannot explain "why it works", write "principle pending supplementation" instead of fabricating it
4. **Examples take priority over description** — if code can explain it clearly, use code
5. **Only recognize your own `doc_type`** — only read and write `doc_type: trick`
