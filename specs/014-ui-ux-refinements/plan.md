# Implementation Plan: UI/UX Refinements

**Branch**: `014-ui-ux-refinements` | **Date**: 2026-08-15 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/014-ui-ux-refinements/spec.md`

## Summary

Six targeted fixes to the Angular dashboard SPA:
1. Change the elapse/trend color from semantic-green to an alert color (orange/amber)
2. Remove CDK drag-and-drop from all dashboard cards
3. Align all card SCSS to use the existing `--color-bg-card` and sibling tokens instead of non-existent `--surface-color` fallbacks
4. Promote `DateRangeSelectorComponent` from the dashboard into the global `HeaderComponent` so the filter applies cross-view
5. Add horizontal overflow scrolling inside chart and heatmap containers to handle 90+ day ranges without breaking layout
6. Create nine smart wrapper components (one per broken analytics card) that self-inject their analytics service and expose the `cardState` signal contract expected by `DashboardCardShellComponent`

## Technical Context

**Language/Version**: TypeScript 5.x, Angular 19

**Primary Dependencies**: `@angular/cdk` (DragDropModule — to be *removed*), Angular Signals

**Storage**: LocalStorage (read-only for this feature)

**Testing**: Jasmine / Karma (`ng test`)

**Target Platform**: Browser SPA, fully offline, RTL

**Project Type**: Angular web application

**Performance Goals**: No degradation; chart scroll containers must not re-trigger full change detection

**Constraints**: No new npm dependencies; existing `DashboardFilterService` (already `providedIn: 'root'`) is the global state authority

**Scale/Scope**: ~25 files modified or created; zero new services required

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Angular Platform | ✅ PASS | Pure Angular — Signals, Standalone Components, OnPush CD |
| II. Local-First | ✅ PASS | No network calls; LocalStorage untouched |
| III. Arabic Language & RTL | ✅ PASS | No UI text changed; filter move is RTL-safe (header already RTL) |
| IV. Modern UI & UX | ✅ PASS | This feature directly repairs UI/UX regressions |
| V. Performance & Scalability | ✅ PASS | Horizontal scroll containers use CSS-only overflow; smart wrappers reuse existing `providedIn: 'root'` services — zero extra compute |
| Code Quality | ✅ PASS | DragDropModule import removed; SCSS tokens standardized |

## Project Structure

### Documentation (this feature)

```text
specs/014-ui-ux-refinements/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── contracts/
│   └── ui-contracts.md  # Phase 1 output
└── tasks.md             # /speckit-tasks output
```

### Source Code (repository root)

```text
src/
├── styles/
│   └── _themes.scss                                           # [MODIFY] add --color-elapse-indicator + token aliases
│
├── app/
│   ├── shared/components/
│   │   └── header/
│   │       ├── header.component.ts                            # [MODIFY] inject DateRangeSelectorComponent
│   │       └── header.component.html                         # [MODIFY] add <app-date-range-selector>
│   │
│   └── features/
│       ├── dashboard/
│       │   ├── dashboard.component.ts                         # [MODIFY] remove DragDropModule, onDrop()
│       │   ├── dashboard.component.html                       # [MODIFY] remove cdkDropList/cdkDrag
│       │   ├── components/
│       │   │   ├── date-range-selector/
│       │   │   │   └── date-range-selector.component.ts       # [NO CHANGE — reused in header]
│       │   │   └── dashboard-card-shell/
│       │   │       └── dashboard-card-shell.component.scss    # [MODIFY] replace --surface-color fallbacks
│       │   └── (card placeholder SCSS)                        # [MODIFY] same token fix
│       │
│       └── analytics/
│           ├── time-series/components/trend-summary-card/
│           │   └── trend-summary-card.component.scss          # [MODIFY] .decreasing → --color-elapse-indicator
│           │
│           ├── patterns/
│           │   └── components/
│           │       ├── weekday-chart-card/                    # [NEW] smart wrapper
│           │       ├── hourly-chart-card/                     # [NEW] smart wrapper
│           │       ├── period-split-card-wrapper/             # [NEW] smart wrapper
│           │       ├── hour-weekday-heatmap-card/             # [NEW] smart wrapper
│           │       ├── pattern-summary-card-wrapper/          # [NEW] smart wrapper
│           │       ├── weekday-chart/
│           │       │   └── weekday-chart.component.scss       # [MODIFY] overflow-x: auto on chart container
│           │       ├── hourly-chart/
│           │       │   └── hourly-chart.component.scss        # [MODIFY] overflow-x: auto
│           │       └── hour-weekday-heatmap/
│           │           └── hour-weekday-heatmap.component.scss# [MODIFY] overflow-x: auto
│           │
│           └── triggers/
│               └── components/
│                   ├── trigger-ranking-list-card/             # [NEW] smart wrapper
│                   ├── trigger-summary-card-wrapper/          # [NEW] smart wrapper
│                   ├── trigger-timeline-card/                 # [NEW] smart wrapper
│                   ├── trigger-distribution-card/             # [NEW] smart wrapper
│                   └── trigger-timeline/
│                       └── trigger-timeline.component.scss    # [MODIFY] overflow-x: auto for timeline
```

**Structure Decision**: Single Angular project; nine new smart wrapper directories follow the existing `*-card` naming convention and live alongside their dumb siblings in the same feature folder.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

*(No violations)*
