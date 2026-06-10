---
name: bt-libdoc
description: Generate reference documentation entry by entry for a library's public surface, such as components, functions, or commands, with manifest-based tracking and support for both single-entry and batch workflows. The source of truth is the source code itself, unlike guidedoc's task-oriented mode. Trigger when the user says "write API docs", "component docs", or "libdoc", or when acceptance finds a newly added public interface.
---

# bt-libdoc

## Read Before Starting

Before making any judgment or taking any action, read `.bytetrue/attention.md` first; if it is missing, treat the skeleton as incomplete and tell the user to fill it in or run `bt-onboard`.

`guidedoc` teaches "how to use X to do Y". `libdoc` tells you "what each part of X looks like and how it is configured".

If guidedoc is wrong, the problem may only be unclear explanation. If libdoc is wrong, it is simply wrong. The source of truth is the source code itself. Types, default values, and signatures each have one correct answer. **Core rule: do not guess, do not copy the previous entry and just rename it, and read the source code independently for every entry.**

---

## Compared with guidedoc

| | guidedoc | libdoc |
|---|---|---|
| Nature | task-oriented, Tutorial / How-to | reference-oriented, Reference |
| Answers | "How do I use X to achieve a certain goal?" | "What does each part of X look like, and how is it configured?" |
| Granularity | one feature or one scenario per document | one document per entry |
| Source of truth | design docs + user knowledge | **the source code itself**, types, comments, default values |
| Scale | a few to a dozen documents | dozens to hundreds of documents |

They complement each other: the guide cites libdoc for detailed reference, such as "see xxx for the full props", and libdoc links back to the guide from "related entries".

## "Entry"

| Project Type | Entry Granularity |
|---|---|
| UI component library | one component = one entry |
| utility function library | one module or function family = one entry |
| API client | one endpoint family = one entry |
| CLI tool | one subcommand = one entry |

Once entry granularity is confirmed during initialization, keep it consistent afterward. If granularity keeps changing, both the manifest and search will become chaotic.

---

## Paths Involved

libdoc artifacts **do not live under `.bytetrue/`** because API reference is a publishable artifact for external readers.

- entry documents → `docs/api/{slug}.md`
- entry manifest → `docs/api/manifest.yaml`

`docs/api/` is the default convention. If the project already uses another convention such as `reference/` or `components/`, follow the project. Confirm this before starting.

---

## Manifest / Templates / Source Extraction

Reference material is in `reference.md` in the same directory:

- full `manifest.yaml` format and `status` semantics
- entry document frontmatter and body template
- source extraction checklist, including interface signatures, default values, export style, and so on

This skill body keeps only the process constraints: **libdoc uses source code as the source of truth. It does not guess and does not copy the previous entry and rename it.**

---

## Workflow

### Phase 1: Initialization — Scan and Manifest

1. **Confirm project type, entry granularity, and output path**
2. **Scan the source directory** — read the file structure under `source_root`, identify public exports, and group them logically
3. **Generate `manifest.yaml`** — every entry starts with `status: pending`; after writing it, validate with `validate-yaml.py --file docs/api/manifest.yaml --yaml-only`; then show it to the user for review
4. **User confirms the scope** — entries can be marked `skipped` for internal implementation, categories can be adjusted, and entries can be merged or split

### Phase 2: Generation

#### Mode A: Single-entry mode

Suitable for 1-3 entries or an initial trial run to confirm quality.

Pick the entry → read `source_files` → generate according to the template → user reviews → write it to disk → validate with `validate-yaml.py --file {path} --require doc_type --require entry --require status` → set the corresponding entry in the manifest to `status: current`

#### Mode B: Batch mode

Suitable when the manifest still contains many `pending` entries.

1. **Produce exemplars first** — pick 2-3 representative entries from the manifest, covering different categories, and go through "read source → extract → generate by template", then write them to disk. Their status starts as `draft`, not `current`, because in batch mode the exemplars are style references and should become `current` only after overall review.
2. **User confirms the quality bar** — review these 2-3 entries to confirm template, level of detail, and style. **This step cannot be skipped.** Otherwise 50 documents might be generated in the wrong style.
3. **Generate in batch** — for each remaining `pending` entry, go through "read source → extract → generate". Subagents may be used in parallel. Each entry gets `status: draft`.
4. **Overall review** — once the batch is done, show the summary, number of entries, number skipped, number pending confirmation. Before review, run `validate-yaml.py --dir docs/api --require doc_type --require entry --require status` for batch validation.
5. **Finalize** — after user confirmation, change both the exemplars and the batch output to `status: current`

**Hard rules for batch mode**:

- **Read source code independently for every entry** — even in batch mode, it is not allowed to copy the previous document and rename it. Two interfaces that look similar often differ in subtle ways.
- **Exemplar confirmation cannot be skipped**
- **If the source structure is special**, such as dynamic exports or code generation, mark it `skipped` with a note for now. Guessed documentation is more harmful than no documentation.

### Phase 3: Incremental Updates

After code changes, sync the documentation. Any of these three entry points may be used:

- use `search-yaml.py` to find `status=outdated`, either from an architecture check or a previous update that marked them
- compare the source files changed after `last_scanned` in `manifest.yaml`
- use `search-yaml.py --sort-by last_reviewed --order asc` to proactively re-review the least recently reviewed entries

Reread the source → compare it with the existing document → update only the changed parts → validate with `validate-yaml.py` → set `status: current` and `last_reviewed` to today.

---

## Relationship with Other Workflows

| Source | Relationship |
|---|---|
| `bt-feat-accept` | after acceptance, if new or changed public library interfaces were introduced, it should ask "do you need to update libdoc?" |
| `bt-guide` | the guide cites libdoc for detailed reference, and libdoc links back to the guide from "related entries" |
| `bt-arch` in check mode | if it detects an interface change that libdoc has not synced, it marks the corresponding entry `outdated`, and this skill handles it in Phase 3 |
| `bt-feat-design` | section 2 of the design can be a supplementary information source for libdoc, **but source code still wins** |
| `bt-trick` | when libdoc "notes" overlap with tricks, cross-reference instead of duplicating content |

---

## Exit Conditions

**Phase 1**: `manifest.yaml` has been written, the user has confirmed the scope including reasons for `skipped`, and entry granularity plus output path are confirmed

**Phase 2 single-entry mode**: the entry has been generated from the template, frontmatter is complete, the API reference section is based on extracted source information rather than invention, the user has confirmed it, and the manifest has been updated

**Phase 2 batch mode**: the exemplars, 2-3 entries, have been confirmed by the user; all `pending` entries have either been generated or marked `skipped`; the user has completed the overall review; and every entry status in the manifest has been synchronized

**Phase 3**: every `outdated` entry has either been updated or explicitly confirmed as not needing an update, and no `outdated` entries remain in the manifest unless the user explicitly chose to defer them

---

## Easy Pitfalls

- writing docs without first scanning the manifest — entries may be missed or duplicated
- writing API reference without reading source — the core value of libdoc is accurate reflection of source code
- copying the previous entry and renaming it — subtle differences will inevitably be missed
- skipping exemplar confirmation in batch mode — 50 documents may be generated in the wrong style
- writing spec information such as invariants or test constraints into libdoc — those belong under `.bytetrue/`
- libdoc and guidedoc overlapping too heavily — one of them has the wrong positioning
- directly deleting a row from `manifest.yaml` — set `status: skipped` and write a note instead
- documenting an interface that does not exist in source code — use source as truth and do not invent
