# Refactor Method Library (1): L1 Behavior-Equivalent Migration and L2 Code-Level Refactor

## L1 Behavior-Equivalent Migration

### M-L1-01 Parallel Change

- **Use when**: a function, interface, or data structure used in many places must be replaced, and changing it directly would hit too many callers
- **Do not use when**: it is only an internal function used in one place, in which case it can be changed directly
- **Steps**:
  1. create `newThing`, whose behavior is fully equivalent to `oldThing`, adding an adapter layer if needed
  2. migrate callers one by one to `newThing`, and run tests after each migration
  3. once `grep` proves that `oldThing` has zero remaining references, delete it
- **Risk points**: during step 2, newly added code may still call `oldThing`, causing migration gaps; add a deprecated marker or lint rule to prevent backflow
- **Validation**: run tests at each step, and after migration, grep confirms zero global references to `oldThing`
- **Frontend / backend**: generic
- **Matches which scan item**: a function or interface is called in N places and its signature or implementation needs to change

### M-L1-02 Strangler Fig

- **Use when**: a whole legacy module, or even an entire subsystem, must be replaced, but the old one cannot be deleted immediately and needs long-term coexistence
- **Do not use when**: it is a single function or small-scope change, use Parallel Change instead
- **Steps**:
  1. add a routing or proxy layer around the old module, still defaulting to the old implementation
  2. wire the new implementation in feature point by feature point, routing new points to the new implementation while old points still go to the old one
  3. migrate old feature points one by one, running full regression after each
  4. once everything is migrated, delete the old module and the routing layer
- **Risk points**: the routing layer becomes a permanent dependency; the new and old implementations may diverge in intermediate state, such as schema conflicts on a shared database
- **Validation**: run full regression after each migration; monitor call counts into the old module and confirm they gradually fall to zero
- **Frontend / backend**: generic, especially common in backend
- **Matches which scan item**: "this whole block of old logic needs to be replaced", but it cannot be cut over all at once

### M-L1-03 Branch by Abstraction

- **Use when**: a widely used low-level library, framework, or core data structure must be replaced
- **Do not use when**: the change affects only a local area
- **Steps**:
  1. insert an abstraction interface between the call site and the old implementation, and change callers to depend on that interface
  2. let the default implementation of the interface still point at the old implementation, and run tests to confirm behavior stays unchanged
  3. implement the new version behind the interface and switch through a feature flag or configuration
  4. after a stable observation period, delete both the old implementation and the abstraction layer
- **Risk points**: a badly designed abstraction leaks old-implementation details into the interface; feature flags are forgotten and never removed
- **Validation**: run tests at each step; compare outputs of new and old implementations during the transition
- **Frontend / backend**: generic
- **Matches which scan item**: a low-level dependency needs to be swapped, such as an HTTP client, ORM, or state-management library

### M-L1-04 Characterization Test

- **Use when**: legacy code has no tests and its behavior is not fully clear, but it must be changed now; this is a mandatory prerequisite before refactor
- **Do not use when**: the code is extremely simple, under 10 lines and branch-free, or already has sufficient tests
- **Steps**:
  1. feed a batch of real inputs into the target function, using sampled production logs if needed
  2. record the current outputs as test assertions — do not judge whether the behavior is "correct", only capture the current state
  3. run the tests, confirm they pass, and commit them
  4. run this suite after every later refactor step; any failure means behavior drift
- **Risk points**: the captured "current state" may include a known bug — if the point is to intentionally fix a bug, route to issue instead of refactor
- **Validation**: after refactor, all tests still passing proves behavior equivalence
- **Frontend / backend**: generic
- **Matches which scan item**: when pre-check #2 hits, use this method to add coverage first

---

## L2 Code-Level Refactor, Fowler classics

### M-L2-01 Extract Function

- **Use when**: there is a cohesive block inside a function that can be named, usually longer than 5 lines and with an independent responsibility
- **Do not use when**: the block is short, hard to name, or tightly coupled to the surrounding logic
- **Steps**:
  1. identify the block to extract and give it a name that clearly states what it does
  2. pass all external variables it uses as parameters, and return any values needed by the outer scope
  3. replace the original block with a function call
  4. run tests
- **Risk points**: too many parameters, more than 4, suggests coupling is too deep and may require M-L2-07 Introduce Parameter Object first; side effects that cross the boundary, such as reading or writing `this` or global state, can turn the "function" into a disguised procedure
- **Validation**: run unit tests
- **Frontend / backend**: generic
- **Matches which scan item**: long functions, high cyclomatic complexity, or a block inside a function that can be cleanly named

### M-L2-02 Inline Function

- **Use when**: the function body is clearer than the name, the function has become a wrapper only, or it is called very rarely
- **Do not use when**: the function is widely used
- **Steps**:
  1. find every call site
  2. replace each call site with the function body
  3. delete the function definition
  4. run tests
- **Risk points**: many call sites may expand into duplicated logic; recursive functions cannot be inlined
- **Validation**: run unit tests, and grep confirms zero references to the original function name
- **Frontend / backend**: generic
- **Matches which scan item**: empty wrapper function or an over-abstracted layer

### M-L2-03 Extract Variable / Replace Temp with Query

- **Use when**: a complex expression is hard to read, such as a long ternary or compound calculation, or the same calculation is used in multiple places
- **Do not use when**: the expression is already clear
- **Steps**:
  1. extract the complex expression into a named variable
  2. if the calculation is reused in multiple places, further extract it into a pure function, a query
  3. run tests
- **Risk points**: over-extraction causes variable clutter; when extracting into a query, ensure the logic is side-effect free
- **Validation**: run unit tests
- **Frontend / backend**: generic
- **Matches which scan item**: difficult long expressions or repeated calculations

### M-L2-04 Move Function

- **Use when**: the function uses more data from another class or module than from its current one, or the function's theme does not match the current module
- **Do not use when**: its current location is still the most natural one
- **Steps**:
  1. confirm that all dependencies of the function are reachable in the new location
  2. create the function in the new location, and during the transition either make the old location forward to it or replace all call sites directly
  3. after all callers are migrated, delete the original function
  4. run tests
- **Risk points**: the function cannot be moved directly if it depends on private state from the original location
- **Validation**: run tests, and grep confirms zero references left in the original location
- **Frontend / backend**: generic
- **Matches which scan item**: function placed in the wrong place or vague module responsibility

### M-L2-05 Decompose Conditional

- **Use when**: the bodies of `if / else` branches are long, and the conditional expression itself is also complex
- **Do not use when**: the branches are short and already clear
- **Steps**:
  1. extract the condition into a named function, for example `isEligibleForDiscount(user)`
  2. extract each branch body into its own named function
  3. leave the main body as a simple skeleton, `if (isX()) doA() else doB()`
  4. run tests
- **Risk points**: over-decomposition makes the call chain deeper
- **Validation**: run unit tests
- **Frontend / backend**: generic
- **Matches which scan item**: nested if-else or complex conditional logic

### M-L2-06 Replace Conditional with Polymorphism

- **Use when**: the same `type` or `status` field triggers similar switch or if-else dispatch in multiple places
- **Do not use when**: dispatch happens in only one place, or the set of types is unstable
- **Steps**:
  1. create a subclass or strategy object for each type, and move the original branch logic into the corresponding implementation
  2. change call sites to invoke the polymorphic method
  3. delete the original switch or if-else
  4. run tests
- **Risk points**: type explosion; on the frontend, excessive OO may be less clear than a lookup map
- **Validation**: run unit tests
- **Frontend / backend**: generic
- **Matches which scan item**: the same type field triggers switches in 3 or more places

### M-L2-07 Introduce Parameter Object

- **Use when**: a function has more than 4 parameters, or multiple functions share the same group of parameters
- **Do not use when**: parameters are few and unrelated
- **Steps**:
  1. group the related parameters into one object or struct
  2. change the function signature to accept that object
  3. update all call sites to construct and pass the object
  4. run tests
- **Risk points**: the object fields may drift from the fields actually used by the function, so unused fields get passed around
- **Validation**: run tests
- **Frontend / backend**: generic
- **Matches which scan item**: parameter explosion or repeated parameter bundles

### M-L2-08 Replace Nested Conditional with Guard Clauses

- **Use when**: a function begins with multiple layers of nested if statements checking boundaries or error conditions
- **Do not use when**: the conditions have real mutual exclusivity rather than just being guards
- **Steps**:
  1. rewrite each edge condition as "if not satisfied, return early"
  2. pull the main logic out of the nesting and back to the top level
  3. run tests
- **Risk points**: it changes the order of returns; if there is finally or cleanup logic, be careful
- **Validation**: run tests covering all boundary conditions
- **Frontend / backend**: generic
- **Matches which scan item**: deeply nested if checks

---
