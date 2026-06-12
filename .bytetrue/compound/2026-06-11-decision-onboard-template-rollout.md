---
doc_type: decision
category: architecture
slug: onboard-template-rollout
status: active
created: 2026-06-11
tags: [onboard, templates, reference-parity, install-projection]
---

# Decision: Onboard Template Rollout and Reference Parity

## Context

The `ai-workflow-absorption` roadmap added several shared workflow contracts: behavior delta, execution modes, implementation review, context manifest, subagent handoff, research-first, and worklog/report-feed.

Each feature updated its own affected skills and references, but a final distribution pass was needed to prove new projects receive the integrated set through `bt-onboard`, and that installation projections accurately describe the package after runtime adapters were deferred out of core.

## Decision

ByteTrue treats `skills/bt-onboard/reference/` as the package-managed publication surface for shared workflow references. Current project `.bytetrue/reference/` may intentionally differ for localization or project-owned configuration, so maintenance uses a reference parity audit rather than blind copy.

Reference parity categories are:

- **managed identical**: shared contract files must match current and onboard copies exactly, such as execution modes, implementation review, context manifest, subagent handoff, research-first, and worklog report-feed.
- **managed localized/current-specific**: content may differ for local readability or current-project phrasing while preserving the same contract, such as current Chinese system overview versus onboard English template.
- **project-owned**: `domain-context.md` and `project-management.md` must not be overwritten without explicit confirmation.

The final rollout also requires install projections to be accurate:

- `package.json` must expose `pi.skills`; runtime adapters stay outside the core skill bundle unless planned separately.
- README must keep the Pi package install described as skills-only unless a future runtime-adapter feature explicitly changes that.
- Claude plugin metadata must remain valid and must not claim hook behavior unless a packaged hook path is verified.

## Alternatives Considered

### Blindly copy onboard references into the current project

Rejected. That would overwrite localized/current-specific docs and risks destroying project-owned `domain-context.md` or `project-management.md`.

### Require byte-for-byte equality for all references

Rejected. Some current files are intentionally localized or project-specific. Equality is required for managed contract files, not for every reference file.

### Treat rollout as a release process

Rejected. Publishing packages, tags, external tracker sync, marketplace publication, and pushes require separate explicit approval and are outside feature acceptance.

### Leave README unchanged

Rejected. ByteTrue core remains skills-only; install docs should not imply runtime adapters are part of the core package.

## Consequences

- New onboarded projects receive the full integrated reference set, including worklog/report-feed contracts.
- Future maintainers have a clear rule for distinguishing true drift from intentional reference differences.
- Package/plugin metadata and README install docs are consistent with current repository state.
- No new workflow behavior, CLI, release, tag, push, marketplace command, or external sync is introduced by rollout.
- The `ai-workflow-absorption` roadmap can be marked done once this feature is accepted.

## Related Documents

- `.bytetrue/features/2026-06-11-onboard-template-rollout/onboard-template-rollout-design.md`
- `.bytetrue/features/2026-06-11-onboard-template-rollout/onboard-template-rollout-acceptance.md`
- `.bytetrue/reference/maintainer-notes.md`
- `skills/bt-onboard/reference/maintainer-notes.md`
- `.bytetrue/roadmap/ai-workflow-absorption/ai-workflow-absorption-roadmap.md`
