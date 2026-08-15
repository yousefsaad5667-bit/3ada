# Implementation Plan: Performance Optimization

**Branch**: `012-performance-optimization` | **Date**: 2026-08-15 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/012-performance-optimization/spec.md`

## Summary

Cross-cutting performance pass to keep the Angular habit-tracker app responsive with up to 100,000 relapse records. Five targeted optimizations — each independently deployable — replace the current default-CD / unvirtualized / unmemoized rendering pipeline with a production-grade one:

1. **`ChangeDetectionStrategy.OnPush`** across all components (leverages existing Signal graph)
2. **Session-scoped analytics memoization** via a new `AnalyticsMemoService` (wraps pure engine functions)
3. **CDK virtual scrolling** in `RecordTableComponent` (eliminates 100k DOM nodes)
4. **150 ms search debounce** (prevents per-keystroke recomputation)
5. **Chunked non-blocking JSON import** in `ImportExportService` (yields UI thread every 500 records)

No new npm packages. No schema changes. No API surface changes. All existing tests must pass after each step.

## Technical Context

**Language/Version**: TypeScript 5.x (strict), Angular 19

**Primary Dependencies**:
- `@angular/cdk/scrolling` — `CdkVirtualScrollViewport` for virtual scrolling (already available as transitive dep)
- No new `npm install` required

**Storage**: LocalStorage (unchanged). `RelapseRecordRepository` signal already acts as in-memory cache — optimization ensures `_reload()` is never called on reads.

**Testing**: Jasmine / Karma (`ng test`). Benchmark scripts via seeded test data in browser DevTools.

**Target Platform**: Browser SPA, fully offline, Angular 19.

**Performance Goals**:
- History view interactive in < 1 s with 100k records
- Search/filter results in < 300 ms
- Dashboard charts update in < 500 ms on date range change
- Cold-start interactive in < 3 s; warm-start in < 1.5 s
- Memory stable over 30-min session

**Constraints**:
- No backend, no IndexedDB, no SSR — LocalStorage only
- Arabic UI + RTL layout unchanged throughout
- All existing `ng test` specs must remain green

**Scale/Scope**: 5 optimization areas, ~15 files modified, 1 new service (`AnalyticsMemoService`).

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Angular Platform | ✅ PASS | OnPush, Signals, CDK — all Angular-native. No forbidden libs. |
| II. Local-First (LocalStorage only) | ✅ PASS | No storage changes; no IndexedDB introduced. |
| III. Arabic Language & RTL | ✅ PASS | Virtual scroll viewport styled RTL; no label/layout changes. |
| IV. Modern UI & UX | ✅ PASS | Non-blocking import shows progress indicator; search debounce is invisible to users. |
| V. Performance & Scalability | ✅ PASS | This entire feature IS the V. compliance work. |
| Charting Library | ✅ PASS | Chart components get OnPush; no library changes. |
| Architecture | ✅ PASS | New service follows existing `core/analytics/services/` pattern; no architectural drift. |
| Code Quality | ✅ PASS | Strict typing; memoize utility fully typed; no duplicated logic. |

**Post-Design Re-check**: ✅ All gates pass. No violations.

## Project Structure

### Documentation (this feature)

```text
specs/012-performance-optimization/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── performance-contracts.md
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
src/app/core/analytics/services/
└── analytics-memo.service.ts        [NEW] Session-scoped memoization cache

src/app/core/analytics/utils/
└── cache-key.util.ts                [NEW] Deterministic cache key builder

src/app/core/services/
└── relapse-record.repository.ts     [MODIFY] Inject AnalyticsMemoService; call clearAll() on every write
└── import-export.service.ts         [MODIFY] Chunked non-blocking import + ImportProgress signal

src/app/features/relapses/
└── relapses.component.ts            [MODIFY] Debounce search input (150 ms); OnPush
└── components/record-table/
    ├── record-table.component.ts    [MODIFY] OnPush + CDK ScrollingModule + trackBy
    └── record-table.component.html  [MODIFY] CdkVirtualScrollViewport + *cdkVirtualFor
└── components/record-filter-bar/
    └── record-filter-bar.component.ts [MODIFY] OnPush + trackBy

src/app/features/analytics/
└── time-series/services/time-series-analytics.service.ts  [MODIFY] memoize computed body
└── calendar/services/calendar-analytics.service.ts        [MODIFY] memoize computed body
└── patterns/services/pattern-analytics.service.ts         [MODIFY] memoize computed body
└── triggers/services/trigger-analytics.service.ts         [MODIFY] memoize computed body
└── urge/services/urge-analytics.service.ts                [MODIFY] memoize computed body

# OnPush applied to ALL components under:
src/app/features/analytics/**/*.component.ts   [MODIFY] OnPush
src/app/shared/components/charts/**/*.component.ts  [MODIFY] OnPush
src/app/features/dashboard/**/*.component.ts   [MODIFY] OnPush
```

**Structure Decision**: New service in `src/app/core/analytics/services/` — consistent with the analytics-engine pattern. Utility in `src/app/core/analytics/utils/` — consistent with existing `date-range.utils.ts`. No new feature module or folder is introduced.

## Complexity Tracking

No constitution violations. No complexity justification required.
