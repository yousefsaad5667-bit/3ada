# Data Model: Performance Optimization

**Feature**: Performance Optimization (Phase 14)
**Date**: 2026-08-15

---

## Overview

This feature introduces no new persistent data entities — all data continues to live in LocalStorage under the existing schema. The new entities described here are **runtime/in-memory** constructs that improve performance without changing the storage format.

---

## Entity 1: RecordCache

**What it represents**: An in-memory snapshot of the deserialized relapse records array, held for the lifetime of the Angular application session. Eliminates repeated `JSON.parse` calls from LocalStorage.

**Ownership**: Lives inside `RelapseRecordRepository` (already holds a `signal<RelapseRecord[]>`). No structural change required — the existing `_records` signal IS the record cache. The optimization is ensuring `_reload()` is only called when the data actually changes (create/update/delete/import), never on read.

**Fields** (already present in `RelapseRecord` — no schema change):
| Field | Type | Notes |
|---|---|---|
| id | string | UUID, cache key for trackBy |
| date | string | ISO date string |
| time | string \| undefined | HH:MM |
| ampm | string \| undefined | |
| count | number | ≥ 0 |
| urgeLevel | number \| undefined | |
| reason | string \| undefined | |
| notes | string \| undefined | |
| createdAt | string | ISO timestamp |
| updatedAt | string | ISO timestamp — used as cache key component |

**Invalidation rule**: Cache is refreshed only on `create()`, `update()`, `delete()`, or `importRecords()`. Read operations (`getAll()`, `getById()`) never touch LocalStorage.

**State transitions**:
```
[App Start] → _reload() → signal<RelapseRecord[]> populated
    ↓
[Any write] → signal updated in-memory → localStorage.setItem()
    ↓
[Read]      → signal() read — no localStorage access
```

---

## Entity 2: ComputationResultCache

**What it represents**: A session-scoped Map that stores the output of expensive analytics engine computations, keyed by a deterministic string derived from the input parameters.

**Lifetime**: Application session. Cleared entirely when any record is mutated.

**Structure**:
```typescript
interface CacheEntry<T> {
  key: string;        // Cache key (see key strategy below)
  value: T;           // Cached computation result
  computedAt: number; // Date.now() — for future TTL support
}

type ComputationCache = Map<string, CacheEntry<unknown>>;
```

**Key strategy**:
```
key = `${functionName}:${filterStart}:${filterEnd}:${recordCount}:${lastRecordUpdatedAt}`
```

- `functionName`: e.g., `"getTimeSeries-daily"`, `"getMovingAverage"`.
- `filterStart` / `filterEnd`: ISO date strings from `DashboardFilterService.activeFilter()`.
- `recordCount`: Total number of records (cheap to compute).
- `lastRecordUpdatedAt`: The `updatedAt` of the most recently updated record — a cheap proxy for "has anything changed?".

**Invalidation rule**: On any write to `RelapseRecordRepository` (create/update/delete/import), the entire cache is cleared.

**Relationships**: Referenced by `AnalyticsMemoService` (new), which wraps each analytics engine function.

---

## Entity 3: MemoizedEngineFunction<TInput, TOutput>

**What it represents**: A wrapped version of a pure analytics engine function that checks the `ComputationResultCache` before executing.

**Not a data entity** — a behavioral pattern. Documented here for completeness.

**Contract**:
```
interface MemoizedEngineFunction<TInput, TOutput> {
  compute(input: TInput, cacheKey: string): TOutput;
  clearCache(): void;
}
```

---

## Entity 4: ImportProgress

**What it represents**: A runtime signal that tracks the progress of a non-blocking JSON import operation.

**Ownership**: Lives inside `ImportExportService`.

**Fields**:
| Field | Type | Notes |
|---|---|---|
| status | `'idle' \| 'importing' \| 'done' \| 'error'` | Current import state |
| totalRecords | number | Total records in the file being imported |
| processedRecords | number | Records processed so far |
| percentComplete | number | 0–100, derived from processedRecords/totalRecords |
| errorMessageAr | string \| null | Arabic error message if status is `'error'` |

**State transitions**:
```
idle → importing (file selected)
    → done (all chunks processed)
    → error (validation failure or storage quota exceeded)
done → idle (user dismisses or starts a new import)
error → idle (user dismisses)
```

---

## Validation Rules

| Entity | Rule |
|---|---|
| RecordCache | Must only be populated with records passing existing `validateRelapseRecord()` — no change to validation logic |
| ComputationResultCache | Cache key must be deterministic — same inputs always produce same key |
| ImportProgress | `processedRecords` must never exceed `totalRecords` |
| ImportProgress | Import chunks must respect existing `validateRelapseRecord()` — invalid records are skipped and counted separately |

---

## No Schema Migrations Required

All new entities are in-memory only. LocalStorage format is unchanged. The existing `MigrationService` is unaffected.
