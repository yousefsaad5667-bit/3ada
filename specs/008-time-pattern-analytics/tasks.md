# Tasks: Time Pattern Analytics

**Input**: Design documents from `specs/008-time-pattern-analytics/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 [P] Create models in `src/app/features/analytics/patterns/models/pattern-view.model.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Implement `PatternAnalyticsService` in `src/app/features/analytics/patterns/services/pattern-analytics.service.ts`
- [x] T003 Update `PatternsComponent` logic in `src/app/features/analytics/patterns/patterns.component.ts`
- [x] T004 Update layout in `src/app/features/analytics/patterns/patterns.component.html` and `src/app/features/analytics/patterns/patterns.component.scss`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Weekday Activity Distribution (Priority: P1) 🎯 MVP

**Goal**: Display a bar chart showing total relapse counts broken down by day of the week.

**Independent Test**: View weekday chart; verify 7 bars render, heights correspond to counts, peak day highlighted.

### Tests for User Story 1

- [x] T005 [P] [US1] Write unit tests for `WeekdayChartComponent` rendering in `src/app/features/analytics/patterns/components/weekday-chart/weekday-chart.component.spec.ts`

### Implementation for User Story 1

- [x] T006 [P] [US1] Create `WeekdayChartComponent` logic in `src/app/features/analytics/patterns/components/weekday-chart/weekday-chart.component.ts`
- [x] T007 [US1] Implement `weekday-chart.component.html` and `weekday-chart.component.scss` (RTL bar chart)
- [x] T008 [US1] Register `patterns-weekday-chart` in `src/app/features/dashboard/dashboard.component.ts`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - View Hourly Activity Distribution (Priority: P2)

**Goal**: Display an hour-by-hour breakdown showing total relapses for each hour of the day.

**Independent Test**: View hourly chart; verify all 24 hours render correctly, missing hours zero-height.

### Tests for User Story 2

- [x] T009 [P] [US2] Write unit tests for `HourlyChartComponent` rendering in `src/app/features/analytics/patterns/components/hourly-chart/hourly-chart.component.spec.ts`

### Implementation for User Story 2

- [x] T010 [P] [US2] Create `HourlyChartComponent` logic in `src/app/features/analytics/patterns/components/hourly-chart/hourly-chart.component.ts`
- [x] T011 [US2] Implement `hourly-chart.component.html` and `hourly-chart.component.scss` (24-bar RTL chart)
- [x] T012 [US2] Register `patterns-hourly-chart` in `src/app/features/dashboard/dashboard.component.ts`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Compare AM vs PM Activity (Priority: P3)

**Goal**: Display an AM vs PM visual comparison.

**Independent Test**: View AM/PM chart; verify percentages are correct and dominant period is identified.

### Tests for User Story 3

- [x] T013 [P] [US3] Write unit tests for `PeriodSplitCardComponent` rendering in `src/app/features/analytics/patterns/components/period-split-card/period-split-card.component.spec.ts`

### Implementation for User Story 3

- [x] T014 [P] [US3] Create `PeriodSplitCardComponent` logic in `src/app/features/analytics/patterns/components/period-split-card/period-split-card.component.ts`
- [x] T015 [US3] Implement `period-split-card.component.html` and `period-split-card.component.scss`
- [x] T016 [US3] Register `patterns-period-split` in `src/app/features/dashboard/dashboard.component.ts`

**Checkpoint**: All P1-P3 user stories should now be independently functional

---

## Phase 6: User Story 4 - View Hour-Weekday Heatmap (Priority: P4)

**Goal**: Display a 7x24 heatmap where intensity reflects relapse count.

**Independent Test**: Verify heatmap cells correctly show intensity for target combinations.

### Tests for User Story 4

- [x] T017 [P] [US4] Write unit tests for `HourWeekdayHeatmapComponent` in `src/app/features/analytics/patterns/components/hour-weekday-heatmap/hour-weekday-heatmap.component.spec.ts`

### Implementation for User Story 4

- [x] T018 [P] [US4] Create `HourWeekdayHeatmapComponent` logic in `src/app/features/analytics/patterns/components/hour-weekday-heatmap/hour-weekday-heatmap.component.ts`
- [x] T019 [US4] Implement `hour-weekday-heatmap.component.html` and `hour-weekday-heatmap.component.scss`
- [x] T020 [US4] Register `patterns-heatmap` in `src/app/features/dashboard/dashboard.component.ts`

---

## Phase 7: User Story 5 - Identify Peak Times and Summary Insights (Priority: P5)

**Goal**: Display summary panel calling out peak weekday, peak hour, etc.

**Independent Test**: Verify summary panel correctly identifies peaks.

### Tests for User Story 5

- [x] T021 [P] [US5] Write unit tests for `PatternSummaryCardComponent` in `src/app/features/analytics/patterns/components/pattern-summary-card/pattern-summary-card.component.spec.ts`

### Implementation for User Story 5

- [x] T022 [P] [US5] Create `PatternSummaryCardComponent` logic in `src/app/features/analytics/patterns/components/pattern-summary-card/pattern-summary-card.component.ts`
- [x] T023 [US5] Implement `pattern-summary-card.component.html` and `pattern-summary-card.component.scss`
- [x] T024 [US5] Register `patterns-summary` in `src/app/features/dashboard/dashboard.component.ts`

---

## Phase 8: User Story 6 - Handle Empty and Sparse Time Data (Priority: P6)

**Goal**: Handle missing time fields cleanly.

**Independent Test**: Load records with no time; verify charts render nicely.

### Implementation for User Story 6

- [x] T025 [P] [US6] Add empty state rendering gracefully across `WeekdayChartComponent`, `HourlyChartComponent`, `PeriodSplitCardComponent`, `HourWeekdayHeatmapComponent`, `PatternSummaryCardComponent` components
- [x] T026 [US6] Ensure skipped/invalid records counts are visually conveyed in pattern analytics views

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T027 Code cleanup and SCSS refactoring across components
- [x] T028 Performance verification for 10k records
- [x] T029 Write integration tests for `PatternAnalyticsService` state transitions in `src/app/features/analytics/patterns/services/pattern-analytics.service.spec.ts`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 -> P2 -> P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2)
- **User Story 2 (P2)**: Can start after Foundational (Phase 2)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2)
- **User Story 4 (P4)**: Can start after Foundational (Phase 2)
- **User Story 5 (P5)**: Can start after Foundational (Phase 2)
- **User Story 6 (P6)**: Applies empty state robustness across the other stories

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational -> Foundation ready
2. Add User Story 1 -> Test independently -> Deploy/Demo (MVP!)
3. Add User Story 2 -> Test independently -> Deploy/Demo
4. Add User Story 3 -> Test independently -> Deploy/Demo
5. Each story adds value without breaking previous stories
