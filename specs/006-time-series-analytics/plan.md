# Implementation Plan: Time Series Analytics

**Branch**: `006-time-series-analytics` | **Date**: 2026-07-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/006-time-series-analytics/spec.md`

---

## Summary

Build the first production analytics cards for the dashboard: daily, weekly, and monthly relapse activity; moving average; cumulative count; trend/growth summaries; distribution; and matching raw data tables. The feature reuses the pure TypeScript analytics engine from Phase 4, reads relapse records through the existing LocalStorage-backed repository, and renders responsive Arabic RTL dashboard cards through the Phase 5 dashboard shell. No backend, API, authentication, database, or new persistence is introduced.

---

## Technical Context

**Language/Version**: TypeScript 5.7.x with Angular 19.2.x, strict typing, standalone components, Angular Signals, SCSS

**Primary Dependencies**: Existing Angular runtime, Chart.js for time-series chart rendering, existing dashboard shell, existing `RelapseRecordRepository`, existing `core/analytics` engine functions.

**Storage**: LocalStorage only, accessed through `RelapseRecordRepository`. This feature reads records and stores no new user preferences.

**Testing**: `ng test` / `npm test` with Karma and Jasmine; `npm run lint`; `npm run build`

**Target Platform**: Browser-only Angular SPA, offline-capable, Arabic UI, RTL layout, mobile-first responsive dashboard

**Project Type**: Angular frontend feature layered over a pure TypeScript analytics engine

**Performance Goals**: Date range changes refresh all time series cards within 1 second for 10,000 records; analytics remain compatible with the constitution target of 100,000 relapse records through single-pass aggregation and memoized Signal computations.

**Constraints**: No backend, no APIs, no authentication, no database, no IndexedDB, no SSR. Avoid duplicated aggregation logic. Use RxJS only if Signals cannot express the data flow. Chart.js configuration must support Arabic labels, RTL tooltips, dark mode, empty states, and sparse datasets.

**Scale/Scope**: Up to 100,000 relapse records; active dashboard date ranges from a single day through one year or all records; Phase 6 is limited to time-based count analytics and excludes calendar heatmaps, weekday/hour patterns, trigger analytics, and urge analytics.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| Angular Platform | PASS | Feature is implemented as Angular standalone components/services with TypeScript and SCSS only. |
| 100% Local-First Storage | PASS | Reads records through the existing LocalStorage repository; introduces no remote service or alternate storage. |
| Arabic Language & RTL | PASS | Cards, chart labels, tables, empty states, and notices are planned for Arabic text and RTL layout. |
| Modern UI & UX | PASS | Dashboard cards include loading, data, empty, sparse-data, error, and non-blocking invalid-record notice states. |
| Performance & Scalability | PASS | Uses existing pure aggregation helpers, adds missing summaries as pure functions, and keeps UI derivation memoized. |
| Charting Library | PASS | Phase 6 uses Chart.js for responsive time-series charts; Phase 12 can still introduce broader reusable wrappers for other visualization families. |
| Architecture | PASS | Business calculations stay in `core/analytics`; UI orchestration and cards stay in `features/analytics/time-series`; dashboard integration uses descriptors. |
| Code Quality | PASS | Strong typed models, reusable services/components, and focused unit tests are planned. |

**All gates pass. No complexity exceptions are required.**

---

## Project Structure

### Documentation (this feature)

```text
specs/006-time-series-analytics/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- time-series-contracts.md
|-- checklists/
|   `-- requirements.md
`-- spec.md
```

### Source Code (repository root)

```text
src/app/core/analytics/
|-- models/
|   |-- analytics.types.ts              # MODIFY: add trend/time-series view result types as needed
|   `-- analytics-granularity.types.ts  # EXISTING: daily | weekly | monthly
|-- engine/
|   |-- time-series.engine.ts           # MODIFY: add cumulative series and invalid-date-safe helpers
|   |-- statistics.engine.ts            # MODIFY: add trend/growth helpers for count time series
|   |-- time-series.engine.spec.ts      # MODIFY: cover edge cases and performance
|   `-- statistics.engine.spec.ts       # MODIFY: trend/growth/distribution tests
|-- utils/
|   `-- date-range.utils.ts             # EXISTING: date range formatting/iteration
`-- index.ts                            # MODIFY: export new public analytics helpers/types

src/app/features/analytics/time-series/
|-- time-series.component.ts            # MODIFY: feature route/page wrapper
|-- time-series.component.html          # MODIFY: full-page analytics view if navigated directly
|-- time-series.component.scss          # MODIFY: responsive RTL layout
|-- models/
|   `-- time-series-view.model.ts       # NEW: card/view state models
|-- services/
|   `-- time-series-analytics.service.ts # NEW: Signal orchestration over repository + dashboard filter
|-- components/
|   |-- time-series-chart/              # NEW: responsive Chart.js line/bar chart wrapper
|   |-- time-series-table/              # NEW: accessible raw dataset table
|   |-- trend-summary-card/             # NEW: trend, growth rate, average, invalid notice
|   |-- daily-series-card/              # NEW: daily chart + table
|   |-- period-series-card/             # NEW: weekly/monthly toggle chart + table
|   |-- moving-average-card/            # NEW: moving average chart
|   `-- cumulative-count-card/          # NEW: cumulative count chart

src/app/features/dashboard/
|-- dashboard.component.ts              # MODIFY: register Phase 6 cards through descriptors
|-- dashboard.component.html            # EXISTING: shell renders registered cards
|-- dashboard.component.scss            # EXISTING: responsive grid
`-- services/
    |-- dashboard-filter.service.ts     # EXISTING: active date range Signal
    `-- dashboard-layout.service.ts     # EXISTING: card order/visibility preferences
```

**Structure Decision**: Keep aggregation and summary math in `src/app/core/analytics/` so later analytics phases can reuse it. Keep all Phase 6 UI, dashboard card state, Chart.js presentation, and table presentation in `src/app/features/analytics/time-series/`. Dashboard changes are limited to registering real time-series card descriptors in place of or alongside placeholder cards.

---

## Phase 0: Research

Completed in [research.md](./research.md).

Key decisions:

- Reuse and extend the existing pure TypeScript analytics engine instead of duplicating calculations in Angular components.
- Use Angular Signals for the feature orchestration service.
- Render Phase 6 charts with Chart.js through Angular standalone wrapper components, while deferring broader cross-feature chart abstractions to Phase 12.
- Use ISO-style Monday-based week grouping already present in the analytics engine.
- Ignore invalid/incomplete records for calculations and surface a non-blocking notice.

---

## Phase 1: Design & Contracts

Completed artifacts:

- [data-model.md](./data-model.md)
- [contracts/time-series-contracts.md](./contracts/time-series-contracts.md)
- [quickstart.md](./quickstart.md)

Post-design constitution check remains PASS: the design preserves Angular-only/local-only constraints, keeps calculations reusable, uses Arabic RTL presentation requirements, and includes performance-sensitive aggregation boundaries.

---

## Verification Plan

### Automated Tests

- `npm test -- --watch=false` for unit tests covering:
  - daily zero-fill across selected ranges
  - weekly and monthly overlapping period aggregation
  - cumulative counts
  - moving average behavior on sparse and short ranges
  - trend direction, growth rate, and insufficient-data states
  - invalid record exclusion and notice count
  - chart/table value consistency through view models
- `npm run lint` for strict TypeScript and Angular linting.
- `npm run build` for production build validation.

### Manual Verification

- Add records across several days with gaps, then verify daily zero-filled chart/table rows.
- Switch dashboard range between Last 7 Days, Last 30 Days, Last 90 Days, Last Year, and Custom Range; verify all time-series cards update together.
- Test no records, one record, single-day range, and sparse long-range data.
- Verify Arabic RTL layout, chart labels, table alignment, dark/light mode readability, and mobile widths down to 320px.
- Corrupt or inject an invalid record in LocalStorage; verify valid records still render and a non-blocking notice appears.

## Complexity Tracking

No constitution violations or complexity exceptions are required.
