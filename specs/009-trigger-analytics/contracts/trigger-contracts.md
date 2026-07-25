# Contracts: Trigger Analytics (Phase 9)

**Feature**: 009-trigger-analytics
**Date**: 2026-07-24

---

## TriggerAnalyticsService — Public Signal Contract

`TriggerAnalyticsService` is the sole orchestrator for Phase 9 state. All components consume it through Angular's `inject()`.

```typescript
class TriggerAnalyticsService {
  /** Reactive state signal — recomputes on records or filter change */
  readonly state: Signal<TriggerAnalyticsState>;

  /** User search query — updated by TriggersComponent search input */
  readonly searchQuery: WritableSignal<string>;

  /** Currently selected keyword for drill-down trend view */
  readonly selectedKeyword: WritableSignal<string | null>;

  /** Computed: allTriggers filtered by searchQuery (case-insensitive) */
  readonly filteredTriggers: Signal<TriggerBucketView[]>;

  /** Computed: per-trigger trend for selectedKeyword; null if none selected */
  readonly triggerTrend: Signal<TriggerTrendView | null>;
}
```

### State Transition Rules

| Condition | `status` | Notes |
|-----------|----------|-------|
| No relapse records in date range | `'empty'` | All arrays empty, summary zeroed |
| ≥ 1 record but no extractable keywords | `'empty'` | `triggerlessRecordCount > 0`, all trigger arrays empty |
| ≥ 1 keyword found | `'data'` | Full state populated |
| Service initialization error | `'error'` | `errorMessageAr` contains Arabic error message |

### Trigger List Contract

- `allTriggers` is always sorted descending by `count`
- Rank numbering starts at 1; tied entries share the same rank value
- `percentage` values across all entries sum to 100 (within floating-point tolerance) when `status === 'data'`
- Keywords are normalized to lowercase before comparison (case-insensitive deduplication)
- `topTriggers` is always a slice of `allTriggers` with at most 5 entries
- `rareTriggers` is always a subset of `allTriggers` where `isRare === true`

### Distribution Contract

- `distribution.topTriggers` contains at most 20 entries (hard cap for chart legibility)
- `distribution.otherCount` is the sum of counts for triggers beyond position 20
- `distribution.otherCount + sum(topTriggers.count) === state.summary.totalOccurrences`

### Filtered Triggers Contract

- `filteredTriggers` re-evaluates whenever `searchQuery` or `state` changes
- An empty `searchQuery` returns `state().allTriggers` unfiltered
- Matching is substring, case-insensitive, applied to `keyword` field only
- Returns `[]` when no triggers match (not null)

### Trend Contract

- `triggerTrend` returns `null` when `selectedKeyword === null`
- When a keyword is selected, `entries` spans the full active date range; days with zero occurrences are included (zero-filled)
- `direction` requires at least 7 non-zero data points; otherwise `'insufficient-data'`
- `peakDate` is the date with the highest count; `null` if all counts are zero

---

## Component Input Contracts

### `TriggerRankingListComponent`

```typescript
@Input({ required: true }) triggers: TriggerBucketView[];
@Input({ required: true }) status: TriggerStatus;
@Input({ required: true }) selectedKeyword: string | null;
@Output() keywordSelected = new EventEmitter<string | null>();
```

### `TriggerSearchComponent`

```typescript
@Input({ required: true }) status: TriggerStatus;
@Output() queryChanged = new EventEmitter<string>();
```

### `TriggerDistributionChartComponent`

```typescript
@Input({ required: true }) distribution: TriggerDistributionView;
@Input({ required: true }) status: TriggerStatus;
```

### `TriggerTimelineComponent`

```typescript
@Input({ required: true }) trend: TriggerTrendView | null;
@Input({ required: true }) status: TriggerStatus;
```

### `TriggerSummaryCardComponent`

```typescript
@Input({ required: true }) summary: TriggerSummaryView;
@Input({ required: true }) status: TriggerStatus;
```

---

## Dashboard Card IDs

Cards are registered in `DashboardComponent.CARD_REGISTRY` using these IDs:

| Card ID | Arabic Title | Component |
|---------|-------------|-----------|
| `triggers-ranking` | `أكثر الأسباب تكراراً` | `TriggerRankingListComponent` |
| `triggers-distribution` | `توزيع المحفزات` | `TriggerDistributionChartComponent` |
| `triggers-timeline` | `مسار المحفز المحدد` | `TriggerTimelineComponent` |
| `triggers-summary` | `ملخص المحفزات` | `TriggerSummaryCardComponent` |

---

## Unit Test Scenarios (per contract)

### TriggerAnalyticsService

1. **Empty dataset** → `status === 'empty'`, `allTriggers.length === 0`, `summary.totalOccurrences === 0`
2. **Records with only stop words** → `status === 'empty'`, `triggerlessRecordCount > 0`
3. **Records with valid keywords** → `status === 'data'`, correct counts, correct percentages summing to 100
4. **Keyword weighting** → record with `count: 3` and keyword `'العمل'` contributes 3 to `العمل.count`
5. **Average urge** → keyword appearing in records with urge 8 and 10 (count 1 each) → `avgUrge === 9`
6. **Rare trigger classification** → keyword with < 5% share AND < 3 occurrences is `isRare === true`
7. **Top trigger** → entry with highest count has `isTop === true` and `rank === 1`
8. **Date range filter** → only records within active date range contribute to state
9. **Search filter** → `searchQuery = 'عمل'` returns only triggers containing that substring
10. **Trend for keyword** → selecting a keyword produces `TriggerTrendView` with correct date-binned counts
11. **Trend direction** → 7+ data points with monotonically increasing counts → `direction === 'increasing'`
12. **Null selected keyword** → `triggerTrend === null`
13. **Distribution cap** → more than 20 keywords → `distribution.topTriggers.length === 20`, `otherCount > 0`
