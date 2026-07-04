# Quickstart: Analytics Engine

**Feature**: `004-analytics-engine`
**Module path**: `src/app/core/analytics/`

---

## Overview

The Analytics Engine is a set of **pure TypeScript functions** with zero Angular dependencies. It processes arrays of `RelapseRecord` objects and returns typed data structures ready for display in charts, tables, and summary cards.

---

## Basic Usage

### 1. Import the functions you need

```typescript
import {
  getDailyCounts,
  getSummaryStatistics,
  getWeekdayAnalysis,
  getDateRangeBounds,
} from '../../core/analytics';
import { DateRange } from '../../core/analytics/models/analytics.types';
```

### 2. Get a date range

```typescript
// Preset: last 30 days
const range = getDateRangeBounds('last30');
// → { from: '2026-06-04', to: '2026-07-04' }

// Custom range
const customRange: DateRange = { from: '2026-01-01', to: '2026-03-31' };
```

### 3. Load records from the repository

```typescript
// In your Angular service or component:
const records = this.relapseRepository.records(); // Signal<RelapseRecord[]>
```

### 4. Call engine functions

```typescript
// Daily time series
const dailyCounts = getDailyCounts(records, range);
// → [{ date: '2026-06-04', label: '4 يونيو', count: 0 }, ...]

// Summary statistics
const stats = getSummaryStatistics(records, range);
// → { total: 142, recordCount: 38, dailyAverage: 4.7, median: 4, min: 1, max: 12, stdDev: 2.3 }

// Weekday distribution
const weekdays = getWeekdayAnalysis(records);
// → [{ weekday: 0, labelAr: 'الأحد', count: 18, percentage: 12.7 }, ...]
```

---

## Integration with Angular Components

Since the engine functions are pure TypeScript, they work in `computed()` signals:

```typescript
// dashboard.component.ts
import { Component, computed, inject } from '@angular/core';
import { RelapseRecordRepository } from '../../core/services/relapse-record.repository';
import { getDailyCounts, getDateRangeBounds } from '../../core/analytics';

@Component({ ... })
export class DashboardComponent {
  private repo = inject(RelapseRecordRepository);

  dailyCounts = computed(() =>
    getDailyCounts(this.repo.records(), getDateRangeBounds('last30')!)
  );
}
```

---

## Available Functions

| Function | Description |
|----------|-------------|
| `getDateRangeBounds(preset, custom?)` | Resolve a named preset to `{ from, to }` date strings |
| `getTimeSeries(records, range, granularity)` | Unified time series (daily/weekly/monthly) |
| `getDailyCounts(records, range)` | Per-day counts, zero-filled |
| `getWeeklyCounts(records, range)` | Per-ISO-week counts, zero-filled |
| `getMonthlyCounts(records, range)` | Per-month counts, zero-filled |
| `getMovingAverage(series, windowSize?)` | Smooth a time series with a moving average |
| `getDistribution(records, field, buckets?)` | Frequency distribution for urgeLevel or count |
| `getHeatmap(records, range)` | Date-intensity map for calendar heatmaps |
| `getWeekdayAnalysis(records)` | Weekday distribution with Arabic labels |
| `getHourAnalysis(records)` | Hour-of-day distribution (skips records without time) |
| `getTriggerAnalysis(records)` | Keyword frequency from reason/notes fields |
| `getUrgeAnalysis(records, range)` | Urge statistics and time series |
| `getSummaryStatistics(records, range)` | Total, average, median, min, max, std deviation |

---

## Edge Cases

```typescript
// Empty records — never throws, always returns valid zero state
getDailyCounts([], { from: '2026-01-01', to: '2026-01-31' });
// → 31 entries, all with count: 0

// Invalid date range (from > to) — returns empty array
getDailyCounts(records, { from: '2026-07-01', to: '2026-01-01' });
// → []

// Records without time — skipped gracefully in hour analysis
const { entries, skipped } = getHourAnalysis(records);
// skipped: number of records excluded due to missing time
```
