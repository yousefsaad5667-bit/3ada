# Tasks: Urge Analytics (Phase 10)

**Input**: Design documents from `specs/010-urge-analytics/`

**Branch**: `010-urge-analytics`

**Prerequisites**: [plan.md](./plan.md) · [spec.md](./spec.md) · [research.md](./research.md) · [data-model.md](./data-model.md) · [contracts/urge-contracts.md](./contracts/urge-contracts.md) · [quickstart.md](./quickstart.md)

**Tests**: Included for engine and service layers (pure functions and Signal state are highly testable).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no blocking dependencies)
- **[Story]**: Which user story this task belongs to (US1–US6)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Extend core types and the barrel export so all downstream tasks can build on a stable foundation.

- [x] T001 Add `UrgeHourEntry`, `UrgeWeekdayEntry`, `UrgeTriggerEntry`, and `UrgeCorrelationResult` interfaces to `src/app/core/analytics/models/analytics.types.ts`
- [x] T002 Export the four new types from `src/app/core/analytics/index.ts`
- [x] T003 Create view-model file `src/app/features/analytics/urge/models/urge-view.model.ts` with `UrgeStatus`, `UrgeSummaryView`, `UrgeTimeSeriesView`, and `UrgeAnalyticsState`

**Checkpoint**: Core types and view models are in place — all story phases can reference them.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Engine extensions and the analytics service that ALL sub-components depend on.

**⚠️ CRITICAL**: No sub-component work can begin until this phase is complete.

- [x] T004 Add `getUrgeByHour(records: RelapseRecord[]): UrgeHourEntry[]` to `src/app/core/analytics/engine/urge.engine.ts` — groups records with non-null `urgeLevel` by hour (0–23), returns all 24 slots with `avgUrge: null` for empty slots
- [x] T005 Add `getUrgeByWeekday(records: RelapseRecord[]): UrgeWeekdayEntry[]` to `src/app/core/analytics/engine/urge.engine.ts` — groups records by weekday (0–6) using Arabic labels, returns all 7 slots with `avgUrge: null` for empty slots
- [x] T006 Add `getUrgeCorrelation(records: RelapseRecord[], dateRange: DateRange): UrgeCorrelationResult` to `src/app/core/analytics/engine/urge.engine.ts` — computes Pearson r between weekly-avg-urge and weekly-relapse-count; returns `'insufficient-data'` direction when fewer than 10 weekly buckets have urge data; includes Arabic `explanationAr` field
- [x] T007 Export `getUrgeByHour`, `getUrgeByWeekday`, `getUrgeCorrelation` from `src/app/core/analytics/index.ts`
- [x] T008 Add engine unit tests for `getUrgeByHour`, `getUrgeByWeekday`, and `getUrgeCorrelation` in `src/app/core/analytics/engine/urge.engine.spec.ts` — cover: happy path, all-null urge records, insufficient-data correlation, single slot populated
- [x] T009 Create `src/app/features/analytics/urge/services/urge-analytics.service.ts` — `@Injectable({ providedIn: 'root' })`, inject `DashboardFilterService` and `RelapseRecordRepository`, expose `state: Signal<UrgeAnalyticsState>` as a `computed` signal that populates all seven sub-views (`summary`, `timeSeries`, `distribution`, `byHour`, `byWeekday`, `byTrigger`, `correlation`), handle `status: 'empty' | 'data' | 'error'`, track `excludedRecordCount`
- [x] T010 Create `src/app/features/analytics/urge/services/urge-analytics.service.spec.ts` — cover: empty records → `'empty'`, records with no urgeLevel → `'empty'` with correct `excludedRecordCount`, full data set → all sub-views populated with correct values, correlation insufficient data → `direction: 'insufficient-data'`

**Checkpoint**: Engine functions tested and service produces a valid `UrgeAnalyticsState` signal — sub-component work can now begin in parallel.

---

## Phase 3: User Story 1 — Urge Intensity Summary Card (Priority: P1) 🎯 MVP

**Goal**: Show average, max, min, and median urge values plus trend direction in a summary card.

**Independent Test**: Navigate to `http://localhost:4200/analytics/urge` with relapse records that have urge data. Confirm all four stat values match hand-calculated results and the trend badge reflects the direction from `getTrendSummary`.

### Implementation for User Story 1

- [x] T011 [US1] Create `src/app/features/analytics/urge/components/urge-summary-card/urge-summary-card.component.ts` — standalone, `@Input({ required: true }) summary: UrgeSummaryView`, no service injection
- [x] T012 [US1] Create `src/app/features/analytics/urge/components/urge-summary-card/urge-summary-card.component.html` — four stat tiles (avg, max, min, median), trend badge with Arabic direction label and colour coding (↑ red / ↓ green / → neutral), excluded record count footnote (hidden when 0); all labels in Arabic
- [x] T013 [US1] Create `src/app/features/analytics/urge/components/urge-summary-card/urge-summary-card.component.scss` — stat tile grid layout, trend badge colour classes, RTL-compatible spacing
- [x] T014 [US1] Replace `src/app/features/analytics/urge/urge.component.ts` with full implementation: inject `UrgeAnalyticsService`, expose `state` signal, import `UrgeSummaryCardComponent`; add page-level empty state (status `'empty'`) and error state (status `'error'`) rendering
- [x] T015 [US1] Replace `src/app/features/analytics/urge/urge.component.html` with full layout: page title "تحليل الرغبة الشديدة", empty-state block, error-state block, `<app-urge-summary-card>` receiving `state().summary`
- [x] T016 [US1] Replace `src/app/features/analytics/urge/urge.component.scss` with page layout styles — section spacing, RTL grid, dark/light mode CSS variable usage

**Checkpoint**: Summary card renders correctly for all data states (data / empty / error).

---

## Phase 4: User Story 2 — Urge Trend Over Time (Priority: P2)

**Goal**: Show daily urge time series with a 7-day moving average overlay and a trend direction badge.

**Independent Test**: Load the page with synthetic records spanning 14+ days. Confirm the data list shows daily values, the moving average is smoothed, and the trend badge reflects the correct direction.

### Implementation for User Story 2

- [x] T017 [P] [US2] Create `src/app/features/analytics/urge/components/urge-time-series-chart/urge-time-series-chart.component.ts` — standalone, `@Input({ required: true }) timeSeries: UrgeTimeSeriesView`
- [x] T018 [US2] Create `src/app/features/analytics/urge/components/urge-time-series-chart/urge-time-series-chart.component.html` — trend direction badge at top; data table showing `date`, `rawSeries count`, `movingAverage count` per row; Arabic placeholder label "رسم بياني سيُضاف في المرحلة ١٢"; empty state: "لا تتوفر بيانات للفترة المحددة"
- [x] T019 [US2] Create `src/app/features/analytics/urge/components/urge-time-series-chart/urge-time-series-chart.component.scss` — trend badge colour, table/list layout, placeholder label style
- [x] T020 [US2] Add `<app-urge-time-series-chart>` to `urge.component.html` and import `UrgeTimeSeriesChartComponent` in `urge.component.ts` — pass `state().timeSeries`

**Checkpoint**: Time-series section renders with trend badge, raw values, and moving-average values for any date range.

---

## Phase 5: User Story 3 — Urge Distribution (Priority: P3)

**Goal**: Show urge intensity grouped into 10 fixed buckets (levels 1–10) as horizontal bar indicators.

**Independent Test**: Load with records spread across urge levels 1–10. Confirm each level bucket shows the correct count and percentage, width scales proportionally, and no bucket is hidden even if count is 0.

### Implementation for User Story 3

- [x] T021 [P] [US3] Create `src/app/features/analytics/urge/components/urge-distribution-chart/urge-distribution-chart.component.ts` — standalone, `@Input({ required: true }) distribution: DistributionEntry[]`
- [x] T022 [US3] Create `src/app/features/analytics/urge/components/urge-distribution-chart/urge-distribution-chart.component.html` — 10 rows (one per bucket level 1–10), each row: severity badge (1–3 خفيف green, 4–6 متوسط amber, 7–10 شديد red), bar indicator (width = `percentage%`), count + percentage text; empty state: "لا تتوفر بيانات"
- [x] T023 [US3] Create `src/app/features/analytics/urge/components/urge-distribution-chart/urge-distribution-chart.component.scss` — horizontal bar style, severity badge colours, RTL layout
- [x] T024 [US3] Add `<app-urge-distribution-chart>` to `urge.component.html` and import component in `urge.component.ts` — pass `state().distribution`

**Checkpoint**: Distribution section renders all 10 levels with correct widths, severity colours, and empty state.

---

## Phase 6: User Story 4 — Urge by Hour & Weekday (Priority: P4)

**Goal**: Show average urge per hour of day and per weekday with highest-slot highlights.

**Independent Test**: Load with records at known times and days. Confirm the "أعلى ساعة" and "أعلى يوم" badges appear on the correct slots and all 24-hour / 7-weekday slots are rendered.

### Implementation for User Story 4

- [x] T025 [P] [US4] Create `src/app/features/analytics/urge/components/urge-by-hour-chart/urge-by-hour-chart.component.ts` — standalone, `@Input({ required: true }) byHour: UrgeHourEntry[]`
- [x] T026 [US4] Create `src/app/features/analytics/urge/components/urge-by-hour-chart/urge-by-hour-chart.component.html` — list sorted by `avgUrge` descending (null slots at bottom with "لا بيانات"), highest slot badge "الأعلى", Arabic hour labels; empty state: "لا تتوفر بيانات الوقت للفترة المحددة"
- [x] T027 [US4] Create `src/app/features/analytics/urge/components/urge-by-hour-chart/urge-by-hour-chart.component.scss` — ranked list layout, highest-slot highlight, RTL
- [x] T028 [P] [US4] Create `src/app/features/analytics/urge/components/urge-by-weekday-chart/urge-by-weekday-chart.component.ts` — standalone, `@Input({ required: true }) byWeekday: UrgeWeekdayEntry[]`
- [x] T029 [US4] Create `src/app/features/analytics/urge/components/urge-by-weekday-chart/urge-by-weekday-chart.component.html` — 7 rows with bar indicators (width = `avgUrge / 10 * 100%`), highest day badge "أعلى يوم", null slots show bar width 0 + "لا بيانات"; empty state: "لا تتوفر بيانات كافية"
- [x] T030 [US4] Create `src/app/features/analytics/urge/components/urge-by-weekday-chart/urge-by-weekday-chart.component.scss` — horizontal bar, highlight colour, Arabic weekday layout, RTL
- [x] T031 [US4] Add both components to `urge.component.html`; import both in `urge.component.ts` — pass `state().byHour` and `state().byWeekday`

**Checkpoint**: Hour and weekday sections render with correct slot values, highlights, and empty states.

---

## Phase 7: User Story 5 — Urge by Trigger (Priority: P5)

**Goal**: Show a ranked list of trigger keywords ordered by average urge intensity (highest first).

**Independent Test**: Load with records tagged to different triggers each with distinct urge values. Confirm the list orders correctly, limited-sample badges appear for triggers with fewer than 3 records, and untagged records are excluded.

### Implementation for User Story 5

- [x] T032 [P] [US5] Create `src/app/features/analytics/urge/components/urge-by-trigger-list/urge-by-trigger-list.component.ts` — standalone, `@Input({ required: true }) byTrigger: UrgeTriggerEntry[]`
- [x] T033 [US5] Create `src/app/features/analytics/urge/components/urge-by-trigger-list/urge-by-trigger-list.component.html` — ranked table: rank | keyword | avgUrge (1 decimal) | recordCount | limited-sample badge "عينة محدودة" (when `isLimitedSample`); max 20 rows; empty state: "لا تتوفر بيانات المحفزات"
- [x] T034 [US5] Create `src/app/features/analytics/urge/components/urge-by-trigger-list/urge-by-trigger-list.component.scss` — table/list layout, limited-sample badge style, rank number style, RTL
- [x] T035 [US5] Add `<app-urge-by-trigger-list>` to `urge.component.html` and import component in `urge.component.ts` — pass `state().byTrigger`

**Checkpoint**: Trigger ranking list renders correctly with avgUrge ordering and limited-sample indicators.

---

## Phase 8: User Story 6 — Urge–Relapse Correlation (Priority: P6)

**Goal**: Show a correlation card explaining whether higher urge periods coincide with more frequent relapses.

**Independent Test**: Load with (a) ≥ 10 weeks of data where high-urge weeks have high relapse counts → confirm "ارتباط إيجابي" displayed; (b) fewer than 10 weekly data points → confirm insufficient-data message with correct weekly count shown.

### Implementation for User Story 6

- [x] T036 [P] [US6] Create `src/app/features/analytics/urge/components/urge-correlation-card/urge-correlation-card.component.ts` — standalone, `@Input({ required: true }) correlation: UrgeCorrelationResult`
- [x] T037 [US6] Create `src/app/features/analytics/urge/components/urge-correlation-card/urge-correlation-card.component.html` — direction heading with icon and colour (positive → red "ارتباط إيجابي", negative → green "ارتباط سلبي", neutral → "لا ارتباط واضح", insufficient → muted "بيانات غير كافية"); `explanationAr` paragraph; `pearsonR` shown as "(r = X.XX)" when non-null; weekly data points shown; insufficient-data branch: shows threshold vs current count
- [x] T038 [US6] Create `src/app/features/analytics/urge/components/urge-correlation-card/urge-correlation-card.component.scss` — direction colour theming, card layout, RTL
- [x] T039 [US6] Add `<app-urge-correlation-card>` to `urge.component.html` and import component in `urge.component.ts` — pass `state().correlation`

**Checkpoint**: Correlation card renders all four direction states correctly with Arabic explanations.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final wiring, styling consistency, and accessibility across all sections.

- [x] T040 Verify SCSS variables for dark mode and light mode are applied consistently across all 7 sub-component SCSS files — use project-wide CSS custom properties (no hard-coded colours)
- [x] T041 [P] Ensure all empty-state messages match the Arabic strings defined in `contracts/urge-contracts.md` exactly — do a text diff across all 7 component templates
- [x] T042 [P] Add `aria-label` attributes in Arabic to all interactive elements and chart-placeholder sections in each component template for screen-reader accessibility
- [x] T043 Validate full page layout in `urge.component.html` / `urge.component.scss` — correct RTL section ordering, consistent gap/padding tokens, responsive layout at mobile and desktop widths
- [x] T044 [P] Run `npx ng test --include="**/urge*" --watch=false` and confirm all tests pass with zero failures
- [x] T045 Run `npm start` and manually navigate to `http://localhost:4200/analytics/urge` — verify all 6 user stories render end-to-end with real LocalStorage data or the correct empty state when no data exists

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — **BLOCKS all sub-component phases**
- **US1 (Phase 3)**: Depends on Phase 2 — page skeleton + summary card
- **US2–US6 (Phases 4–8)**: All depend on Phase 2; can start in parallel once Phase 2 is done; US1 (Phase 3) must be complete first because it replaces `urge.component.ts/html`
- **Polish (Phase 9)**: Depends on all story phases complete

### User Story Dependencies

- **US1 (P1)**: After Phase 2 — first story; replaces the root component files
- **US2 (P2)**: After Phase 2 — can run in parallel with US3–US6 after US1 root-component wiring is done (T014–T016)
- **US3 (P3)**: After Phase 2 — parallel with US2, US4–US6
- **US4 (P4)**: After Phase 2 — parallel with US2, US3, US5–US6
- **US5 (P5)**: After Phase 2 — parallel with US2–US4, US6
- **US6 (P6)**: After Phase 2 — parallel with US2–US5

### Within Each Story Phase

- Engine/service tasks (Phase 2) before all component tasks
- Component `.ts` file before `.html` and `.scss` (selector must exist to import)
- Component fully created before wiring into `urge.component.ts/html`

### Parallel Opportunities

All tasks marked **[P]** within a phase can be executed simultaneously. Most sub-component creation tasks (T017/T021/T025/T028/T032/T036) are parallel with each other after Phase 2 completes.

---

## Parallel Example: Phases 4–8 (after Phase 3 complete)

```text
# All six sub-component .ts skeletons can be created simultaneously:
T017 urge-time-series-chart.component.ts
T021 urge-distribution-chart.component.ts
T025 urge-by-hour-chart.component.ts
T028 urge-by-weekday-chart.component.ts
T032 urge-by-trigger-list.component.ts
T036 urge-correlation-card.component.ts

# Then their .html templates can be authored in parallel:
T018, T022, T026, T029, T033, T037

# Then their .scss files in parallel:
T019, T023, T027, T030, T034, T038

# Finally wire all into root component:
T020, T024, T031, T035, T039
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T003)
2. Complete Phase 2: Foundational (T004–T010) — **critical gate**
3. Complete Phase 3: User Story 1 (T011–T016)
4. **STOP and VALIDATE**: Open `analytics/urge`, confirm summary card shows correct stats, trend badge, excluded record count
5. Demo / commit — the page is live and useful immediately

### Incremental Delivery

1. Setup + Foundational → engine extended, service live → Foundation ready
2. Phase 3 (US1) → Summary card functional → MVP
3. Phase 4 (US2) → Time series with trend → Deployed
4. Phase 5 (US3) → Distribution view → Deployed
5. Phase 6 (US4) → Hour & weekday breakdowns → Deployed
6. Phase 7 (US5) → Trigger ranking → Deployed
7. Phase 8 (US6) → Correlation card → All 6 stories live
8. Phase 9 (Polish) → Final review + tests pass

---

## Notes

- All engine functions added in Phase 2 are **pure functions** — easy to unit-test without Angular TestBed
- The `UrgeAnalyticsService` follows the `TriggerAnalyticsService` pattern exactly — reference `src/app/features/analytics/triggers/services/trigger-analytics.service.ts` for implementation guidance
- Chart library integration is deferred to Phase 12 — add an Arabic placeholder comment in each chart component template
- Do not modify `src/app/app.routes.ts` (route already exists) or any file outside `src/app/core/analytics/` and `src/app/features/analytics/urge/`
- `getDistribution(records, 'urgeLevel')` already returns the correct 10-bucket structure — no new engine function needed for distribution
- `getTriggerAnalysis` already returns `avgUrge` per keyword — sort by `avgUrge desc` (filtering out null entries) to produce `byTrigger`
