# ByteTrue Deep Dive

[Back to README](../README.en.md)

This document holds the longer workflow diagram, runtime tree, design philosophy, and near-term roadmap so the top-level README stays compact.

---

## Workflow at a glance

ByteTrue's skills are not a single linear pipeline — they are **layered + event-driven**:

```text
═══════════════════════════════════════════════════════════════════════
 Root entry · routing                              (callable any time)
───────────────────────────────────────────────────────────────────────
   bt ──▶ Introduce the system / route open-ended intent to a sub-skill
          (does nothing itself — only triages and points)
═══════════════════════════════════════════════════════════════════════
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        (not onboarded)  (onboarded)    (just want to learn)
         go to phase 0   jump to L1~4 / cross-cut    quick read
              │
              ▼
═══════════════════════════════════════════════════════════════════════
 Phase 0 · Onboard                            (runs once per project)
───────────────────────────────────────────────────────────────────────
   bt-onboard ──▶ Generate .bytetrue/ skeleton + release reference/, tools/
═══════════════════════════════════════════════════════════════════════
                              │
                              ▼
═══════════════════════════════════════════════════════════════════════
 Layer 1 · Long-lived archive (“what the system looks like now”)
───────────────────────────────────────────────────────────────────────
   bt-req   ──▶ .bytetrue/requirements/{slug}.md
   bt-arch  ──▶ .bytetrue/architecture/ARCHITECTURE.md
                                       └─ {type}-{slug}.md (subsystems)
═══════════════════════════════════════════════════════════════════════
                              │
                              ▼
═══════════════════════════════════════════════════════════════════════
 Layer 2 · Planning (“how we plan to deliver this big thing next”)
───────────────────────────────────────────────────────────────────────
   bt-roadmap ──▶ .bytetrue/roadmap/{slug}/
                  Turn “I want X” into a complete up-front plan:
                    ① High-level design — module / component split
                    ② Architectural detail — interface contracts / shared protocol
                    ③ Sub-features      — broken into executable units
                  ② is a hard input for feature-design
                  (Small needs skip this layer and go straight to L3)
═══════════════════════════════════════════════════════════════════════
                              │
                              ▼
═══════════════════════════════════════════════════════════════════════
 Discussion entry (optional · enter when fuzzy or when a plan needs grilling)
───────────────────────────────────────────────────────────────────────
                          ┌── case 1 clear enough ──▶ bt-feat-design
   bt-brainstorm ────────▶├── case 2 small + decided ─▶ feature flow
                          ├── case 3 big + ready ─────▶ bt-roadmap
                          └── case 4 needs grilling ──▶ bt-grill
                              │
                              ▼
═══════════════════════════════════════════════════════════════════════
 Layer 3 · Execution flows (pick one per event type)
───────────────────────────────────────────────────────────────────────

  ▸ Event: new capability                                  ┌──────────┐
       bt-feat-design ──▶ bt-feat-impl ──▶ bt-feat-accept  │ features │
       bt-feat-ff     ──(light lane, skips design/accept)─▶│ /YYYY-…/ │
                                                            └──────────┘

  ▸ Event: fix a defect                                     ┌──────────┐
       bt-issue-report ──▶ bt-issue-analyze ──▶ bt-issue-fix│  issues  │
                                                            │ /YYYY-…/ │
                                                            └──────────┘

  ▸ Event: code rot (beta)                                  ┌──────────┐
       bt-refactor / bt-refactor-ff                         │refactors │
                                                            │ /YYYY-…/ │
                                                            └──────────┘
═══════════════════════════════════════════════════════════════════════
                              │
                ▼ trigger any time something is worth recording ▼
═══════════════════════════════════════════════════════════════════════
 Cross-cut · Knowledge sink (compounding engineering)
───────────────────────────────────────────────────────────────────────
   bt-learn   ──▶ ┐
   bt-trick   ──▶ ├─▶ .bytetrue/compound/YYYY-MM-DD-{doc_type}-{slug}.md
   bt-decide  ──▶ │     doc_type ∈ { learning, trick, decision, explore }
   bt-explore ──▶ ┘
                   ↑
          Next bt-arch / bt-feat-design / bt-issue-analyze
          reads back compound/ so experience is reused
═══════════════════════════════════════════════════════════════════════
```

How to read the diagram:

- **Vertical = layers**, not strict time order
- **Layer 3 is event-driven**: new need → feature flow, bug → issue flow, rot → refactor flow
- **Cross-cut is the flywheel**: any flow can sink reusable knowledge and the next round reads it back

---

## Runtime structure

After `/bt-onboard`, a `.bytetrue/` directory appears at your project root — the aggregate root for all ByteTrue artifacts and the only workspace skills read/write at runtime.

```text
your-project/
├── .bytetrue/
│   ├── requirements/
│   │   └── {slug}.md
│   ├── architecture/
│   │   ├── ARCHITECTURE.md
│   │   └── {type}-{slug}.md
│   ├── roadmap/
│   │   └── {slug}/
│   │       ├── {slug}-roadmap.md
│   │       ├── {slug}-items.yaml
│   │       └── drafts/
│   ├── features/
│   │   └── YYYY-MM-DD-{slug}/
│   │       ├── {slug}-brainstorm.md
│   │       ├── {slug}-design.md
│   │       ├── {slug}-checklist.yaml
│   │       └── {slug}-acceptance.md
│   ├── issues/
│   │   └── YYYY-MM-DD-{slug}/
│   │       ├── {slug}-report.md
│   │       ├── {slug}-analysis.md
│   │       └── {slug}-fix-note.md
│   ├── refactors/
│   │   └── YYYY-MM-DD-{slug}/
│   ├── audits/
│   ├── compound/
│   │   └── YYYY-MM-DD-{doc_type}-{slug}.md
│   ├── tools/
│   └── reference/
│       ├── shared-conventions.md
│       ├── system-overview.md
│       ├── domain-context.md
│       └── project-management.md
└── AGENTS.md
```

Key points:

- All artifacts aggregate under `.bytetrue/`, so past feature / bug context is always close
- `requirements/` and `architecture/` are long-lived archives, while `roadmap/` is the planning layer
- `compound/` is the single knowledge sink directory
- `reference/` is copied in by `bt-onboard` and is the stable place for cross-skill conventions

---

## Design philosophy

ByteTrue deliberately moves away from agent-centric orchestration.

- Agent-orchestration systems usually want less human intervention over time
- ByteTrue treats the programmer as a first-class in-the-loop owner of the system

Software architecture should stay **evolvable**, **observable**, and **controllable**.

Even if stronger models remove some manual phases later, organizing requirements, architecture, design, issues, and durable knowledge still matters today.

---

## Near-term roadmap

- [ ] Keep hardening `bt-refactor` (still beta)
- [ ] Absorb collaboration finishers like review / PR finishing
- [ ] Keep improving the external-collaboration experience around `bt-tracker`
