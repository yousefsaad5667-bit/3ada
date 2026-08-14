# Implementation Plan: Urge Analytics

**Branch**: `010-urge-analytics` | **Date**: 2026-07-25 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/010-urge-analytics/spec.md`

## Summary

Build the Urge Analytics feature (`analytics/urge` route) which already has a skeleton component and a partially implemented engine. The feature will expose all six analytical views defined in the spec — summary statistics, time series with moving average and trend, distribution, hourly and weekday breakdowns, trigger-ranked urge averages, and a relapse-count correlation insight. The implementation follows the established trigger-analytics pattern: a dedicated `UrgAnalyticsService` backed by Angular Signals that aggregates engine outputs into a typed state object, consumed by focused sub-components composed inside `UrgeComponent`.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)

**Primary Dependencies**: Angular 19 (Signals, Standalone Components, computed/signal), RxJS (not needed — pure Signals), SCSS

**Storage**: LocalStorage via `RelapseRecordRepository` (already injected by all other analytics services)

**Testing**: Jasmine / Karma (`ng test`) — spec files colocated with source

**Target Platform**: Browser (SPA, fully offline)

**Project Type**: Angular SPA — single-project structure under `src/`

**Performance Goals**: Analytics recompute in < 100 ms for 100,000 records; correlation computation uses lightweight Pearson-like directional signal (no heavy stats libraries)

**Constraints**: No backend, no APIs, no cloud. All computation in-browser. Arabic UI (RTL). Engine functions are pure functions (easily testable). Correlation minimum threshold = 10 data points.

**Scale/Scope**: Analytics page scoped to the active `DashboardFilterService` date range; all views update reactively when filter changes.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Angular Platform | ✅ PASS | Standalone components, Angular Signals, TypeScript, SCSS |
| II. Local-First (LocalStorage only) | ✅ PASS | All data from `RelapseRecordRepository`; no external calls |
| III. Arabic Language & RTL | ✅ PASS | All labels, tooltips, empty states in Arabic; RTL layout |
| IV. Modern UI & UX | ✅ PASS | Empty states, loading states, dark/light mode via SCSS vars |
| V. Performance & Scalability | ✅ PASS | Correlation uses O(n) aggregation; moving average uses existing `getMovingAverage` utility |
| Charting | ✅ PASS | No new chart library needed for Phase 10 — data is prepared for Phase 12 charts |
| Architecture | ✅ PASS | Feature-based folder, service/component/model separation, SOLID |
| Code Quality | ✅ PASS | Strict typing, no duplication (reuses existing engine functions) |

**Post-Design Re-check**: ✅ All gates pass. No violations.

## Project Structure

### Documentation (this feature)

```text
specs/010-urge-analytics/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── urge-contracts.md
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
src/app/core/analytics/
├── engine/
│   └── urge.engine.ts         [EXTEND] add getUrgeByHour, getUrgeByWeekday,
│                               getUrgeByTrigger, getUrgeCorrelation functions
├── models/
│   └── analytics.types.ts     [EXTEND] add UrgeHourEntry, UrgeWeekdayEntry,
│                               UrgeTriggerEntry, UrgeCorrelationResult,
│                               UrgeDistributionResult types
└── index.ts                   [EXTEND] export new engine functions & types

src/app/features/analytics/urge/
├── models/
│   └── urge-view.model.ts     [NEW] typed view models & state (mirrors trigger-view pattern)
├── services/
│   └── urge-analytics.service.ts         [NEW] main service (Angular Signal computed)
│   └── urge-analytics.service.spec.ts    [NEW] unit tests
├── components/
│   ├── urge-summary-card/
│   │   ├── urge-summary-card.component.ts    [NEW]
│   │   ├── urge-summary-card.component.html  [NEW]
│   │   └── urge-summary-card.component.scss  [NEW]
│   ├── urge-time-series-chart/
│   │   ├── urge-time-series-chart.component.ts   [NEW]
│   │   ├── urge-time-series-chart.component.html [NEW]
│   │   └── urge-time-series-chart.component.scss [NEW]
│   ├── urge-distribution-chart/
│   │   ├── urge-distribution-chart.component.ts   [NEW]
│   │   ├── urge-distribution-chart.component.html [NEW]
│   │   └── urge-distribution-chart.component.scss [NEW]
│   ├── urge-by-hour-chart/
│   │   ├── urge-by-hour-chart.component.ts   [NEW]
│   │   ├── urge-by-hour-chart.component.html [NEW]
│   │   └── urge-by-hour-chart.component.scss [NEW]
│   ├── urge-by-weekday-chart/
│   │   ├── urge-by-weekday-chart.component.ts   [NEW]
│   │   ├── urge-by-weekday-chart.component.html [NEW]
│   │   └── urge-by-weekday-chart.component.scss [NEW]
│   ├── urge-by-trigger-list/
│   │   ├── urge-by-trigger-list.component.ts   [NEW]
│   │   ├── urge-by-trigger-list.component.html [NEW]
│   │   └── urge-by-trigger-list.component.scss [NEW]
│   └── urge-correlation-card/
│       ├── urge-correlation-card.component.ts   [NEW]
│       ├── urge-correlation-card.component.html [NEW]
│       └── urge-correlation-card.component.scss [NEW]
├── urge.component.ts          [REPLACE] wire up service and sub-components
├── urge.component.html        [REPLACE] full layout
└── urge.component.scss        [REPLACE] page layout styles
```

## Complexity Tracking

No constitution violations. No complexity justification required.
