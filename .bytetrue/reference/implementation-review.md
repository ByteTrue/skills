# ByteTrue Implementation Review

This reference defines the gate between `bt-feat-impl` and `bt-feat-accept`.
It does not replace acceptance. It only proves that implementation has reviewed readiness before asking the user to proceed.

## Gate Shape

Use this shape in implementation completion reports:

```yaml
implementation_review:
  spec_compliance:
    status: passed | failed
    evidence: []
  code_quality:
    status: passed | failed
    evidence: []
```

## Ordered Reviews

### 1. Spec Compliance Review

Run this first. If it fails, code quality cannot pass yet.

Required checks:

- behavior deltas are satisfied or explicitly marked not applicable
- acceptance scenarios have evidence
- no extra behavior was added outside the approved design
- explicit non-goals are guarded by grep, tests, type checks, or manual evidence
- plan-external file changes are absent, or the design was updated and approved

If spec compliance fails because the design is wrong or incomplete, return to design rather than patching silently.

### 2. Code Quality Review

Run this only after spec compliance passes.

Required checks:

- fresh verification evidence exists
- no debug, temporary, or instrumentation code remains unless explicitly planned
- no unplanned refactor or while-here improvement was secretly included
- reflection checks were handled or recorded as follow-up
- naming and module boundaries match the design terminology

## Completion Report Section

Add this section to the implementation completion report:

```markdown
### Implementation Review Gate

**Spec compliance**: passed / failed
- behavior deltas satisfied: ...
- acceptance scenarios have evidence: ...
- no extra behavior outside design: ...
- explicit non-goals guarded: ...

**Code quality**: passed / failed
- fresh verification: ...
- no debug/temp code: ...
- no unplanned refactor: ...
- reflection checks handled: ...
- naming and module boundaries consistent: ...
```

## Rules

- Spec compliance must pass before code quality is meaningful.
- Inline review is mandatory; subagent review is optional future enhancement.
- Acceptance still verifies independently and may reject a passed implementation review.
- Missing review evidence sends the feature back to implementation.
