# Refactor Method Library (3): L4 Performance and Async + Usage Cheat Sheet

## L4 Performance and Async

### M-L4-01 Memoization

- **Use when**: a pure computation is repeatedly executed with the same input, or a derived value used during rendering is recomputed every time
- **Do not use when**: the computation is already very cheap, or the input space is huge so caching misses plus memory cost outweigh the gain
- **Steps**:
  1. identify the pure computation point, meaning no side effects and output depends only on input
  2. use `computed` in Vue, `useMemo` or `React.memo` in React, or hand-written memoization in plain JS
  3. run a benchmark before and after to compare
- **Risk points**: misclassifying a non-pure function as pure; unstable cache keys causing permanent misses; large-object cache leaks
- **Validation**: behavior stays unchanged, and performance indicators, CPU or render count, go down
- **Frontend / backend**: generic, though performance cases are more common on the frontend
- **Matches which scan item**: repeated computation, or every parent render causes child rerenders

### M-L4-02 Batching

- **Use when**: high-frequency small operations create too much total cost, such as one DB write at a time, one event emission at a time, or one render at a time
- **Do not use when**: a single operation is already cheap enough, or the scenario is latency-sensitive, because batching introduces delay
- **Steps**:
  1. add a buffer layer between producing the operation and executing it
  2. trigger batch execution by time window or capacity
  3. change call sites from "do one thing now" to "push into queue"
- **Risk points**: higher latency; failure handling becomes more complex, such as what happens when only some items in the batch fail; memory pressure
- **Validation**: throughput improves, latency remains acceptable, and failure handling is covered
- **Frontend / backend**: generic
- **Matches which scan item**: IO inside loops or very high-frequency event emission

### M-L4-03 Lazy Loading / Code Splitting

- **Use when**: the initial bundle is too large, or certain pages or components are used only on specific paths
- **Do not use when**: the content is core and needed immediately by all users
- **Steps**:
  1. identify modules that can load later, by route, by component, or by feature
  2. switch them to dynamic import, `() => import(...)`, or route-level bundle splitting
  3. add loading or fallback UI
  4. use the build analyzer to confirm the effect
- **Risk points**: flicker during switching; slow loading on poor networks; over-splitting increases request count
- **Validation**: the initial bundle size goes down, and the delayed-loaded feature still works normally
- **Frontend / backend**: frontend-specific
- **Matches which scan item**: large bundle, or infrequently used modules being eagerly loaded

### M-L4-04 N+1 Query Elimination

- **Use when**: the code performs one query per record inside a loop, an N+1 problem
- **Do not use when**: the record count is tiny and each query is cheap
- **Steps**:
  1. locate the query inside the loop
  2. replace it with a batch query, `IN`, `JOIN`, eager load, or dataloader
  3. build an `id → result` map in code instead of querying inside the loop
  4. run performance tests and confirm query count goes down
- **Risk points**: very long `IN` lists; JOIN Cartesian explosion; overly eager loading causing memory spikes
- **Validation**: query logs show the count drops from N+1 to 1-2, while results remain correct
- **Frontend / backend**: backend-specific
- **Matches which scan item**: DB or external API calls inside loops

### M-L4-05 Index & Cache

- **Use when**: a slow query has obvious filter fields but no index, or read-heavy data can be cached
- **Do not use when**: the workload is write-heavy and additional indexes would hurt performance, or the data requires such high consistency that naive caching is unsafe
- **Steps**:
  1. use slow-query logs or EXPLAIN to locate the bottleneck
  2. add indexes covering the filter and sort fields, paying attention to composite-index order
  3. add caching, choose the layer, in-process, Redis, CDN, and define TTL plus invalidation strategy
  4. after rollout, observe hit rate and latency
- **Risk points**: too many indexes hurt write performance; cache consistency, stale reads; cache avalanche or penetration
- **Validation**: query latency goes down, cache hit rate matches expectation, and data-consistency tests pass
- **Frontend / backend**: backend-specific
- **Matches which scan item**: slow queries or hot data read repeatedly

### M-L4-06 Async & Cancellation

- **Use when**: long tasks block execution, side effects or network requests continue after component unmount, or callback hell appears
- **Do not use when**: tasks are extremely short and effectively non-cancellable
- **Steps**:
  1. convert long synchronous tasks into async, Promise or async-await
  2. add cancellation, `AbortController` for fetch, Vue `onUnmounted` or React cleanup return for teardown
  3. clean up resources, timers, event listeners, subscriptions
  4. test fast component switching or rapid request retry to ensure nothing is left behind
- **Risk points**: forgetting cleanup, causing memory leaks or state updates into unmounted components, React warnings; handling intermediate state after cancellation
- **Validation**: no leak warnings after unmount or switch, and fast-switch scenarios are covered by tests
- **Frontend / backend**: generic, but especially common on the frontend
- **Matches which scan item**: callback hell, uncleared side effects, or `useEffect` without cleanup

### M-L4-07 List Virtualization

- **Use when**: long lists, hundreds of rows or more, render sluggishly, or large data tables are involved
- **Do not use when**: the list is short, or row height is unstable and would make the implementation much more complex
- **Steps**:
  1. choose a library, such as `vue-virtual-scroller`, `react-window`, or `tanstack-virtual`
  2. replace the list rendering with a virtualized component
  3. handle fixed or variable row heights and scroll restoration
- **Risk points**: browser search, Ctrl+F, only sees rendered rows; accessibility, screen readers; printing
- **Validation**: scrolling becomes smooth, DOM node count stays bounded around the viewport, and interactive behavior stays unchanged
- **Frontend / backend**: frontend-specific
- **Matches which scan item**: very long lists without pagination or virtualization

---

## Usage Cheat Sheet

- **In the scan stage**: when a candidate optimization point is found, match it to the most suitable method ID and fill that into "suggested mapped method". If nothing fits, the candidate is still too vague and should be rewritten
- **In the design stage**: once the execution step cites a method ID, project the "steps" field down into the concrete files and functions of this repo. The steps in the method library are the skeleton, not a copy-paste answer
- **When extending the method library**: continue numbering inside the same level. Every new method must fill all fields completely. Missing fields mean the method is not allowed into the library
