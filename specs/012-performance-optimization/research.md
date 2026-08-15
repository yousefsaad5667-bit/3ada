# Research: Performance Optimization

**Feature**: Performance Optimization (Phase 14)
**Branch**: `012-performance-optimization`
**Date**: 2026-08-15

---

## 1. Profiling: Where Are the Real Bottlenecks?

### Decision
Prioritize three root causes, in order of expected impact:
1. **Analytics recomputation** — every `computed()` signal containing full aggregation runs from scratch on every filter/records change.
2. **Record table rendering** — `RecordTableComponent` renders a flat `*ngFor` with no virtualization and no `OnPush`, so 100,000 rows would be painted all at once.
3. **Storage deserialization** — `StorageService.get()` calls `JSON.parse` on the entire records array every time `_reload()` is triggered.

### Rationale
Confirmed by reading `TimeSeriesAnalyticsService.state` (a single large `computed()` that calls `getTimeSeries`, `getMovingAverage`, `getCumulativeSeries`, and `getTrendSummary` in sequence), `RelapseRecordRepository._reload()` (re-parses JSON every call), and `RecordTableComponent` (plain `*ngFor`, no `trackBy`, no `ChangeDetectionStrategy.OnPush`).

### Alternatives Considered
- Server-side pagination: Not applicable (local-first constitution).
- IndexedDB: Not applicable (LocalStorage-only constitution).
- Pre-built WASM aggregation: Disproportionate complexity for the dataset size.

---

## 2. Change Detection: OnPush + Signals

### Decision
Adopt `ChangeDetectionStrategy.OnPush` on all feature components and analytics sub-components. Angular Signals already integrated — all `computed()` values are read via signal graph, so OnPush is safe and dramatically reduces CD cycles.

### Rationale
- Angular's default CD strategy re-checks every component on every browser event.
- With 100k records, even tiny microtasks (mouse moves, scroll events) trigger unnecessary re-renders of unchanged analytics cards.
- `signal` / `computed` values automatically mark only the affected view as dirty when `OnPush` is in use.

### Alternatives Considered
- Manual `markForCheck()` / `detectChanges()`: More error-prone; signals + OnPush is the idiomatic Angular 19 pattern.

---

## 3. Memoization of Analytics Engine Functions

### Decision
Wrap each analytics engine function (`getTimeSeries`, `getMovingAverage`, `getCumulativeSeries`, `getTrendSummary`, `getDistribution`, `getHeatmap`, `getWeekdayAnalysis`, `getHourAnalysis`, `getTriggerAnalysis`, `getUrgeAnalysis`) with a generic `memoize<F>()` utility that caches by a serialized key composed of `(recordIds[], filterParams)`.

### Rationale
- Engine functions are pure — same input always produces same output.
- `computed()` in Angular already memoizes at the signal level, but only equality-checks the input signals, not the derived computation. If `records` signal identity changes (even if content is same), the computed re-runs.
- An explicit result cache keyed on `(sortedRecordIds joined, filterKey)` survives signal identity changes.
- Cache is session-scoped — invalidated when any record is mutated (create/update/delete triggers cache clear).

### Cache Key Strategy
```
key = `${engineFunctionName}:${filterStart}:${filterEnd}:${recordCount}:${lastUpdatedAt}`
```
`lastUpdatedAt` is the `updatedAt` timestamp of the most recently modified record. This gives O(n) key construction at worst but avoids full array hashing.

### Alternatives Considered
- Per-filter LRU cache (bounded size): Adds complexity; simple Map with invalidation on write is sufficient for a single-user app.
- Reselect-style selector memoization: Angular Signals `computed()` already handles the reactivity graph; explicit memoization is additive, not a replacement.

---

## 4. Virtual Scrolling for the Record Table

### Decision
Use Angular CDK `ScrollingModule` (`CdkVirtualScrollViewport` + `*cdkVirtualFor`) in `RecordTableComponent`. Row height: fixed 48 px (current table row height from existing SCSS). Only visible rows (+buffer) are rendered in the DOM.

### Rationale
- `@angular/cdk` is already a transitive dependency of Angular Material / Angular itself and is available without adding packages.
- With 100,000 records, a plain `*ngFor` would create ~100,000 DOM nodes — unacceptable.
- Fixed-row-height virtual scrolling is trivially implemented and eliminates the rendering bottleneck entirely.

### Package check
```
@angular/cdk  →  already declared in package.json as a transitive dependency
```
No new `npm install` required.

### Alternatives Considered
- Pagination (server-style): User-visible UX regression; not aligned with the existing filter/search UX.
- Intersection Observer manual approach: Significantly more complex than CDK.

---

## 5. Debounced Search / Filter Input

### Decision
Add a 150 ms debounce to the record search input using `rxjs/operators debounceTime` (or a simple `setTimeout`/`clearTimeout` pair to avoid RxJS if the component is signal-based). Debounce also applied to custom date range picker inputs.

### Rationale
- Current implementation triggers a full computed() rerun on every keystroke.
- 150 ms is imperceptible to users but prevents 10–20 redundant filter evaluations per word typed.

### Alternatives Considered
- 300 ms: Slightly more noticeable lag; 150 ms is optimal per UX research for search fields.

---

## 6. Non-Blocking JSON Import

### Decision
Parse and insert imported JSON records in chunks of 500 per `setTimeout(0)` tick, yielding control to the UI thread between chunks. A progress signal (`importProgress: Signal<number>`) will be exposed by `ImportExportService`.

### Rationale
- `JSON.parse` on a 100,000-record file is ~15–50 ms (acceptable), but the subsequent validation + write loop blocks the main thread.
- Chunked insertion (500 records at a time, ~5 ms/chunk) makes the import non-blocking without Web Workers.
- No new dependencies required.

### Alternatives Considered
- Web Worker for JSON parse: Overkill; the parse itself is fast; the bottleneck is the write loop.
- Streaming JSON parser: External dependency; unnecessary for the file size range.

---

## 7. trackBy in All *ngFor Loops

### Decision
Add `trackBy: trackById` (or `trackByIndex` where no id is available) to every `*ngFor` in the application.

### Rationale
- Without `trackBy`, Angular destroys and recreates all DOM nodes on every array change.
- With `trackBy`, unchanged items are reused — critical for large lists.

---

## 8. Lazy Loading — Already Implemented

### Decision
No action needed. All feature routes already use `loadComponent: () => import(...)` — Angular's built-in route-level code splitting.

### Rationale
Verified in `app.routes.ts`. Every page is already a separate lazy chunk.

---

## 9. Memory Leak Prevention

### Decision
Audit all `effect()` calls, RxJS subscriptions, and chart lifecycle hooks. Ensure:
- All `effect()` calls created outside the component constructor use `manualCleanup: true` + `destroyRef.onDestroy`.
- All chart instances (Chart.js) are destroyed via `destroyRef.onDestroy`.
- No global event listeners left alive after component destruction.

### Rationale
Existing `RecordTableComponent` and analytics components use signals only (no RxJS subscriptions observed), so leaks are low-risk. Chart components from Phase 11 use `destroyRef` pattern. Audit is precautionary but necessary for the 100k-record 30-minute session criterion.

---

## 10. Web Workers — Deferred

### Decision
Web Workers are identified as a valid technique but are **deferred until profiling with real data confirms main-thread blocking**. The memoization + OnPush + chunked import changes are expected to meet all success criteria without Web Workers.

### Rationale
Web Workers in Angular require a separate build target and cross-thread serialization overhead. For in-memory computation on pre-parsed signal data, the overhead may negate the benefit. Profiling first, Worker second.
