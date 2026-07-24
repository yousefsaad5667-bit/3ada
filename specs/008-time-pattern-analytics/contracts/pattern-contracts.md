# Contracts: Time Pattern Analytics (Phase 8)

**Feature**: 008-time-pattern-analytics
**Date**: 2026-07-24

---

## PatternAnalyticsService — Public Signal Contract

The `PatternAnalyticsService` is the sole orchestrator for Phase 8 state. All components consume it through Angular's `inject()`.

```typescript
class PatternAnalyticsService {
  /** Reactive state signal — recomputes on records or filter change */
  readonly state: Signal<PatternAnalyticsState>;
}
```

### State Transition Rules

| Condition | `status` | Notes |
|-----------|----------|-------|
| No valid records in date range | `'empty'` | All derived arrays are empty/zero-filled |
| ≥ 1 valid record in date range | `'data'` | All 7 weekdays and 24 hours always present |
| Service initialization error | `'error'` | `errorMessageAr` contains Arabic error message |

### Weekday Distribution Contract

- **Always 7 entries**, one per weekday (Sunday=0 to Saturday=6)
- All records with valid dates are included, regardless of whether time is present
- `percentage` values sum to 100 (within floating-point tolerance) when `status === 'data'`
- `isPeak` is `true` for all weekdays sharing the maximum `count`

### Hourly Distribution Contract

- **Always 24 entries**, one per hour (0–23)
- Only records with valid, parseable time fields are counted
- `skippedRecordCount` in the state captures excluded relapse counts
- `percentage` values sum to 100 (within floating-point tolerance) when any hourly count > 0

### Hour-Weekday Heatmap Contract

- **`cells[weekday][hour]`** — outer index 0–6 (weekday), inner index 0–23 (hour)
- `intensity` is `'none'` when `count === 0`
- Intensity thresholds: `low` ≤ 25%, `medium` ≤ 50%, `high` ≤ 75%, `very-high` > 75% of `maxCellCount`
- Only records with both valid date AND valid time are included in heatmap cells

### Period Split Contract

- `amCount + pmCount === total` always
- `amPercentage + pmPercentage === 100` when `total > 0`
- `dominantPeriod === 'insufficient'` when `total === 0`
- `dominantPeriod === 'equal'` when `amCount === pmCount && total > 0`

---

## Component Input Contracts

### `WeekdayChartComponent`

```typescript
@Input({ required: true }) weekdays: WeekdayBucketView[];
@Input({ required: true }) status: PatternStatus;
```

### `HourlyChartComponent`

```typescript
@Input({ required: true }) hours: HourBucketView[];
@Input({ required: true }) status: PatternStatus;
@Input({ required: true }) skippedCount: number;
```

### `PeriodSplitCardComponent`

```typescript
@Input({ required: true }) periodSplit: PeriodSplitView;
@Input({ required: true }) status: PatternStatus;
```

### `HourWeekdayHeatmapComponent`

```typescript
@Input({ required: true }) heatmap: HourWeekdayHeatmapView;
@Input({ required: true }) status: PatternStatus;
```

### `PatternSummaryCardComponent`

```typescript
@Input({ required: true }) summary: PatternSummaryView;
@Input({ required: true }) status: PatternStatus;
```

---

## Dashboard Card IDs

Cards are registered in `DashboardComponent.CARD_REGISTRY` using these IDs:

| Card ID | Arabic Title | Component |
|---------|-------------|-----------|
| `patterns-weekday-chart` | `توزيع أيام الأسبوع` | `WeekdayChartComponent` |
| `patterns-hourly-chart` | `توزيع ساعات اليوم` | `HourlyChartComponent` |
| `patterns-period-split` | `مقارنة الصباح والمساء` | `PeriodSplitCardComponent` |
| `patterns-heatmap` | `خريطة الوقت والأسبوع` | `HourWeekdayHeatmapComponent` |
| `patterns-summary` | `أبرز أوقات النشاط` | `PatternSummaryCardComponent` |

---

## Unit Test Scenarios (per contract)

### PatternAnalyticsService

1. **Empty dataset** → `status === 'empty'`, all weekday counts = 0, all hour counts = 0, heatmap all `'none'`
2. **Records with no time** → `status === 'data'` for weekday analysis, `skippedRecordCount > 0`, hourly and heatmap all zero
3. **Records with time** → `status === 'data'`, correct weekday counts, correct hour counts, correct heatmap cells
4. **Single record** → peak weekday = that record's weekday, peak hour = that record's hour, AM/PM matches record time
5. **Date range change** → state recomputes with updated counts
6. **Tied peaks** → `peakWeekdays.length > 1`, all tied weekdays marked `isPeak: true`
7. **Invalid records** → excluded from all analyses, `invalidRecordCount` incremented
