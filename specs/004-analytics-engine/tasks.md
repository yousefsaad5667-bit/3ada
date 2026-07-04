---
description: "Task list for Analytics Engine implementation"
---

# Tasks: Analytics Engine

**Input**: Design documents from `specs/004-analytics-engine/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/analytics-api.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for the Analytics Engine.

- [x] T001 Create analytics engine directory structure in `src/app/core/analytics/`
- [x] T002 [P] Create `DatePreset`, `DateRange`, `Granularity` types in `src/app/core/analytics/models/analytics-granularity.types.ts` and `src/app/core/analytics/models/analytics.types.ts`
- [x] T003 [P] Create output entity types (`TimeSeriesEntry`, `WeekdayEntry`, `SummaryStatistics`, etc.) in `src/app/core/analytics/models/analytics.types.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented. Specifically, the date range logic (User Story 4 from spec) is foundational.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T004 [P] Write unit tests for date utilities in `src/app/core/analytics/utils/date-range.utils.spec.ts`
- [x] T005 [P] Implement `getDateRangeBounds` and native Date helpers in `src/app/core/analytics/utils/date-range.utils.ts`
- [x] T006 Update `src/app/features/relapses/models/record-filter.types.ts` to replace local DatePreset with the core one

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel.

---

## Phase 3: User Story 1 - Query Time Series Data (Priority: P1) 🎯 MVP

**Goal**: Retrieve relapse counts aggregated over time (daily, weekly, or monthly) for a given date range to render a time series chart.

**Independent Test**: Can be tested in isolation by calling `getDailyCounts({ from, to })` with a fixed set of records and asserting that the returned array has the correct structure, date span, and counts — including zero-filled gaps.

### Tests for User Story 1 ⚠️

- [x] T007 [P] [US1] Write unit tests for `getDailyCounts`, `getWeeklyCounts`, `getMonthlyCounts`, and `getTimeSeries` in `src/app/core/analytics/engine/time-series.engine.spec.ts`

### Implementation for User Story 1

- [x] T008 [P] [US1] Implement `getDailyCounts` (with zero-filling) in `src/app/core/analytics/engine/time-series.engine.ts`
- [x] T009 [P] [US1] Implement `getWeeklyCounts` (with custom inline ISO week logic) in `src/app/core/analytics/engine/time-series.engine.ts`
- [x] T010 [P] [US1] Implement `getMonthlyCounts` in `src/app/core/analytics/engine/time-series.engine.ts`
- [x] T011 [US1] Implement `getTimeSeries` unified entry point in `src/app/core/analytics/engine/time-series.engine.ts`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Compute Summary Statistics (Priority: P2)

**Goal**: Retrieve pre-computed statistical summaries (count, average, median, min, max, standard deviation) for a given date range and set of records.

**Independent Test**: Can be tested by calling `getSummaryStatistics(records, { from, to })` with a known dataset and asserting each returned field matches hand-calculated values.

### Tests for User Story 2 ⚠️

- [x] T012 [P] [US2] Write unit tests for statistics functions in `src/app/core/analytics/engine/statistics.engine.spec.ts`

### Implementation for User Story 2

- [x] T013 [P] [US2] Implement `getSummaryStatistics` in `src/app/core/analytics/engine/statistics.engine.ts`
- [x] T014 [P] [US2] Implement `getMovingAverage` in `src/app/core/analytics/engine/statistics.engine.ts`
- [x] T015 [P] [US2] Implement `getDistribution` in `src/app/core/analytics/engine/statistics.engine.ts`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently.

---

## Phase 5: User Story 3 - Analyze Behavioral Patterns (Priority: P3)

**Goal**: Query how relapse activity distributes across weekdays, hours of day, urge levels, and triggers to surface behavioral insights.

**Independent Test**: Can be tested by calling `getWeekdayAnalysis(records)`, `getHourAnalysis(records)`, etc. with fixed datasets and asserting correctly ranked and labeled distributions.

### Tests for User Story 3 ⚠️

- [x] T016 [P] [US3] Write unit tests for pattern analytics in `src/app/core/analytics/engine/pattern.engine.spec.ts`
- [x] T017 [P] [US3] Write unit tests for trigger and urge analytics in `src/app/core/analytics/engine/trigger.engine.spec.ts` and `urge.engine.spec.ts`
- [x] T018 [P] [US3] Write unit tests for heatmap analytics in `src/app/core/analytics/engine/heatmap.engine.spec.ts`

### Implementation for User Story 3

- [x] T019 [P] [US3] Implement `getWeekdayAnalysis` with Arabic labels in `src/app/core/analytics/engine/pattern.engine.ts`
- [x] T020 [P] [US3] Implement `getHourAnalysis` (handling null times) in `src/app/core/analytics/engine/pattern.engine.ts`
- [x] T021 [P] [US3] Implement `getTriggerAnalysis` with simple tokenization and Arabic stop words in `src/app/core/analytics/engine/trigger.engine.ts`
- [x] T022 [P] [US3] Implement `getUrgeAnalysis` in `src/app/core/analytics/engine/urge.engine.ts`
- [x] T023 [P] [US3] Implement `getHeatmap` in `src/app/core/analytics/engine/heatmap.engine.ts`

**Checkpoint**: All user stories should now be independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and finalizing the API contract.

- [x] T024 Export all public API functions defined in the contract from `src/app/core/analytics/index.ts`
- [x] T025 Run performance verification benchmark script to verify 100,000 records complete in < 500ms
- [x] T026 Code cleanup, formatting, and verifying zero Angular dependencies in the engine module

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories.
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion. User stories can proceed sequentially or in parallel.
- **Polish (Phase 6)**: Depends on all user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational.
- **User Story 2 (P2)**: Can start after Foundational. Independent of US1.
- **User Story 3 (P3)**: Can start after Foundational. Independent of US1 and US2.

### Parallel Opportunities

- Types definition in Setup can be done in parallel.
- All tests for a specific engine file can be run in parallel with tests for other engine files.
- US1, US2, US3 implementations can be developed completely in parallel once the types and `getDateRangeBounds` are established, since they are independent pure functions.

---

## Parallel Example: User Story 1

```bash
# Launch models and foundational types:
Task: "Create DatePreset, DateRange, Granularity types"
Task: "Create output entity types"

# Later, launch US1 tasks in parallel:
Task: "Implement getDailyCounts"
Task: "Implement getWeeklyCounts"
Task: "Implement getMonthlyCounts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Run `ng test` for the time-series engine. Test User Story 1 independently.
