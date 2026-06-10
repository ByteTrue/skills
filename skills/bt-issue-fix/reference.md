# issue-fix reference templates

This file provides the fix report template, log-debugging scaffolding, and `{slug}-fix-note.md` templates used by `bt-issue-fix`.

## 1. Fix Report Template

```markdown
## Fix Report

### Which Files Were Changed
{git status output or file list}

### What Exactly Changed
- `{file}:{line}` — {change description; it used to be X, now it is Y}

### Did this touch files outside the analysis scope?
{yes / no}

### Did this introduce any new concept or structure not mentioned in the analysis?
{yes / no}

### Re-run the Reproduction Steps Once
{walk through the reproduction steps from section 2 of {slug}-report.md; does the result now match the expected behavior?}
```

## 2. Log-Debugging Escalation

When the fix does not take effect:

1. Declare that the current approach did not solve the problem
2. Determine where to add instrumentation
3. Obtain the logs
4. Analyze the logs and revise the root-cause hypothesis
5. Clean up the logging instrumentation

Temporary logs or instrumentation must carry a unique prefix, such as `[DEBUG-{slug}]`. Before committing, confirm cleanup with `grep`. If a formal log line is intentionally kept, the reason must be explained in the fix note.
6. Re-enter the fix flow with the revised root cause

If the root cause is still not located after two rounds of log debugging, recommend returning to `bt-issue-analyze`.

### User Prompt for Collecting Logs

```text
Please reproduce the issue using these steps and paste the logs:
1. {specific reproduction action}
2. Copy the output in the console or log file from [instrumentation marker A] to [instrumentation marker B]
```

## 3. `{slug}-fix-note.md` Standard Path Template

```markdown
---
doc_type: issue-fix
issue: {issue directory name}
status: confirmed
path: standard
fix_date: YYYY-MM-DD
related: [{relative path to slug-analysis.md}]
tags: []
---

# {Short Problem Description} Fix Record

## 1. Actual Solution Used

## 2. Changed Files List

## 3. Regression Coverage

- **New regression test**: {test file / test name / red→green evidence}
- **Reused existing test**: {test command / behavior covered}
- **No suitable seam**: {reason; whether follow-up `bt-refactor` or `bt-arch` is recommended}

## 4. Verification Result

## 5. Instrumentation Cleanup

- **Temporary instrumentation**: {none / yes, and what prefix it used}
- **Cleanup evidence**: {grep command or explanation}
- **Retained logs**: {none / yes, and the reason for keeping them}

## 6. Mini Post-mortem

What would prevent this kind of bug in the future: {tests / types / constraints / architecture seam / review checklist / other}

## 7. Follow-up Items
```

## 4. `{slug}-fix-note.md` Fast-Track Template

```markdown
---
doc_type: issue-fix
issue: {issue directory name}
status: confirmed
path: fast-track
fix_date: YYYY-MM-DD
tags: []
---

# {Short Problem Description} Fix Record

## 1. Problem Description

## 2. Root Cause

## 3. Fix Plan

## 4. Changed Files List

## 5. Regression Coverage

- **New regression test**: {test file / test name / red→green evidence}
- **Reused existing test**: {test command / behavior covered}
- **No suitable seam**: {reason; whether follow-up `bt-refactor` or `bt-arch` is recommended}

## 6. Verification Result

## 7. Instrumentation Cleanup

- **Temporary instrumentation**: {none / yes, and what prefix it used}
- **Cleanup evidence**: {grep command or explanation}
- **Retained logs**: {none / yes, and the reason for keeping them}

## 8. Mini Post-mortem

What would prevent this kind of bug in the future: {tests / types / constraints / architecture seam / review checklist / other}

## 9. Follow-up Items
```
