---
description: "Task list template for feature implementation"
---

# Tasks: UI/UX Refinements

**Input**: Design documents from `specs/014-ui-ux-refinements/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. Priority order maps to the spec.md (P1s first, then P2s).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure
*(Skipped: No infrastructure setup required for these UI fixes)*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented
*(Skipped: No blocking infrastructure required for these UI fixes)*

---

## Phase 3: User Story 1 - Contextually Correct Elapse Color (Priority: P1) 🎯 MVP

**Goal**: Update elapsed-time indicator on relapse cards to use an alert color (orange/red) instead of green.

**Independent Test**: Open the dashboard with at least one relapse record; verify the elapsed-time indicator is displayed in an alert color rather than green.

### Implementation for User Story 1

- [x] T001 [US1] Add `--color-elapse-indicator` (alerting amber/orange) to `src/styles/_themes.scss`
- [x] T002 [US1] Replace `--success-color` with `var(--color-elapse-indicator)` in `.decreasing` class of `src/app/features/analytics/time-series/components/trend-summary-card/trend-summary-card.component.scss`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Fixed (Non-Draggable) Dashboard Cards (Priority: P1)

**Goal**: Prevent users from accidentally dragging dashboard cards, keeping them static.

**Independent Test**: Attempt to drag any dashboard card; the card must not move from its original position.

### Implementation for User Story 2

- [x] T003 [P] [US2] Remove `DragDropModule` and `onDrop()` from `src/app/features/dashboard/dashboard.component.ts`
- [x] T004 [P] [US2] Remove `cdkDropList` and `cdkDrag` directives from `src/app/features/dashboard/dashboard.component.html`
- [x] T005 [P] [US2] Remove `cdk-drag-handle` class from `src/app/features/dashboard/components/dashboard-card-shell/dashboard-card-shell.component.html`
- [x] T006 [P] [US2] Remove `cursor: grab` and `cursor: grabbing` from `src/app/features/dashboard/components/dashboard-card-shell/dashboard-card-shell.component.scss`

**Checkpoint**: At this point, User Story 2 should be fully functional and testable independently

---

## Phase 5: User Story 3 - Theme-Adaptive Card Appearance (Priority: P1)

**Goal**: Ensure cards display readable text and appropriate backgrounds in both light and dark modes.

**Independent Test**: Toggle between light and dark mode; verify all dashboard cards display readable text and appropriate backgrounds in both modes.

### Implementation for User Story 3

- [x] T007 [P] [US3] Add missing theme aliases (`--color-surface`, `--color-text-muted`, `--color-bg-surface-secondary`) to both light and dark blocks in `src/styles/_themes.scss`
- [x] T008 [P] [US3] Replace `var(--surface-color, #ffffff)` with `var(--color-bg-card)` in `src/app/features/dashboard/components/dashboard-card-shell/dashboard-card-shell.component.scss`
- [x] T009 [P] [US3] Replace `--surface-color` fallbacks with `var(--color-bg-card)` in `src/app/features/dashboard` placeholder SCSS files (if any exist)

**Checkpoint**: At this point, User Story 3 should be fully functional and testable independently

---

## Phase 6: User Story 6 - Analytics Cards Displaying Real Data (Priority: P1)

**Goal**: Fix the 9 broken analytics cards on the dashboard so they fetch and display real data.

**Independent Test**: With at least one relapse record in storage, open any of the nine affected cards; verify each displays real data.

### Implementation for User Story 6

- [x] T010 [P] [US6] Create `WeekdayChartCardComponent` wrapper in `src/app/features/analytics/patterns/components/weekday-chart-card/`
- [x] T011 [P] [US6] Create `HourlyChartCardComponent` wrapper in `src/app/features/analytics/patterns/components/hourly-chart-card/`
- [x] T012 [P] [US6] Create `PeriodSplitCardWrapperComponent` in `src/app/features/analytics/patterns/components/period-split-card-wrapper/`
- [x] T013 [P] [US6] Create `HourWeekdayHeatmapCardComponent` in `src/app/features/analytics/patterns/components/hour-weekday-heatmap-card/`
- [x] T014 [P] [US6] Create `PatternSummaryCardWrapperComponent` in `src/app/features/analytics/patterns/components/pattern-summary-card-wrapper/`
- [x] T015 [P] [US6] Create `TriggerRankingCardComponent` in `src/app/features/analytics/triggers/components/trigger-ranking-list-card/`
- [x] T016 [P] [US6] Create `TriggerSummaryCardWrapperComponent` in `src/app/features/analytics/triggers/components/trigger-summary-card-wrapper/`
- [x] T017 [P] [US6] Create `TriggerTimelineCardComponent` in `src/app/features/analytics/triggers/components/trigger-timeline-card/`
- [x] T018 [P] [US6] Create `TriggerDistributionCardComponent` in `src/app/features/analytics/triggers/components/trigger-distribution-card/`
- [x] T019 [US6] Update `CARD_REGISTRY` in `src/app/features/dashboard/dashboard.component.ts` to use new smart wrappers (depends on T010-T018)

**Checkpoint**: At this point, User Story 6 should be fully functional and testable independently

---

## Phase 7: User Story 4 - Global Date Filter Across All Views (Priority: P2)

**Goal**: Move the date filter from the dashboard into the global header so it's consistent across all views.

**Independent Test**: Change the date filter in any component; verify that all other visible analytics components immediately reflect the same period.

### Implementation for User Story 4

- [x] T020 [P] [US4] Add `DateRangeSelectorComponent` to imports array in `src/app/shared/components/header/header.component.ts`
- [x] T021 [P] [US4] Add `<app-date-range-selector>` to `src/app/shared/components/header/header.component.html`
- [x] T022 [US4] Remove `DateRangeSelectorComponent` from imports in `src/app/features/dashboard/dashboard.component.ts` (depends on T020)
- [x] T023 [US4] Remove `<app-date-range-selector>` from `src/app/features/dashboard/dashboard.component.html` (depends on T021)

**Checkpoint**: At this point, User Story 4 should be fully functional and testable independently

---

## Phase 8: User Story 5 - Graceful Handling of Large Date Ranges (Priority: P2)

**Goal**: Prevent charts and heatmaps from overflowing the page layout when 90+ days are selected.

**Independent Test**: Select a 90-day (or longer) range; verify all charts and heatmaps remain within their containers and are readable.

### Implementation for User Story 5

- [x] T024 [P] [US5] Add `overflow-x: auto` to chart container in `src/app/features/analytics/patterns/components/weekday-chart/weekday-chart.component.scss`
- [x] T025 [P] [US5] Add `overflow-x: auto` to chart container in `src/app/features/analytics/patterns/components/hourly-chart/hourly-chart.component.scss`
- [x] T026 [P] [US5] Add `overflow-x: auto` to container and `min-width` to inner grid in `src/app/features/analytics/patterns/components/hour-weekday-heatmap/hour-weekday-heatmap.component.scss`
- [x] T027 [P] [US5] Add `overflow-x: auto` to timeline container in `src/app/features/analytics/triggers/components/trigger-timeline/trigger-timeline.component.scss`

**Checkpoint**: At this point, User Story 5 should be fully functional and testable independently

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T028 Run full end-to-end manual testing against all acceptance criteria
- [x] T029 Clean up any unused imports after component wrapper creation

---

## Dependencies & Execution Order

### Phase Dependencies

- All phases (User Stories) can theoretically be worked on independently because they target different components or distinct CSS fixes, with the exception of the `dashboard.component.ts` file being touched by US2, US6, and US4. It's recommended to do them sequentially to avoid merge conflicts on that file, or coordinate closely.

### Parallel Opportunities

- P1 stories (US1, US2, US3, US6) can be run sequentially or in parallel.
- Within US6, the creation of all 9 wrappers (T010-T018) can happen in parallel before T019 wires them up.
- CSS fixes (US1, US3, US5) can happen entirely in parallel.

---

## Parallel Example: User Story 6

```bash
# Launch all wrappers for User Story 6 together:
Task: "Create WeekdayChartCardComponent wrapper in src/app/features/analytics/patterns/components/weekday-chart-card/"
Task: "Create HourlyChartCardComponent wrapper in src/app/features/analytics/patterns/components/hourly-chart-card/"
Task: "Create PeriodSplitCardWrapperComponent in src/app/features/analytics/patterns/components/period-split-card-wrapper/"
# ... etc.
```

---

## Implementation Strategy

### Incremental Delivery

1. Add User Story 1 (Elapse color) → Test independently
2. Add User Story 2 (Fix draggable cards) → Test independently 
3. Add User Story 3 (Theme-adaptive cards) → Test independently
4. Add User Story 6 (Data wrappers) → Test independently 
5. Add User Story 4 (Global filter) → Test independently 
6. Add User Story 5 (Large date handling) → Test independently 
