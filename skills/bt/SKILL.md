---
name: bt
description: Root entry for the ByteTrue workflow. Introduce the overall system and route the user's request to the appropriate `bt-*` sub-skill. Trigger when the user only types `bt`, says "introduce bytetrue", "which skill should I use", "I don't know which skill to use", or the request is still broad and unconverged. This skill only routes; it does not do the work itself.
---

# bt

## Read Before Starting

Before making any judgment or taking any action, read `.bytetrue/attention.md` first; if it is missing, treat the skeleton as incomplete and tell the user to fill it in or run `bt-onboard`.

`bt` is the unified entry point for the ByteTrue workflow family. In most cases, the user will not name a specific `bt-xxx` skill up front. They may only say "I want to add a permission check", "there is a bug here", "introduce bytetrue", or even just send `bt`. This skill is responsible for catching that open-ended input, understanding the intent, and routing to the correct sub-skill.

**Two things, and only these two things**:

1. The user has a concrete request → match it against the scenario routing table, tell the user which `bt-*` to trigger, and briefly explain why
2. The user wants to understand the system or cannot clearly say what they want to do → give a concise system quick-read and let the user choose or describe a more specific request

**This skill does not do the work**: it does not write specs, does not read or write content artifacts under `.bytetrue/`, and does not run a sub-skill's workflow for it. The only output is "which sub-skill should be triggered".

---

## Scan Before Responding

Do this every time before replying; a few tool calls are enough:

1. **Check whether the repo has been onboarded to ByteTrue** — `Glob .bytetrue/` and look at the top-level directories
2. **If it exists** — you must `Read .bytetrue/attention.md` first (if it is missing, say the skeleton is incomplete and ask the user to fill it in or rerun `bt-onboard`); then `Read .bytetrue/reference/system-overview.md` if present; `Glob` `features/`, `issues/`, and `roadmap/` once to see ongoing work (directory names are enough; do not read every file)
3. **If it does not exist** — later tell the user to go through `bt-onboard` first
4. **Look at the user's exact wording** — is it open-ended or already a concrete request? If concrete, match the routing table; if not, give the system introduction

Reply only after the scan. The user should feel that you know the terrain.

---

## One-Page System Quick Read

Use this when the user does not have a concrete request yet or asks you to introduce the system.

ByteTrue models development activities as **8 entities + 3 workflows**, with all artifacts gathered under `.bytetrue/`:

```
.bytetrue/
├── requirements/    Requirement entities ("why this capability should exist", current state only)
├── architecture/    Architecture entities ("what the system looks like now", current state only)
├── roadmap/         Planning layer ("how to execute this larger need next: module split + interface contracts")
├── features/        Aggregate root for new-capability specs (design / impl / accept)
├── issues/          Aggregate root for bug-fix specs (report / analyze / fix)
├── refactors/       Aggregate root for refactor specs (beta)
├── audits/          Audit entities (proactively discovered finding lists, not committed fixes)
└── compound/        Knowledge accumulation (learning / trick / decision / explore)
```

**Three workflows**:

- **New capability**: `bt-feat-design` → `bt-feat-impl` → `bt-feat-accept` (if the idea is still fuzzy, route through `bt-brainstorm` first)
- **Bug fix**: `bt-issue-report` → `bt-issue-analyze` → `bt-issue-fix`
- **Refactor** (beta): `bt-refactor` / `bt-refactor-ff`

**Cross-cutting**: if the proposal has not been questioned hard enough yet, use `bt-grill` first; if you need to sync ByteTrue artifacts that match a syncable source and syncable status mapping into a GitHub/GitLab/local tracker, or triage external incoming issues, use `bt-tracker`; after a workflow finishes, if something is "worth writing down", record it into `compound/` through `bt-learn`, `bt-trick`, `bt-decide`, or `bt-explore`.

**Core idea**: what gets orchestrated is the lifecycle of the software itself (requirements, architecture, features, bugs, decisions), not the Agent. Human in the loop: the programmer remains responsible for overall control, and AI is the efficient executor.

> If the project has already been onboarded, see `.bytetrue/reference/system-overview.md` for the more detailed overview.

---

## Scenario Routing Table

Match the user's words to one row in the table, then tell them: "Your request should go through `bt-xxx`, because {one-line reason}."

| What the user says / wants to do | Route to |
|---|---|
| The repo does not have `.bytetrue/` yet | **`bt-onboard` first** — every other `bt-*` depends on that directory |
| Wants to interrogate a proposal / "grill me" / "stress-test" / "is this design solid" / "push this plan hard" | `bt-grill` (by default it reads `.bytetrue/` and code context; only explicit `--lite` / `--no-docs` makes it pure conversation) |
| The idea is still fuzzy / "I have an idea but haven't thought it through" / "let's talk first" / "I don't know if this is a feature" | `bt-brainstorm` (it triages and routes to design / feature-brainstorm write-up / roadmap; if the user explicitly wants to be challenged, switch to `bt-grill`) |
| New feature / "add X" / "implement XX" | `bt-feat` (routes to design / ff / impl / accept) |
| BUG / exception / error / "something is wrong here" / "the docs are wrong" | `bt-issue` (routes to report / analyze / fix) |
| Code optimization / refactor / rewrite with unchanged behavior | `bt-refactor` / `bt-refactor-ff` |
| Read the code / "how is X implemented" / exploratory question / zoom out / step up one level / map the module and its callers | `bt-explore` (`module-overview` handles zoom-out; if a long-lived architecture map is needed, continue with `bt-arch`) |
| Review the system / scan for bugs / audit the code / "what problems are there" / "what can be optimized" | `bt-audit` (proactive discovery only; list findings without committing to fixes) |
| Add or update requirement docs | `bt-req` |
| Add / update / check architecture docs / "refresh the architecture doc" / "do an architecture health check" | `bt-arch` |
| Break down a larger need / "I want an X system" / scheduling plan / module split + interface contracts | `bt-roadmap` |
| Technical choices / long-term constraints / coding conventions | `bt-decide` |
| Pitfall review / experience summary / "this is worth writing down" | `bt-learn` |
| Reusable programming patterns / library usage / "this is how X should be done in the future" | `bt-trick` |
| One or two lines of project-specific notes / special build setup / command pitfalls / "put this into attention.md" | `bt-note` |
| Developer guide / user guide | `bt-guide` |
| Library API reference | `bt-libdoc` |
| External tracker / GitHub Issues / GitLab Issues / PRD sync / issue sync / triage incoming issues | `bt-tracker` (external tracker bridge; publish/link/update/triage, not a replacement for `bt-roadmap`, `bt-feat`, or `bt-issue`) |
| The user asks "what's next" in the middle of a feature / issue workflow | Route to the corresponding entry (`bt-feat` / `bt-issue`) and let that entry decide the current phase |

**Cannot tell / too abstract**: "It sounds like {guess}, but your description is missing {what is missing}. Is it {option A} or {option B}?" Make the user choose; do not guess hard.

---

## Cases That Need Extra Attention

### The Repo Is Not Onboarded Yet

Any `bt-*` workflow when `.bytetrue/` does not exist → point this out and recommend **`bt-onboard` first**. Do not route directly to `bt-feat` or `bt-issue`; their `SKILL.md` files all assume `.bytetrue/` already exists.

### A Large Need Mistaken for a Feature

Requests like "I want a permission system / notification center / SSO integration" are the kind you can tell **at a glance will not fit into one feature** → do not route to `bt-feat`; route to `bt-brainstorm` instead (most likely it will classify as case 3 → `bt-roadmap`) or directly to `bt-roadmap`. Reason: starting a feature directly will turn into an oversized design that no longer fits.

### "Change X" but X Is an Existing Capability

Ask first whether this is a **bug fix** (X behaves incorrectly now) or a **requirement change** (X behaves correctly now, but the policy has changed):

- bug → `bt-issue`
- requirement change → update the requirement doc through `bt-req`, then run implementation through `bt-feat`

### Work Already In Progress

If the scan sees related directories under `features/` or `issues/`, say something like "I can see `features/2026-04-22-xxx/` already exists. Are we continuing that one?" Let the user confirm whether this is continuation work or a new one.

### How to Distinguish Accumulation Skills

Rule of thumb:

- Review of "we hit Y while doing X" → `bt-learn`
- Prescription of "this is how X should be done from now on" → `bt-trick`
- Rule of "the whole project will follow X from now on" → `bt-decide`
- Investigation of "what X looks like right now" → `bt-explore`
- One or two lines of standing reminder: "every ByteTrue skill startup must know X" → `bt-note` (written into `.bytetrue/attention.md`)

If you still cannot tell, ask the user: "Which type do you want this recorded as: {pitfall review / reusable prescription / long-term convention / investigation archive / standing reminder}?"

---

## Introduction Mode

Use this when the user only wants to understand the system or does not know what to do.

Explain it in this order, **without dumping everything at once**:

1. One sentence: ByteTrue is an AI coding workflow for serious engineering. It orchestrates the software lifecycle, not the Agent.
2. The quick-read map of 8 entities + 3 workflows
3. Ask the user "Where do you want to start right now?", and offer four prompts:
   - "I have a new feature I want to build" → `bt-feat`
   - "I want to pressure-test a proposal" → `bt-grill`
   - "There is a bug in the code" → `bt-issue`
   - "This project has not been onboarded to ByteTrue yet" → `bt-onboard`

Stop there. Do not explain every sub-skill in detail at once. Expand only when the user asks about something specific.

---

## Exit

This skill does not "write anything down". There is only one exit condition:

- [ ] You have told the user which specific `bt-*` sub-skill to trigger next, or confirmed that the user only came to understand the system and is not asking to do work yet

Output should look like this:

> Your request should go through **`bt-xxx`** — {one-line reason}.
> After you trigger it, it will {briefly describe what happens next: scan existing specs first / ask you to describe the issue first / enter triage / ...}.
> Switch to `bt-xxx` now?

---

## Things This Skill Must Not Do

- **Do not read or write content artifacts under `.bytetrue/`** — that is the job of the sub-skills
- **Do not make sub-skill decisions on their behalf** — do not perform brainstorm triage here, and do not decide which mode `bt-arch` should use
- **Do not recommend multiple skills at once** — point to exactly one path each time; split two independent requests across two rounds
- **Do not repeat the detailed system overview** — `.bytetrue/reference/system-overview.md` is the authoritative full version
- **Do not bypass `bt-onboard`** — if the repo is not onboarded, onboard first
