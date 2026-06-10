# bt-brainstorm templates

This file contains only write-to-disk templates. `bt-brainstorm/SKILL.md` owns triage and conversation flow; read this file only when it is time to actually write a document.

## feature brainstorm template

Used for case 2. The path is `.bytetrue/features/{feature}/{slug}-brainstorm.md`.

```markdown
---
doc_type: feature-brainstorm
feature: YYYY-MM-DD-{slug}
status: confirmed
summary: One sentence describing the chosen direction
tags: [...]
---

# {Feature Name} Brainstorm

> Stage 0 | {YYYY-MM-DD} | Next: design

## What We Want to Do and Why
{starting point + key discoveries and turning points}

## Directions Considered

### Direction A: {name}

- description / value / cost
- conclusion: selected / rejected (reason)

### Direction B / C ...

## Design Points Already Settled
{specific design points already agreed during the discussion: library choice / schema / interface shape / technical constraints}
{mark each one as: confirmed / leaning / to be verified. Design can carry these forward directly without reopening the discussion}
{if the discussion never reached this level, delete the whole section instead of leaving it empty}

## Chosen Direction and Remaining Questions
{restate the chosen direction in 2-3 sentences + coarse-grained outline of the core behavior / what is clearly out of scope / biggest unknowns + questions left for design}
```

## open brainstorm template

Used for case 4. The path is `.bytetrue/brainstorms/{slug}/brainstorm.md`.

```markdown
---
doc_type: brainstorm
slug: {slug}
created: YYYY-MM-DD
status: active
summary: One sentence describing what this area needs to explore
tags: [...]
---

# {Topic Name}

> Idea space | {YYYY-MM-DD} | Next: bt-roadmap

## Starting Point
{what triggered this idea / what problem it is trying to solve / why it seems worth doing}

## Directions Discussed
{key turning points in the divergent discussion, candidate directions, and possibilities that were discussed; convergence is not required, keep the exploration trail}

## Current Leaning
{the current fuzzy direction after the discussion so far; this can be 2-3 directions still in play, each with one or two sentences}
{if things are already fairly clear, write "leaning toward direction X, with Y as the core"}

## Points Already Settled
{constraints, non-goals, analogies, or technical judgments that reached consensus during the discussion}
{delete this section if there is nothing yet}

## Remaining Questions & Next Step
{the biggest unknowns / assumptions that still need verification / points that roadmap should pay attention to}
```
