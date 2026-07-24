# Tasks: Calendar Analytics

**Input**: Design documents from `/specs/007-calendar-analytics/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create view models in src/app/features/analytics/calendar/models/calendar-view.model.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Implement CalendarAnalyticsService in src/app/features/analytics/calendar/services/calendar-analytics.service.ts
- [x] T003 Update route wrapper in src/app/features/analytics/calendar/calendar.component.ts
- [x] T004 Update route template in src/app/features/analytics/calendar/calendar.component.html
- [x] T005 [P] Register placeholder dashboard cards in src/app/features/dashboard/dashboard.component.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Annual Relapse Activity as a GitHub-Style Heatmap (Priority: P1) 🎯 MVP

**Goal**: Display a GitHub-style heatmap where each cell represents a single day, and cell color intensity reflects the number of relapses.

**Independent Test**: Load records spanning at least 60 days, view the heatmap, and verify days with records have darker cells and days without records are empty.

### Implementation for User Story 1

- [x] T006 [P] [US1] Scaffold HeatmapComponent in src/app/features/analytics/calendar/components/heatmap/heatmap.component.ts
- [x] T007 [P] [US1] Implement CSS grid layout in src/app/features/analytics/calendar/components/heatmap/heatmap.component.scss
- [x] T008 [US1] Implement template and interaction logic in src/app/features/analytics/calendar/components/heatmap/heatmap.component.html
- [x] T009 [US1] Update dashboard registration for calendar-heatmap in src/app/features/dashboard/dashboard.component.ts

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Navigate a Monthly Calendar View (Priority: P2)

**Goal**: Provide a monthly calendar layout showing one month at a time, allowing navigation backward and forward between months.

**Independent Test**: Load records spread across two consecutive months, navigate the calendar, and confirm day cells show accurate relapse counts per day.

### Implementation for User Story 2

- [x] T010 [P] [US2] Scaffold MonthlyCalendarComponent in src/app/features/analytics/calendar/components/monthly-calendar/monthly-calendar.component.ts
- [x] T011 [P] [US2] Implement CSS grid layout in src/app/features/analytics/calendar/components/monthly-calendar/monthly-calendar.component.scss
- [x] T012 [US2] Implement template and navigation logic in src/app/features/analytics/calendar/components/monthly-calendar/monthly-calendar.component.html
- [x] T013 [US2] Update dashboard registration for calendar-monthly in src/app/features/dashboard/dashboard.component.ts

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - View Day Details in a Popup (Priority: P3)

**Goal**: Display a popup panel showing full details for a specific day when a day cell is clicked on the heatmap or calendar.

**Independent Test**: Click a day cell with multiple records and verify the popup shows all records, the correct total count, reasons, average urge level, and notes.

### Implementation for User Story 3

- [x] T014 [P] [US3] Scaffold DayDetailPopupComponent in src/app/features/analytics/calendar/components/day-detail-popup/day-detail-popup.component.ts
- [x] T015 [P] [US3] Implement overlay styling in src/app/features/analytics/calendar/components/day-detail-popup/day-detail-popup.component.scss
- [x] T016 [US3] Implement template rendering in src/app/features/analytics/calendar/components/day-detail-popup/day-detail-popup.component.html
- [x] T017 [US3] Integrate popup overlay handling in src/app/features/analytics/calendar/calendar.component.ts

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: User Story 4 - View a Daily Summary Section (Priority: P4)

**Goal**: Provide a persistent daily summary card that updates immediately when a day is selected.

**Independent Test**: Select a day with records and verify the summary card updates to show total count, average urge, reasons, and notes.

### Implementation for User Story 4

- [x] T018 [P] [US4] Scaffold DaySummaryCardComponent in src/app/features/analytics/calendar/components/day-summary-card/day-summary-card.component.ts
- [x] T019 [P] [US4] Implement styling in src/app/features/analytics/calendar/components/day-summary-card/day-summary-card.component.scss
- [x] T020 [US4] Implement template rendering in src/app/features/analytics/calendar/components/day-summary-card/day-summary-card.component.html
- [x] T021 [US4] Update dashboard registration for calendar-day-summary in src/app/features/dashboard/dashboard.component.ts

---

## Phase 7: User Story 5 - Handle Empty and Sparse Data (Priority: P5)

**Goal**: Ensure calendar grids render cleanly with no errors for empty datasets, and show friendly empty states.

**Independent Test**: Load no records and verify both heatmap and monthly calendar render correctly without errors.

### Implementation for User Story 5

- [x] T022 [P] [US5] Implement empty state handling in src/app/features/analytics/calendar/components/heatmap/heatmap.component.ts
- [x] T023 [P] [US5] Implement empty state handling in src/app/features/analytics/calendar/components/monthly-calendar/monthly-calendar.component.ts
- [x] T024 [US5] Enhance service to handle empty data and invalid records in src/app/features/analytics/calendar/services/calendar-analytics.service.ts

---

## Phase 8: Polish and Testing

- [x] T025 Add SCSS intensity theme variables to global styles
- [x] T026 Code cleanup, refactoring, and verifying SCSS RTL logic
- [x] T027 Additional unit tests for calendar components and service

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4 → P5)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Integrates with US1 and US2 (triggering the popup from cells)
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - Relies on the same selection logic as US3
- **User Story 5 (P5)**: Can start after US1-US4 - Adds empty state logic to existing components

### Within Each User Story

- Components are scaffolded first.
- SCSS styles are implemented.
- Templates are written.
- Finally, they are integrated (e.g., registered on the dashboard).

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Component scaffoldings and styling files within a story marked [P] can run in parallel

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Add User Story 5 → Test independently → Deploy/Demo
7. Each story adds value without breaking previous stories
