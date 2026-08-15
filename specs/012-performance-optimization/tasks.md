# Tasks: Performance Optimization

**Input**: Design documents from `specs/012-performance-optimization/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅ | quickstart.md ✅

**Tests**: Not requested — omitted per spec (no TDD requirement in spec.md).

**Organization**: Tasks follow the implementation order from quickstart.md, grouped by user story for independent delivery.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to
- Exact file paths included in all descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the new utility and service skeletons that all user stories depend on.

- [x] T001 Create `src/app/core/analytics/utils/cache-key.util.ts` — export `buildCacheKey(fnName, filterStart, filterEnd, recordCount, lastUpdatedAt): string` returning `"fnName:filterStart:filterEnd:recordCount:lastUpdatedAt"`
- [x] T002 [P] Create `src/app/core/analytics/services/analytics-memo.service.ts` — `@Injectable({ providedIn: 'root' })` with `private cache = new Map<string, unknown>()`, `readonly _cacheSize = signal(0)`, `readonly cacheSize = this._cacheSize.asReadonly()`, `memoize<T>(key, compute): T`, and `clearAll(): void` per Contract 1

**Checkpoint**: New utility + service exist and compile (`ng build` passes).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Wire `AnalyticsMemoService` into the record repository so cache invalidation is guaranteed before any analytics memoization tasks begin.

**CRITICAL**: No user story work can begin until this phase is complete.

- [x] T003 Modify `src/app/core/services/relapse-record.repository.ts` — inject `AnalyticsMemoService`; call `this.memoService.clearAll()` at the end of every write method (`create()`, `update()`, `delete()`, `importRecords()`) per Contract 2; verify `_reload()` is called only in write paths, never in `getAll()` / `getById()` read paths

**Checkpoint**: Foundation ready — analytics invalidation is guaranteed. User story phases can now begin.

---

## Phase 3: User Story 1 — Browsing a Large History Without Freezing (Priority: P1) MVP

**Goal**: History view stays interactive with 100,000 records — virtual scrolling eliminates DOM bloat, debounce prevents per-keystroke recomputation, and `OnPush` removes unnecessary CD cycles.

**Independent Test**: Seed 100,000 records; open the History view; verify initial render < 1 s, search results < 300 ms per keystroke, and smooth scrolling with no blank-row flash.

### Implementation for User Story 1

- [x] T004 [P] [US1] Modify `src/app/features/relapses/components/record-table/record-table.component.ts` — import `ScrollingModule` from `@angular/cdk/scrolling`; add `changeDetection: ChangeDetectionStrategy.OnPush`; add `readonly ROW_HEIGHT = 48` constant; add `trackById = (_: number, r: RelapseRecord) => r.id` method per Contract 4 & 5
- [x] T005 [P] [US1] Modify `src/app/features/relapses/components/record-table/record-table.component.html` — replace existing `*ngFor` table rows with `<cdk-virtual-scroll-viewport [itemSize]="ROW_HEIGHT" class="table-viewport">` wrapping a `<table><tbody>` with `*cdkVirtualFor="let record of records; trackBy: trackById"` per Contract 4; ensure filtered records are passed to the viewport (filter happens before viewport input)
- [x] T006 [US1] Modify `src/app/features/relapses/relapses.component.ts` — add `private searchDebounce: ReturnType<typeof setTimeout> | null = null`; implement `onSearchChange(value: string)` with 150 ms `setTimeout`/`clearTimeout` debounce updating `searchQuery` signal; add `changeDetection: ChangeDetectionStrategy.OnPush` per Contract 5 & 6
- [x] T007 [US1] Modify `src/app/features/relapses/components/record-filter-bar/record-filter-bar.component.ts` — add `changeDetection: ChangeDetectionStrategy.OnPush`; add `trackBy` functions to any `*ngFor` directives per Contract 5 & 7

**Checkpoint**: User Story 1 fully functional. History view with 100,000 records interactive in < 1 s, search debounced, scrolling smooth.

---

## Phase 4: User Story 2 — Viewing Dashboard Analytics Without Delay (Priority: P2)

**Goal**: All analytics computed() signals are wrapped with session-scoped memoization so previously computed filter combinations return instantly from cache.

**Independent Test**: With 100,000 records, switch date range filter on every dashboard card; verify all charts update in < 500 ms; revisit a previous range and verify instant load from cache.

### Implementation for User Story 2

- [x] T008 [P] [US2] Modify `src/app/features/analytics/time-series/services/time-series-analytics.service.ts` — inject `AnalyticsMemoService`; wrap every `computed()` aggregation body (`getTimeSeries`, `getMovingAverage`, `getCumulativeSeries`, `getTrendSummary`) with `this.memoService.memoize(buildCacheKey('fn-name', filterStart, filterEnd, recordCount, lastUpdatedAt), () => originalComputation())` per Contract 1
- [x] T009 [P] [US2] Modify `src/app/features/analytics/calendar/services/calendar-analytics.service.ts` — same memoization pattern as T008 for calendar aggregation functions
- [x] T010 [P] [US2] Modify `src/app/features/analytics/patterns/services/pattern-analytics.service.ts` — same memoization pattern for pattern aggregation functions
- [x] T011 [P] [US2] Modify `src/app/features/analytics/triggers/services/trigger-analytics.service.ts` — same memoization pattern for trigger aggregation functions
- [x] T012 [P] [US2] Modify `src/app/features/analytics/urge/services/urge-analytics.service.ts` — same memoization pattern for urge aggregation functions
- [x] T013 [P] [US2] Apply `changeDetection: ChangeDetectionStrategy.OnPush` to all analytics feature components under `src/app/features/analytics/**/*.component.ts` (urge, time-series, calendar, patterns, triggers sub-components) per Contract 5
- [x] T014 [P] [US2] Apply `changeDetection: ChangeDetectionStrategy.OnPush` to all shared chart components under `src/app/shared/components/charts/**/*.component.ts` per Contract 5

**Checkpoint**: User Story 2 fully functional. Dashboard chart updates <= 500 ms; repeated filter combos load instantly from cache.

---

## Phase 5: User Story 3 — Opening the App Cold-Start With a Large Dataset (Priority: P2)

**Goal**: Dashboard components use `OnPush`, reducing CD overhead on initial render so cold-start time-to-interactive stays under 3 s with 100,000 records.

**Independent Test**: Clear browser cache, reload with 100,000 seeded records, measure time-to-interactive; verify < 3 s cold, < 1.5 s warm.

### Implementation for User Story 3

- [x] T015 [P] [US3] Apply `changeDetection: ChangeDetectionStrategy.OnPush` to all dashboard components under `src/app/features/dashboard/**/*.component.ts` per Contract 5
- [x] T016 [P] [US3] Add `trackBy` functions to all `*ngFor` directives in dashboard component templates (`src/app/features/dashboard/**/*.component.html`) — use `trackBy(index, card) => card.id` for dashboard card lists per Contract 7

**Checkpoint**: User Story 3 fully functional. Cold-start interactive < 3 s; warm-start < 1.5 s confirmed with 100,000-record seed.

---

## Phase 6: User Story 4 — Using the App During Background Computation (Priority: P3)

**Goal**: Large JSON imports are non-blocking (chunked at 500 records / `setTimeout(0)` tick) and expose a progress signal; UI remains fully responsive during import.

**Independent Test**: Trigger a 100,000-record JSON import; navigate to another page during import; verify page transition begins within 100 ms and keystrokes register without delay.

### Implementation for User Story 4

- [x] T017 [US4] Modify `src/app/core/services/import-export.service.ts` — add `private readonly _importProgress = signal<ImportProgress>({ status: 'idle', totalRecords: 0, processedRecords: 0, percentComplete: 0, errorMessageAr: null })`; expose `readonly importProgress = this._importProgress.asReadonly()`; implement `importRecordsNonBlocking(jsonBlob: string, strategy: 'merge' | 'replace'): void` with `IMPORT_CHUNK_SIZE = 500`, `setTimeout(processChunk, 0)` loop yielding between each chunk, and progress signal updates per Contract 3
- [x] T018 [US4] Update the import UI component that calls `ImportExportService` — switch from blocking import call to `importRecordsNonBlocking()`; bind a progress indicator (percentage or spinner) to `importExportService.importProgress` signal; handle `'done'` and `'error'` status transitions; ensure indicator is visible but non-blocking (FR-009)

**Checkpoint**: User Story 4 fully functional. 100,000-record import runs in background; UI stays interactive; progress indicator visible.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Memory audit, global trackBy sweep, and end-to-end verification against all success criteria.

- [x] T019 [P] Audit all `effect()` calls across `src/app/` — ensure any `effect()` created outside a component constructor uses `manualCleanup: true` with `destroyRef.onDestroy()` cleanup per research.md section 9
- [x] T020 [P] Audit all chart component lifecycle hooks under `src/app/shared/components/charts/**/*.component.ts` — confirm every Chart.js instance is destroyed via `destroyRef.onDestroy()` to prevent memory leaks per research.md section 9
- [x] T021 [P] Audit all remaining `*ngFor` directives across `src/app/` templates — add missing `trackBy` functions per Contract 7 (use `trackBy(index, record) => record.id` for RelapseRecord lists, `trackBy(index, item) => index` for chart data arrays)
- [x] T022 Run `ng build` and confirm zero TypeScript / template errors
- [x] T023 Run `ng test` and confirm all existing Jasmine/Karma specs pass (SC-009 — zero functional regressions)
- [x] T024 Manual benchmark: Seed 100,000 records; open History view — verify interactive in < 1 s (SC-001); type in search box — results within 300 ms (SC-002); scroll rapidly — no blank rows (SC-005)
- [x] T025 Manual benchmark: Open Dashboard; switch date range — all charts update in < 500 ms (SC-003); revisit same range — loads in < 50 ms from cache (SC-007)
- [x] T026 Manual benchmark: Cold reload with 100,000 records — interactive in < 3 s (SC-004a); warm reload — < 1.5 s (SC-004b)
- [x] T027 Manual benchmark: Navigate rapidly between Dashboard, History, and Analytics — verify no duplicate Chart.js instance warnings in console, heap size stable < 50 MB
- [x] T028 Manual benchmark: Check DevTools Network/Sources tabs — confirm Web Worker loaded successfully from `/assets/workers/` and main thread isn't blocked during data seedly (SC-006 proxy check)

**Checkpoint**: All success criteria verified. Feature complete.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — **BLOCKS** all user story phases
- **Phase 3 (US1)**: Depends on Phase 2 — can start after T003 completes
- **Phase 4 (US2)**: Depends on Phase 2 — can start after T003 completes (parallel with Phase 3)
- **Phase 5 (US3)**: Depends on Phase 2 — can start after T003 completes (parallel with Phases 3-4)
- **Phase 6 (US4)**: Depends on Phase 2 — can start after T003 completes (parallel with Phases 3-5)
- **Phase 7 (Polish)**: Depends on all user story phases being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — no dependencies on other stories
- **US2 (P2)**: Can start after Phase 2 — no dependencies on other stories
- **US3 (P2)**: Can start after Phase 2 — no dependencies on other stories
- **US4 (P3)**: Can start after Phase 2 — no dependencies on other stories

### Within Each User Story

- US1: T004 and T005 (virtual scroll TS + HTML) done together; T006 (debounce) and T007 (filter bar) can be parallel
- US2: T008-T012 (analytics services) fully parallel; T013-T014 (OnPush) fully parallel
- US3: T015 and T016 fully parallel
- US4: T017 (service) before T018 (UI); T018 depends on T017

### Parallel Opportunities

- T001 and T002 (Phase 1) — different files, run together
- T004, T005, T006, T007 within US1 — different files, run in parallel
- T008-T014 within US2 — all different analytics service files, fully parallel
- T015-T016 within US3 — different files, parallel
- T019, T020, T021 in Polish — different audit scopes, parallel

---

## Parallel Example: User Story 2

```bash
# All 7 analytics memoization + OnPush tasks run simultaneously:
Task T008: Memoize time-series-analytics.service.ts
Task T009: Memoize calendar-analytics.service.ts
Task T010: Memoize pattern-analytics.service.ts
Task T011: Memoize trigger-analytics.service.ts
Task T012: Memoize urge-analytics.service.ts
Task T013: OnPush all analytics feature components
Task T014: OnPush all shared chart components
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 2: Foundational (T003)
3. Complete Phase 3: User Story 1 (T004-T007)
4. **STOP and VALIDATE**: Seed 100k records; confirm History view interactive in < 1 s, search debounced, scrolling smooth
5. Demo / ship US1 independently

### Incremental Delivery

1. Setup + Foundational (T001-T003) — Foundation ready
2. US1 (T004-T007) — History performance fixed — Demo MVP
3. US2 (T008-T014) — Dashboard analytics cached — Demo
4. US3 (T015-T016) — Cold-start improved — Demo
5. US4 (T017-T018) — Non-blocking import — Demo
6. Polish (T019-T028) — Full verification pass

---

## Notes

- No new npm packages required — `@angular/cdk` is already a transitive dependency
- No schema or LocalStorage format changes — all new entities are in-memory only
- Arabic UI + RTL layout must remain intact after virtual scroll viewport styling
- `[P]` tasks = different files with no cross-task write conflicts
- Each user story is independently testable after its phase completes
- Commit after each phase checkpoint
