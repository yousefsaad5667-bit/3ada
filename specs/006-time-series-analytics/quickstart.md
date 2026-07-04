# Quickstart: Time Series Analytics

## Prerequisites

- Current branch: `006-time-series-analytics`
- Active Spec Kit feature: `specs/006-time-series-analytics`
- Dependencies already installed with `npm install`

## Read First

1. `specs/006-time-series-analytics/spec.md`
2. `specs/006-time-series-analytics/plan.md`
3. `specs/006-time-series-analytics/data-model.md`
4. `specs/006-time-series-analytics/contracts/time-series-contracts.md`

## Suggested Implementation Order

1. Extend `src/app/core/analytics` with cumulative count, trend/growth summary, invalid-record-safe helpers, and exports.
2. Add or update analytics engine tests for daily zero-fill, weekly/monthly overlap, moving average, cumulative counts, trend states, and invalid records.
3. Create `TimeSeriesAnalyticsService` under `src/app/features/analytics/time-series/services/`.
4. Create shared time-series view models under `src/app/features/analytics/time-series/models/`.
5. Create Chart.js chart components and table components that consume prepared datasets without recalculating business logic.
6. Create the five dashboard cards:
   - daily series
   - weekly/monthly periods
   - moving average
   - cumulative count
   - summary/distribution
7. Register the Phase 6 card descriptors with `DashboardComponent`.
8. Fill `TimeSeriesComponent` as the route-level view if direct navigation is supported.
9. Polish Arabic RTL states, dark/light mode, mobile layout, and accessibility labels.

## Verification Commands

```powershell
npm test -- --watch=false
npm run lint
npm run build
```

## Manual Verification Checklist

- Daily chart/table includes every date in the selected range.
- Missing dates show zero counts.
- Weekly and monthly views include overlapping partial periods.
- Moving average shows an insufficient-data state when too little data exists.
- Cumulative count ends at the same total as the daily dataset.
- Trend summary does not claim a direction for no-record or one-point ranges.
- Invalid records are ignored without blocking valid analytics.
- Switching dashboard date ranges updates all Phase 6 cards together.
- RTL layout remains readable at 320px, tablet, and desktop widths.
- Dark mode and light mode both keep chart lines, labels, and tables legible.
