# Tasks: Project Foundation

**Input**: Design documents from `specs/001-project-foundation/`

**Prerequisites**: [plan.md](plan.md) · [spec.md](spec.md) · [research.md](research.md) · [data-model.md](data-model.md) · [contracts/ui-contracts.md](contracts/ui-contracts.md) · [quickstart.md](quickstart.md)

**Tests**: Not requested — no test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- All paths relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Scaffold the Angular project and configure the development toolchain.

- [x] T001 Initialize Angular 19 project with `ng new habit-tracker --standalone --routing --style=scss --strict` in project root
- [x] T002 Remove all generated boilerplate content from `src/app/app.component.html` and `src/styles.scss`
- [x] T003 [P] Configure `tsconfig.json` with strict mode: `"strict": true`, `"strictNullChecks": true`, `"noImplicitAny": true`, `"strictPropertyInitialization": true`
- [x] T004 [P] Install and configure `@angular-eslint` — run `ng add @angular-eslint/schematics` and edit `.eslintrc.json` with rules: `@typescript-eslint/strict-type-checked`, `@angular-eslint/prefer-standalone`, `no-any`
- [x] T005 [P] Install and configure Prettier — create `.prettierrc` with `singleQuote: true, trailingComma: 'es5', printWidth: 100, tabWidth: 2, semi: true` and `.prettierignore` excluding `dist/`, `.angular/`
- [x] T006 [P] Create `src/environments/environment.ts` and `src/environments/environment.prod.ts` with `AppEnvironment` shape: `production`, `version: '0.1.0'`, `storageKeyPrefix: 'habit-tracker-'`, `appName: 'متتبع العادات'`
- [x] T007 Download Cairo Arabic font (Regular 400, SemiBold 600, Bold 700) in WOFF2 format (Arabic Unicode-range subset) and place in `src/assets/fonts/cairo-regular.woff2`, `cairo-semibold.woff2`, `cairo-bold.woff2`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core models, constants, design tokens, and SCSS architecture that ALL user stories depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T008 [P] Create `src/app/core/models/app-theme.model.ts` — export `type AppTheme = 'dark' | 'light'`
- [x] T009 [P] Create `src/app/core/models/app-route.model.ts` — export `interface AppRoute` with fields: `path: string`, `label: string`, `icon: string`, `isActive: boolean`, `children?: AppRoute[]`
- [x] T010 [P] Create `src/app/core/models/app-environment.model.ts` — export `interface AppEnvironment` with fields: `production: boolean`, `version: string`, `storageKeyPrefix: string`, `appName: string`
- [x] T011 [P] Create `src/app/core/models/storage-status.model.ts` — export `interface StorageStatus` with fields: `available: boolean`, `warningMessage: string | null`
- [x] T012 [P] Create `src/app/core/constants/routes.constants.ts` — export `const APP_ROUTES` object with all 10 route path strings (e.g., `DASHBOARD: '/'`, `RELAPSES: '/relapses'`, `ANALYTICS_TIME_SERIES: '/analytics/time-series'`, etc.)
- [x] T013 [P] Create `src/app/core/constants/storage.constants.ts` — export `const STORAGE_KEYS` object with `THEME: 'habit-tracker-theme'`
- [x] T014 [P] Create `src/app/core/constants/app.constants.ts` — export `const APP_NAME = 'متتبع العادات'` and `const APP_VERSION = '0.1.0'`
- [x] T015 Create `src/styles/_variables.scss` — define CSS custom properties for all design tokens from the UI contracts: colors (`--color-bg-primary`, `--color-text-primary`, `--color-accent`, etc.), spacing (`--spacing-xs` through `--spacing-3xl`), typography (`--font-family`, `--font-size-*`, `--line-height-*`), borders, shadows, transitions
- [x] T016 Create `src/styles/_themes.scss` — define `[data-theme="dark"]` and `[data-theme="light"]` CSS blocks with all color token values from the UI contracts design token table
- [x] T017 Create `src/styles/_fonts.scss` — declare `@font-face` rules for Cairo Regular, SemiBold, and Bold using `src: url('/assets/fonts/cairo-*.woff2') format('woff2')` with `unicode-range: U+0600-06FF, U+0750-077F` (Arabic block)
- [x] T018 Create `src/styles/_reset.scss` — CSS normalize/reset with `*, *::before, *::after { box-sizing: border-box }`, body margin reset, and `html { height: 100% }`
- [x] T019 Create `src/styles/_rtl.scss` — RTL-specific overrides: logical property usage (`margin-inline-start`, `padding-inline-end`), RTL flexbox direction defaults, icon flip utilities
- [x] T020 Update `src/styles/styles.scss` — import all partials in order: `_reset`, `_fonts`, `_variables`, `_themes`, `_rtl`; set global `font-family: var(--font-family)`, `direction: rtl`, `color: var(--color-text-primary)`, `background: var(--color-bg-primary)`
- [x] T021 Update `src/index.html` — set `<html lang="ar" dir="rtl" data-theme="dark">` and link Cairo font preload `<link rel="preload" href="assets/fonts/cairo-regular.woff2" as="font" type="font/woff2" crossorigin>`
- [x] T022 Create `src/app/shared/utils/date.utils.ts` — export `formatArabicDate(date: Date): string` using `Intl.DateTimeFormat('ar-SA')` and `formatArabicTime(date: Date): string`
- [x] T023 [P] Create `src/app/shared/utils/type-guards.ts` — export `isAppTheme(value: unknown): value is AppTheme`, `isString(value: unknown): value is string`
- [x] T024 [P] Create `src/app/shared/utils/error.utils.ts` — export `handleStorageError(error: unknown): string` returning Arabic error message strings

**Checkpoint**: Design system, models, constants, and utilities complete — user story implementation can now begin.

---

## Phase 3: User Story 1 — Developer Bootstraps the Project (Priority: P1) 🎯 MVP

**Goal**: A complete Angular project structure with feature-based architecture, configured linting/formatting, and a working dev server showing a placeholder Arabic RTL shell.

**Independent Test**: Clone repo → `npm install` → `ng serve` → app launches in browser showing Arabic shell with RTL layout and sidebar navigation.

### Implementation for User Story 1

- [x] T025 Create `src/app/core/services/storage.service.ts` — injectable service implementing the `StorageService` contract: `isAvailable: Signal<boolean>` (detected at construction via try/catch), `get<T>()`, `set<T>()`, `remove()`, `has()` with full `storageKeyPrefix` handling and JSON serialization
- [x] T026 Create `src/app/core/services/theme.service.ts` — injectable service implementing the `ThemeService` contract: `currentTheme: Signal<AppTheme>`, `toggleTheme()`, `setTheme()`, `initialize()` — reads from LocalStorage on init, sets `document.documentElement.setAttribute('data-theme', theme)`, defaults to `'dark'` if unavailable
- [x] T027 Create `src/app/shared/components/header/header.component.ts` — standalone component with `@Output() sidebarToggle`, displays `متتبع العادات`, theme toggle button (moon/sun icon swap), hamburger menu on mobile; injects `ThemeService`, calls `toggleTheme()` on button click
- [x] T028 Create `src/app/shared/components/header/header.component.html` — RTL header template: app name on left (RTL: visual right), theme toggle button and hamburger on right (RTL: visual left)
- [x] T029 Create `src/app/shared/components/header/header.component.scss` — header styles using CSS tokens: `background: var(--color-bg-secondary)`, flexbox with `justify-content: space-between`, fixed height `64px`, `border-bottom: 1px solid var(--color-border)`
- [x] T030 [P] Create `src/app/shared/components/storage-warning/storage-warning.component.ts` — standalone component injecting `StorageService`, conditionally renders when `!storageService.isAvailable()`, shows Arabic message: `التخزين المحلي غير متوفر. لن يتم حفظ بياناتك.`, dismissible via Signal
- [x] T031 [P] Create `src/app/shared/components/storage-warning/storage-warning.component.html` and `.scss` — sticky top banner with warning token colors from design system
- [x] T032 Create `src/app/shared/components/sidebar/sidebar.component.ts` — standalone component receiving `routes: AppRoute[]` input, collapsible state via Signal, highlights active route using `Router` `isActive` checks
- [x] T033 Create `src/app/shared/components/sidebar/sidebar.component.html` — RTL sidebar: nav list with Arabic route labels, icons, active state styling; hamburger toggle for mobile
- [x] T034 Create `src/app/shared/components/sidebar/sidebar.component.scss` — sidebar styles: `position: fixed`, `inset-inline-end: 0` (RTL right), `width: 280px`, `background: var(--color-bg-secondary)`, transitions for collapse/expand, responsive breakpoints (collapsed below 768px)
- [x] T035 Create `src/app/shared/components/shell/shell.component.ts` — standalone root layout component composing `HeaderComponent`, `SidebarComponent`, `StorageWarningComponent`, and `<router-outlet>`; manages sidebar open/close state
- [x] T036 Create `src/app/shared/components/shell/shell.component.html` — CSS Grid layout: storage warning banner (full width, conditional), header row, body row (sidebar + main content area with `<router-outlet>`)
- [x] T037 Create `src/app/shared/components/shell/shell.component.scss` — grid layout: `grid-template-rows: auto auto 1fr`, `grid-template-columns: 1fr auto` (sidebar on inline-end for RTL), `min-height: 100vh`, responsive adjustments at breakpoints
- [x] T038 Create `src/app/shared/components/not-found/not-found.component.ts` and `.html` — standalone 404 component displaying Arabic `صفحة غير موجودة` with link back to `/`
- [x] T039 Create all 9 feature placeholder components (one per route): `src/app/features/dashboard/dashboard.component.ts`, `features/relapses/relapses.component.ts`, `features/analytics/time-series/time-series.component.ts`, `features/analytics/calendar/calendar.component.ts`, `features/analytics/patterns/patterns.component.ts`, `features/analytics/triggers/triggers.component.ts`, `features/analytics/urge/urge.component.ts`, `features/charts/charts.component.ts`, `features/settings/settings.component.ts` — each is a standalone component showing an Arabic placeholder heading (e.g., `<h1>لوحة التحكم</h1>`)
- [x] T040 Create `src/app/app.routes.ts` — define all 10 routes using `loadComponent` lazy loading pointing to each feature placeholder component, plus `{ path: '**', component: NotFoundComponent }` wildcard
- [x] T041 Create `src/app/app.config.ts` — configure `provideRouter(routes, withComponentInputBinding())`, inject `ThemeService` and call `initialize()` in `APP_INITIALIZER`
- [x] T042 Update `src/app/app.component.ts` and `app.component.html` — root component renders `<app-shell>` only; no other content
- [x] T043 Verify `ng serve` runs with zero errors, navigate all 10 routes manually, and confirm Arabic RTL layout renders in browser

**Checkpoint**: User Story 1 complete — developer can clone, install, and serve the app within 5 minutes. Arabic RTL shell with all routes is functional.

---

## Phase 4: User Story 2 — UI Renders Correctly in Dark and Light Mode (Priority: P2)

**Goal**: Theme toggle works end-to-end: switching between dark and light mode updates the entire UI via CSS custom properties with no FOUC.

**Independent Test**: Open app → toggle theme button → entire UI switches from dark to light and back. Reload browser → persisted theme is restored. Verify no hard-coded colors exist in any component stylesheet.

### Implementation for User Story 2

- [x] T044 [US2] Audit all component SCSS files created in Phase 3 — replace any remaining hard-coded color/spacing values with CSS custom property tokens (`var(--color-*)`, `var(--spacing-*)`)
- [x] T045 [US2] Add theme toggle button interaction polish to `src/app/shared/components/header/header.component.scss` — icon rotation/swap animation using `transition: var(--transition-fast)`, moon ↔ sun SVG icons
- [x] T046 [US2] Add `prefers-color-scheme` media query fallback in `src/styles/_themes.scss` — if no `data-theme` attribute set, default to system dark/light preference
- [x] T047 [US2] Test theme persistence: verify `ThemeService.initialize()` correctly reads LocalStorage theme key on app reload and applies the correct `data-theme` attribute before first paint (avoiding FOUC)
- [x] T048 [US2] Verify SC-003 — measure theme switch time in browser DevTools Performance tab; confirm transition completes in under 100ms

**Checkpoint**: User Stories 1 AND 2 both independently functional. Theme system is production-ready.

---

## Phase 5: User Story 3 — Navigation Routes Work Correctly (Priority: P3)

**Goal**: All 10 registered routes render the correct placeholder page without full reloads. Browser back/forward navigation works. Unknown routes display the Arabic 404 page.

**Independent Test**: Navigate directly to each route via the URL bar. No full page reload (network panel shows no document request). Navigate to `/unknown` → 404 page in Arabic with Dashboard link.

### Implementation for User Story 3

- [x] T049 [US3] Add active route highlighting logic to `src/app/shared/components/sidebar/sidebar.component.ts` — use `Router.isActive()` or `RouterLinkActive` directive to apply `.is-active` CSS class to matching nav items
- [x] T050 [US3] Add active route styles to `src/app/shared/components/sidebar/sidebar.component.scss` — `.is-active` state: `background: var(--color-accent)`, `color: var(--color-bg-primary)`, left border accent (`border-inline-end: 3px solid var(--color-accent)` for RTL)
- [x] T051 [US3] Update `src/app/shared/components/sidebar/sidebar.component.html` — add Arabic route group label "التحليلات" as a collapsible section header for all `/analytics/*` child routes
- [x] T052 [US3] Verify wildcard route — navigate to `/unknown` and confirm `NotFoundComponent` renders with Arabic text and functional link to `/`
- [x] T053 [US3] Verify browser back/forward navigation — use browser history buttons after navigating between routes; confirm URL and rendered component stay in sync

**Checkpoint**: All user stories complete. All 10 routes work, active state highlighted, 404 in Arabic, history navigation correct.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Responsiveness validation, code quality gates, accessibility, and final verification.

- [x] T054 [P] Responsive layout audit — open browser DevTools, test shell layout at 320px, 768px, 1024px, and 1440px widths. Confirm sidebar collapses at <768px, hamburger menu appears, content remains usable
- [x] T055 [P] RTL audit — check sidebar position (right side), text alignment (right), spacing direction, and icon orientation in all components at all breakpoints
- [x] T056 Run `ng lint` — fix all ESLint violations, confirm zero errors reported
- [x] T057 [P] Run `npx prettier --check "src/**/*.{ts,html,scss}"` — fix any formatting violations
- [x] T058 Run Lighthouse audit in Chrome DevTools on the served app — confirm Performance ≥ 90 and Accessibility ≥ 90 (SC-006)
- [x] T059 [P] Verify self-hosted fonts load correctly in browser Network tab — confirm zero requests to `fonts.googleapis.com` or any external CDN
- [x] T060 [P] Verify LocalStorage unavailability behavior — open app in browser private mode with storage blocked, confirm Arabic warning banner appears, all routes still navigable, and no JS errors thrown
- [x] T061 Update `specs/001-project-foundation/quickstart.md` if any setup steps changed during implementation
- [x] T062 Final smoke test per `quickstart.md` — clone repo, install, serve, verify all routes, toggle theme, confirm Arabic RTL layout on Chrome, Firefox, and Safari

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 complete — **BLOCKS all user stories**
- **User Story Phases (3–5)**: All depend on Phase 2 completion; can proceed sequentially in priority order
- **Polish (Phase 6)**: Depends on all user story phases complete

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — no dependencies on other stories
- **US2 (P2)**: Depends on US1 (ThemeService and component SCSS already created)
- **US3 (P3)**: Depends on US1 (Router and Sidebar already created)

### Within Each User Story

- Models/constants before services
- Services before components
- Components before routes
- Routes before shell integration

### Parallel Opportunities

- T008–T014 (models + constants): all parallelizable
- T022–T024 (utils): all parallelizable
- T027–T031 (header + storage-warning): can be parallelized per component
- T039 (9 feature placeholders): all fully parallelizable
- T044–T048 (US2 theme polish): mostly parallelizable

---

## Parallel Example: Phase 2 Foundational

```text
Stream A (Models):   T008 → T009 → T010 → T011
Stream B (Constants): T012 → T013 → T014
Stream C (Styles):   T015 → T016 → T017 → T018 → T019 → T020 → T021
Stream D (Utils):    T022 → T023 → T024
```

## Parallel Example: User Story 1 Feature Placeholders

```text
# T039 — all 9 placeholder components can be created in parallel:
features/dashboard/dashboard.component.ts
features/relapses/relapses.component.ts
features/analytics/time-series/time-series.component.ts
features/analytics/calendar/calendar.component.ts
features/analytics/patterns/patterns.component.ts
features/analytics/triggers/triggers.component.ts
features/analytics/urge/urge.component.ts
features/charts/charts.component.ts
features/settings/settings.component.ts
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T007)
2. Complete Phase 2: Foundational (T008–T024) — **CRITICAL blocker**
3. Complete Phase 3: User Story 1 (T025–T043)
4. **STOP and VALIDATE**: Run `ng serve`, navigate all routes, confirm Arabic RTL shell
5. Demo the working foundation before proceeding to theming and routing polish

### Incremental Delivery

1. Phase 1 + Phase 2 → Dev environment ready
2. Phase 3 → Working app shell with all routes (MVP!)
3. Phase 4 → Polished theme switching
4. Phase 5 → Active navigation state and 404 handling
5. Phase 6 → Production-ready quality gates pass

---

## Notes

- `[P]` tasks operate on different files with no shared state — safe to parallelize
- All paths are relative to the repository root (`src/`, `specs/`, etc.)
- Each user story checkpoint is a demo-able increment
- Verify `ng lint` and `ng build` pass before marking any phase complete
- Arabic text in components must be hard-coded strings for now (no i18n service needed in this phase)
