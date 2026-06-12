# bt-roadmap reference templates

`SKILL.md` keeps only the workflow skeleton. The concrete format lives here.

---

## 1. Main Document `{slug}-roadmap.md`

### 1.1 frontmatter

```yaml
---
doc_type: roadmap
slug: permission-system
status: active          # active | paused | completed
created: YYYY-MM-DD
last_reviewed: YYYY-MM-DD
tags: [permission, auth]
related_requirements: []    # list of related req slugs, may be empty
related_architecture: []    # list of related architecture doc slugs, may be empty
---
```

- `status`: `active` means in progress, `paused` means paused, `completed` means all items are `done`, `dropped`, or `archived`
- `related_requirements`: the req slugs involved in this larger demand, helping readers jump to "why this capability should exist"
- `related_architecture`: the architecture doc slugs that will be touched, helping readers understand "which parts of current state this will hit"

### 1.2 Body Sections

````markdown
# {Title of the larger demand — say directly what it is, no metaphor}

## 1. Background

One or two paragraphs explaining what it is and why it should be done. The target reader is someone new who wants to know what the team will be busy with in the next few months.

## 2. Scope and Explicit Non-goals

### Covered by this roadmap
- Capability A
- Capability B

### Explicitly not covered
- Capability X, with reason
- Capability Y, pointing to another roadmap or req

## 3. Module Split, conceptual design

Describe which modules or components it is split into and what each one does. A text tree or an ASCII box diagram is fine, plus one paragraph per module:

```text
{Large Demand Name}
├── Module A: {one-line responsibility}
├── Module B: {one-line responsibility}
└── Module C: {one-line responsibility}
```

### Module A · {name}
- **Responsibility**: {one or two sentences describing what it does and does not do}
- **Sub-features carried**: {slug-1, slug-2}
- **Existing code or modules touched**: {existing module X / brand new / rewrite of a certain module}

### Module B / C · ...

> If module splitting is unnecessary, for example a pure internal behavior change inside one existing module, explicitly write "This larger demand is completed inside the existing module {X}, without adding new modules or changing module boundaries", skip section 4, and go directly to section 5.

## 4. Inter-module Interface Contracts / Shared Protocols, detailed architecture layer

Define how the modules interact. This section becomes hard-constraint input for feature-design. **Write all the way down to function signatures, data structures, protocol fields, and error codes**. "The two sides will discuss it" or "TBD" is not allowed.

### 4.1 {interface / protocol name 1}

**Direction**: Module A → Module B
**Form**: HTTP API / function call / message event / shared database table / file protocol / ...

**Contract**:

```text
# HTTP API example:
POST /api/v1/permission/check
Request:  { user_id: str, resource: str, action: str }
Response: { allowed: bool, reason: str | null }
Errors:   400 invalid_input, 404 user_not_found, 500 internal

# Function signature example:
def check_permission(user_id: str, resource: str, action: str) -> PermissionResult
class PermissionResult: allowed: bool; reason: Optional[str]

# Event example:
event_type: permission.changed
payload: { user_id: str, role: str, changed_at: ISO8601 }
```

**Constraints**:
- the caller must ensure `user_id` is authenticated first
- in the response, `reason` must be `null` when `allowed=true`
- the event must be consumed idempotently

### 4.2 ...

### 4.x Shared Data Structures / State

When several modules share the same data structure, persistence, or global state, define it here once:

```text
{table schema / type definition / config schema}
```

> If there is no cross-module interface, such as a pure frontend style adjustment, explicitly write "This roadmap has no cross-module interfaces". It must not be left blank or written as "none yet".

## 5. Sub-feature List

Order by dependency and rollout sequence. Each item corresponds to one entry in `items.yaml`, and the two must stay synchronized.

1. **{slug}** — {one-line description}
   - module: {Module A / B / cross-module, explicitly naming which modules are involved}
   - dependencies: {list of prerequisite slugs / none}
   - status: {pending | active | done | dropped}
   - corresponding feature: {YYYY-MM-DD-{slug} / not started}
   - notes: {optional}

**Minimal loop**: after item {N} `{slug}` is done, {describe the narrowest end-to-end path that can run through}.

## 6. Scheduling Rationale

One short paragraph explaining why the split is done this way, by module, user value, risk, or dependency, why the first item was chosen as the minimal loop, and whether there are any sticking points in the middle, such as prerequisite architecture changes, external dependencies, or unresolved design decisions.

## 7. Observations

Things noticed during drafting or refreshing that this roadmap itself will not handle and should be decided by the user:

- `architecture/X.md` has an outdated description of Y; recommend a separate architecture update
- the boundary of `requirement-Z` conflicts with item 5 in this roadmap; recommend aligning the req first

## 8. Change Log, update mode only

- YYYY-MM-DD: {description of this change; if section 4 interface contracts changed, list "interface contract changes" and "affected already-started features" separately}
````

---

## 2. `items.yaml` Format

```yaml
roadmap: permission-system
created: YYYY-MM-DD

items:
  - slug: permission-rbac-core
    description: Base RBAC model and tables, providing role and permission tables plus the minimal query API
    depends_on: []
    status: pending             # pending | active | done | dropped
    feature: null               # fill YYYY-MM-DD-{slug} after the feature starts; null before that
    minimal_loop: true          # exactly one entry should be true
    notes: null                 # optional, remarks / special constraints / reason for drop

  - slug: permission-admin-ui
    description: The page where admins configure roles and permissions
    depends_on: [permission-rbac-core]
    status: pending
    feature: null
    minimal_loop: false
    notes: null
```

### Field Rules

- `slug`: the slug of the sub-feature, lowercase letters, digits, and hyphens; the future feature directory will be `YYYY-MM-DD-{slug}`
- `description`: one sentence that can stand alone and clearly say what it does
- `depends_on`: the list of prerequisite slugs; empty array means no dependency; every dependency must point to another item in the same roadmap
- `status`: a four-state machine
- `feature`: after the feature starts, fill the directory name, so acceptance can trace back to it
- `minimal_loop`: exactly one entry in the whole file should be `true`
- `notes`: dropped items must state a reason

### State Machine

```text
planned      → in-progress   (changed by feature-design when the feature starts)
in-progress  → done          (changed by feature-acceptance when it completes)
planned      → dropped       (changed by roadmap update when the user decides not to do it)
done / dropped are terminal states
```

**Illegal transitions**: `done` back to `in-progress`, because if the demand changes it should go through a new feature instead; `dropped` back to `planned`, because restoring it should add a new slightly modified slug instead.

### Validation

```bash
python .bytetrue/tools/validate-yaml.py --file .bytetrue/roadmap/{slug}/{slug}-items.yaml --yaml-only
```

---

## 3. Decomposition Checklist, questions to ask yourself while drafting

### Architecture-plan layer, ask these first

- [ ] Is the module split clear? Can each module's responsibility be stated in one sentence? Are the boundaries clear, what this module does and what it does not do?
- [ ] Are the interface contracts written all the way down to function signatures, data structures, protocol fields, and error codes? After reading them, can feature-design implement directly without coming back to ask again?
- [ ] Are shared data structures, persistence, and global state fully listed?
- [ ] If there is no cross-module interface, does section 4 explicitly say "no cross-module interface" rather than staying blank or saying "TBD"?

### Sub-feature decomposition layer

- [ ] Can each item independently complete one full feature workflow? If not, keep splitting or merge differently
- [ ] Can each item be verified independently after completion? Can you write "after it is done, {specific observable result}"?
- [ ] Does the slug conflict with an existing directory under `features/`? Have you grep-checked it?
- [ ] Is the "module" field filled? Does that module actually exist in section 3?
- [ ] Is each dependency backed by a concrete reason, for example "B depends on the specific artifact provided by A"?
- [ ] Is the minimal loop truly the narrowest end-to-end path, not just the easiest path?
- [ ] Is any item really a requirement change rather than a feature, for example "change the boundary of XX capability"? Those should go to `bt-req`

---

## 4. Review Prompt

> The roadmap draft is complete. Please review it as a whole. **Look at the architecture plan first, then the feature decomposition** — if the architecture plan changes, everything downstream must be reordered:
>
> **Architecture-plan layer**
> 1. Is the module split correct? Are the boundaries reasonable? Is anything over-split or under-split?
> 2. Are the interface contracts specific enough? Can feature-design implement directly from them, or are there still vague "the two sides will discuss it" gaps?
> 3. Are any shared data structures, protocol fields, or error codes missing?
>
> **Feature-decomposition layer**
> 4. Is the decomposition grain appropriate? Can each item really become an independent feature?
> 5. Is each item assigned to the correct module?
> 6. Are the dependency relationships correct? Are there missing prerequisites or unnecessary dependencies?
> 7. Is the minimal loop chosen correctly? After the first item is done, can it really demonstrate something end to end?
> 8. Are any explicit non-goals missing?
> 9. Does the scheduling order match your product priority?
>
> If you have changes, say them directly. After confirmation, the roadmap directory and `items.yaml` will be written to disk.
