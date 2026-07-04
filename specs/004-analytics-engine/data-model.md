# Data Model: Analytics Engine

**Feature**: `004-analytics-engine`
**Date**: 2026-07-04

---

## Input Entity

### RelapseRecord *(existing — defined in `src/app/core/models/relapse-record.model.ts`)*

The engine receives arrays of this existing entity. No changes to this model are required.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | `string` | ✅ | UUID |
| `date` | `string` | ✅ | `YYYY-MM-DD` format |
| `time` | `string \| null` | ❌ | `HH:mm` format; null if not recorded |
| `ampm` | `'am' \| 'pm' \| null` | ❌ | Paired with `time` |
| `count` | `number` | ✅ | Positive integer ≥ 1 |
| `urgeLevel` | `number \| null` | ❌ | Integer 1–10; null if not rated |
| `reason` | `string \| null` | ❌ | Free text; used for trigger analysis |
| `notes` | `string \| null` | ❌ | Free text; used for trigger analysis |
| `createdAt` | `string` | ✅ | ISO 8601 timestamp |
| `updatedAt` | `string` | ✅ | ISO 8601 timestamp |

---

## Configuration Entities

### DatePreset *(new canonical definition — supersedes the one in relapses feature)*

```typescript
export type DatePreset =
  | 'today'
  | 'last7'
  | 'last30'
  | 'last90'
  | 'lastYear'
  | 'all'
  | 'custom';
```

### DateRange

```typescript
export interface DateRange {
  from: string;  // YYYY-MM-DD, inclusive
  to: string;    // YYYY-MM-DD, inclusive
}
```

### Granularity

```typescript
export type Granularity = 'daily' | 'weekly' | 'monthly';
```

---

## Output Entities

### TimeSeriesEntry

One data point in a time series (daily, weekly, or monthly).

| Field | Type | Notes |
|-------|------|-------|
| `date` | `string` | Anchor date for the period (`YYYY-MM-DD`) |
| `label` | `string` | Human-readable label (e.g., `"15 يناير"`, `"الأسبوع 3"`, `"مارس 2026"`) |
| `count` | `number` | Total relapse count in this period |

### WeekdayEntry

One entry in a weekday distribution (0 = Sunday … 6 = Saturday).

| Field | Type | Notes |
|-------|------|-------|
| `weekday` | `number` | 0–6 (JS `Date.getDay()` convention) |
| `labelAr` | `string` | Arabic weekday name |
| `count` | `number` | Total relapse count on this weekday |
| `percentage` | `number` | Fraction of total (0–100, rounded to 1 decimal) |

**Arabic weekday labels**:
| `weekday` | `labelAr` |
|-----------|-----------|
| 0 | الأحد |
| 1 | الاثنين |
| 2 | الثلاثاء |
| 3 | الأربعاء |
| 4 | الخميس |
| 5 | الجمعة |
| 6 | السبت |

### HourEntry

One entry in an hour-of-day distribution (0–23).

| Field | Type | Notes |
|-------|------|-------|
| `hour` | `number` | 0–23 |
| `label` | `string` | Display label (e.g., `"12 م"`, `"3 ص"`) |
| `count` | `number` | Total relapse count at this hour |

### TriggerEntry

One extracted keyword from reason/notes fields.

| Field | Type | Notes |
|-------|------|-------|
| `keyword` | `string` | Normalized Arabic keyword |
| `count` | `number` | Number of records containing this keyword |
| `avgUrge` | `number \| null` | Average urge level across records with this keyword; null if no urge data |

### HeatmapEntry

One date cell in a calendar heatmap.

| Field | Type | Notes |
|-------|------|-------|
| `date` | `string` | `YYYY-MM-DD` |
| `count` | `number` | Total relapse count on this date |
| `intensity` | `number` | Normalized 0–1 value (0 = no activity, 1 = maximum in range) |

### DistributionEntry

One bucket in a numeric distribution.

| Field | Type | Notes |
|-------|------|-------|
| `label` | `string` | Bucket label (e.g., `"1"` for urgeLevel, `"1–5"` for count ranges) |
| `min` | `number` | Inclusive lower bound |
| `max` | `number` | Inclusive upper bound |
| `count` | `number` | Number of records falling in this bucket |
| `percentage` | `number` | Fraction of total (0–100) |

### SummaryStatistics

Aggregate statistics for a filtered record set.

| Field | Type | Notes |
|-------|------|-------|
| `total` | `number` | Sum of all `count` values |
| `recordCount` | `number` | Number of distinct records |
| `dailyAverage` | `number` | `total / numberOfDaysInRange` |
| `median` | `number` | Median `count` value across records |
| `min` | `number` | Minimum `count` across records |
| `max` | `number` | Maximum `count` across records |
| `stdDev` | `number` | Sample standard deviation of `count` values |

### UrgeAnalysisResult

| Field | Type | Notes |
|-------|------|-------|
| `average` | `number \| null` | Null if no records have urge data |
| `median` | `number \| null` | |
| `min` | `number \| null` | |
| `max` | `number \| null` | |
| `timeSeries` | `TimeSeriesEntry[]` | Average urge per day (records without urge excluded) |

---

## Validation Rules

All validation happens inside the engine functions:

- Records where `date` is not a valid `YYYY-MM-DD` string are silently skipped.
- Records with `time === null` are excluded from `getHourAnalysis()` with a count tracked in a `skipped` field on the result.
- Records with `urgeLevel === null` are excluded from urge computations; if all records have null urge, urge statistics return `null`.
- Records where `reason` and `notes` are both empty/null are excluded from `getTriggerAnalysis()`.
- An empty input array always returns a valid zero-state result — never throws.

---

## State Transitions

The Analytics Engine is **stateless** — no state transitions apply. Each function call is independent.
