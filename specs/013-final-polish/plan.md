# Implementation Plan: Final Polish

**Branch**: `014-final-polish` | **Date**: 2026-08-15 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/013-final-polish/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command.

## Summary

Cross-cutting final polish pass to prepare the Angular SPA for production: implementing full responsive design across viewports, WCAG 2.1 AA accessibility (focus rings, SR announcements, contrast), auto-switching dark mode, route and component animations, robust global error handling, and code cleanup.

## Technical Context

**Language/Version**: TypeScript 5.x, Angular 19

**Primary Dependencies**: `@angular/cdk` (A11yModule), `@angular/animations`

**Storage**: LocalStorage (unchanged, adding parse error recovery)

**Testing**: Jasmine / Karma (`ng test`)

**Target Platform**: Browser SPA, fully offline

**Project Type**: Web application

**Performance Goals**: < 300ms route transitions, zero jank on mobile

**Constraints**: LocalStorage only, Arabic UI + RTL layout unchanged

**Scale/Scope**: ~15 files modified, mostly SCSS + 2 new error-handling classes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Angular Platform | ✅ PASS | Core Angular features used (Animations, ErrorHandler) |
| II. Local-First | ✅ PASS | No external APIs. LocalStorage error guard added. |
| III. Arabic Language & RTL | ✅ PASS | Responsive design accounts for RTL drawer/layout. |
| IV. Modern UI & UX | ✅ PASS | This feature directly implements the UI/UX requirements. |
| V. Performance & Scalability | ✅ PASS | CSS variables and minimal animations ensure high performance. |
| Code Quality | ✅ PASS | SCSS token standardization and ESLint strictness applied. |

## Project Structure

### Documentation (this feature)

```text
specs/013-final-polish/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── ui-contracts.md  # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks command)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── core/
│   │   ├── models/app-error.model.ts              # [NEW]
│   │   ├── services/app-error-handler.service.ts  # [NEW]
│   │   ├── services/storage.service.ts            # [MODIFY]
│   │   └── services/theme.service.ts              # [MODIFY]
│   ├── shared/
│   │   ├── animations/route-animations.ts         # [NEW]
│   │   └── components/error-page/                 # [NEW]
│   ├── app.component.ts                           # [MODIFY]
│   ├── app.config.ts                              # [MODIFY]
│   └── (various feature components)               # [MODIFY] SCSS for responsive/a11y
└── styles/
    ├── _variables.scss                            # [MODIFY]
    └── styles.scss                                # [MODIFY]
```

**Structure Decision**: Single Angular project layout. New global error boundary added to `core/` and `shared/` to support reliable rendering in failure states without architectural bloat.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

*(No violations)*

