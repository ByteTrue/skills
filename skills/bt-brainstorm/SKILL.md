---
name: bt-brainstorm
description: Discussion entry point for when the idea is still fuzzy. It triages and routes to feature-design, feature-brainstorm, roadmap, or bt-grill. The AI is a thinking partner, not a recorder. Trigger when the user says "I have an idea but haven't thought it through", "let's brainstorm first", "let's talk about this area", or "the direction is still shaky". If the user explicitly wants grill, stress-test, or to push the proposal until it is clear, route to `bt-grill`. This skill does not handle bugs or refactors.
---

# bt-brainstorm

Brainstorm is the unified entry for the discussion layer.

Three things matter most:

- **Brainstorm is an idea space, not an audit gate** — exploring, questioning, changing your mind, or even discovering halfway through that the real thing you want is something else is all normal
- **Any topic is fair game** — if the user wants to talk about a library, schema, or interface, talk about it. The fact that they brought it up means they already have something in mind. Clarifying it early saves effort in design. There is no blacklist of allowed topics
- **The AI is a thinking partner, not a recorder** — the user came to this step to be challenged and inspired, not to fill out a form. If all you do is reorganize the user's own words and write them down, the step was wasted

> For shared paths and naming conventions, see `.bytetrue/reference/shared-conventions.md`.

---

## Triage

### Four-case overview

| Case | Scale | User State | Output |
|---|---|---|---|
| **case 1: already clear enough** | any size | one sentence can already say what to build, for whom, what success looks like, and what is out of scope | no file written, go directly to `bt-feat-design` |
| **case 2: small demand** | single feature | the user knows what problem they want to solve, but the solution and boundary still wobble | `.bytetrue/features/{feature}/{slug}-brainstorm.md` → `bt-feat-design` |
| **case 3: large demand, decomposition-ready** | multiple features | the user already has a rough module split in mind and wants to move directly into breakdown and interface contracts | no file written, hand off to `bt-roadmap` |
| **case 4: large demand, wants to be grilled first** | multiple features | the user does not want decomposition yet, they want grill, stress-test, and to push the plan until it is clear | hand off to `bt-grill`, default `with-docs`; after convergence, decide whether to write `.bytetrue/brainstorms/{slug}/brainstorm.md` or move into `bt-roadmap` |

Misclassifying the case is not a disaster. **Upgrading and downgrading are allowed.** A case 2 discussion can grow into case 3 or 4 as the scope expands. Case 3 can switch to case 4 if it becomes clear that the proposal needs interrogation first. Case 4 can, after `bt-grill`, switch directly into case 3 and decompose immediately.

### Checks before starting the discussion

Do this every time:

1. **Scan the repo once** — read `.bytetrue/attention.md` first; Glob `.bytetrue/` to discover architecture, features, roadmap, brainstorms, compound, and requirements; read the architecture entry, inspect existing features, roadmaps, and brainstorms, and search compound for related pitfalls with `--filter doc_type=learning`; Grep the user's keywords to prevent terminology collisions. If `attention.md` is missing, treat the skeleton as incomplete and do not fall back to external AI entry files
2. **Check whether this continues existing work**:
   - are there similarly named brainstorms under `features/`? Similar subdirectories under `roadmap/`? Related idea records under `brainstorms/`?
   - if none, treat it as a new discussion
   - if there is an unfinished brainstorm, read it and report "last time the discussion reached {...}; do we continue that or overturn it?"
   - if there is a design.md with the same name, tell the user design already exists and ask whether this is the wrong entry point
   - if there is a roadmap with the same topic, tell the user that this area is already being tracked by roadmap and ask whether the real goal is to advance a concrete sub-feature
   - if there is a related idea record under `brainstorms/`, read it and report "there was already a brainstorm record from {date}, with direction {...}; do we continue that or go straight into roadmap decomposition?"
3. **Confirm this is new-feature brainstorming** — bugs go to `bt-issue`, refactors go to `bt-refactor`
4. **If you can already write the first draft of the design requirement summary on the user's behalf**, classify it as case 1 immediately. Taking work that does not belong here is the biggest anti-pattern of this phase

### Opening triage, decide the case in one or two rounds

This is not a form. If you ask too many classification questions, the user feels trapped in process.

**When the user gives only one fuzzy word or short phrase**, such as "I want a permission system" or "let's talk about notifications":

> Let me align in one sentence first: the problem you want to solve is {AI's restatement}, right? In your mind, how large is this, something small enough to fit in one feature, or a whole new subsystem that has to be done over several rounds?

**When the user comes in with a plan**, such as "I want to do X, including a/b/c":

> Let me restate it to check: the problem you want to solve is {P}, and your plan is X with a/b/c inside it. Taken together, do a/b/c feel like something one feature can finish, or like three dependent things that need to be done over several rounds?

If the user themselves splits it into multiple separate things, that is multi-feature scale. Then ask whether they want to decompose straight into roadmap, or first use `bt-grill` to pressure-test the plan until it is clear, leading to case 3 or case 4. If a/b/c are just different faces of the same thing, that is case 2. If the user says after your restatement "yes, exactly, that is already clear", that is case 1.

**Signals for deciding the case**, if the user cannot say it cleanly and the AI must judge:

- each goal is **a different angle of the same thing** → case 2
- the goals have **dependency order** or **independent submodules**, and the user can already describe the rough split → case 3
- the goals have **dependency order** or **independent submodules**, but the user cannot describe the module boundaries clearly and wants to explore first → case 4
- after two quick exchanges, the explicit non-goals, core behavior, and success standard all line up → case 1

---

## How to Talk, the lightweight toolbox for case 2

The following dialogue methods are mainly for case 2: the target problem is roughly clear, but the solution or boundary is still unstable. If the discussion turns into explicit grill, crosses into multiple-feature scale, or the restatement still fails after repeated attempts, hand it to `bt-grill` immediately.

### Two core stances

**1. Distinguish between what the user says and what the user actually wants** — the first sentence the user gives is often the solution they happened to think of, not the real problem they want to solve. When you hear "I want to do X", do not follow them straight into the solution. First ask what scenario and what problem X is meant to solve. A common outcome is that the real problem is not solved by X, or that there is a much smaller, lighter, or completely different solution. Once something enters design, the direction becomes welded. The biggest value of brainstorm is catching that before the user notices it themselves.

**2. When the user arrives with a plan, assess it before accepting it** — do not immediately go into "then let's discuss how to do a". First:
- **restate and reverse-ask the problem** — translate the proposed plan back into "the problem you want to solve is P, right?"
- **evaluate and propose alternatives** — if the plan has an obvious issue, wrong problem, over-engineering, an existing lighter path, or it would step on a known learning pitfall, say so directly and offer 1-2 genuinely different alternatives. **Do not stay silent just to look cooperative**

If, after evaluating, the plan actually looks solid, say "I think this direction is fine; recommend going straight into design", and do not force extra divergence just to satisfy the workflow. That is a case 1 promotion on the spot.

### Conversation rhythm

There is no rigid sequence. You may move back to the previous step at any time:

1. **dig for the real problem** — use stance 1 until the "real problem to solve" can be restated in one sentence and the user says "yes, that is exactly it". **This is the highest-value step; do not rush past it**

   **Explicit grill signals**

   If any of the following appears, do not keep questioning inside `bt-brainstorm`; hand it to `bt-grill`:

   - **explicit request**: the user says "ask me a few more rounds", "help me question this until it is clear", "grill me", "stress-test", or "interrogate the plan"
   - **implicit signal**: two consecutive restatements are rejected with "close, but not quite"; the same concept is repeatedly referred to using different words, for example permission, role, and tenant all pointing at the same thing; or the user explicitly says they cannot explain it clearly either
   - **scope signal**: the issue clearly spans multiple features, but the user still has no module boundaries or dependency order

   When handing off, bring along what has already been discussed: the real problem, the user's current plan, conflicting terms, known constraints, and what you think is the single most important next question. `bt-grill` will, by default, read `.bytetrue/` docs and code context. Only when the user explicitly says `--lite` or `--no-docs` does it switch to pure conversation.

2. **diverge** — only after the problem is clear, discuss solutions. Offer 2-3 concrete candidate directions, counting the user's plan as one of them. Give each 1-2 sentences of description, value, and cost. **At least one candidate should be counterintuitive**, by reversing assumptions, removing a common constraint, or borrowing an analogy from another domain. Present all candidates before giving your recommendation. If you anchor early and then add others, you bias the user's judgment
3. **converge** — after selecting a direction, sketch it lightly: what is the core behavior, what is obviously out of scope, and what is the biggest unknown. This is warming up design, not making design decisions for it

### Minimal demo or spike

If the discussion reaches "whether this direction is viable depends on whether X is actually Y", do not keep debating it in the abstract. **Stop and spend 5-30 minutes building the smallest possible demo** to verify the fact. That usually saves more time than three additional rounds of discussion.

**Do not do this by default**. Most brainstorms are comparing tradeoffs, and a demo would not help. Only proactively suggest it when all three of the following are true:

1. **this is a factual question, not a preference question** — for example how an API behaves, whether a library really supports something, or whether a performance characteristic holds, not "which style is nicer"
2. **the result would change the direction** — whether it succeeds or fails, the discussion will converge afterward
3. **the cost is controlled** — you judge that a runnable thing can be built in 5-30 minutes. Beyond that, it should either go straight through `bt-feat-ff` or be split into a formal feature

Suggested phrasing: **"This one is hard to settle by thinking. I can build a minimal demo to verify {the thing to verify} in 5-10 minutes. OK?"** The user can then instantly approve or reject.

**Spike landing convention**:
- case 2: put the experiment code under `.bytetrue/features/{feature}/`, in the same directory as the brainstorm note, with any simple name such as `spike.py` or `try-{topic}.ts`
- case 4: put the spike under `.bytetrue/brainstorms/{slug}/` next to `brainstorm.md`
- after verification, cleanup is not mandatory; leaving it there for later is fine. Delete it only if the user thinks it is clutter
- **the result must be written back into the brainstorm note** — regardless of success or failure, add one line in the "design points already settled" section: "{conclusion} — verified by spike, see `{path}`", so that design or roadmap does not re-open the same doubt later

Case 1 and case 3 can also borrow this action, though it is not mandatory to land a brainstorm note there. The same logic applies: the fact is uncertain, the answer changes direction, and the cost is controlled.

### Pitfalls in the conversation itself

- **Ask only one question at a time** — if you dump three or five, the user will answer only the easiest one
- **Offer options before asking** — if 2-4 concrete choices with real distinctions can be offered, let the user choose instead of writing a free-form answer
- **Do not proactively drag the topic back to the "user-visible layer"** — if the user wants to talk about a library, schema, interface, or technical choice, go with them. The AI should not open technical detail just to fill airtime, but if the user opens it, discuss it seriously. If the answer depends on code, read the code as needed and bring the fact back into the dialogue

---

## The four cases

### case 1: already clear enough

**Signal**: one sentence can already say what is being built, for whom, what success looks like, and what is out of scope. After two exchanges, core behavior and success criteria both line up.

**Handling**:
1. tell the user: "This is already clear enough: {AI one-sentence restatement}. Recommend going directly to `bt-feat-design`; brainstorm adds no value here"
2. **check whether the discussion produced non-trivial technical decisions** — if the user discussed a concrete library choice, schema, interface shape, or cross-module convention, write a minimal brainstorm note, filling only "design points already settled", so design can read it without reopening the same discussion. If it was only direction confirmation with no technical detail, exit with no file
3. stop and wait for the user to trigger design

**Exit**: "trigger `bt-feat-design` directly to write the design from scratch", with no file written; or, if a lightweight note was written, "the next `bt-feat-design` will read `{path}` so you do not have to repeat it"

---

### case 2: small demand → feature brainstorm

**Signal**: the user knows what problem they want to solve and roughly what part of the system it affects; one feature can hold it; but the solution or boundary still wobbles.

**How to talk**: use the toolbox from the previous section, dig the real problem → diverge → converge. Once the direction converges, write it down.

**Upgrading or downgrading**:
- if the discussion reveals that the scale exceeds a single feature → "this is larger than one feature. Do you want to decompose it straight into roadmap, or first use `bt-grill` to question it through?" → case 3 or case 4
- if the discussion reveals that everything is already clear → case 1

**Write to disk**: after convergence, write `.bytetrue/features/{feature}/{slug}-brainstorm.md`.

Directory conventions:
- date prefix: use today's date from environment info
- slug: invent an English lowercase hyphenated slug based on the direction, and tell the user what it is. If design later renames it, only rename the slug part, not the date
- if the directory does not exist, create it; if it already exists, follow the continuation logic from the pre-discussion check

Write to disk only when the user confirms it is ready to move into design. Do not write files during the discussion itself. `status` is always `confirmed`, never `draft`.

See the "feature brainstorm template" in `reference.md` in the same directory for the template. The frontmatter conventions are shared with design and acceptance; see section 1 of `shared-conventions.md`.

**Exit**: proactively ask "is this clear enough to move into design now?" and after confirmation, write it to disk. If the vision, user stories, pain point, and boundaries, is already well discussed, tell the user they may optionally run `bt-req draft` first so the requirement vision is captured before design. Then say "the next `bt-feat-design` will read `{path}`"

---

### case 3: large demand → direct roadmap decomposition

**Signal**: multi-feature scale, and the user already has a rough module split in mind, enough to go directly into decomposition and interface contracts.

**Handling**:
1. tell the user: "This sounds like a set of multiple features, too large for a single feature. `bt-roadmap` will handle the decomposition and dependency sorting, so I will hand the discussion there"
2. summarize the discussion so roadmap does not start from zero: the real problem, rough scope, and any possible sub-modules already mentioned, one sentence each; **also list any cross-module interface shape, shared protocol, or technology choice already discussed**, because these are the seeds for the "detailed architecture layer" section of roadmap
3. **do not write a file** — `roadmap new` will create the directory and main document itself

**Exit**: "handing off to `bt-roadmap`", with the summary of what has been discussed, and no file written

---

### case 4: large demand → `bt-grill` first, then decide

**Signal**: multi-feature scale, but the user cannot yet explain the module boundaries and wants to explore first, by saying things like "help me question it through", "let's sort the idea first", "the direction is still messy", or explicitly "grill / stress-test / interrogate the plan".

**Handling**: hand it to `bt-grill`. Do not maintain a second grill flow inside `bt-brainstorm`.

The handoff summary should include:

1. the real problem the user wants to solve, if that has already been reached
2. the user's current plan or intuition
3. the terminology conflicts, scope confusion, or dependency confusion already exposed
4. any known ByteTrue context clues already read, such as related requirement, architecture, roadmap, or compound artifacts
5. the single question you think should be asked first

After `bt-grill` converges, then decide the exit:

- if it is clear enough and only one feature, go to `bt-feat-design`; if needed, the user may ask to write a feature brainstorm note first
- if it is clear enough but spans multiple features, go to `bt-roadmap`
- if it produced an idea worth retaining but is still not ready, it may write `.bytetrue/brainstorms/{slug}/brainstorm.md` using the open brainstorm template
- if it finalized vision, architecture, or long-term constraints, suggest `bt-req`, `bt-arch`, or `bt-decide`

**Exit**: tell the user "this needs to be pushed further first; I recommend switching to `bt-grill`. By default it will read `.bytetrue/` docs and code context; if you want pure conversation only, use `bt-grill --lite`."

---

## Hard Boundaries

1. **Never skip triage** — every discussion must be classified into a case before it really starts
2. **Do not decide the scale on the user's behalf** — when the boundary between case 2, 3, and 4 is fuzzy, ask the user whether in their head this fits one feature or should first be grilled and stored
3. **Do not write files for non-case-2 or non-case-4 outputs** — case 1 and case 3 do not write a file
4. **Do not handle bugs or refactors**
5. **Do not maintain a grill flow inside this skill** — explicit grill, stress-test, or plan interrogation always routes to `bt-grill`
6. **Do not casually start writing design or roadmap yourself** — the human checkpoint between stages is a hard constraint in the whole ByteTrue workflow

---

## Common Mistakes

- skipping triage and forcing every discussion into case 2, which means a large demand gets stuffed into one feature
- making triage feel like a questionnaire — one or two rounds should be enough to see the direction; if by the third round you are still only aligning the scale, the method is wrong
- forcing a brainstorm note in case 1 — the user is already clear, and the template only creates the illusion that something valuable happened
- decomposing case 3 yourself — that oversteps the roadmap workflow
- ignoring upgrade and downgrade signals — the scope grows but the AI continues as case 2, ending with a note that cannot hold all the submodules
- treating case 4 like case 3 — the user wants to be questioned through, but the AI pushes them straight into roadmap and forces an immature idea into feature decomposition
- treating case 3 like case 4 — the user is already ready to decompose, but the AI forces grill and delays the rhythm
- giving only one candidate direction and asking the user to evaluate it — users get anchored and do not propose alternatives
- simply restating the user's plan and writing it down — recorder mentality, with no added value as a thinking partner
