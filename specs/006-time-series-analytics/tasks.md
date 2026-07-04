# Tasks: Time Series Analytics

**Input**: Design documents from `/specs/006-time-series-analytics/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/time-series-contracts.md, quickstart.md

**Tests**: Included because the implementation plan requires automated tests for analytics calculations, Signal-derived view models, and chart/table consistency.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Angular source paths are relative to repository root under `src/app/`
- Feature documentation paths are relative to `specs/006-time-series-analytics/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the Phase 6 feature structure without changing behavior.

- [x] T001 Create Phase 6 feature directories in `src/app/features/analytics/time-series/models/`, `src/app/features/analytics/time-series/services/`, and `src/app/features/analytics/time-series/components/`
- [x] T002 [P] Create chart component directory structure in `src/app/features/analytics/time-series/components/time-series-chart/`
- [x] T003 [P] Create table component directory structure in `src/app/features/analytics/time-series/components/time-series-table/`
- [x] T004 [P] Create dashboard card component directories in `src/app/features/analytics/time-series/components/daily-series-card/`, `src/app/features/analytics/time-series/components/period-series-card/`, `src/app/features/analytics/time-series/components/moving-average-card/`, `src/app/features/analytics/time-series/components/cumulative-count-card/`, and `src/app/features/analytics/time-series/components/trend-summary-card/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared models and service shell required before any user story can be completed.

**CRITICAL**: No user story work can begin until this phase is complete.

- [x] T005 [P] Define TimeSeriesPoint, TimeSeriesPeriodView, TimeSeriesDatasetView, TrendSummaryView, and TimeSeriesAnalyticsState interfaces in `src/app/features/analytics/time-series/models/time-series-view.model.ts`
- [x] T006 Add TimeSeriesStatus, TrendDirection, and TrendConfidence exported types in `src/app/features/analytics/time-series/models/time-series-view.model.ts`
- [x] T007 Create `TimeSeriesAnalyticsService` skeleton with repository and dashboard filter dependencies in `src/app/features/analytics/time-series/services/time-series-analytics.service.ts`
- [x] T008 [P] Add `TimeSeriesAnalyticsService` unit test scaffold in `src/app/features/analytics/time-series/services/time-series-analytics.service.spec.ts`
- [x] T009 Export feature view models from `src/app/features/analytics/time-series/models/time-series-view.model.ts`
- [x] T010 Add reusable date conversion helpers for dashboard filters in `src/app/features/analytics/time-series/services/time-series-analytics.service.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - View Relapse Activity Over Time (Priority: P1) MVP

**Goal**: Users can view daily, weekly, and monthly relapse activity in chronological order with missing daily dates represented as zero.

**Independent Test**: Load records across multiple dates, select a dashboard date range, and verify daily, weekly, and monthly views display complete chronological datasets with zero-filled gaps.

### Tests for User Story 1

- [x] T011 [P] [US1] Add daily zero-fill and chronological ordering tests in `src/app/core/analytics/engine/time-series.engine.spec.ts`
- [x] T012 [US1] Add weekly and monthly overlapping-period tests in `src/app/core/analytics/engine/time-series.engine.spec.ts`
- [x] T013 [P] [US1] Add daily/weekly/monthly derived state tests in `src/app/features/analytics/time-series/services/time-series-analytics.service.spec.ts`
- [x] T014 [P] [US1] Add chart component rendering tests for zero values and ordered points in `src/app/features/analytics/time-series/components/time-series-chart/time-series-chart.component.spec.ts`

### Implementation for User Story 1

- [x] T015 [US1] Extend `getWeeklyCounts` and `getMonthlyCounts` output mapping to preserve partial period metadata in `src/app/core/analytics/engine/time-series.engine.ts`
- [x] T016 [US1] Export any new time-series engine helpers from `src/app/core/analytics/index.ts`
- [x] T017 [US1] Implement daily, weekly, and monthly dataset derivation in `src/app/features/analytics/time-series/services/time-series-analytics.service.ts`
- [x] T018 [P] [US1] Implement responsive Chart.js line/bar rendering inputs in `src/app/features/analytics/time-series/components/time-series-chart/time-series-chart.component.ts`
- [x] T019 [P] [US1] Implement chart template with Arabic accessible labels and zero-value support in `src/app/features/analytics/time-series/components/time-series-chart/time-series-chart.component.html`
- [x] T020 [P] [US1] Implement chart styles with RTL-safe layout and theme variables in `src/app/features/analytics/time-series/components/time-series-chart/time-series-chart.component.scss`
- [x] T021 [US1] Implement daily series dashboard card behavior in `src/app/features/analytics/time-series/components/daily-series-card/daily-series-card.component.ts`
- [x] T022 [P] [US1] Implement daily series card template in `src/app/features/analytics/time-series/components/daily-series-card/daily-series-card.component.html`
- [x] T023 [P] [US1] Implement daily series card styles in `src/app/features/analytics/time-series/components/daily-series-card/daily-series-card.component.scss`
- [x] T024 [US1] Implement weekly/monthly period card behavior and grouping toggle in `src/app/features/analytics/time-series/components/period-series-card/period-series-card.component.ts`
- [x] T025 [P] [US1] Implement weekly/monthly period card template in `src/app/features/analytics/time-series/components/period-series-card/period-series-card.component.html`
- [x] T026 [P] [US1] Implement weekly/monthly period card styles in `src/app/features/analytics/time-series/components/period-series-card/period-series-card.component.scss`
- [x] T027 [US1] Register `time-series-daily` and `time-series-periods` dashboard descriptors in `src/app/features/dashboard/dashboard.component.ts`

**Checkpoint**: US1 is independently functional: daily, weekly, and monthly activity appears on the dashboard and updates from the active date range.

---

## Phase 4: User Story 2 - Understand Trends and Momentum (Priority: P2)

**Goal**: Users can understand whether relapse activity is increasing, decreasing, stable, or insufficient for interpretation using moving average, cumulative count, growth rate, and average count.

**Independent Test**: Use known increasing, decreasing, flat, and too-small datasets; verify trend direction, moving average, growth rate, cumulative count, and average match expected values.

### Tests for User Story 2

- [x] T028 [P] [US2] Add cumulative count tests in `src/app/core/analytics/engine/time-series.engine.spec.ts`
- [x] T029 [P] [US2] Add trend direction, growth rate, average count, and insufficient-data tests in `src/app/core/analytics/engine/statistics.engine.spec.ts`
- [x] T030 [P] [US2] Add moving average and cumulative derived state tests in `src/app/features/analytics/time-series/services/time-series-analytics.service.spec.ts`
- [x] T031 [P] [US2] Add summary card state tests for increasing, decreasing, stable, and insufficient-data cases in `src/app/features/analytics/time-series/components/trend-summary-card/trend-summary-card.component.spec.ts`

### Implementation for User Story 2

- [x] T032 [US2] Add `getCumulativeSeries` helper in `src/app/core/analytics/engine/time-series.engine.ts`
- [x] T033 [US2] Add `getTrendSummary` helper for direction, growth rate, average, and confidence in `src/app/core/analytics/engine/statistics.engine.ts`
- [x] T034 [US2] Export cumulative and trend helpers from `src/app/core/analytics/index.ts`
- [x] T035 [US2] Add moving average, cumulative, and trend derivation to `TimeSeriesAnalyticsService` in `src/app/features/analytics/time-series/services/time-series-analytics.service.ts`
- [x] T036 [US2] Implement moving average dashboard card behavior in `src/app/features/analytics/time-series/components/moving-average-card/moving-average-card.component.ts`
- [x] T037 [P] [US2] Implement moving average dashboard card template and styles in `src/app/features/analytics/time-series/components/moving-average-card/moving-average-card.component.html` and `src/app/features/analytics/time-series/components/moving-average-card/moving-average-card.component.scss`
- [x] T038 [US2] Implement cumulative count dashboard card behavior in `src/app/features/analytics/time-series/components/cumulative-count-card/cumulative-count-card.component.ts`
- [x] T039 [P] [US2] Implement cumulative count dashboard card template and styles in `src/app/features/analytics/time-series/components/cumulative-count-card/cumulative-count-card.component.html` and `src/app/features/analytics/time-series/components/cumulative-count-card/cumulative-count-card.component.scss`
- [x] T040 [US2] Implement trend summary card behavior in `src/app/features/analytics/time-series/components/trend-summary-card/trend-summary-card.component.ts`
- [x] T041 [P] [US2] Implement trend summary card template and styles in `src/app/features/analytics/time-series/components/trend-summary-card/trend-summary-card.component.html` and `src/app/features/analytics/time-series/components/trend-summary-card/trend-summary-card.component.scss`
- [x] T042 [US2] Register `time-series-moving-average`, `time-series-cumulative`, and `time-series-summary` dashboard descriptors in `src/app/features/dashboard/dashboard.component.ts`

**Checkpoint**: US2 is independently functional: trend and momentum cards explain the active range without relying on table inspection.

---

## Phase 5: User Story 3 - Inspect Underlying Time Series Data (Priority: P3)

**Goal**: Users can verify chart values through matching raw data tables for daily, weekly, and monthly counts.

**Independent Test**: Compare chart points and table rows for the same selected date range; labels, counts, and ordering must match exactly.

### Tests for User Story 3

- [x] T043 [P] [US3] Add chart/table row consistency tests in `src/app/features/analytics/time-series/services/time-series-analytics.service.spec.ts`
- [x] T044 [P] [US3] Add table component rendering tests for daily, weekly, monthly, and empty datasets in `src/app/features/analytics/time-series/components/time-series-table/time-series-table.component.spec.ts`

### Implementation for User Story 3

- [x] T045 [US3] Add table row mapping helpers to `TimeSeriesAnalyticsService` in `src/app/features/analytics/time-series/services/time-series-analytics.service.ts`
- [x] T046 [P] [US3] Implement reusable table inputs and row rendering logic in `src/app/features/analytics/time-series/components/time-series-table/time-series-table.component.ts`
- [x] T047 [P] [US3] Implement accessible Arabic table template in `src/app/features/analytics/time-series/components/time-series-table/time-series-table.component.html`
- [x] T048 [P] [US3] Implement responsive RTL table styles in `src/app/features/analytics/time-series/components/time-series-table/time-series-table.component.scss`
- [x] T049 [US3] Embed `TimeSeriesTableComponent` in daily and period cards in `src/app/features/analytics/time-series/components/daily-series-card/daily-series-card.component.html` and `src/app/features/analytics/time-series/components/period-series-card/period-series-card.component.html`
- [x] T050 [US3] Add table visibility controls for compact dashboard cards in `src/app/features/analytics/time-series/components/daily-series-card/daily-series-card.component.ts` and `src/app/features/analytics/time-series/components/period-series-card/period-series-card.component.ts`

**Checkpoint**: US3 is independently functional: users can inspect exact data behind daily, weekly, and monthly charts.

---

## Phase 6: User Story 4 - Handle Empty and Sparse Data (Priority: P4)

**Goal**: Empty, one-record, sparse, invalid, and single-day datasets render accurately without misleading trend claims or broken charts.

**Independent Test**: Load no records, one record, sparse records, a single-day range, and invalid stored records; verify charts, tables, trend summaries, empty states, and notices remain accurate and readable.

### Tests for User Story 4

- [x] T051 [P] [US4] Add invalid and incomplete record exclusion tests in `src/app/features/analytics/time-series/services/time-series-analytics.service.spec.ts`
- [x] T052 [US4] Add empty, one-record, single-day, and sparse dataset tests in `src/app/features/analytics/time-series/services/time-series-analytics.service.spec.ts`
- [x] T053 [P] [US4] Add empty-state rendering tests for chart, table, and summary cards in `src/app/features/analytics/time-series/components/time-series-chart/time-series-chart.component.spec.ts`, `src/app/features/analytics/time-series/components/time-series-table/time-series-table.component.spec.ts`, and `src/app/features/analytics/time-series/components/trend-summary-card/trend-summary-card.component.spec.ts`

### Implementation for User Story 4

- [x] T054 [US4] Add record validation and invalid-record counting to `TimeSeriesAnalyticsService` in `src/app/features/analytics/time-series/services/time-series-analytics.service.ts`
- [x] T055 [US4] Add empty and sparse state derivation to `TimeSeriesAnalyticsService` in `src/app/features/analytics/time-series/services/time-series-analytics.service.ts`
- [x] T056 [US4] Add insufficient-data messaging to trend summaries in `src/app/core/analytics/engine/statistics.engine.ts`
- [x] T057 [P] [US4] Add empty and sparse states to chart template and styles in `src/app/features/analytics/time-series/components/time-series-chart/time-series-chart.component.html` and `src/app/features/analytics/time-series/components/time-series-chart/time-series-chart.component.scss`
- [x] T058 [P] [US4] Add invalid-record notice and insufficient-data state to summary card template in `src/app/features/analytics/time-series/components/trend-summary-card/trend-summary-card.component.html`
- [x] T059 [US4] Wire Phase 6 cards into dashboard shell loading, empty, data, and error conventions in `src/app/features/analytics/time-series/components/daily-series-card/daily-series-card.component.ts`, `src/app/features/analytics/time-series/components/period-series-card/period-series-card.component.ts`, `src/app/features/analytics/time-series/components/moving-average-card/moving-average-card.component.ts`, `src/app/features/analytics/time-series/components/cumulative-count-card/cumulative-count-card.component.ts`, and `src/app/features/analytics/time-series/components/trend-summary-card/trend-summary-card.component.ts`

**Checkpoint**: All user stories are independently functional and resilient across empty, sparse, and partially invalid local data.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements and validation that affect multiple user stories.

- [x] T060 [P] Fill route-level Phase 6 analytics view in `src/app/features/analytics/time-series/time-series.component.ts`
- [x] T061 [P] Build route-level Phase 6 analytics template in `src/app/features/analytics/time-series/time-series.component.html`
- [x] T062 [P] Add route-level responsive RTL styles in `src/app/features/analytics/time-series/time-series.component.scss`
- [x] T063 Verify dashboard placeholder cards are removed or demoted behind real Phase 6 cards in `src/app/features/dashboard/dashboard.component.ts`
- [x] T064 [P] Add Arabic copy review for route and card UI strings in `src/app/features/analytics/time-series/time-series.component.html`, `src/app/features/analytics/time-series/components/daily-series-card/daily-series-card.component.html`, `src/app/features/analytics/time-series/components/period-series-card/period-series-card.component.html`, `src/app/features/analytics/time-series/components/moving-average-card/moving-average-card.component.html`, `src/app/features/analytics/time-series/components/cumulative-count-card/cumulative-count-card.component.html`, and `src/app/features/analytics/time-series/components/trend-summary-card/trend-summary-card.component.html`
- [x] T065 [P] Validate mobile widths, dark mode, and light mode for chart/table cards in `src/app/features/analytics/time-series/components/time-series-chart/time-series-chart.component.scss` and `src/app/features/analytics/time-series/components/time-series-table/time-series-table.component.scss`
- [x] T066 Run quickstart verification commands from `specs/006-time-series-analytics/quickstart.md`
- [x] T067 Run manual verification checklist from `specs/006-time-series-analytics/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion and is the MVP
- **User Story 2 (Phase 4)**: Depends on Foundational completion; best after US1 because it builds on daily datasets and shared charting
- **User Story 3 (Phase 5)**: Depends on US1 for daily/period datasets and cards
- **User Story 4 (Phase 6)**: Depends on US1 and US2 for shared state and summary behavior
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - no dependency on other user stories
- **User Story 2 (P2)**: Can start after Foundational, but reuses US1 daily datasets for the cleanest implementation
- **User Story 3 (P3)**: Requires chart datasets from US1 before table consistency can be validated
- **User Story 4 (P4)**: Requires the service and card states from US1/US2 before empty/sparse behavior can be finalized

### Within Each User Story

- Tests first, and they should fail before implementation
- Models before services
- Services before components
- Shared chart/table components before dashboard card integration
- Dashboard registration after card components exist
- Story checkpoint validation before moving to the next priority

### Parallel Opportunities

- Setup directory tasks T002-T004 can run in parallel after T001
- Foundational model/spec scaffold tasks T005, T008, and T009 can run in parallel
- US1 tests T011-T014 can run in parallel
- US1 chart files T018-T020 can run in parallel with card templates/styles T022-T026 after T017
- US2 tests T028-T031 can run in parallel
- US2 moving average, cumulative, and summary card templates/styles T037, T039, and T041 can run in parallel after their component classes exist
- US3 table component files T046-T048 can run in parallel after T045
- US4 tests T051-T053 can run in parallel
- Polish UI review and responsive checks T064-T065 can run in parallel after card implementation

---

## Parallel Example: User Story 1

```text
Task: "T011 [P] [US1] Add daily zero-fill and chronological ordering tests in src/app/core/analytics/engine/time-series.engine.spec.ts"
Task: "T013 [P] [US1] Add daily/weekly/monthly derived state tests in src/app/features/analytics/time-series/services/time-series-analytics.service.spec.ts"
Task: "T014 [P] [US1] Add chart component rendering tests for zero values and ordered points in src/app/features/analytics/time-series/components/time-series-chart/time-series-chart.component.spec.ts"
```

## Parallel Example: User Story 2

```text
Task: "T028 [P] [US2] Add cumulative count tests in src/app/core/analytics/engine/time-series.engine.spec.ts"
Task: "T029 [P] [US2] Add trend direction, growth rate, average count, and insufficient-data tests in src/app/core/analytics/engine/statistics.engine.spec.ts"
Task: "T031 [P] [US2] Add summary card state tests for increasing, decreasing, stable, and insufficient-data cases in src/app/features/analytics/time-series/components/trend-summary-card/trend-summary-card.component.spec.ts"
```

## Parallel Example: User Story 3

```text
Task: "T046 [P] [US3] Implement reusable table inputs and row rendering logic in src/app/features/analytics/time-series/components/time-series-table/time-series-table.component.ts"
Task: "T047 [P] [US3] Implement accessible Arabic table template in src/app/features/analytics/time-series/components/time-series-table/time-series-table.component.html"
Task: "T048 [P] [US3] Implement responsive RTL table styles in src/app/features/analytics/time-series/components/time-series-table/time-series-table.component.scss"
```

## Parallel Example: User Story 4

```text
Task: "T051 [P] [US4] Add invalid and incomplete record exclusion tests in src/app/features/analytics/time-series/services/time-series-analytics.service.spec.ts"
Task: "T052 [P] [US4] Add empty, one-record, single-day, and sparse dataset tests in src/app/features/analytics/time-series/services/time-series-analytics.service.spec.ts"
Task: "T053 [P] [US4] Add empty-state rendering tests for chart, table, and summary cards in src/app/features/analytics/time-series/components/time-series-chart/time-series-chart.component.spec.ts, src/app/features/analytics/time-series/components/time-series-table/time-series-table.component.spec.ts, and src/app/features/analytics/time-series/components/trend-summary-card/trend-summary-card.component.spec.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Stop and validate daily, weekly, and monthly dashboard cards independently

### Incremental Delivery

1. Deliver US1 for raw time series visibility
2. Add US2 for trend, moving average, cumulative count, and summary interpretation
3. Add US3 for raw data table inspection and chart/table trust
4. Add US4 for empty, sparse, and invalid-data resilience
5. Polish route-level view, Arabic RTL copy, responsive behavior, and quickstart validation

### Parallel Team Strategy

1. Complete Setup and Foundational tasks together
2. Assign core analytics tests/helpers to one developer and Angular card components to another after Foundational completion
3. Keep dashboard descriptor registration as the integration point after each story card is complete
4. Validate each story checkpoint before stacking the next user story on top

---

## Notes

- [P] tasks touch different files or can be performed independently after their phase prerequisites.
- [US1], [US2], [US3], and [US4] labels map directly to user stories in `specs/006-time-series-analytics/spec.md`.
- Preserve the constitution: Angular-only, LocalStorage-only, Arabic RTL, offline-first, and no backend/API/database.
- Use Chart.js for Phase 6 time-series charts as decided in `research.md`.
- Commit after each task or logical group if using the optional Spec Kit git hook.
