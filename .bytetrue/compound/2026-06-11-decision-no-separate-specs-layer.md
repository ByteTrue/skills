---
doc_type: decision
category: architecture
date: 2026-06-11
slug: no-separate-specs-layer
status: active
area: bytetrue-workflow
tags: [bytetrue, specs, delta, source-of-truth, workflow-integration]
---

## Background

ByteTrue is absorbing useful mechanisms from OpenSpec, Superpowers, and Trellis. OpenSpec's strongest mechanism is its current-behavior `specs/` layer plus change delta/archive flow. ByteTrue already has a layered source-of-truth model: `requirements/` for capability vision, `architecture/` for current implementation structure, `features/` for one concrete change, `roadmap/` for multi-feature planning, and `compound/` for durable decisions and learnings.

## Decision

Do not add a new `.bytetrue/specs/` behavior-fact layer.

When absorbing OpenSpec-style delta/archive ideas, integrate them into the existing ByteTrue lifecycle instead:

- feature or roadmap artifacts may describe expected behavior deltas for the current change;
- acceptance materializes confirmed outcomes back into the existing ByteTrue layers, such as `requirements/`, `architecture/`, `compound/`, and the feature acceptance report;
- `.bytetrue/` remains the canonical source of truth, but its existing layers keep their current responsibilities.

## Rationale

A new `specs/` layer would compete with ByteTrue's existing split between capability vision, current architecture, per-feature change records, and durable decisions. That would make later agents ask whether a behavior belongs in `requirements/`, `architecture/`, `features/`, or `specs/`, increasing ambiguity instead of reducing it.

The valuable part of OpenSpec is the delta/archive discipline, not the exact directory name. ByteTrue can absorb that discipline while preserving its current document ownership model.

## Alternatives Considered

### Add `.bytetrue/specs/`

Rejected. It would mirror OpenSpec more directly, but it would introduce a second current-behavior source of truth that overlaps with `requirements/` and `architecture/`.

### Ignore OpenSpec delta/archive entirely

Rejected. Delta/archive is useful for making behavior changes explicit and for preventing acceptance from becoming only a conversational report.

## Consequences

Future workflow improvements should phrase OpenSpec-inspired work as lifecycle additions, such as behavior delta sections, acceptance writeback rules, validation checks, or context manifests. They should not introduce a parallel top-level facts directory unless this decision is superseded.

Roadmap planning for OpenSpec/Superpowers/Trellis absorption should treat this decision as a hard constraint.