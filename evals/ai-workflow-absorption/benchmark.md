# AI Workflow Absorption Skill Benchmark

## Scope

This is a lightweight skill-creator-style benchmark for PR #2. It evaluates whether the ByteTrue workflow skills and onboard templates now support the intended `ai-workflow-absorption` behavior compared with the old `origin/main` baseline.

This is a static artifact review benchmark, not a live multi-agent transcript benchmark. It is appropriate here because the PR mainly changes workflow contracts, skill instructions, shared references, and templates rather than deterministic runtime code. The benchmark evidence cites the changed artifacts and expected routing / closeout behavior; it should not be read as claiming that every prompt remains directly executable against the current project state after the roadmap has been completed.

## Evaluated prompts

See `../evals.json` for the five realistic prompts:

1. current roadmap status review / no pending item guard
2. feature implementation readiness
3. feature acceptance writeback
4. issue strict-evidence routing
5. onboard integrated template

## Results

| Configuration | Passed | Failed | Total | Pass rate |
|---|---:|---:|---:|---:|
| old_skill_baseline (`origin/main`) | 7 | 16 | 23 | 30% |
| pr_branch (`feat/onboard-template-rollout`) | 23 | 0 | 23 | 100% |

Note: the table is historical static-review evidence for the PR branch. The live prompt in `evals/evals.json` now guards the completed-roadmap state instead of trying to start a non-existent pending item; future live feature-design evals should use an isolated fixture with a pending roadmap item.

## Key improvements observed

- Feature design now carries Behavior Delta, execution mode, and context manifest expectations.
- Feature implementation now has explicit implementation review gate evidence before acceptance.
- Feature acceptance now reads check-context, materializes behavior delta, and still verifies independently.
- Issue workflows now have strict-evidence / break-loop vocabulary for high-risk debugging.
- Onboard templates now include the full shared reference set, worklog directory, reference parity maintenance rules, and a pure-skills README/package projection.

## Residual risks

- This benchmark does not measure live model triggering quality. It verifies that the artifacts contain the required workflow instructions and routing contracts.
- Future follow-up can run live agent trials against the same `evals/evals.json` prompts and attach transcript-based `with_skill` / `old_skill` outputs if a stronger empirical benchmark is desired.
