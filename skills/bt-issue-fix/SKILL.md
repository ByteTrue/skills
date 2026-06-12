---
name: bt-issue-fix
description: 'Stage 3 of the issue workflow. Apply a pinpoint fix based on the confirmed root cause and plan, verify it, and archive the result in `{slug}-fix-note.md`. There are two entry points: the standard path comes from analyze, and the fast path comes directly from report. Trigger when the user says "start fixing the bug", "fix it according to the analysis", or "go change the code". Only touch files declared by the plan. Do not optimize adjacent things along the way.'
---

# bt-issue-fix

## Read Before Starting

Before making any judgment or taking any action, read `.bytetrue/attention.md` first; if it is missing, treat the skeleton as incomplete and tell the user to fill it in or run `bt-onboard`.

The root cause and fix plan are already determined. In the standard path this happened in analysis, and in the fast path it was confirmed verbally during report. Your job is to change the code according to that plan, verify the result, and write down the fix record.

The easiest way for the fix stage to go wrong is not the code change itself, but the **"while I'm here" impulse** that appears during the change: while I'm here, optimize this; while I'm here, refactor that; while I'm here, add an abstraction. Each item can sound reasonable on its own, but together in a single PR they make it impossible for other people to tell what was changed for the bug itself.

> For shared paths and naming conventions, see section 0 of `.bytetrue/reference/shared-conventions.md` and the "where the files go" section in `bt-issue`.

---

## Two Entry Paths

### Standard Path, with analysis

1. **The plan is confirmed** — read the analysis, confirm `doc_type=issue-analysis` and `status=done`, and identify which plan the user selected in section 5
2. **Read the full context**: the full analysis, the full report, all code locations identified in section 1 of the analysis, `.bytetrue/attention.md`, and search the archival directory:
   - `python .bytetrue/tools/search-yaml.py --dir .bytetrue/compound --filter doc_type=trick --filter status=active --query "{keyword}"` — confirm the fix approach does not violate existing library usage or established patterns
   - the same command with `--filter doc_type=explore` — confirm the fix point does not conflict with existing evidence
3. **Confirm the starting point** — tell the user "I will modify {file list} according to plan X and start the fix", and wait for their confirmation before touching code

### Fast Path, no analysis, triggered directly from report

When entering through this path, the AI already read the code during report and is confident about the root cause.

1. **State the root cause explicitly**: "`{file}:{line}` contains {specific code}, which has {problem description}", and let the user confirm that the root-cause judgment is accurate
2. **Give the fix plan** — what will be changed and how, in one or two sentences, without writing a full analysis document
3. **Wait until the user explicitly says "yes, change it that way" before acting** — "I think it's right, so I changed it" is not allowed
4. Read `.bytetrue/attention.md`
5. **Search the archival directory as a supplement** — even fast path must check `compound/` once, both trick and explore, to avoid mistaking a known boundary condition for a new issue

---

## Constraints During Implementation

### Only change files declared in analysis

The fix scope comes from the "impact surface" in the recommended plan of section 5 in the analysis. Files outside that scope, no matter how tempting, **must not be changed**.

If you find something worth fixing outside the scope, record it as a "while here I noticed" item and do not change the code:

```markdown
> While here I noticed: {file:line} {short problem summary}. It is outside the scope of this fix and can be handled as a separate issue later.
```

Why this is strict: changes made "while here" are not in the analysis, acceptance cannot line them up, and `git blame` cannot tell which changes were actually for this bug.

### Keep the change minimal

The fix must target only the root cause. **Do not introduce new abstractions, new interfaces, or new patterns**. If you discover that "to fix this cleanly, X needs to be refactored first", stop and confirm with the user whether that refactor should happen inside this issue or be split into separate work.

Why: bug fixes are naturally narrow in scenario. Adding a new abstraction means it is supported by only this one use site, which is the classic case of premature abstraction.

### Code-quality reflection check

Bug fixes often look small, but the AI can still drift while writing them: stuffing another special case into a big file, adding another method into a large class, or adding `if` branches just to get around an edge case. See section 7 of `.bytetrue/reference/shared-conventions.md` for the reflection checks.

`issue-fix` is more conservative than `feature-implement`: **when reflection signals are triggered and the conclusion is "this should be split", the default is not to do that split inside this PR**. Record it as a "while here I noticed" item under the minimal-change rule. The only exception is when "without splitting, this bug cannot be fixed cleanly". In that case, stop and confirm with the user: "the prerequisite for fixing this bug cleanly is {refactor action}; should it be included here or split out separately?"

### Prefer a regression seam

If analysis or the fast-path judgment says there is a suitable behavior seam, prefer writing a failing regression test before the fix. Rules:

- test the public interface or observable behavior, not private implementation details
- choose the highest seam and the seam closest to user behavior; do not add low-level test-only interfaces for convenience
- first confirm the test reproduces the bug, red, and then write the minimum fix that makes it pass, green
- before the regression test turns green, do not refactor; while the test is red, only make the minimum change needed to pass it; code cleanup is allowed only after all relevant tests are green
- if there is no suitable seam, do not force a fragile test. Explain the reason in `{slug}-fix-note.md`, and optionally record the "missing seam" as a candidate follow-up for `bt-refactor` or `bt-arch`

For simple bugs, pure configuration, or pure copy changes, a regression test may be omitted, but the verification result must explain what evidence replaced it.

If the confirmed analysis or fast-path plan records `execution_mode.level: strict-evidence`, the regression seam and fresh verification are mandatory unless the fix note explains why no seam exists. If it records `break-loop`, do not continue normal fixing; stop and return to issue analysis, grill, refactor, or roadmap discussion before another patch attempt.

### Report after every completed change

Use the fix report template in `reference.md` in the same directory. **Vague status reports are not allowed.** After the report, stop and wait for the user to reply.

---

## Verification Checklist

After the fix is in, check each of these:

- [ ] **reproduction-step verification** — walk through section 2 of the report and confirm the issue no longer appears
- [ ] **expected-behavior verification** — what section 3 of the report calls the expected behavior now truly happens
- [ ] **impact-surface regression** — for every potentially affected module in section 4 of the analysis, run the most basic smoke path once
- [ ] **browser verification for frontend changes**, if applicable — execute the hard requirement from `.bytetrue/attention.md`; typecheck alone is not enough
- [ ] **related tests pass** — if tests cover the changed area, run them
- [ ] **regression coverage** — if there is a suitable seam, write the failing regression test first and then fix; if there is no seam, explain why in the fix note

---

## If the Fix Does Not Work: Escalate to Log Debugging

If you finish the checklist and **the problem still reproduces** or the behavior still does not match the expectation, **do not keep trial-and-erroring on the old guess**. Switch to log-debugging mode and collect runtime evidence again; after 2-3 failed fix attempts, treat the situation as `break-loop` and question the plan or architecture before another patch.

Why switch: repeated trial and error is still guessing under the original hypothesis. If the original hypothesis was wrong, more guessing only loops. Logs force you to see the real runtime data, which often makes the incorrect assumption obvious immediately.

See `reference.md` in the same directory for the log-debugging steps, the user prompt for collecting logs, and the loop limit.

Constraints for logs and instrumentation:

- temporary logs must carry a unique prefix such as `[DEBUG-{slug}]` so they can be cleaned with grep
- for performance issues, prefer baseline, profiler, or query plan; do not guess from ad hoc logging
- before committing the fix, grep the prefix and confirm the temporary logs are gone; if a formal log is intentionally kept, the reason must be explained

---

## Write `{slug}-fix-note.md`

After verification passes, create `{slug}-fix-note.md` in the issue directory, location defined in the "where the files go" section of `bt-issue`, and record the full closure. Both the standard-path template and fast-path template are in `reference.md` in the same directory.

The completed state of the fix note is always `status: done`. Do not leave it at `active`; `active` means the fix record has not completed review or verification, which will make later `bt-issue` runs think the workflow is still open.

The fix note must additionally record:

- regression coverage: which test was added, or which existing test was reused, or why there was no suitable seam
- instrumentation cleanup: whether temporary logs, debugger, or profiler instrumentation were used, and how cleanup was confirmed
- mini post-mortem: what should prevent this class of bug in the future, such as tests, types, constraints, architecture seams, or review checklists

---

## Exit Conditions

- [ ] all changed files have either been committed or listed clearly
- [ ] the full verification checklist is checked off
- [ ] `{slug}-fix-note.md` has been created and fully filled
- [ ] the fix note frontmatter is `status: done`
- [ ] regression coverage or the reason for no seam has been written into the fix note
- [ ] temporary instrumentation has been cleaned, or the reason for keeping it is explicitly written
- [ ] the mini post-mortem has been written into the fix note
- [ ] there are no unhandled "while here I noticed" items, meaning they all went into the follow-up issue list
- [ ] there are no out-of-scope changes, or the user explicitly approved them
- [ ] the user has explicitly confirmed that the fix is complete

---

## Close-Out Commit

Follow the "scoped-commit" rules in section 4 of `.bytetrue/reference/shared-conventions.md`. At this stage:

- **commit scope**: the fix code, `{slug}-fix-note.md`, and any report or analysis files updated together this time
- after the fix closes the loop, tell the user "fix verification is complete and `{slug}-fix-note.md` has been written", then immediately ask whether they want a commit

---

## After Exit

Tell the user: "The issue fix is complete and the workflow is closed. Report, analysis, and fix-note have all been archived."

Following section 3 `issue-fix` of `.bytetrue/reference/shared-conventions.md`, apply `.bytetrue/config.yaml` close-out behavior: in `manual`, ask one sentence for each suggestion below; in `auto`, continue only through deterministic non-boundary suggestions that do not match any current `workflow.ask_before` operation key and do not require user choice.

1. if this exposed a reusable pitfall → "Do you want to capture it as learning? (`bt-learn`)"
2. if this surfaced a long-term constraint, convention, or technical decision → "Do you want to archive the decision? (`bt-decide`)"
3. if this fixed bug issue needs collaboration-state projection → "Do you want to update, bind, or request closure on the external tracker? (`bt-tracker`)" If it was never bound before, sync can still be added. With `auto_preview`, the preview may be prepared automatically; external writes still follow current `workflow.ask_before` and `bt-tracker` confirmation rules.
4. if this bug exposed a project-wide hard constraint, command pitfall, or environment setup that can be explained in one or two lines and should be known at every ByteTrue startup → "Do you want to record it in attention.md? (`bt-note`)"
5. if a concise work record would help reporting, handoff, or recovery → "Do you want to add a concise worklog/report-feed entry for this fix?" (`.bytetrue/reference/worklog-report-feed.md`)
6. finally ask whether they want you to commit it. If they agree, execute according to the close-out commit rules and current `workflow.ask_before`

Recommendation: put the issue-directory files and code changes in the same commit for traceability. Handle "while here I noticed" items through a separate `bt-issue-report`, not inside this PR.

If, during fixing, you discover that the real problem is missing functionality rather than a bug, suggest opening `bt-feat` separately rather than quietly building a new feature inside the issue workflow.

---

## Easy Pitfalls

- declaring "fixed" without running the verification checklist
- casually changing code outside the analysis scope
- introducing a new abstraction or interface as part of the fix without stopping to confirm
- declaring completion without creating `{slug}-fix-note.md`
- finding a regression problem in the impact surface and writing "minor enough to ignore" — it must be fixed cleanly
- reporting frontend changes as passed based only on typecheck
- ending the workflow before the user explicitly says the fix is complete
- if the fix does not work, continuing trial-and-error on the original hypothesis instead of switching to log debugging
- forgetting to clean temporary logs after log-debugging and then committing them
- skipping a regression test even though a suitable seam exists, and failing to explain why
- forgetting to grep-clean the temporary debug prefix
- writing only "fixed" in the fix note, without regression coverage or mini post-mortem
- refactoring while the regression test is still red — go green first, then refactor, then rerun the tests
- forgetting to ask at close-out whether the user wants a commit
- running `git commit` without explicit user agreement
