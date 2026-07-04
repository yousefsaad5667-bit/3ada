# Analytics Engine — Public API Contract

**Feature**: `004-analytics-engine`
**Module**: `src/app/core/analytics/index.ts`
**Date**: 2026-07-04

This document defines the complete public interface of the Analytics Engine. Every function listed here is a **pure TypeScript function** — no side effects, no Angular dependencies, no promises.

---

## Types Reference

```typescript
// src/app/core/analytics/models/analytics.types.ts

export type DatePreset = 'today' | 'last7' | 'last30' | 'last90' | 'lastYear' | 'all' | 'custom';
export type Granularity = 'daily' | 'weekly' | 'monthly';

export interface DateRange {
  from: string; // YYYY-MM-DD, inclusive
  to: string;   // YYYY-MM-DD, inclusive
}

export interface TimeSeriesEntry {
  date: string;   // anchor date YYYY-MM-DD
  label: string;  // human-readable Arabic label
  count: number;
}

export interface WeekdayEntry {
  weekday: number;    // 0 (Sun) – 6 (Sat)
  labelAr: string;   // Arabic weekday name
  count: number;
  percentage: number; // 0–100, 1 decimal place
}

export interface HourEntry {
  hour: number;    // 0–23
  label: string;   // e.g. "3 ص" / "2 م"
  count: number;
}

export interface TriggerEntry {
  keyword: string;
  count: number;
  avgUrge: number | null;
}

export interface HeatmapEntry {
  date: string;       // YYYY-MM-DD
  count: number;
  intensity: number;  // 0–1 normalized
}

export interface DistributionEntry {
  label: string;
  min: number;
  max: number;
  count: number;
  percentage: number; // 0–100
}

export interface SummaryStatistics {
  total: number;
  recordCount: number;
  dailyAverage: number;
  median: number;
  min: number;
  max: number;
  stdDev: number;
}

export interface UrgeAnalysisResult {
  average: number | null;
  median: number | null;
  min: number | null;
  max: number | null;
  timeSeries: TimeSeriesEntry[];
}
```

---

## Utility Functions

### `getDateRangeBounds(preset, custom?)`

```typescript
function getDateRangeBounds(
  preset: DatePreset,
  custom?: DateRange
): DateRange | null
```

- Returns `{ from, to }` for named presets; returns `custom` as-is when `preset === 'custom'`; returns `null` when `preset === 'all'` (unbounded).
- `from` and `to` are always `YYYY-MM-DD` strings.
- Both bounds are **inclusive**.

---

## Time Series Functions

### `getTimeSeries(records, dateRange, granularity)`

```typescript
function getTimeSeries(
  records: RelapseRecord[],
  dateRange: DateRange,
  granularity: Granularity
): TimeSeriesEntry[]
```

Unified entry point. Delegates to `getDailyCounts`, `getWeeklyCounts`, or `getMonthlyCounts` based on `granularity`. Zero-fills missing periods.

---

### `getDailyCounts(records, dateRange)`

```typescript
function getDailyCounts(
  records: RelapseRecord[],
  dateRange: DateRange
): TimeSeriesEntry[]
```

Returns one entry per calendar day in `dateRange`. Days with no records have `count: 0`. Array length always equals `numberOfDays(from, to)`.

---

### `getWeeklyCounts(records, dateRange)`

```typescript
function getWeeklyCounts(
  records: RelapseRecord[],
  dateRange: DateRange
): TimeSeriesEntry[]
```

Returns one entry per ISO 8601 week that overlaps the date range. Weeks with no records have `count: 0`.

---

### `getMonthlyCounts(records, dateRange)`

```typescript
function getMonthlyCounts(
  records: RelapseRecord[],
  dateRange: DateRange
): TimeSeriesEntry[]
```

Returns one entry per calendar month that overlaps the date range. Months with no records have `count: 0`.

---

## Statistics Functions

### `getSummaryStatistics(records, dateRange)`

```typescript
function getSummaryStatistics(
  records: RelapseRecord[],
  dateRange: DateRange
): SummaryStatistics
```

Filters records to `dateRange`, then computes all summary fields. Returns all-zero `SummaryStatistics` for empty input.

---

### `getMovingAverage(series, windowSize?)`

```typescript
function getMovingAverage(
  series: TimeSeriesEntry[],
  windowSize?: number  // default: 7
): TimeSeriesEntry[]
```

Computes a simple moving average over an existing `TimeSeriesEntry[]`. Returns same length as input; first `windowSize - 1` entries use all available preceding values (expanding window). Does not throw if `windowSize > series.length`.

---

### `getDistribution(records, field, bucketCount?)`

```typescript
function getDistribution(
  records: RelapseRecord[],
  field: 'urgeLevel' | 'count',
  bucketCount?: number  // default: 10 for count; ignored for urgeLevel (always 1-10)
): DistributionEntry[]
```

For `urgeLevel`: always returns 10 entries (one per integer 1–10). For `count`: returns `bucketCount` equal-width buckets between min and max.

---

## Pattern Analysis Functions

### `getHeatmap(records, dateRange)`

```typescript
function getHeatmap(
  records: RelapseRecord[],
  dateRange: DateRange
): HeatmapEntry[]
```

Returns one `HeatmapEntry` per day in `dateRange`. `intensity` is `count / maxCount` in the range (0 when `maxCount === 0`).

---

### `getWeekdayAnalysis(records)`

```typescript
function getWeekdayAnalysis(
  records: RelapseRecord[]
): WeekdayEntry[]
```

Returns exactly 7 entries (Sunday–Saturday order). All Arabic labels. Percentages sum to 100 (with minor floating-point rounding).

---

### `getHourAnalysis(records)`

```typescript
function getHourAnalysis(
  records: RelapseRecord[]
): { entries: HourEntry[]; skipped: number }
```

Returns 24 entries (hours 0–23). Records with `time === null` are counted in `skipped` and excluded from all hour entries.

---

### `getTriggerAnalysis(records)`

```typescript
function getTriggerAnalysis(
  records: RelapseRecord[]
): TriggerEntry[]
```

Tokenizes `reason` and `notes` fields. Filters Arabic stop words and single-character tokens. Returns keywords sorted by `count` descending. `avgUrge` is `null` if none of the matching records have urge data.

---

### `getUrgeAnalysis(records, dateRange)`

```typescript
function getUrgeAnalysis(
  records: RelapseRecord[],
  dateRange: DateRange
): UrgeAnalysisResult
```

Filters to `dateRange`. All statistics are `null` if zero records have urge data. `timeSeries` contains daily average urge (only for days where at least one record has urge data).

---

## Error Contracts

| Condition | Behavior |
|-----------|----------|
| `records` is `[]` | Returns valid zero-state result — never throws |
| `dateRange.from > dateRange.to` | Returns empty/zero result — never throws |
| Record has invalid `date` format | Record is silently skipped |
| Record has `urgeLevel: null` | Excluded from urge computations |
| Record has `time: null` | Excluded from hour analysis; counted in `skipped` |
| `windowSize > series.length` | Returns all available data with expanding window |
