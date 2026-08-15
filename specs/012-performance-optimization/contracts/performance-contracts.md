# Performance Optimization Contracts

**Feature**: Performance Optimization (Phase 14)
**Date**: 2026-08-15

---

## Overview

This feature is a cross-cutting improvement — it modifies existing services, components, and utilities rather than introducing new public interfaces. The contracts documented here describe the **behavioral contracts** that must hold after optimization, and the **new internal service interfaces** introduced.

---

## Contract 1: AnalyticsMemoService

A new injectable service that wraps all analytics engine pure functions with session-scoped memoization.

```typescript
// src/app/core/analytics/services/analytics-memo.service.ts

interface AnalyticsMemoService {
  /**
   * Wraps a pure analytics computation with memoization.
   * Returns cached result if key matches; otherwise computes and caches.
   */
  memoize<TResult>(
    cacheKey: string,
    compute: () => TResult
  ): TResult;

  /**
   * Clears all cached results.
   * Called by RelapseRecordRepository on every write.
   */
  clearAll(): void;

  /**
   * Returns the number of currently cached entries.
   * Exposed for testing and debugging.
   */
  readonly cacheSize: Signal<number>;
}
```

**Behavioral guarantees**:
- Same `cacheKey` always returns the same value within a session (until `clearAll()` is called).
- `clearAll()` is idempotent — safe to call multiple times.
- No async — all results are synchronous.
- Thread-safe: single-threaded JS environment; no concurrent access issues.

---

## Contract 2: RelapseRecordRepository (modified)

The repository's public API is unchanged. The internal behavior contract gains one guarantee:

```
POST-CONDITION (all write methods):
  After create(), update(), delete(), or importRecords() completes,
  AnalyticsMemoService.clearAll() MUST be called before returning.
```

**No API surface change** — consumers (analytics services, components) use the same `records` signal and mutation methods.

---

## Contract 3: ImportExportService (modified)

The import method gains a non-blocking contract:

```typescript
// Modified method signature:
interface ImportExportService {
  /**
   * Imports records from a JSON blob in non-blocking chunks.
   * Returns a signal tracking progress.
   * Emits 'done' or 'error' when complete.
   */
  importRecordsNonBlocking(
    jsonBlob: string,
    strategy: 'merge' | 'replace'
  ): Signal<ImportProgress>;
}

interface ImportProgress {
  status: 'idle' | 'importing' | 'done' | 'error';
  totalRecords: number;
  processedRecords: number;
  percentComplete: number;
  errorMessageAr: string | null;
}
```

**Behavioral guarantees**:
- The call returns immediately with a Signal — it does not block.
- Chunks are processed at `IMPORT_CHUNK_SIZE` (500) records per tick.
- UI thread is yielded between every chunk via `setTimeout(0)`.
- The existing import result format (JSON with `records[]`) is unchanged.
- Invalid records within the import file are skipped (counted in `errorMessageAr` summary), not rejected entirely.

---

## Contract 4: RecordTableComponent (modified)

Virtual scrolling contract:

```
INPUT: records: RelapseRecord[]   (unchanged)
RENDERING GUARANTEE:
  - At most MAX_VISIBLE_ROWS + CDK_BUFFER rows are in the DOM at any time.
  - MAX_VISIBLE_ROWS ≈ viewport_height / ROW_HEIGHT_PX (48 px)
  - CDK_BUFFER = 5 rows above and below viewport (CdkVirtualScrollViewport default)

BEHAVIOR:
  - Scrolling is synchronous — no async data loading required.
  - Row identity is stable via trackBy(record => record.id).
  - Search/filter filtering happens BEFORE passing to the virtual scroll viewport
    (the viewport receives only the filtered subset).
```

---

## Contract 5: OnPush Change Detection (cross-cutting)

All components listed below MUST declare `changeDetection: ChangeDetectionStrategy.OnPush`.
Their templates MUST read Angular Signals via the `()` call syntax (already the pattern).

Affected components (exhaustive list):
- `RecordTableComponent`
- `RecordFilterBarComponent`
- `DashboardCardShellComponent`
- All analytics sub-components (urge, time-series, calendar, patterns, triggers)
- All shared chart components (area-chart, bar-chart, etc.)

**Verification**: `ng build` must succeed without zone.js errors. `ng test` must pass.

---

## Contract 6: Search Debounce

```
DEBOUNCE CONTRACT:
  Filter/search signal updates triggered by user text input
  MUST be debounced by a minimum of 150 ms.

  This applies to:
  - Record search box in RelapsesComponent
  - Custom date range start/end inputs in DateRangeSelectorComponent

  Analytics computed() signals are NOT debounced at the signal level —
  debouncing happens at the input event level only.
```

---

## Contract 7: trackBy Requirement

```
ALL *ngFor directives in the application MUST specify a trackBy function.

Preferred implementations:
  - For RelapseRecord lists: trackBy(index, record) => record.id
  - For analytics period lists: trackBy(index, period) => period.anchorDate
  - For chart data arrays: trackBy(index, item) => index
  - For dashboard cards: trackBy(index, card) => card.id
```

---

## Backward Compatibility

All existing public APIs (`RelapseRecordRepository`, `ImportExportService`, analytics services) maintain their current method signatures and return types. This feature is purely additive (new internal services) and behavioral (optimization of existing code paths). No consumers need to be updated beyond the targeted components listed in Contract 5.
