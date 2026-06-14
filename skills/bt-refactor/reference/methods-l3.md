# Refactor Method Library (2): L3 Structural Splitting

## L3 Structural Splitting

### M-L3-01 Component Split, container / presentation

- **Use when**: one component is visibly oversized, handles data fetching, state management, and rendering at the same time, or props are exploding
- **Do not use when**: the component is already small, or the child components would have no independent meaning after splitting
- **Steps**:
  1. identify which part of the component is "data orchestration", the container, and which part is "pure rendering", the presentation part
  2. extract the presentation part into an independent child component that receives data and event callbacks through props
  3. let the container component keep only data fetching, state, and prop wiring
  4. verify one by one that the child components can render independently
- **Risk points**: props are still passed too deeply, props drilling; or the boundary between child and container remains unclear, causing props to keep exploding
- **Validation**: the child component can render independently in Storybook or in a test environment, and the overall interaction behavior stays unchanged
- **Frontend / backend**: frontend-specific
- **Matches which scan item**: oversized component or a component with mixed responsibilities

### M-L3-02 Extract Composable / Custom Hook

- **Use when**: a component contains a block of state plus side-effect logic, such as form validation, data fetching, local caching, or keyboard binding, that can be reused across multiple components or tested independently
- **Do not use when**: the logic is strongly coupled to one component, or it is used in only one place and is not growing
- **Steps**:
  1. identify one cohesive block of reactive state plus side effects
  2. extract it into an independent file, `use{Name}.ts` for both Vue and React
  3. make configuration the input, and state plus operation methods the return value
  4. change the component to call the composable or hook
  5. write unit tests for the composable or hook, pure JS side, without mounting the component
- **Risk points**: the boundary is not clean, so the component and the composable still share state implicitly; lifecycle cleanup inside `onMounted` or `useEffect` does not move correctly
- **Validation**: component behavior stays unchanged and the composable unit tests pass
- **Frontend / backend**: frontend-specific, Vue composable or React hook
- **Matches which scan item**: a self-contained logic block inside a component, or similar logic appearing in multiple components

### M-L3-03 State Lifting / Lowering

- **Use when**: state lives at the wrong level — lifting means state shared by multiple sibling components currently lives in each child's local state; lowering means state used by only one child currently lives in the parent or in global state
- **Do not use when**: the current state location is already the lowest common ancestor
- **Steps**:
  1. map the read and write points of the state
  2. find the lowest common ancestor of all the read and write points
  3. move the state to that LCA, then pass it down and events back up through props, context, or events
  4. rerun interaction verification
- **Risk points**: moving it to the wrong level widens the render scope; abusing context hurts performance
- **Validation**: interaction behavior stays unchanged, and React DevTools or Vue DevTools show the expected render scope
- **Frontend / backend**: frontend-specific
- **Matches which scan item**: the same state duplicated across multiple components, or global store holding fields used in only one place

### M-L3-04 Service Layer Extraction

- **Use when**: controller or route handlers directly contain business logic, validation, multi-table queries, or external calls, making the code longer and harder to test
- **Do not use when**: it is an extremely simple CRUD pass-through
- **Steps**:
  1. create a `services/` directory and a service class or module for the business domain
  2. move the business logic from the controller into service methods
  3. leave the controller with only request parsing → service call → response assembly
  4. write unit tests for the service methods without spinning up HTTP
- **Risk points**: the service becomes yet another "does everything" class; transaction boundaries remain unclear
- **Validation**: HTTP-layer integration tests stay unchanged and the service unit tests pass independently
- **Frontend / backend**: backend-specific
- **Matches which scan item**: fat controllers or business logic stuck in routes

### M-L3-05 Repository Extraction

- **Use when**: service code writes SQL directly or calls ORM directly, and the same queries are repeated in multiple places
- **Do not use when**: this is only a script or a prototype
- **Steps**:
  1. create a Repository for the entity and encapsulate all DB access, CRUD plus common queries
  2. change the service layer to depend on the Repository
  3. make testing able to swap in an in-memory implementation or a mocked Repository
- **Risk points**: the Repository turns into a generic DAO bag and loses business meaning; transactions become complicated across Repository boundaries
- **Validation**: integration tests pass, and service-layer tests can use a mocked Repository
- **Frontend / backend**: backend-specific
- **Matches which scan item**: scattered DB access inside services

### M-L3-06 Layer Rectification

- **Use when**: established layering is violated, controller calling DB directly, view calling service, model calling view
- **Do not use when**: the project has no explicit layering convention yet; define the layering first through decisions
- **Steps**:
  1. confirm the project's layering convention, relying on records in decisions
  2. find every violation point
  3. migrate each violation point into the correct layer using Parallel Change, M-L1-01
  4. add lint rules or code-review checks to prevent drift back
- **Risk points**: the blast radius is large, so it is usually better split across multiple refactors; during coexistence it is easy to end up with two paths
- **Validation**: static analysis or dependency graphs show no violations
- **Frontend / backend**: common in backend, but also applies to frontend
- **Matches which scan item**: cross-layer dependencies, and when pre-check #3 hits, prefer routing to architecture first

### M-L3-07 Single Responsibility Split

- **Use when**: one class or module carries more than 2 unrelated responsibilities
- **Do not use when**: the responsibilities are still tightly related
- **Steps**:
  1. list every method in the current class and group them by "what kind of reason would cause this method to change"
  2. split the groups into multiple classes, one responsibility per class
  3. if the original class still needs to exist, convert it into a coordinator that composes the new classes
  4. migrate call sites
- **Risk points**: oversplitting causes object explosion; deciding the groups is subjective, so two people may split it differently
- **Validation**: each new class passes its unit tests independently, and the original external behavior stays unchanged
- **Frontend / backend**: generic
- **Matches which scan item**: Managers, Helpers, or Utils that try to do everything

---
