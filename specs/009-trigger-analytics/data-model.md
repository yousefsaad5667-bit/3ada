# Data Model: Trigger Analytics (Phase 9)

**Feature**: 009-trigger-analytics
**Date**: 2026-07-24

---

## Core View Models

All models live in `src/app/features/analytics/triggers/models/trigger-view.model.ts`.

---

### `TriggerStatus`

```typescript
export type TriggerStatus = 'loading' | 'empty' | 'data' | 'error';
```

Status of the overall trigger analytics state.

---

### `TriggerBucketView`

Represents a single keyword trigger and its aggregated statistics. Derived from the engine's `TriggerEntry`.

| Field | Type | Description |
|-------|------|-------------|
| `keyword` | `string` | The extracted trigger keyword (Arabic or mixed) |
| `count` | `number` | Weighted occurrence count across all in-bounds records |
| `avgUrge` | `number \| null` | Weighted average urge intensity (1–10 scale); `null` if no urge data |
| `percentage` | `number` | Percentage share of total trigger-weighted occurrences (0–100, 1 decimal) |
| `isTop` | `boolean` | `true` if this trigger is in the top 5 by count |
| `isRare` | `boolean` | `true` if count / totalCount < 5% AND count < 3 |
| `rank` | `number` | 1-based rank by count descending (ties share the same rank) |

---

### `TriggerTrendEntry`

A single point in the per-trigger time series (used for the trigger timeline / trend chart).

| Field | Type | Description |
|-------|------|-------------|
| `date` | `string` | Date bucket (YYYY-MM-DD) |
| `labelAr` | `string` | Arabic date label (e.g., "١٥ يوليو") |
| `count` | `number` | Weighted occurrence count for the selected trigger on this date |

---

### `TriggerTrendView`

The per-trigger trend series returned when a trigger is selected.

| Field | Type | Description |
|-------|------|-------------|
| `keyword` | `string` | The selected keyword |
| `entries` | `TriggerTrendEntry[]` | Date-sorted entries; zero-filled for dates with no occurrence |
| `peakDate` | `string \| null` | Date of highest count; `null` if all entries are zero |
| `direction` | `'increasing' \| 'decreasing' \| 'stable' \| 'insufficient-data'` | Trend direction (requires ≥ 7 entries) |
| `mostActivePeriodLabelAr` | `string \| null` | Arabic label for the ISO calendar week with the highest count |

---

### `TriggerDistributionView`

Aggregated distribution of all triggers for charting.

| Field | Type | Description |
|-------|------|-------------|
| `topTriggers` | `TriggerBucketView[]` | Top triggers by count (max 20 entries for chart legibility) |
| `otherCount` | `number` | Aggregated count for triggers beyond the top 20 |
| `otherPercentage` | `number` | Percentage share of "other" triggers |

---

### `TriggerSummaryView`

Distilled summary panel for the analytics section header.

| Field | Type | Description |
|-------|------|-------------|
| `totalKeywordCount` | `number` | Total distinct keywords found in the date range |
| `totalOccurrences` | `number` | Sum of all trigger occurrences across all keywords |
| `topTrigger` | `TriggerBucketView \| null` | The #1 trigger by count; `null` if no data |
| `highestUrgeKeyword` | `string \| null` | Keyword with the highest average urge; `null` if no urge data |
| `highestAvgUrge` | `number \| null` | The highest average urge value; `null` if no urge data |
| `rareTriggersCount` | `number` | Count of triggers classified as rare |
| `triggerlessRecordCount` | `number` | Count of relapse records with no extractable trigger keywords |

---

### `TriggerAnalyticsState`

The top-level state object produced by `TriggerAnalyticsService`.

| Field | Type | Description |
|-------|------|-------------|
| `status` | `TriggerStatus` | `'empty'`, `'data'`, or `'error'` |
| `rangeStart` | `string` | Active range start (YYYY-MM-DD) |
| `rangeEnd` | `string` | Active range end (YYYY-MM-DD) |
| `allTriggers` | `TriggerBucketView[]` | Full ranked list of triggers (all keywords), sorted by count desc |
| `topTriggers` | `TriggerBucketView[]` | Shorthand: top 5 triggers |
| `rareTriggers` | `TriggerBucketView[]` | Triggers classified as rare |
| `distribution` | `TriggerDistributionView` | Chart-ready distribution for top-20 triggers |
| `summary` | `TriggerSummaryView` | Summary statistics card data |
| `triggerlessRecordCount` | `number` | Records with no extractable keyword |
| `errorMessageAr` | `string \| null` | Arabic error message when `status === 'error'` |

---

### `TriggerInteractionState`

User-driven interaction state that lives alongside the main analytics state (not inside `computed` to avoid unnecessary recomputation).

| Signal | Type | Description |
|--------|------|-------------|
| `searchQuery` | `WritableSignal<string>` | Current search filter string (case-insensitive substring match) |
| `selectedKeyword` | `WritableSignal<string \| null>` | Currently selected trigger for drill-down/trend view |
| `filteredTriggers` | `Signal<TriggerBucketView[]>` | Computed: `allTriggers` filtered by `searchQuery` |
| `triggerTrend` | `Signal<TriggerTrendView \| null>` | Computed: trend series for `selectedKeyword`; `null` if none selected |

---

## Engine Types Reused

Defined in `src/app/core/analytics/models/analytics.types.ts` and consumed as-is:

- `TriggerEntry` — direct engine output (`keyword`, `count`, `avgUrge`) mapped to `TriggerBucketView`
- `DateRange` — used to bound record filtering in the service

---

## Validation Rules

| Rule | Description |
|------|-------------|
| `count >= 0` | All trigger counts must be non-negative |
| `percentage ∈ [0, 100]` | Sum of all `TriggerBucketView.percentage` ≈ 100 (within floating-point tolerance) |
| `avgUrge ∈ [1, 10] \| null` | Average urge is within the defined scale or null |
| `rank >= 1` | Rank starts at 1; tied triggers share the same rank |
| `allTriggers` sorted descending by `count` | Contract: array order is always count-descending |
| `topTriggers.length <= 5` | Hard cap: never more than 5 entries |
| `distribution.topTriggers.length <= 20` | Chart cap: never more than 20 entries in the chart |
