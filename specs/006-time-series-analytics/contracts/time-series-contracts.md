# Contracts: Time Series Analytics

This feature has no backend or external API contracts. Contracts are internal UI/service contracts for the Angular application and must remain compatible with the dashboard shell.

## Dashboard Card Registration Contract

Time-series cards must be registered with the dashboard through `DashboardCardDescriptor`.

```ts
interface DashboardCardDescriptor {
  id: string;
  titleAr: string;
  component: Type<unknown>;
  defaultOrder: number;
}
```

### Required Card IDs

| Card ID | Purpose | Primary Requirements |
|---------|---------|----------------------|
| `time-series-daily` | Daily count chart and raw table | FR-001, FR-002, FR-003, FR-005, FR-013, FR-018 |
| `time-series-periods` | Weekly/monthly grouped views | FR-001, FR-002, FR-004, FR-006, FR-013, FR-018 |
| `time-series-moving-average` | Moving average chart | FR-007, FR-016 |
| `time-series-cumulative` | Running total chart | FR-008 |
| `time-series-summary` | Trend, growth, average, distribution, invalid-record notice | FR-009, FR-010, FR-011, FR-012, FR-017 |

### Registration Rules

- Card IDs must be stable across releases so user layout preferences remain valid.
- Card titles must be Arabic.
- Cards must support dashboard shell loading, empty, data, and error states.
- Placeholder cards from Phase 5 may remain only as development/demo cards; user-facing dashboard value should come from the Phase 6 cards.

## TimeSeriesAnalyticsService Contract

The feature orchestration service derives all Phase 6 view state from local records and the active dashboard date range.

```ts
type TimeSeriesStatus = 'loading' | 'empty' | 'data' | 'error';
type TrendDirection = 'increasing' | 'decreasing' | 'stable' | 'insufficient-data';
type TrendConfidence = 'meaningful' | 'limited' | 'insufficient';

interface TimeSeriesPoint {
  date: string;
  labelAr: string;
  value: number;
}

interface TimeSeriesPeriod {
  grouping: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
  anchorDate: string;
  labelAr: string;
  count: number;
  isPartial: boolean;
}

interface TimeSeriesDataset {
  grouping: 'daily' | 'weekly' | 'monthly';
  rangeStart: string;
  rangeEnd: string;
  periods: TimeSeriesPeriod[];
  totalCount: number;
  hasActivity: boolean;
  zeroFilled: boolean;
}

interface TrendSummary {
  direction: TrendDirection;
  growthRatePercent: number | null;
  averageDailyCount: number;
  comparisonStartCount: number;
  comparisonEndCount: number;
  confidence: TrendConfidence;
  messageAr: string;
}

interface TimeSeriesAnalyticsState {
  status: TimeSeriesStatus;
  rangeStart: string;
  rangeEnd: string;
  daily: TimeSeriesDataset;
  weekly: TimeSeriesDataset;
  monthly: TimeSeriesDataset;
  movingAverage: TimeSeriesPoint[];
  cumulative: TimeSeriesPoint[];
  trend: TrendSummary;
  distribution: DistributionEntry[];
  invalidRecordCount: number;
  errorMessageAr: string | null;
}
```

### Service Behavior

- Expose a readonly Signal for `TimeSeriesAnalyticsState`.
- Recompute when relapse records change.
- Recompute when the dashboard date range changes.
- Exclude invalid records from calculations and increment `invalidRecordCount`.
- Return `empty` when the active range has no valid activity.
- Return `error` only when valid local data cannot be read or transformed.

## Chart Component Contract

Time-series chart components must accept already-prepared points, render with Chart.js, and avoid doing business aggregation internally.

```ts
interface TimeSeriesChartInput {
  points: TimeSeriesPoint[];
  titleAr: string;
  valueLabelAr: string;
  emptyMessageAr: string;
  variant: 'line' | 'bar';
}
```

### Chart Rules

- Render chronologically from oldest to newest.
- Preserve visible zero values instead of dropping them.
- Provide a readable empty state when `points` is empty.
- Provide accessible labels for the chart title and current values.
- Support RTL layout and Arabic labels.
- Configure Chart.js tooltips with RTL/text-direction support.
- Use theme variables so dark/light mode remains readable.

## Table Component Contract

Raw data tables must reflect the same data used by charts.

```ts
interface TimeSeriesTableRow {
  labelAr: string;
  startDate: string;
  endDate: string;
  count: number;
}
```

### Table Rules

- Row order must match chart point order.
- Counts must match chart values exactly.
- Daily rows show one date; weekly/monthly rows show the period start/end when helpful.
- Empty datasets must show a user-friendly Arabic empty state.

## Acceptance Coverage

| Requirement | Contract Coverage |
|-------------|-------------------|
| FR-001 through FR-006 | Dashboard card contract plus dataset/chart/table contracts |
| FR-007 through FR-012 | Service contract, trend summary, moving average, cumulative, distribution outputs |
| FR-013 | Table component contract |
| FR-014 | Service recomputation from dashboard date range Signal |
| FR-015 through FR-017 | State handling and invalid-record notice behavior |
| FR-018 through FR-020 | Shared state contract and dashboard card registration contract |
