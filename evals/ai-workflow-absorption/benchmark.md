# AI Workflow Absorption Skill Benchmark

## Scope

This is a lightweight skill-creator-style benchmark for PR #2. It evaluates whether the ByteTrue workflow skills and onboard templates now support the intended `ai-workflow-absorption` behavior compared with the old `origin/main` baseline.

This is a static artifact review benchmark, not a live multi-agent transcript benchmark. It is appropriate here because the PR mainly changes workflow contracts, skill instructions, shared references, and templates rather than deterministic runtime code. The benchmark evidence cites the changed artifacts and expected routing / closeout behavior.

## Evaluated prompts

See `../evals.json` for the five realistic prompts:

1. roadmap-backed feature design
2. feature implementation readiness
3. feature acceptance writeback
4. issue strict-evidence routing
5. onboard integrated template

## Results

| Configuration | Passed | Failed | Total | Pass rate |
|---|---:|---:|---:|---:|
| old_skill_baseline (`origin/main`) | 6 | 17 | 23 | 26% |
| pr_branch (`feat/onboard-template-rollout`) | 23 | 0 | 23 | 100% |

## Key improvements observed

- Feature design now carries Behavior Delta, execution mode, and context manifest expectations.
- Feature implementation now has explicit implementation review gate evidence before acceptance.
- Feature acceptance now reads check-context, materializes behavior delta, and still verifies independently.
- Issue workflows now have strict-evidence / break-loop vocabulary for high-risk debugging.
- Onboard templates now include the full shared reference set, worklog directory, reference parity maintenance rules, and README/package projection for the optional Pi runtime breadcrumb.

## Residual risks

- This benchmark does not measure live model triggering quality. It verifies that the artifacts contain the required workflow instructions and routing contracts.
- Future follow-up can run live agent trials against the same `evals/evals.json` prompts and attach transcript-based `with_skill` / `old_skill` outputs if a stronger empirical benchmark is desired.
