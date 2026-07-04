# Tasks: Dashboard Infrastructure

**Input**: Design documents from `/specs/005-dashboard-infrastructure/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not requested by user; omitted from plan.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- All paths are relative to repository root (`src/app/features/dashboard/...`)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create directory structure for models, services, and components per implementation plan

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 [P] Create `DashboardCardDescriptor` interface in `src/app/features/dashboard/models/dashboard-card-descriptor.model.ts`
- [x] T003 [P] Create `DashboardCard` view model and `CardState` type in `src/app/features/dashboard/models/dashboard-card.model.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View the Dashboard (Priority: P1) 🎯 MVP

**Goal**: The dashboard shell renders a responsive grid of analytical cards with loading, empty, and data states.

**Independent Test**: Navigate to the dashboard route and verify the dummy cards are rendered with their respective simulated states (loading, empty, data).

### Implementation for User Story 1

- [x] T004 [P] [US1] Implement `DashboardCardShellComponent` state machine in `src/app/features/dashboard/components/dashboard-card-shell/dashboard-card-shell.component.ts`
- [x] T005 [P] [US1] Create UI template for states in `src/app/features/dashboard/components/dashboard-card-shell/dashboard-card-shell.component.html`
- [x] T006 [P] [US1] Add responsive shell styles in `src/app/features/dashboard/components/dashboard-card-shell/dashboard-card-shell.component.scss`
- [x] T007 [P] [US1] Implement `PlaceholderCardAComponent` in `src/app/features/dashboard/components/placeholder-cards/placeholder-card-a/placeholder-card-a.component.ts`
- [x] T008 [US1] Update `DashboardComponent` to define a hardcoded registry array of placeholder cards and render them via `@for` and `NgComponentOutlet` in `src/app/features/dashboard/dashboard.component.ts` and `src/app/features/dashboard/dashboard.component.html`
- [x] T009 [US1] Add responsive CSS Grid layout to `src/app/features/dashboard/dashboard.component.scss`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently (Grid layout + Card shells rendering data).

---

## Phase 4: User Story 2 - Filter Analytics by Date Range (Priority: P2)

**Goal**: Add date range filtering that all cards read from.

**Independent Test**: Change the date range preset; verify the filter service updates and placeholder cards reflect the new range.

### Implementation for User Story 2

- [x] T010 [P] [US2] Implement `DashboardFilterService` (Signal state, Last 7 Days default) in `src/app/features/dashboard/services/dashboard-filter.service.ts`
- [x] T011 [P] [US2] Implement `DateRangeSelectorComponent` UI and bindings in `src/app/features/dashboard/components/date-range-selector/date-range-selector.component.ts`
- [x] T012 [P] [US2] Add template and styles for `DateRangeSelectorComponent` in `src/app/features/dashboard/components/date-range-selector/date-range-selector.component.html`
- [x] T013 [US2] Integrate `DateRangeSelectorComponent` into dashboard shell in `src/app/features/dashboard/dashboard.component.html`
- [x] T014 [US2] Update placeholder cards to inject and react to `DashboardFilterService.activeFilter`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently.

---

## Phase 5: User Story 3 - Customize Dashboard Layout (Priority: P3)

**Goal**: Enable card reordering (drag-and-drop), hiding, restoring, and LocalStorage persistence.

**Independent Test**: Hide a card, drag another card to a new spot, refresh the page, and verify the layout remains customized. Click "إظهار" to restore the hidden card.

### Implementation for User Story 3

- [x] T015 [P] [US3] Implement `DashboardCardPlaceholderComponent` (hidden tile) in `src/app/features/dashboard/components/dashboard-card-placeholder/dashboard-card-placeholder.component.ts`
- [x] T016 [US3] Implement `DashboardLayoutService` (merging descriptors with preferences) in `src/app/features/dashboard/services/dashboard-layout.service.ts`
- [x] T017 [US3] Update `DashboardComponent` to use `DashboardLayoutService.cards` Signal instead of hardcoded array
- [x] T018 [US3] Add Angular CDK `DragDropModule` directives to dashboard grid in `src/app/features/dashboard/dashboard.component.html` and handle drop events in `dashboard.component.ts`
- [x] T019 [US3] Add "Hide" button to `DashboardCardShellComponent` template and wire up to layout service
- [x] T020 [US3] Wire "إظهار" button in `DashboardCardPlaceholderComponent` to layout service

**Checkpoint**: Layout customization fully functional.

---

## Phase 6: User Story 4 - Handle Errors Gracefully (Priority: P4)

**Goal**: Per-card error isolation and manual retry mechanism.

**Independent Test**: Simulate an error in one placeholder card. Verify only that card shows the error state while others function normally. Click retry to clear it.

### Implementation for User Story 4

- [x] T021 [P] [US4] Add manual retry event emitter to `DashboardCardShellComponent` in `src/app/features/dashboard/components/dashboard-card-shell/dashboard-card-shell.component.ts`
- [x] T022 [US4] Implement `PlaceholderCardBComponent` to simulate throwing an error and recovering on retry in `src/app/features/dashboard/components/placeholder-cards/placeholder-card-b/placeholder-card-b.component.ts`
- [x] T023 [US4] Register `PlaceholderCardBComponent` in the shell registry to validate isolation alongside `PlaceholderCardAComponent`

**Checkpoint**: All user stories should now be independently functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T024 [P] Run quickstart.md manual validation steps to ensure integration completeness
- [x] T025 [P] Verify RTL design compliance and check layout across mobile/desktop screen sizes
- [x] T026 Code cleanup and strict type checking pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Best done after US1 to have a rendered grid to interact with
- **User Story 4 (P4)**: Depends on US1 (requires card shell to exist)

### Within Each User Story

- Models before services
- Services before components
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- Foundational tasks T002-T003 can run in parallel
- Shell components (T004-T006) and dummy cards (T007) can be developed concurrently
- `DashboardFilterService` (T010) and `DateRangeSelectorComponent` UI (T011-T012) can run parallel

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently (verify card grid rendering)

### Incremental Delivery

1. Add User Story 2 → Test independently → Dashboard now filters by date
2. Add User Story 3 → Test independently → Dashboard now supports drag/drop and hide
3. Add User Story 4 → Test independently → Dashboard now handles card failures gracefully
4. Each story adds value without breaking previous stories
