# Data Model: Urge Analytics (Phase 10)

## Source Entity

All urge analytics derive from `RelapseRecord` (existing):

```typescript
interface RelapseRecord {
  id: string;
  date: string;          // YYYY-MM-DD
  time: string | null;   // HH:mm
  ampm: 'am' | 'pm' | null;
  count: number;         // relapse count for this record
  urgeLevel: number | null;  // 1–10 intensity; null = not recorded
  reason: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}
```

**Key constraint**: `urgeLevel` is nullable. All urge engine functions MUST exclude records where `urgeLevel === null | undefined` and surface the exclusion count.

---

## New Types — `analytics.types.ts` Extensions

### `UrgeHourEntry`

Average urge intensity for a single hour of the day (0–23).

```typescript
interface UrgeHourEntry {
  hour: number;          // 0–23
  label: string;         // Arabic: e.g. "3 ص", "2 م"
  avgUrge: number | null; // null = no records with urge data in this hour
  recordCount: number;   // number of records contributing
}
```

### `UrgeWeekdayEntry`

Average urge intensity for a single weekday.

```typescript
interface UrgeWeekdayEntry {
  weekday: number;        // 0 (Sun) – 6 (Sat)
  labelAr: string;        // Arabic weekday name
  avgUrge: number | null; // null = no records with urge data on this weekday
  recordCount: number;
}
```

### `UrgeTriggerEntry`

A trigger keyword paired with its average urge intensity — sorted descending by `avgUrge`.

```typescript
interface UrgeTriggerEntry {
  keyword: string;
  avgUrge: number;        // guaranteed non-null (records with null urge excluded)
  recordCount: number;    // number of relapse instances contributing urge data
  isLimitedSample: boolean; // true when recordCount < 3
}
```

### `UrgeCorrelationResult`

Direction and strength of the urge–relapse relationship.

```typescript
interface UrgeCorrelationResult {
  direction: 'positive' | 'negative' | 'neutral' | 'insufficient-data';
  pearsonR: number | null;         // Pearson coefficient (null when insufficient)
  weeklyDataPoints: number;        // number of weekly buckets used
  minimumDataPoints: number;       // threshold (10)
  explanationAr: string;           // plain-language Arabic interpretation
}
```

---

## View Models — `urge-view.model.ts` (new file)

### `UrgeStatus`

```typescript
type UrgeStatus = 'loading' | 'empty' | 'data' | 'error';
```

### `UrgeSummaryView`

```typescript
interface UrgeSummaryView {
  average: number | null;
  median: number | null;
  min: number | null;
  max: number | null;
  includedRecordCount: number;   // records with urge data in range
  excludedRecordCount: number;   // records without urge data in range
  trendDirection: 'increasing' | 'decreasing' | 'stable' | 'insufficient-data';
  trendConfidence: 'high' | 'medium' | 'low' | 'insufficient';
}
```

### `UrgeTimeSeriesView`

```typescript
interface UrgeTimeSeriesView {
  rawSeries: TimeSeriesEntry[];          // daily average urge; from getUrgeAnalysis
  movingAverage: TimeSeriesEntry[];      // 7-day MA; from getMovingAverage
  trend: TrendAnalysisResult;           // from getTrendSummary
  movingAverageWindow: number;          // always 7 in Phase 10
}
```

### `UrgeAnalyticsState`

Top-level state object produced by `UrgeAnalyticsService`.

```typescript
interface UrgeAnalyticsState {
  status: UrgeStatus;
  rangeStart: string;            // YYYY-MM-DD
  rangeEnd: string;              // YYYY-MM-DD

  summary: UrgeSummaryView;
  timeSeries: UrgeTimeSeriesView;
  distribution: DistributionEntry[];      // from existing getDistribution('urgeLevel')
  byHour: UrgeHourEntry[];               // from new getUrgeByHour
  byWeekday: UrgeWeekdayEntry[];         // from new getUrgeByWeekday
  byTrigger: UrgeTriggerEntry[];         // from getTriggerAnalysis re-sorted by avgUrge
  correlation: UrgeCorrelationResult;

  errorMessageAr: string | null;
}
```

---

## Engine Function Signatures

### Existing (unchanged)

```typescript
// urge.engine.ts
getUrgeAnalysis(records: RelapseRecord[], dateRange: DateRange): UrgeAnalysisResult

// statistics.engine.ts
getMovingAverage(series: TimeSeriesEntry[], windowSize?: number): TimeSeriesEntry[]
getTrendSummary(series: TimeSeriesEntry[]): TrendAnalysisResult
getDistribution(records: RelapseRecord[], field: 'urgeLevel' | 'count', bucketCount?: number): DistributionEntry[]

// trigger.engine.ts
getTriggerAnalysis(records: RelapseRecord[]): TriggerEntry[]
```

### New (to be added to `urge.engine.ts`)

```typescript
getUrgeByHour(records: RelapseRecord[]): UrgeHourEntry[]
// Groups records by hour (requires time + ampm fields).
// Records with null time or null urgeLevel are excluded.
// Returns all 24 slots; slots with no data have avgUrge: null, recordCount: 0.

getUrgeByWeekday(records: RelapseRecord[]): UrgeWeekdayEntry[]
// Groups records by weekday (0–6).
// Records with null urgeLevel are excluded.
// Returns all 7 slots; slots with no data have avgUrge: null, recordCount: 0.

getUrgeCorrelation(records: RelapseRecord[], dateRange: DateRange): UrgeCorrelationResult
// Computes Pearson r between weekly-avg-urge and weekly-relapse-count.
// Returns direction + Arabic explanation.
// Returns insufficient-data if fewer than 10 weekly buckets have data.
```

---

## State Transitions

```
Records change or filter changes
         │
         ▼
UrgeAnalyticsService.state (computed Signal)
         │
         ├─ No in-range records → status: 'empty'
         ├─ In-range records but 0 have urgeLevel → status: 'empty' (with excludedCount shown)
         ├─ Error thrown → status: 'error'
         └─ Data available → status: 'data' (all sub-views populated)
```

---

## Validation Rules

| Field | Rule |
|---|---|
| `urgeLevel` | Accepted range: 1–10 (integer); null = excluded from all urge calculations |
| Moving average window | Always 7; if rawSeries.length < 7 the window expands to available length (handled by existing `getMovingAverage`) |
| Correlation threshold | `weeklyDataPoints >= 10` required for a non-`insufficient-data` result |
| `UrgeTriggerEntry` | Only keywords where at least one associated record has a non-null urgeLevel appear |
| `isLimitedSample` | `recordCount < 3` |
