# Data Model: Time Pattern Analytics (Phase 8)

**Feature**: 008-time-pattern-analytics
**Date**: 2026-07-24

---

## Core View Models

All models live in `src/app/features/analytics/patterns/models/pattern-view.model.ts`.

---

### `PatternStatus`

```typescript
export type PatternStatus = 'loading' | 'empty' | 'data' | 'error';
```

Status of the overall pattern analytics state.

---

### `WeekdayBucketView`

Represents aggregated relapse activity for a single weekday. Derived directly from the engine's `WeekdayEntry`.

| Field | Type | Description |
|-------|------|-------------|
| `weekday` | `number` | Weekday index: 0 = Sunday, 6 = Saturday |
| `labelAr` | `string` | Arabic weekday name (e.g., "الاثنين") |
| `count` | `number` | Total relapse count on this weekday within the active range |
| `percentage` | `number` | Percentage share of total weekly activity (0–100, 1 decimal) |
| `isPeak` | `boolean` | `true` if this weekday has the highest count (including ties) |
| `isLeast` | `boolean` | `true` if this weekday has the lowest nonzero count |

---

### `HourBucketView`

Represents aggregated relapse activity for a single hour of the day. Derived from the engine's `HourEntry`.

| Field | Type | Description |
|-------|------|-------------|
| `hour` | `number` | Hour index: 0–23 |
| `labelAr` | `string` | Arabic 12-hour label (e.g., "3 ص", "10 م") |
| `count` | `number` | Total relapse count in this hour within the active range |
| `percentage` | `number` | Percentage share of total hourly activity (0–100, 1 decimal) |
| `period` | `'am' \| 'pm'` | Half-day classification: hours 0–11 = `'am'`, 12–23 = `'pm'` |
| `isPeak` | `boolean` | `true` if this hour has the highest count (including ties) |

---

### `HourWeekdayCellView`

A single cell in the 7×24 temporal heatmap grid.

| Field | Type | Description |
|-------|------|-------------|
| `weekday` | `number` | Weekday index (0–6) |
| `hour` | `number` | Hour index (0–23) |
| `count` | `number` | Total relapses at this weekday-hour combination |
| `intensity` | `IntensityLevel` | Visual intensity: `'none' \| 'low' \| 'medium' \| 'high' \| 'very-high'` |

`IntensityLevel` is imported from `calendar-view.model.ts` (shared across phases).

---

### `HourWeekdayHeatmapView`

The full 7×24 heatmap grid.

| Field | Type | Description |
|-------|------|-------------|
| `cells` | `HourWeekdayCellView[][]` | `cells[weekday][hour]` — 7 rows × 24 columns |
| `maxCellCount` | `number` | Maximum count across all cells (used for intensity normalization) |
| `weekdayLabelsAr` | `string[]` | 7 Arabic weekday labels in order |
| `hourLabelsAr` | `string[]` | 24 Arabic hour labels in order |

---

### `PeriodSplitView`

AM vs PM comparison summary.

| Field | Type | Description |
|-------|------|-------------|
| `amCount` | `number` | Total relapses in hours 0–11 |
| `pmCount` | `number` | Total relapses in hours 12–23 |
| `total` | `number` | Total time-attributed relapses (`amCount + pmCount`) |
| `amPercentage` | `number` | AM percentage (0–100) |
| `pmPercentage` | `number` | PM percentage (0–100) |
| `dominantPeriod` | `'am' \| 'pm' \| 'equal' \| 'insufficient'` | Which half-day dominates |

---

### `PatternSummaryView`

Distilled peak-insight summary panel.

| Field | Type | Description |
|-------|------|-------------|
| `peakWeekdays` | `WeekdayBucketView[]` | Weekday(s) with the highest count (1 or more in case of ties) |
| `peakHours` | `HourBucketView[]` | Hour(s) with the highest count (1 or more in case of ties) |
| `leastActiveWeekday` | `WeekdayBucketView \| null` | Weekday with the lowest nonzero count; `null` if all are zero |
| `dominantPeriod` | `'am' \| 'pm' \| 'equal' \| 'insufficient'` | Dominant half-day period |
| `hasWeekdayInsights` | `boolean` | `true` if there is at least 1 record to form weekday patterns |
| `hasTimeInsights` | `boolean` | `true` if there are ≥ 7 time-attributed relapse counts (sufficient for hourly patterns) |

---

### `PatternAnalyticsState`

The top-level state object produced by `PatternAnalyticsService`.

| Field | Type | Description |
|-------|------|-------------|
| `status` | `PatternStatus` | `'empty'`, `'data'`, or `'error'` |
| `rangeStart` | `string` | Active range start (YYYY-MM-DD) |
| `rangeEnd` | `string` | Active range end (YYYY-MM-DD) |
| `weekdays` | `WeekdayBucketView[]` | 7-entry weekday distribution |
| `hours` | `HourBucketView[]` | 24-entry hourly distribution |
| `heatmap` | `HourWeekdayHeatmapView` | 7×24 cross-product heatmap |
| `periodSplit` | `PeriodSplitView` | AM vs PM comparison |
| `summary` | `PatternSummaryView` | Peak insights summary |
| `skippedRecordCount` | `number` | Count of relapse events excluded from time-based analyses due to missing/invalid time |
| `invalidRecordCount` | `number` | Count of records with invalid dates excluded from all analyses |
| `errorMessageAr` | `string \| null` | Arabic error message if `status === 'error'` |

---

## Engine Types Reused

These types are defined in `src/app/core/analytics/models/analytics.types.ts` and consumed as-is:

- `WeekdayEntry` — direct engine output, mapped to `WeekdayBucketView`
- `HourEntry` — direct engine output, mapped to `HourBucketView`
- `IntensityLevel` — imported from `calendar-view.model.ts` (defined in Phase 7)
