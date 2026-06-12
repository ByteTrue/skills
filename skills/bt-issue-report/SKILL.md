---
name: bt-issue-report
description: Stage 1 of the issue workflow. Turn a problem into a reproducible and traceable `{slug}-report.md` through conversation, and decide whether it should take the standard path or the fast path. Ask only about symptoms; do not guess the root cause. Trigger when the user says "file an issue", "record this bug", or "I found a problem". This is the entry point of the issue workflow.
---

# bt-issue-report

## Read Before Starting

Before making any judgment or taking any action, read `.bytetrue/attention.md` first; if it is missing, treat the skeleton as incomplete and tell the user to fill it in or run `bt-onboard`.

This stage does two things: turn the problem in the user's head into a structured record, and decide between the standard path and the fast path.

**Core principle: record symptoms, not root causes**. If the user says "I think it is a problem in component XX", record "the user suspects component XX" as a clue, but do not follow them into root-cause discussion. Root cause belongs to stage 2 and must be confirmed by actually reading code rather than guessing. A report mixed with root-cause guesses will bias stage 2 and send the analyst in circles around a false lead.

> For shared paths and naming conventions, see section 0 of `.bytetrue/reference/shared-conventions.md` and the "where the files go" section in `bt-issue`.

---

## Startup Checks

1. **Confirm this is a bug, not a new feature request** — if the description is really "I want to add capability X", tell the user to use `bt-feat`
2. **Check for related issue directories** — `Glob .bytetrue/issues/`; if a similar problem already exists, confirm with the user whether this is a new issue or an update
3. **Fast-path decision, the only formal decision point** — based on the user's clues, **read the related code briefly** with Grep and Read:
   - **If the root cause is obvious at a glance**, meaning you can point to `{file}:{line}`, the fix is only 1-2 small changes, and there is no cross-module impact risk → tell the user: "I can already see where the problem is. We can use the fast path: I will tell you the root cause and fix plan directly, you confirm, I fix it immediately, you verify it afterward, and we write only one `{slug}-fix-note.md`." If they agree, trigger `bt-issue-fix` in fast-track mode
   - **If not**, because there are multiple root-cause candidates, uncertainty remains, or more reproduction information is needed → use the standard path and write the full issue report. Once the standard path has started, do not re-decide the route later
4. **Determine the issue directory name** — agree on the slug with the user. Use today's date from `currentDate` as the date prefix. Create the directory if it does not exist. Even the fast path must have an issue directory, because `{slug}-fix-note.md` still lives there

---

## The Five Mandatory Questions

Ask them one by one in order. **Do not throw all 5 at once.** When users get a list all at once, they answer only the easiest items and skip the deeper ones. After each question, do one ambiguity check. If it fails, keep probing.

### 1. What is the problem? What symptom did you observe?

The expectation is a concrete failure symptom, such as "after clicking the submit button, a blank modal appears". That is a hundred times more useful than "the submit function has a problem".

Ambiguity signals include "it sometimes errors" or "it feels wrong" → ask "exactly when?" and "what exactly is wrong?"

Red line: **do not let the user describe the root cause**. If they say "it is probably because XXX", record the symptom only and leave root cause to stage 2.

### 2. How do you reproduce it?

The expectation is the minimum reproduction path: enter page XX → input YY → click ZZ → observe the problem.

Ambiguity signals include "reproduces inconsistently" or "sometimes yes, sometimes no" → ask for reproduction frequency and the difference in conditions. If it is truly unstable, record the known trigger conditions and reproduction rate.

"Cannot reproduce" is still a valid answer. Write "currently cannot reproduce stably; only observed once under condition X". Do not force fake steps.

### 3. Expected behavior vs actual behavior

The expectation is two separate statements:

- **Expected**: I thought that after doing A, B should happen
- **Actual**: but what actually happened was C

**Do not merge them into one sentence**. A sentence like "the button did not work normally" does not tell the analyst what "normal" was supposed to mean.

### 4. Environment information

Minimum collection: **which module or functional area it was found in**, and **related files or functions if the user knows them**.

Optional: operating system, browser version, runtime environment such as dev or prod, and whether related code changed recently.

If the user says "I do not know which file", write "TBD". Stage 2 will investigate it.

### 5. Severity and priority

- **P0 blocker**: core functionality is completely broken, affecting all users, must be fixed immediately
- **P1 serious**: core functionality is damaged but there is a workaround, should be fixed soon
- **P2 medium**: non-core functionality or impact on a small subset of users, fix within planned work
- **P3 minor**: UI flaws, edge cases, or places where there is simply a better implementation, fix when there is time

If the user is unsure, recommend one but let the user make the final call.

---

## Issue Report Template

```markdown
---
doc_type: issue-report
issue: {issue directory name}
status: active
severity: P0 | P1 | P2 | P3
summary: {one-line summary of the symptom}
tags: []
---

# {Short Problem Description} Issue Report

## 1. Problem Symptom

{specific abnormal behavior described by the user, symptom-only description, without root-cause speculation}

## 2. Reproduction Steps

1. {step 1}
2. {step 2}
3. observed: {problem symptom}

Reproduction frequency: {stable / probabilistic, about X% / currently cannot be reproduced stably}

## 3. Expected vs Actual

**Expected behavior**: {after doing A, B should happen}

**Actual behavior**: {but what actually happened was C}

## 4. Environment Information

- module / feature involved: {module name or feature description}
- related files / functions: {known file:line or "TBD"}
- runtime environment: {dev / staging / prod / unknown}
- other context: {OS, browser, recent changes, etc.; write "none" if there is nothing}

## 5. Severity

**{P0 / P1 / P2 / P3}** — {one-line reason}

## Notes

{optional: screenshot description, log snippets, etc.}
```

---

## Exit Conditions

- [ ] frontmatter is complete, including `doc_type=issue-report`, matching `issue`, non-empty `severity` and `summary`, and at least 1 tag
- [ ] all 5 questions have concrete answers, though related files in the environment section may still be `TBD`
- [ ] the problem symptom is a pure symptom description, with no mixed-in root-cause speculation
- [ ] expected and actual behavior are explicitly written separately
- [ ] reproduction steps are executable, or explicitly explained as "cannot reproduce stably"
- [ ] the user explicitly says "the report is good; move to the next step"
- [ ] frontmatter is updated to `status: done`

---

## After Exit

Tell the user: "The issue report is ready. Stage 2 is root-cause analysis. Trigger `bt-issue-analyze` next."

Following section 3 `issue-report` in `.bytetrue/reference/shared-conventions.md`, apply `.bytetrue/config.yaml` close-out behavior: in `manual`, give the tracker prompt and stop; in `auto`, skip tracker when local/never, prepare only a preview for `auto_preview`, and continue to `bt-issue-analyze` only if no tracker/write/ambiguity boundary is reached.

1. a reviewed bug issue (`status: done`) may need collaboration projection → "Do you want to sync or bind it to an external tracker? (`bt-tracker`)" Do not create or update an external issue before explicit user confirmation.

Do not start root-cause analysis on your own in `manual` mode. In `auto` mode, analysis may continue only after the report is complete and the next step has no `ask_before` boundary.

---

## Easy Pitfalls

- the user says "it might be a problem in XX" and you start discussing root cause with them — wrong, that is stage 2
- the reproduction steps are too vague, such as "do something in the UI", and you still let it pass — force executable steps out of it
- expected and actual are mixed into one paragraph — they must be written separately
- severity is left empty — give a default or write "none"
- all 5 questions are dumped at the user as a checklist at once — ask them one by one or the deeper details will be lost
