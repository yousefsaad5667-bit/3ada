# Feature Specification: Project Foundation

**Feature Branch**: `001-project-foundation`

**Created**: 2026-07-03

**Status**: Draft

**Input**: User description: "Phase 1 — Project Foundation: Angular project structure, feature-based architecture, shared/core folders, theming, ESLint, Prettier"

---

## Clarifications

### Session 2026-07-03

- Q: What top-level navigation routes should the application define? → A: Phase-based semantic routes grouped into logical sections: Dashboard (`/`), Relapse Management (`/relapses`), Analytics group — Time Series (`/analytics/time-series`), Calendar (`/analytics/calendar`), Time Patterns (`/analytics/patterns`), Triggers (`/analytics/triggers`), Urge Analysis (`/analytics/urge`), Charts Library (`/charts`), Settings (`/settings`), and a wildcard 404 route.
- Q: How should Arabic fonts be loaded? → A: Self-hosted — fonts downloaded and bundled inside `assets/fonts/`, declared via `@font-face` in global SCSS. No external CDN dependency, guaranteeing full offline operation.
- Q: How should the application behave if LocalStorage is unavailable? → A: Show a persistent top-of-page Arabic warning banner; allow read-only browsing of the shell/routes, but disable all data-write actions.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Developer Bootstraps the Project (Priority: P1)

A developer joins the project and can immediately start contributing within minutes. The project
structure makes it clear where every type of file belongs: features, shared components, core
services, models, and utilities all have dedicated, predictable locations. Configuration for
linting and formatting is pre-set so code style is enforced automatically from the first commit.

**Why this priority**: Without a solid foundation, all future phases will accumulate technical
debt. A consistent, predictable structure eliminates guesswork and enables parallel feature
development.

**Independent Test**: A new developer can clone the repository, run a single install command,
and have a working application launch in the browser with no errors, correctly structured
folders, and functioning linting.

**Acceptance Scenarios**:

1. **Given** a fresh clone of the repository, **When** the developer runs the install and serve
   commands, **Then** the application launches in the browser without errors and displays a
   placeholder shell UI in Arabic with RTL layout.
2. **Given** a correctly structured project, **When** a developer adds a new feature file in the
   wrong directory, **Then** the linter immediately reports a violation without needing to run a
   separate check manually.
3. **Given** unsaved code edits, **When** the developer saves the file, **Then** the formatter
   automatically enforces consistent code style without manual intervention.

---

### User Story 2 — UI Renders Correctly in Dark and Light Mode (Priority: P2)

An Arabic-speaking user opens the application and sees a clean, modern interface in Arabic with
full RTL layout. They can switch between dark and light mode, and the entire theme updates
consistently across all components.

**Why this priority**: Theme infrastructure (design tokens, CSS variables, RTL direction) must
be in place before any visible UI component is built, otherwise each phase would re-implement
theming inconsistently.

**Independent Test**: Open the running application and toggle between dark and light mode. All
text, backgrounds, and spacing must update consistently. All text displays right-to-left in
Arabic typography.

**Acceptance Scenarios**:

1. **Given** the application is open, **When** the user views any page, **Then** all text is in
   Arabic, the layout direction is RTL, and Arabic-appropriate fonts are loaded.
2. **Given** the application is in dark mode, **When** the user switches to light mode, **Then**
   the entire UI updates without a page reload, with no mixed-theme visual artifacts.
3. **Given** the application loads for the first time, **Then** the default theme is applied
   consistently using design tokens (color, spacing, typography) with no hard-coded values.

---

### User Story 3 — Navigation Routes Work Correctly (Priority: P3)

A user can navigate between different sections of the application via the top navigation. Each
section renders its own page without a full page reload.

**Why this priority**: Route configuration must exist as a skeleton before feature modules are
built. Without it, phase integration would require disruptive refactoring.

**Independent Test**: Navigate directly to each registered route via the URL bar. Each route
renders its own placeholder component without errors and the browser URL updates correctly.

**Acceptance Scenarios**:

1. **Given** the application is running, **When** the user navigates to any of the registered
   routes (`/`, `/relapses`, `/analytics/time-series`, `/analytics/calendar`,
   `/analytics/patterns`, `/analytics/triggers`, `/analytics/urge`, `/charts`, `/settings`),
   **Then** the correct placeholder page renders without a full browser reload.
2. **Given** the user navigates to an unregistered route (e.g., `/unknown`), **Then** a
   "صفحة غير موجودة" (page not found) state is shown in Arabic with a link back to the Dashboard.
3. **Given** the application loads, **When** the user navigates back using the browser back
   button, **Then** the previous page is restored correctly and the browser URL reflects the
   correct route.

---

### Edge Cases

- What happens if LocalStorage is unavailable (e.g., private browsing with strict settings)?
  The application MUST show a persistent top-of-page Arabic warning banner. It MUST degrade
  gracefully to allow read-only browsing of the shell and routes, but disable all data-write actions.
- How does the application behave on very small screens (320px width)? RTL layout must remain
  intact and usable.
- What if the user's system locale is not Arabic? The application MUST still render fully in
  Arabic regardless of the system locale.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The project MUST be structured using a feature-based folder architecture with
  distinct `features/`, `shared/`, `core/`, and `environments/` directories.
- **FR-002**: All Angular components MUST be standalone (no NgModules).
- **FR-003**: The application MUST have a working Angular Router configuration with the
  following semantic routes, each rendering a dedicated placeholder component:
  - `/` → Dashboard (لوحة التحكم)
  - `/relapses` → Relapse Management (إدارة الانتكاسات)
  - `/analytics/time-series` → Time Series Analytics (تحليل السلاسل الزمنية)
  - `/analytics/calendar` → Calendar Analytics (تحليل التقويم)
  - `/analytics/patterns` → Time Pattern Analytics (أنماط الوقت)
  - `/analytics/triggers` → Trigger Analytics (تحليل المحفزات)
  - `/analytics/urge` → Urge Analytics (تحليل الرغبة)
  - `/charts` → Charts Library (مكتبة الرسوم البيانية)
  - `/settings` → Settings (الإعدادات)
  - `**` → 404 Not Found (صفحة غير موجودة)
- **FR-004**: The application MUST support two themes (dark and light) via a toggleable
  mechanism using CSS custom properties (design tokens), with no hard-coded colors.
- **FR-005**: The entire UI MUST render in Arabic with a `dir="rtl"` attribute on the root HTML
  element and RTL-compatible spacing and layout.
- **FR-006**: The project MUST include ESLint configured for Angular/TypeScript with RTL and
  strict typing rules enforced.
- **FR-007**: The project MUST include Prettier configured with a shared formatting ruleset,
  enforced on save and as a pre-commit check.
- **FR-008**: The project MUST define global constants for route paths, LocalStorage keys,
  application name, and version.
- **FR-009**: The project MUST include shared utility functions for date formatting (Arabic
  locale), type guards, and error handling helpers.
- **FR-010**: The application MUST have a responsive shell layout (header, navigation, main
  content area) that works on screen widths from 320px to 2560px.
- **FR-011**: Arabic fonts MUST be self-hosted — font files (WOFF2 format, Unicode-range subsetted
  for Arabic script) MUST be stored in `assets/fonts/` and declared via `@font-face` in the
  global SCSS. No external font CDN (e.g., Google Fonts) is permitted. Fonts MUST be applied
  globally with correct `line-height` and `letter-spacing` for Arabic script.
- **FR-012**: The project MUST include environment configuration files separating development
  and production settings.

### Key Entities

- **AppTheme**: Represents the application color scheme (dark / light), stored in LocalStorage
  for persistence across sessions.
- **AppRoute**: Represents a navigation route entry — path (e.g., `/analytics/time-series`),
  Arabic label (e.g., `تحليل السلاسل الزمنية`), icon reference, active state flag, and optional
  lazy-loaded module reference. The 10 registered routes are: Dashboard, Relapse Management,
  Time Series, Calendar, Time Patterns, Triggers, Urge Analysis, Charts Library, Settings, 404.
- **AppEnvironment**: Configuration object containing environment-specific values (production
  flag, version, storage key prefix).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A developer can clone, install, and launch the application in under 5 minutes
  with zero manual configuration steps.
- **SC-002**: 100% of UI text is displayed in Arabic with correct RTL layout verified on Chrome,
  Firefox, and Safari at 320px, 768px, and 1440px widths.
- **SC-003**: Theme switching completes in under 100ms with no flash of unstyled content (FOUC).
- **SC-004**: ESLint reports zero errors on a clean project checkout, and Prettier auto-formats
  files on save within the IDE.
- **SC-005**: All route navigations complete without a full page reload, verified by the browser
  network panel showing no full-document requests on navigation.
- **SC-006**: The application scores at least 90 on Lighthouse Performance and Accessibility
  audits at initial launch.

---

## Assumptions

- Arabic is the sole UI language for all current and future phases; no i18n/l10n toggle is
  needed at this stage.
- The Angular version used will be the latest stable release at the time of implementation.
- SCSS is the stylesheet preprocessor for all components and global styles.
- RxJS is available but will only be used where Angular Signals are insufficient.
- The application will be served locally via the Angular CLI dev server; no production build
  configuration is required in this phase.
- All future feature modules will follow the same feature-based folder conventions established
  in this phase.
- Dark mode is the default theme on first load.
- Arabic fonts will be self-hosted in WOFF2 format; the chosen typeface is assumed to be a
  widely-used Arabic web font (e.g., Cairo, Tajawal, or Noto Naskh Arabic) — the exact
  typeface will be decided during implementation, not locked in this spec.
