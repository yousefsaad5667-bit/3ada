# Implementation Plan: Time Pattern Analytics

**Branch**: `008-time-pattern-analytics` | **Date**: 2026-07-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/008-time-pattern-analytics/spec.md`

---

## Summary

Build the Phase 8 Time Pattern Analytics feature: weekday distribution, hourly distribution, AM vs PM comparison, a 7×24 hour-weekday heatmap, and a peak-insights summary card. All five surfaces share a single `PatternAnalyticsService` that derives view state from the existing `RelapseRecordRepository` records Signal and the `DashboardFilterService` active date range Signal. The engine functions `getWeekdayAnalysis()` and `getHourAnalysis()` from Phase 4 are reused as-is. The stub `PatternsComponent` in `features/analytics/patterns/` is replaced with a full implementation. Dashboard integration follows the `DashboardCardDescriptor` pattern from Phase 5. No third-party chart or visualization library is introduced for Phase 8 — all charts are pure Angular CSS-grid/Flexbox components with RTL and Arabic support.

---

## Technical Context

**Language/Version**: TypeScript 5.7.x with Angular 19.2.x, strict typing, standalone components, Angular Signals, SCSS

**Primary Dependencies**: Existing Angular runtime, existing `RelapseRecordRepository`, existing `DashboardFilterService`, existing `getWeekdayAnalysis()` and `getHourAnalysis()` analytics engine functions, existing dashboard shell and `DashboardCardDescriptor` contract, existing `IntensityLevel` type from Phase 7. No new library dependency is introduced.

**Storage**: LocalStorage only, accessed through `RelapseRecordRepository`. This feature reads records and stores no new user preferences.

**Testing**: `ng test` / `npm test` with Karma and Jasmine; `npm run lint`; `npm run build`

**Target Platform**: Browser-only Angular SPA, offline-capable, Arabic UI, RTL layout, mobile-first responsive dashboard

**Project Type**: Angular frontend feature layered over the existing pure TypeScript analytics engine

**Performance Goals**: All pattern charts render within 2 seconds for 10,000 records; date range changes refresh all charts within 1 second.

**Constraints**: No backend, no APIs, no authentication, no database, no IndexedDB, no SSR. No third-party chart or calendar library — custom CSS-grid rendering required due to RTL/Arabic constraints. Engine functions `getWeekdayAnalysis()` and `getHourAnalysis()` are reused as-is; no engine modifications in this phase. Avoid duplicating aggregation logic already in the engine.

**Scale/Scope**: Up to 100,000 relapse records; Phase 8 is limited to temporal pattern visualizations (weekday, hour, AM/PM, hour-weekday heatmap, summary); urge-by-time and trigger-by-time analyses are out of scope for this phase.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| Angular Platform | PASS | Feature is implemented as Angular standalone components and a service with TypeScript and SCSS. No third-party library is added. |
| 100% Local-First Storage | PASS | Reads records through the existing LocalStorage repository. Introduces no remote service, alternate storage, or new persistence key. |
| Arabic Language & RTL | PASS | Weekday/hour bar charts, heatmap, period split card, and summary card are planned for Arabic text, RTL layout, and SCSS intensity variables that respect dark/light mode. |
| Modern UI & UX | PASS | Dashboard cards include loading, data, empty, and error states. Empty state for missing time data is explicitly spec'd. |
| Performance & Scalability | PASS | `getWeekdayAnalysis()` and `getHourAnalysis()` are O(n) in records. Cross-product heatmap computation is O(n) in records (single-pass). Signal-based memoization prevents recomputation when unrelated Signals change. |
| Charting Library | PASS | No chart library is introduced for this phase. All bar charts and the heatmap are purely CSS Angular components. |
| Architecture | PASS | Business calculations stay in `core/analytics`; all Phase 8 UI, state, and layout stay in `features/analytics/patterns`; dashboard integration uses descriptors. |
| Code Quality | PASS | Strict-typed models, a single orchestration service, reusable components, and focused unit tests are planned. |

**All gates pass. No complexity exceptions are required.**

---

## Project Structure

### Documentation (this feature)

```text
specs/008-time-pattern-analytics/
├── plan.md                        <- this file
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
|   └── pattern-contracts.md
├── checklists/
|   └── requirements.md
└── spec.md
```

### Source Code (repository root)

```text
src/app/core/analytics/
├── engine/
│   └── pattern.engine.ts          EXISTING — reused as-is (getWeekdayAnalysis, getHourAnalysis)
└── index.ts                       NO CHANGE — already exports getWeekdayAnalysis, getHourAnalysis

src/app/features/analytics/patterns/
├── patterns.component.ts          MODIFY — replace stub; full page layout wrapper
├── patterns.component.html        MODIFY — replace stub; RTL layout with all five cards
├── patterns.component.scss        MODIFY — replace stub; responsive RTL page layout
├── models/
│   └── pattern-view.model.ts      NEW — PatternAnalyticsState, WeekdayBucketView, HourBucketView,
│                                        HourWeekdayCellView, HourWeekdayHeatmapView,
│                                        PeriodSplitView, PatternSummaryView, PatternStatus
├── services/
│   └── pattern-analytics.service.ts  NEW — Signal orchestration:
│                                           state (computed from records + filter)
│                                           Maps engine outputs to typed view models
│                                           Derives heatmap cross-product, AM/PM split, peak summary
└── components/
    ├── weekday-chart/              NEW — 7-bar weekday distribution chart
    │   ├── weekday-chart.component.ts
    │   ├── weekday-chart.component.html
    │   └── weekday-chart.component.scss
    ├── hourly-chart/               NEW — 24-bar hour distribution chart
    │   ├── hourly-chart.component.ts
    │   ├── hourly-chart.component.html
    │   └── hourly-chart.component.scss
    ├── period-split-card/          NEW — AM vs PM visual comparison card
    │   ├── period-split-card.component.ts
    │   ├── period-split-card.component.html
    │   └── period-split-card.component.scss
    ├── hour-weekday-heatmap/       NEW — 7x24 temporal heatmap (CSS grid)
    │   ├── hour-weekday-heatmap.component.ts
    │   ├── hour-weekday-heatmap.component.html
    │   └── hour-weekday-heatmap.component.scss
    └── pattern-summary-card/       NEW — peak insights summary panel
        ├── pattern-summary-card.component.ts
        ├── pattern-summary-card.component.html
        └── pattern-summary-card.component.scss

src/app/features/dashboard/
└── dashboard.component.ts         MODIFY — register Phase 8 card descriptors:
                                            patterns-weekday-chart, patterns-hourly-chart,
                                            patterns-period-split, patterns-heatmap, patterns-summary
```

**Structure Decision**: All cross-product aggregation, intensity mapping, and peak-insight derivation live in `PatternAnalyticsService`. All layout rendering, RTL CSS, and interaction events live in the five new component trees under `features/analytics/patterns/components/`. Dashboard integration uses the existing `DashboardCardDescriptor` pattern.

---

## Phase 0: Research

Completed in [research.md](./research.md).

Key decisions:
- Reuse `getWeekdayAnalysis()` and `getHourAnalysis()` from the existing analytics engine — no engine changes.
- Derive the 7x24 hour-weekday heatmap in the service (single-pass O(n) aggregation).
- Derive AM/PM split by summing hour buckets 0-11 vs 12-23 from the engine output.
- Derive peak/least insights by reduce operations over weekday and hour bucket arrays in the service.
- Render all charts as pure CSS Angular components (no third-party chart library) for RTL/Arabic compatibility.
- Reuse `IntensityLevel` type and SCSS intensity variables from Phase 7.

---

## Phase 1: Design & Contracts

Completed artifacts:

- [data-model.md](./data-model.md)
- [contracts/pattern-contracts.md](./contracts/pattern-contracts.md)
- [quickstart.md](./quickstart.md)

Post-design constitution check remains PASS: the design is Angular-only, local-only, RTL-capable, and preserves the engine/feature separation. No library dependency is added.

---

## Verification Plan

### Automated Tests

- `npm test -- --watch=false` for unit tests covering:
  - `PatternAnalyticsService`:
    - Empty dataset: `status === 'empty'`, all weekday counts zero, all hour counts zero
    - Records with no time: weekday distribution populated, `skippedRecordCount > 0`, hourly empty
    - Records with time: correct weekday/hour/heatmap/period split/summary values
    - Date range change: state recomputes correctly
    - Tied peak weekdays: all tied days have `isPeak: true`
    - Invalid records excluded: `invalidRecordCount` incremented
  - `WeekdayBucketView` derivation: 7 entries always, percentages sum to 100
  - `HourBucketView` derivation: 24 entries always, AM/PM classification correct
  - `HourWeekdayHeatmapView`: cells[weekday][hour] correctly populated, intensity levels correct
  - `PeriodSplitView`: AM + PM = total, percentages sum to 100
- `npm run lint` for strict TypeScript and Angular linting
- `npm run build` for production build validation

### Manual Verification

- Load records across multiple weekdays: verify weekday chart shows correct bar heights, all 7 bars visible, peak bar visually distinct.
- Load records with known AM/PM times: verify hourly chart shows correct bars, zero-height bars for empty hours.
- Verify AM vs PM card shows correct percentages and dominant period label in Arabic.
- Load records targeting specific weekday-hour combinations: verify heatmap cells show correct intensity.
- Switch dashboard date range: verify all pattern charts update.
- Load records with no time fields: verify weekday chart works, hourly chart shows empty state with Arabic message.
- Test with zero records: all charts render cleanly with Arabic empty state messages.
- Test RTL layout: weekday labels right-aligned, bars grow from right baseline, heatmap hour labels on right.
- Verify dark mode and light mode intensity colors are distinct and readable.
- Verify mobile layout at 320px width.
- Inject invalid record (missing date) in LocalStorage: verify valid records still render and `invalidRecordCount > 0`.

---

## Complexity Tracking

No constitution violations or complexity exceptions are required.
