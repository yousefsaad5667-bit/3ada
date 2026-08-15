---
description: "Task list template for feature implementation"
---

# Tasks: Final Polish

**Input**: Design documents from `specs/013-final-polish/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL. The steps here focus on manual verification through browser dev tools as specified in `quickstart.md`.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/` at repository root
- Paths shown below are for the Angular application in `src/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create Animation and Breakpoint tokens in `src/styles/_variables.scss`
- [x] T002 Add `sr-only` utility and global accessibility rules (`:focus-visible`, touch targets) in `src/styles.scss`
- [x] T003 Add reduced motion global rule in `src/styles.scss`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 [P] Add ESLint `no-console` rule to `.eslintrc.json` or equivalent config

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Using the App on a Mobile Device (Priority: P1) 🎯 MVP

**Goal**: Make every screen adapt to smaller viewports and ensure touch targets are large enough.

**Independent Test**: Open each screen at 375 px wide (iPhone SE breakpoint) and verify full usability without horizontal scrolling or overlapping elements.

### Implementation for User Story 1

- [x] T005 [US1] Refine the slide-in drawer's touch targets and overlay in `ShellComponent` SCSS (`src/app/shared/components/shell/shell.component.scss` or equivalent).
- [x] T006 [P] [US1] Add mobile responsive media query block to dashboard feature SCSS.
- [x] T007 [P] [US1] Add mobile responsive media query block to relapses feature SCSS.
- [x] T008 [P] [US1] Add mobile responsive media query block to analytics feature SCSS.
- [x] T009 [P] [US1] Add mobile responsive media query block to settings feature SCSS.

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Using the App with a Screen Reader (Priority: P1)

**Goal**: Allow visually impaired users to navigate and use the habit tracker exclusively with a keyboard and screen reader.

**Independent Test**: Navigate the full relapse-logging flow using only the keyboard (Tab, Enter, Arrow keys) and verify that every interactive element receives focus and has a descriptive accessible label.

### Implementation for User Story 2

- [x] T010 [P] [US2] Add `cdkTrapFocus` directive to modal dialogs.
- [x] T011 [P] [US2] Add `aria-live="polite"` containers for form validation errors across the app.
- [x] T012 [P] [US2] Add accessible text alternatives (`<p class="sr-only">`) to custom charts.
- [x] T013 [P] [US2] Audit and add `aria-label` to all icon-only buttons across all components.

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently.

---

## Phase 5: User Story 3 - Switching to Dark Mode (Priority: P2)

**Goal**: Support OS dark mode preference out-of-the-box and handle live changes seamlessly.

**Independent Test**: Toggle dark mode and inspect every screen for contrast ratio compliance (WCAG AA) and visual consistency.

### Implementation for User Story 3

- [x] T014 [US3] Update `ThemeService.initialize()` in `src/app/core/services/theme.service.ts` to respect `window.matchMedia('(prefers-color-scheme: dark)')`.
- [x] T015 [US3] Subscribe to `MediaQueryList` change event in `ThemeService` in `src/app/core/services/theme.service.ts` to auto-switch themes based on live OS changes.

**Checkpoint**: User Story 3 should now be independently functional.

---

## Phase 6: User Story 4 - Experiencing Meaningful Animations and Transitions (Priority: P2)

**Goal**: Provide smooth transitions and meaningful micro-animations, while respecting reduced motion preferences.

**Independent Test**: Navigate between all routes and interact with UI elements to verify 250-300ms transitions. Check that "prefers-reduced-motion" disables them.

### Implementation for User Story 4

- [x] T016 [US4] Add `provideAnimations()` to `src/app/app.config.ts`.
- [x] T017 [US4] Create route transition definition in `src/app/shared/animations/route-animations.ts`.
- [x] T018 [US4] Apply `@routeAnimations` to the router-outlet in `src/app/shared/components/shell/shell.component.html` and import in `src/app/shared/components/shell/shell.component.ts`.
- [x] T019 [US4] Add `fadeInUp` keyframe entrance animation to page-level containers in SCSS files.

---

## Phase 7: User Story 5 - Encountering an Error Gracefully (Priority: P2)

**Goal**: Show clear, friendly error messages instead of crashing when unrecoverable states are hit.

**Independent Test**: Corrupt the local storage data, reload the app, and verify that a human-readable error boundary is shown with a recovery action.

### Implementation for User Story 5

- [x] T020 [US5] Create `AppError` model and type definitions in `src/app/core/models/app-error.model.ts`.
- [x] T021 [US5] Create `AppErrorHandler` service in `src/app/core/services/app-error-handler.service.ts`.
- [x] T022 [US5] Create `AppErrorPageComponent` UI in `src/app/shared/components/error-page/error-page.component.ts` and `error-page.component.html`.
- [x] T023 [US5] Register `AppErrorHandler` as `ErrorHandler` provider in `src/app/app.config.ts`.
- [x] T024 [US5] Render `<app-error-page />` conditionally using `@if (errorHandler.hasCriticalError())` in `src/app/app.component.html`.
- [x] T025 [US5] Wrap `JSON.parse` in `try/catch` within `src/app/core/services/storage.service.ts` and route failures to `AppErrorHandler.handleStorageCorruption()`.
- [x] T026 [P] [US5] Add inline component-level error states to individual feature components.

---

## Phase 8: User Story 6 - Onboarding to a Consistent, Polished UI (Priority: P3)

**Goal**: Cross-cutting quality gate to clean up code and unify design system tokens.

**Independent Test**: Conduct a visual audit of every screen against the design system and a developer review for debug code.

### Implementation for User Story 6

- [x] T027 [P] [US6] Scan for and remove/resolve all TODO comments across the codebase.
- [x] T028 [P] [US6] Replace all hardcoded transition values (e.g., `0.2s`, `0.3s`) in SCSS files with CSS token variables (e.g., `var(--transition-normal)`).

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and documentation.

- [x] T029 Execute manual verification checks outlined in `quickstart.md`.
- [x] T030 Final audit for `console.log` removal and consistent emoji usage.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories.
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion.
  - Can proceed in priority order or parallel if staffed.
- **Polish (Final Phase)**: Depends on all user stories being complete.

### User Story Dependencies

- **US1-US6**: All can technically be started independently after Foundational tasks, but logical grouping recommends following the numeric sequence.

### Parallel Opportunities

- Responsive media queries across feature SCSS files (US1) can be done in parallel.
- Accessibility additions (`cdkTrapFocus`, `aria-live`, `aria-label`) (US2) can be implemented in parallel.
- Feature-level inline error states (US5) can be implemented in parallel once `AppErrorHandler` is active.

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently via devtools emulation.
