# Implementation Plan: Project Foundation

**Branch**: `001-project-foundation` | **Date**: 2026-07-03 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-project-foundation/spec.md`

## Summary

Establish the foundational Angular project structure for the Habit Tracker application. This
includes scaffolding a feature-based architecture, configuring RTL/Arabic-first theming with
dark and light modes, setting up routing for all planned phases, bundling self-hosted Arabic
fonts, and enforcing code quality via ESLint and Prettier. The result is a clean, scalable
workspace that all future features build upon.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Angular 19.x (latest stable)

**Primary Dependencies**:
- `@angular/core`, `@angular/router`, `@angular/forms` (Reactive Forms)
- `@angular/cli` for project scaffolding and dev server
- Angular Signals for reactive state
- RxJS (minimal, only where Signals are insufficient)

**Storage**: LocalStorage (browser API — no external DB)

**Testing**: Angular CLI default (`karma` + `jasmine`); Linting: `@angular-eslint`; Formatting: `prettier`

**Target Platform**: Modern browsers (Chrome, Firefox, Safari), client-side only, no SSR

**Project Type**: Single-page web application (SPA)

**Performance Goals**: Lighthouse ≥ 90 (Performance + Accessibility), theme switch < 100ms

**Constraints**: 100% offline-capable, no backend/API calls, no external CDN, RTL Arabic-only UI

**Scale/Scope**: 10 routes (placeholder pages), 1 shell layout, 2 themes, ~15 source files in this phase

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. Angular Platform | ✅ PASS | Angular latest, TypeScript, Signals, Standalone Components, Reactive Forms, Router, SCSS — all required items present. No backend, no SSR, no auth, no APIs, no DB. |
| II. 100% Local-First | ✅ PASS | LocalStorage only. No Firebase, Supabase, MongoDB, SQL, REST, GraphQL. Fully offline. |
| III. Arabic & RTL | ✅ PASS | Full Arabic UI, `dir="rtl"`, self-hosted Arabic fonts (WOFF2), RTL spacing/icons/navigation. |
| IV. Modern UI/UX | ✅ PASS | Responsive, mobile-first, dark/light modes, loading/empty/error states planned, reusable components. |
| V. Performance | ✅ PASS | Lighthouse ≥ 90 target. OnPush change detection strategy. Lazy loading for route modules. |
| Charting Library | ⏭ N/A | Not applicable in this phase (no charts yet). |
| Architecture | ✅ PASS | Feature-based folder structure, separation of concerns, SOLID, strong typing. |
| Code Quality | ✅ PASS | Strict TypeScript, interfaces/models, reusable utilities, ESLint + Prettier. |
| Deliverables | ✅ PASS | Folder structure, components, services, interfaces, models, styling, validation all planned. |

**Gate Result**: ✅ ALL PASS — Proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/001-project-foundation/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (UI contracts)
├── checklists/          # Spec quality checklist
│   └── requirements.md
└── spec.md              # Feature specification
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── core/                          # Singleton services, guards, interceptors
│   │   ├── services/
│   │   │   ├── theme.service.ts       # Dark/light theme toggle + LocalStorage persistence
│   │   │   └── storage.service.ts     # LocalStorage abstraction + availability check
│   │   ├── constants/
│   │   │   ├── routes.constants.ts    # Route path constants
│   │   │   ├── storage.constants.ts   # LocalStorage key constants
│   │   │   └── app.constants.ts       # App name, version
│   │   └── models/
│   │       ├── app-route.model.ts     # AppRoute interface
│   │       ├── app-theme.model.ts     # AppTheme type (dark | light)
│   │       └── app-environment.model.ts # AppEnvironment interface
│   │
│   ├── shared/                        # Reusable, multi-feature components
│   │   ├── components/
│   │   │   ├── shell/                 # App shell (header, sidebar, main content)
│   │   │   │   ├── shell.component.ts
│   │   │   │   ├── shell.component.html
│   │   │   │   └── shell.component.scss
│   │   │   ├── header/               # Top header bar with theme toggle
│   │   │   │   ├── header.component.ts
│   │   │   │   ├── header.component.html
│   │   │   │   └── header.component.scss
│   │   │   ├── sidebar/              # RTL sidebar navigation
│   │   │   │   ├── sidebar.component.ts
│   │   │   │   ├── sidebar.component.html
│   │   │   │   └── sidebar.component.scss
│   │   │   ├── storage-warning/      # Persistent banner when LocalStorage unavailable
│   │   │   │   ├── storage-warning.component.ts
│   │   │   │   ├── storage-warning.component.html
│   │   │   │   └── storage-warning.component.scss
│   │   │   └── not-found/            # 404 page
│   │   │       ├── not-found.component.ts
│   │   │       ├── not-found.component.html
│   │   │       └── not-found.component.scss
│   │   └── utils/
│   │       ├── date.utils.ts          # Arabic date formatting helpers
│   │       ├── type-guards.ts         # Runtime type guards
│   │       └── error.utils.ts         # Error handling helpers
│   │
│   ├── features/                      # Feature modules (one per phase)
│   │   ├── dashboard/
│   │   │   └── dashboard.component.ts # Placeholder
│   │   ├── relapses/
│   │   │   └── relapses.component.ts  # Placeholder
│   │   ├── analytics/
│   │   │   ├── time-series/
│   │   │   │   └── time-series.component.ts  # Placeholder
│   │   │   ├── calendar/
│   │   │   │   └── calendar.component.ts     # Placeholder
│   │   │   ├── patterns/
│   │   │   │   └── patterns.component.ts     # Placeholder
│   │   │   ├── triggers/
│   │   │   │   └── triggers.component.ts     # Placeholder
│   │   │   └── urge/
│   │   │       └── urge.component.ts         # Placeholder
│   │   ├── charts/
│   │   │   └── charts.component.ts    # Placeholder
│   │   └── settings/
│   │       └── settings.component.ts  # Placeholder
│   │
│   ├── app.component.ts               # Root component
│   ├── app.component.html
│   ├── app.component.scss
│   ├── app.config.ts                  # Application config (provideRouter, etc.)
│   └── app.routes.ts                  # Route definitions
│
├── assets/
│   └── fonts/                         # Self-hosted Arabic WOFF2 fonts
│       ├── cairo-regular.woff2
│       ├── cairo-bold.woff2
│       └── cairo-semibold.woff2
│
├── environments/
│   ├── environment.ts                 # Dev config
│   └── environment.prod.ts            # Prod config
│
├── styles/
│   ├── _variables.scss                # Design tokens (colors, spacing, typography)
│   ├── _themes.scss                   # Dark/light theme CSS custom properties
│   ├── _fonts.scss                    # @font-face declarations
│   ├── _reset.scss                    # CSS reset / normalize
│   ├── _rtl.scss                      # RTL-specific overrides
│   └── styles.scss                    # Global entry point (imports all partials)
│
├── index.html                         # Root HTML with dir="rtl" lang="ar"
└── main.ts                            # Bootstrap

.eslintrc.json                         # ESLint configuration
.prettierrc                            # Prettier configuration
angular.json                           # Angular workspace config
tsconfig.json                          # TypeScript config (strict)
package.json                           # Dependencies + scripts
```

**Structure Decision**: Single-project Angular SPA with feature-based architecture. No
monorepo, no backend, no multi-project workspace. Features are isolated under `features/`
with lazy-loaded routes. Shared UI lives in `shared/`, singleton services in `core/`.

## Complexity Tracking

No constitution violations detected — no complexity justifications needed.
