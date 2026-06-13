---
doc_type: learning
track: knowledge
status: active
date: 2026-06-11
slug: workflow-contracts-without-renumbering
component: bytetrue-feature-workflow
tags: [workflow-contract, feature-design, acceptance, behavior-delta]
---

# Add workflow contracts without breaking existing section mappings

## Background

During `behavior-delta-contract`, ByteTrue needed to absorb OpenSpec-style behavior deltas into feature design and acceptance. The existing acceptance skill depends strongly on feature design section numbering, so changing top-level section names or numbers would have created downstream drift.

## Guiding Principles

- Prefer adding a subsection under the existing owner section instead of renumbering top-level sections.
- If acceptance already maps to a design section, keep the new contract inside that mapped section.
- Sync both current project reference docs and `bt-onboard/reference/` templates in the same change.
- Add checklist source vocabulary when a new contract must be verified later.

## Why It Matters

Workflow documents act like APIs for future agents. A seemingly small section rename can break acceptance instructions, checklist extraction, and roadmap handoff assumptions. Keeping contracts additive preserves compatibility while still improving the workflow.

## When It Applies

Use this pattern when adding new ByteTrue workflow contracts such as behavior delta, risk mode, context manifest, review gate, or worklog records.

## Example

Behavior Delta was added as `### 3.2 Behavior Delta` under the existing acceptance contract section, while Delta Materialization was added inside acceptance report section 2. This preserved the existing top-level design and acceptance section mapping while adding a new verifiable contract.
