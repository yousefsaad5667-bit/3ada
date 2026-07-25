# Research: Trigger Analytics (Phase 9)

**Feature**: 009-trigger-analytics
**Date**: 2026-07-24

---

## Decision 1: Engine Reuse — `getTriggerAnalysis()`

**Decision**: Reuse the existing `getTriggerAnalysis()` function from `core/analytics/engine/trigger.engine.ts` as the primary computation engine. No modifications to the engine are needed.

**Rationale**: The function already:
- Extracts Arabic keywords from `reason` and `notes` fields with Arabic stop-word filtering
- Aggregates frequency counts weighted by `record.count`
- Computes weighted average urge per keyword
- Returns results sorted descending by count
- De-duplicates keywords within the same record (one count per record per keyword)

All required functional requirements (FR-001 through FR-006, FR-012) are satisfied by the existing implementation. The engine is already tested in `trigger.engine.spec.ts`.

**Alternatives considered**: Adding a new engine function for trigger trend or distribution. Rejected — trend computation belongs in the service layer using the existing time-series engine, consistent with how Phase 8 handles cross-aggregation in the service rather than the engine.

---

## Decision 2: Trend-by-Trigger Computation

**Decision**: Compute per-trigger time series in `TriggerAnalyticsService` by re-iterating records for the selected trigger and bucketing by date. The service will expose a `selectedTriggerTrend` signal derived from a `selectedTrigger` signal.

**Rationale**: The existing `getTriggerAnalysis()` engine returns aggregated totals — it does not preserve temporal information. A per-trigger trend requires iterating the filtered records again, filtering to records containing the selected keyword, and building a chronological count series. This is an O(n) operation appropriate for the service layer.

**Implementation approach**:
- `TriggerAnalyticsService` holds a writable signal `selectedKeyword: WritableSignal<string | null>`
- A `computed` signal `triggerTrend` depends on `records()`, `activeFilter()`, and `selectedKeyword()`
- For the selected keyword, iterate `inBoundsRecords`, extract keywords per record (reusing `extractKeywords` logic), and if the keyword is present, add the record to the trend series
- Group by date (YYYY-MM-DD) and produce a `TriggerTrendEntry[]` (date + count)

**Alternatives considered**: Calling `getDailyCounts()` filtered by a predicate. Rejected — `getDailyCounts()` operates on the full record set and doesn't support per-keyword filtering without duplicating its logic. Direct re-iteration is cleaner and consistent with Phase 8's service-layer cross-aggregation.

---

## Decision 3: Rare Triggers Definition & Threshold

**Decision**: A trigger is classified as "rare" if it appears in fewer than **5% of in-bounds records** OR fewer than **3 occurrences** (whichever threshold is higher for datasets below 60 records). This matches the spec assumption.

**Rationale**: Consistent with the spec assumption in `spec.md` Assumptions section. The threshold produces a meaningful distinction between frequently recurring triggers and one-off mentions.

**Implementation**: In the service, after `getTriggerAnalysis()` returns, compute `totalCount = sum of all trigger counts`. Classify each entry as `isRare: true` if `entry.count / totalCount < 0.05` and `entry.count < 3`. Expose `rareTriggers` and `topTriggers` as separate filtered views in the state.

---

## Decision 4: Rendering Strategy — Charts and Timeline

**Decision**: Use pure Angular CSS/SCSS components for all visualizations. No third-party chart library is introduced in Phase 9.

**Rationale**: Consistent with the project constitution's charting principle (best library per visualization type) and Phase 8 research Decision 4. Trigger frequency charts are horizontal bar charts (good fit for Arabic RTL — text labels on the right, bars grow left). The trigger timeline is a simple date-axis line/area visualization renderable as a CSS-height area chart.

**Chart types**:
- **Trigger frequency list**: Sorted list with horizontal progress bars showing percentage share — native HTML/CSS
- **Trigger distribution**: Horizontal bar chart — native CSS bars (RTL-compatible, labels on right)
- **Trigger timeline**: Date-binned count chart (line/step) — native CSS area chart with discrete date buckets
- **Rare vs. common trigger split**: Simple count display / small badge labels — native HTML

**Alternatives considered**: Using ECharts or Chart.js for the timeline. Rejected — RTL/Arabic text rendering issues remain (established in Phase 7/8 research), and the timeline is simple enough for CSS rendering.

---

## Decision 5: Search / Filter Strategy

**Decision**: Search is a client-side filter over the `TriggerAnalyticsState.allTriggers` array, implemented as a `WritableSignal<string>` in the service (`searchQuery`). A `computed` signal `filteredTriggers` applies case-insensitive substring matching on `keyword`.

**Rationale**: All trigger data is derived from LocalStorage (no API call needed). A simple signal-based filter over an in-memory array is instantaneous and reactive with zero additional complexity.

**Implementation**: 
- `searchQuery: WritableSignal<string>` initialized to `''`
- `filteredTriggers = computed(() => state().allTriggers.filter(t => t.keyword.includes(searchQuery())))`
- Cleared to `''` when the date range changes

---

## Decision 6: Angular Signals Architecture

**Decision**: `TriggerAnalyticsService` uses the same single `computed<TriggerAnalyticsState>` signal architecture established in Phase 6 (time-series), Phase 7 (calendar), and Phase 8 (patterns). Two additional writable signals support interactivity: `searchQuery` and `selectedKeyword`.

**Rationale**: Consistent with the established project service pattern. `computed` memoizes the expensive aggregation; writable signals drive user interactions without re-running the full aggregation unnecessarily (only `filteredTriggers` and `triggerTrend` depend on the writable signals directly).

---

## Decision 7: No New Engine Functions Required

**Decision**: Phase 9 introduces **no new functions** in `core/analytics/engine/`. All new computation lives in `TriggerAnalyticsService`.

**Rationale**:
- `getTriggerAnalysis()` already covers frequency, aggregation, and average urge
- Trend computation is O(n) service-layer work (Decision 2)
- Rare classification is a threshold check over the engine's output (Decision 3)
- Distribution percentages can be computed from the engine's `count` fields in the service

This preserves the engine as a pure, tested, stateless function layer.

---

## Decision 8: "Most Active Period" per Trigger

**Decision**: "Most active period" for a trigger is the calendar week (Mon–Sun, ISO-style) in which that trigger had the highest occurrence count. It is computed on-demand in the service for the top trigger(s) only (not for every trigger in the list, to avoid O(n × k) complexity on large datasets).

**Rationale**: Computing "most active period" for every trigger in a list of potentially hundreds is expensive and not necessary for the initial view. The feature spec (FR-011) requires surfacing this per top trigger; computing it for the selected trigger on drill-down satisfies the requirement at O(n) cost.

**Implementation**: When `selectedKeyword` is set, the service additionally computes a weekly bucket series and returns the bucket with the highest count as `mostActivePeriod`.
