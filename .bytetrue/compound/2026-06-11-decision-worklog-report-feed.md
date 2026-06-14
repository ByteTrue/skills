---
doc_type: decision
category: architecture
slug: worklog-report-feed
status: active
created: 2026-06-11
tags: [workflow, worklog, report-feed, handoff]
---

# Decision: Worklog Report Feed

## Context

ByteTrue already has formal artifacts for final truth: feature design and acceptance, issue reports and fix notes, roadmaps, requirements, architecture, and compound knowledge docs. These artifacts explain the durable result, but they do not always provide a chronological record of what happened across work intervals, what was verified, what was blocked, or what a future human/agent should read first.

Trellis journal showed the value of cross-session work memory, but directly copying per-developer raw journals would duplicate ByteTrue's existing artifact system and risk becoming a noisy chat log.

## Decision

ByteTrue adds a lightweight **worklog/report-feed** as a secondary work-record layer.

The shared contract lives in:

- `.bytetrue/reference/worklog-report-feed.md`
- `skills/bt-onboard/reference/worklog-report-feed.md`

The current project and new onboarded projects use:

- `.bytetrue/worklog/`
- `.bytetrue/worklog/YYYY-MM.md`
- split files such as `.bytetrue/worklog/YYYY-MM-02.md` before any markdown file exceeds the repository volume control

A worklog entry records concise work context:

- actor
- scope
- linked formal artifacts
- short summary
- commits or `pending same close-out`
- verification
- status
- next steps

Worklog entries are optional. Closeout workflows may offer a one-sentence worklog prompt, and the user can skip it immediately.

## Alternatives Considered

### Use `.bytetrue/compound/`

Rejected. Compound is for durable decisions, learnings, tricks, and explores. Worklog entries are chronological work records, not long-lived domain knowledge.

### Clone Trellis per-developer journals

Rejected. ByteTrue does not need a separate per-developer workspace hierarchy in v1. The first version is project-level and lightweight.

### Store raw chat transcripts

Rejected. Raw chat belongs to the assistant harness or Magic Context, not repo-level project documentation.

### Auto-export Magic Context or Pi sessions

Rejected. This feature is a workflow contract and optional closeout prompt only. Automatic session scraping, watchers, and CLI behavior are separate concerns.

### Make worklog mandatory

Rejected. Mandatory worklog would add process tax and duplicate formal artifacts. It should be useful when reporting, handoff, recovery, or audit matters.

## Consequences

- Worklog can support weekly reports, handoff, recovery background, and AI work audit.
- Formal artifacts remain the source of truth.
- Closeout flows can offer optional worklog entries before scoped commits.
- Monthly files must split before hitting the repository maintainer-only documentation guidance.
- No raw transcript storage, per-developer workspace clone, session scraper, watcher, or CLI is introduced.

## Related Documents

- `.bytetrue/features/2026-06-11-worklog-report-feed/worklog-report-feed-design.md`
- `.bytetrue/features/2026-06-11-worklog-report-feed/worklog-report-feed-acceptance.md`
- `.bytetrue/reference/worklog-report-feed.md`
- `.bytetrue/compound/2026-06-11-explore-trellis-journal-role.md`
- `.bytetrue/roadmap/ai-workflow-absorption/ai-workflow-absorption-roadmap.md`
