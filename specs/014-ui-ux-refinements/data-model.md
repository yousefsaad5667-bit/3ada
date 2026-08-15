# Data Model: UI/UX Refinements

This feature makes no changes to data models, storage schemas, or service state shapes. All changes are purely presentational (CSS tokens, component wiring, template changes).

For reference, the key entity relationships that inform wrapper component design:

## Analytics State Signals (consumed by new smart wrappers)

### PatternAnalyticsState (from PatternAnalyticsService.state)

```typescript
interface PatternAnalyticsState {
  status: 'loading' | 'empty' | 'data' | 'error';
  weekdays: WeekdayBucketView[];       // → WeekdayChartComponent @Input
  hours: HourBucketView[];             // → HourlyChartComponent @Input
  periodSplit: PeriodSplitView;        // → PeriodSplitCardComponent @Input
  heatmap: HourWeekdayHeatmapView;    // → HourWeekdayHeatmapComponent @Input
  summary: PatternSummaryView;         // → PatternSummaryCardComponent @Input
  rangeStart: string;
  rangeEnd: string;
  skippedRecordCount: number;
  invalidRecordCount: number;
  errorMessageAr: string | null;
}
```

### TriggerAnalyticsState (from TriggerAnalyticsService.state)

```typescript
interface TriggerAnalyticsState {
  status: 'loading' | 'empty' | 'data' | 'error';
  triggers: TriggerBucketView[];            // → TriggerRankingListComponent @Input
  distribution: TriggerDistributionView;    // → TriggerDistributionChartComponent @Input
  summary: TriggerSummaryView;              // → TriggerSummaryCardComponent @Input
  trend: TriggerTrendView | null;           // → TriggerTimelineComponent @Input
  rangeStart: string;
  rangeEnd: string;
  errorMessageAr: string | null;
}
```

### DashboardCardShell Contract

Each smart wrapper MUST expose a public `cardState` signal of type `() => CardState` where:

```typescript
type CardState = 'loading' | 'data' | 'empty' | 'error';
```

The shell's `ngOnInit` reads this signal via `instance.cardState` and mirrors it into the shell's own `state` signal to drive the loading/empty/error overlay.

## Token Map (CSS)

| Old (broken) | New (correct) |
|---|---|
| `var(--surface-color, #ffffff)` | `var(--color-bg-card)` |
| `--success-color` (for decreasing trend) | `var(--color-elapse-indicator)` |
| `var(--text-primary, #333333)` | `var(--color-text-primary)` |
| `var(--text-secondary, #666666)` | `var(--color-text-secondary)` |
| `var(--border-color, ...)` | `var(--color-border)` |
| `var(--danger-color, #d32f2f)` | `var(--color-danger, #d32f2f)` |
| `var(--hover-bg, #f5f5f5)` | `var(--color-bg-secondary)` |
