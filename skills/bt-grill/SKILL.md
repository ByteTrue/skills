---
name: bt-grill
description: ByteTrue's plan stress-test skill. By default it reads `.bytetrue` project docs and code context to stress-test a plan, design, roadmap, refactor, architecture proposal, or project-management proposal, and in with-docs mode it updates the appropriate ByteTrue docs as terminology or decisions crystallize. When explicitly invoked with `--lite`, `--no-docs`, or "pure grill-me", it degrades into a lightweight questioning mode that does not read ByteTrue docs. Use when the user says "grill me", "interrogate this plan", "help me pressure-test it", "stress-test the design", "is this design solid", or "push this plan until it is clear", or when a proposal needs to be challenged before `bt-brainstorm`, `bt-roadmap`, or `bt-feat-design`.
---

# bt-grill

`bt-grill` is ByteTrue's "plan interrogation / pressure test" skill. It pushes a plan, design, roadmap, refactor proposal, or project-management proposal until it is clear enough, exposing hidden assumptions, terminology conflicts, decision dependencies, and verification gaps.

It combines two modes:

- **Default: with docs** — read project context under `.bytetrue/` first, then challenge the user's proposal against that context; as terminology, decisions, or open questions crystallize, capture them in the appropriate ByteTrue document after user confirmation rather than merely suggesting "this should be written down"
- **Lightweight: grill-me** — when the user explicitly says `--lite`, `--no-docs`, "pure grill-me", or "do not read docs, just question me", it becomes dialogue-only probing; it may still read code as needed to answer factual questions, but it does not read or write `.bytetrue` docs

## Hard Rules

1. **Ask only one question at a time**, then wait for the user's answer before continuing
2. **Give a recommended answer with every question**. Do not dump blank questions on the user
3. **If the answer can be obtained from docs or code, do not ask the user** — explore first, then bring the evidence back into the conversation
   If the fact depends on external tool behavior, library/API capability, platform hooks, comparable workflows, industry convention, or performance/cost claims, and the answer would change the plan, route through `bt-explore spike` and cite the artifact; see `.bytetrue/reference/research-first.md`.
4. **Advance along the decision tree** — resolve upstream dependency questions first, then downstream implementation details
5. **Do not keep asking questions for their own sake** — if a round gives no new information, the user says "close enough", or the question can only be answered by implementation, then converge and give the next step
6. **Do not make the final decision for the user** — you may strongly recommend, but the user must confirm

## Mode Selection

### Default `with-docs` mode

Unless the user explicitly asks for lightweight mode, use `with-docs`.

At startup, do a minimal context scan:

1. Read `.bytetrue/attention.md`. If it is missing, explain that the project is not fully onboarded to ByteTrue, stop, and suggest either:
   - `bt-onboard` first, or
   - the user re-triggering `bt-grill --lite` to skip ByteTrue docs
2. If it exists, read the relevant parts of `.bytetrue/reference/system-overview.md`, `.bytetrue/reference/shared-conventions.md`, and `.bytetrue/reference/domain-context.md`. For project-management topics, also read `.bytetrue/reference/project-management.md`
3. Based on keywords in the user's plan, look up relevant:
   - `requirements/`: why this capability exists and what its boundaries are
   - `architecture/`: the current system state and constraints
   - `roadmap/`: whether there is already a large-demand plan or sub-feature dependency
   - `features/`, `issues/`, `refactors/`: whether this is continuation of existing work
   - `compound/`: whether there are existing decisions, learnings, tricks, or explores that conflict with or can be reused
4. When the user claims "the code is currently X", read code as needed to verify it. If you find a conflict, you must point it out.
5. When a term, language boundary, decision, or open question crystallizes, do not wait until the final summary. Follow the "document write rules" in this file and update the appropriate ByteTrue document after user confirmation.

### Lightweight `grill-me` mode

Trigger conditions: the user explicitly says `--lite`, `--no-docs`, `mode=lite`, "pure grill-me", "do not read docs", or "just question me".

Behavior:

- `.bytetrue/` is not required
- do not proactively read ByteTrue docs
- do not write `.bytetrue` docs
- still follow: one question at a time, every question includes a recommendation, and if code can answer the fact, read code
- if the user asks to "record it" or "write it down", state clearly that this switches back to `with-docs` mode; after switching, read `.bytetrue/` context first, then write into the corresponding ByteTrue document

## Interrogation Method

First compress the user's plan into one sentence:

> My understanding of your plan is: achieve {goal} through {approach}, under {constraints}, with {success criteria} as the finish line. I will start with the point that most affects the downstream branches.

Then, in the following order, find the "highest-leverage current question". Do not ask every section mechanically.

### 1. Goal and success criteria

Clarify:

- what is the real problem to solve?
- what happens if this is not done?
- how will success be validated from the outside?
- does this goal belong to feature, roadmap, refactor, issue, docs, or project management?

### 2. Terms and domain boundaries

In `with-docs` mode, compare against `.bytetrue/requirements/`, `.bytetrue/architecture/`, and `compound/decision`:

- does the user's term conflict with existing docs?
- is the same term being used to represent multiple concepts?
- is there a canonical term that should be unified?

When you find a conflict, point it out directly:

> There is a terminology conflict here: in the existing docs, `{term}` means X, but just now you sounded like you meant Y. My recommendation is to call Y `{new_term}`; otherwise the later design will get confused. Do you accept that?

### 3. Plan and alternative routes

Do not only follow the user's chosen plan into detail. Check at least:

- is this plan actually solving the real problem?
- is there a smaller, lighter, more reversible path?
- is there a path already supported by the current architecture?
- is there an existing decision that explicitly prohibits or favors a direction?

For architecture candidates or refactor proposals, additionally grill using Matt `improve-codebase-architecture` points:

- is this module becoming **deep**, a small interface hiding more complexity, or just adding another **shallow** forwarding layer?
- where is the seam or adapter boundary, and which complexities are being trapped behind the adapter?
- what is the result of the deletion test: if this module disappears, does the complexity disappear, or scatter back into multiple callers?
- is the public interface rich enough to serve as the behavior-test surface? If tests can only touch private implementation details, the seam is probably cut incorrectly
- does this belong to behavior-equivalent refactor, feature target state, or architecture-document current-state update? These three must not be mixed

Question format:

> I see two routes here: A is faster but will accumulate X; B is slower but more consistent with the existing `{doc/code}`. My recommendation is B, because {reason}. Do you want B, or is there a hard constraint that forces A?

### 4. Dependencies and order

Break the plan into a dependency tree rather than a task list:

- which decision would change every later question? Ask that first
- which questions can be postponed until implementation and validated there? Mark those as open questions; do not fight to resolve them now
- which work must first go into `bt-roadmap` and cannot fit inside a single feature?
- which parts should first be validated through `bt-explore` or a spike?

### 5. Risk and counterexample scenarios

Actively construct concrete pressure-test scenarios:

- the most common path
- the boundary path
- the failure path
- the migration or rollback path
- old data, old interfaces, or compatibility path
- project-relevant risks such as permissions, multi-tenancy, concurrency, performance, or security

Each time, ask only the single scenario most likely to overturn the plan.

### 6. Document write rules

In `with-docs` mode, important conclusions must not remain only in the conversation, and it is not enough to merely say "this should be captured". When terminology is resolved, capture it inline after confirmation rather than batching all glossary work until the end. Before each grill converges, complete one document-ownership judgment; after user confirmation, write the smallest appropriate update into the proper ByteTrue doc.

Write targets:

- terminology, language consensus, or domain glossary → update `.bytetrue/reference/domain-context.md`. This file is the ByteTrue equivalent of Matt's `CONTEXT.md`: a glossary and language-boundary document only, not a spec, scratch pad, or home for implementation decisions
- project-management provider, label, sync, or tracker rules → update `.bytetrue/reference/project-management.md`
- capability vision, user stories, or boundaries became clearer → use `bt-req draft/update` or update the corresponding requirement directly
- current system state or architecture constraints need updating → use `bt-arch update` or update the relevant architecture doc
- finalized long-term technical choice, architecture decision, hard constraint, or convention → use `bt-decide` and write into `.bytetrue/compound/` as a decision. Offer this sparingly: it should be a real decision with meaningful future cost, not just an obvious or easy-to-reverse note
- one or two lines of must-read startup notes → use `bt-note` and write into `.bytetrue/attention.md`
- investigation facts or code evidence → use `bt-explore` and write into `.bytetrue/compound/` as an explore
- a large-demand breakdown is ready → use `bt-roadmap` and write into `.bytetrue/roadmap/{slug}/`
- a single feature is ready → use `bt-feat-design`; if needed, write a feature brainstorm first

Disagreements that are not yet finalized must not be written as decisions. They may be written into the open-question section of roadmap, brainstorm, or project-management, but they must be explicitly marked as `open` or pending confirmation.

If one grill produces multiple destinations, write the most stable and most upstream document first: terminology consensus → long-term decision → project-management rule → roadmap/feature/issue plan.

## Output Format for Each Round

Each round outputs only one question, and the format should stay fairly stable:

```md
I will ask the point that most affects the downstream branches first: {question}

What I see in context: {one or two sentences of evidence from docs, code, or the conversation; can be omitted in lite mode}
My recommended answer: {clear recommendation + reason}

Do you choose {recommended option}, or is there another constraint that should change my judgment?
```

If options are needed, offer at most 2-4, and each option must reflect a real difference.

## Convergence Conditions

Converge when any of these happens:

- the key decision tree has been walked, and only implementation detail remains
- the user says "enough", "close enough", or "let's leave it there"
- repeated questioning on the same issue yields no new information
- the question can only be answered by writing code, running experiments, or seeing real data

Convergence output:

```md
Our current shared understanding is:
1. Confirmed: ...
2. Still open: ...
3. Biggest risk: ...
4. Docs already written or to be written: ...
5. Recommended next step: `bt-xxx`, because ...
```

If the next step belongs to a project-management capability but ByteTrue does not yet have a dedicated skill for it, say clearly that this is a later additive direction, and use `bt-roadmap`, `bt-brainstorm`, or manual issue breakdown as the temporary bridge.

## Common Mistakes

- dumping 5 questions at once and turning grill into a questionnaire
- accepting whatever the user says without challenging alternative routes
- starting `with-docs` mode without first reading `.bytetrue/`
- noticing a docs or code conflict but being afraid to interrupt the user, so you do not point it out
- batching resolved terminology until the final summary instead of capturing it when the language consensus forms
- using `.bytetrue/reference/domain-context.md` as a spec, scratch pad, or implementation-decision document instead of keeping it as glossary and terminology boundaries
- drilling down into implementation details and crossing the responsibility line of `bt-feat-design` or `bt-roadmap`
- writing unresolved discussion directly into a decision document
- creating a decision document for an obvious, easy-to-reverse note that does not carry meaningful future context
- the user explicitly asks for lite mode, yet you still force ByteTrue docs into the turn
