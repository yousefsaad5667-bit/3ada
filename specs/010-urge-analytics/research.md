# Research: Urge Analytics (Phase 10)

## Overview

Phase 10 builds on a codebase that already has mature analytics infrastructure. This document records decisions and findings for each area requiring design resolution.

---

## 1. Engine Extension Strategy

**Decision**: Extend `urge.engine.ts` with four new pure functions; do not create a second engine file.

**Rationale**: The existing `getUrgeAnalysis` already handles summary stats and time series. The four new functions — `getUrgeByHour`, `getUrgeByWeekday`, `getUrgeByTrigger`, `getUrgeCorrelation` — follow the same signature convention (`records: RelapseRecord[], dateRange?: DateRange`). Keeping them in the same file preserves cohesion and co-location of tests.

**Alternatives considered**:
- Separate `urge-extended.engine.ts` — rejected: premature fragmentation for a small addition.
- Composing existing `getHourAnalysis` / `getWeekdayAnalysis` — partially reused but those return *count* (relapse frequency), not *average urge*, so new specialized variants are needed.

---

## 2. Reuse of Existing Engine Functions

**Decision**: The following existing engine functions are re-used as-is by `UrgAnalyticsService`:

| Existing Function | Re-used for |
|---|---|
| `getUrgeAnalysis` | Summary stats (avg, min, max, median) + time series |
| `getMovingAverage` | Applied to the urge time series (7-day default window) |
| `getTrendSummary` | Applied to the urge time series to derive trend direction |
| `getDistribution` with `field: 'urgeLevel'` | Urge distribution (fixed 1-10 buckets already implemented) |
| `getTriggerAnalysis` | Already computes `avgUrge` per keyword — re-used for trigger ranking |

**Rationale**: The statistics engine already implements all aggregation primitives. Building new wrappers would duplicate logic.

---

## 3. Correlation Computation

**Decision**: Compute a directional correlation signal (positive / negative / neutral / insufficient-data) using period-by-period comparison. Group records into weekly buckets. For each week: compute average urge and total relapse count. Compute the Pearson correlation coefficient between these two weekly vectors. Classify:
- r ≥ 0.3 → positive (higher urge periods have more relapses)
- r ≤ -0.3 → negative
- |r| < 0.3 → neutral
- fewer than 10 weekly data points → insufficient-data

**Rationale**: Pearson correlation on weekly buckets is simple, O(n), and interpretable. Weekly aggregation reduces noise from single-day spikes. The ±0.3 threshold is a conventional "weak correlation" boundary widely used in behavioural science.

**Alternatives considered**:
- Spearman rank correlation — more robust to outliers but more complex; overkill for a directional signal.
- Rolling 7-day windows — considered but weekly ISO calendar buckets align better with the existing `getWeeklyCounts` engine output.

---

## 4. "Urge by Hour" and "Urge by Weekday" — New vs. Reuse

**Decision**: Write two new engine functions `getUrgeByHour` and `getUrgeByWeekday` that return average urge per slot (not relapse count). Internally they reuse `getHourAnalysis` / `getWeekdayAnalysis` only as a label reference.

**Rationale**: The existing hour/weekday functions aggregate *relapse counts*. For urge analytics we need *average urge intensity per slot* — a different aggregate that requires its own accumulation loop. Sharing a label array avoids hard-coding Arabic day/time strings twice.

---

## 5. "Urge by Trigger" — Reuse TriggerAnalysis

**Decision**: Re-use the output of `getTriggerAnalysis` (which already computes `avgUrge` per keyword) and sort descending by `avgUrge` (not by `count`).

**Rationale**: `TriggerEntry.avgUrge` is already computed with correct count-weighting. Sorting by `avgUrge` instead of `count` repurposes the existing computation for the new requirement at zero additional cost.

**Alternatives considered**:
- A brand-new `getUrgeTriggerAnalysis` function — rejected: pure duplication of `getTriggerAnalysis`.

---

## 6. View Model Pattern

**Decision**: Follow the `trigger-view.model.ts` pattern exactly. Create `urge-view.model.ts` with a top-level `UrgeAnalyticsState` interface containing `status`, range fields, and typed sub-views for each section.

**Rationale**: Consistency with the existing pattern makes the codebase predictable. The status-based discriminated union (`'empty' | 'data' | 'error'`) ensures components never render stale or undefined data.

---

## 7. Component Decomposition

**Decision**: Seven sub-components, each receiving a typed `@Input` slice of the state.

| Component | Input |
|---|---|
| `UrgeSummaryCardComponent` | `UrgeSummaryView` |
| `UrgeTimeSeriesChartComponent` | `UrgeTimeSeriesView` (time series + moving average + trend) |
| `UrgeDistributionChartComponent` | `DistributionEntry[]` |
| `UrgeByHourChartComponent` | `UrgeHourEntry[]` |
| `UrgeByWeekdayChartComponent` | `UrgeWeekdayEntry[]` |
| `UrgeByTriggerListComponent` | `UrgeTriggerEntry[]` |
| `UrgeCorrelationCardComponent` | `UrgeCorrelationResult` |

**Rationale**: Each component is independently testable. Charts (Phase 12) will replace the placeholder rendering inside these components without requiring service or layout changes.

---

## 8. Chart Rendering for Phase 10

**Decision**: Phase 10 components contain structured data layouts (stat cards, ranked lists, bar-like indicator rows) using only HTML + SCSS — no charting library. The `UrgeTimeSeriesChartComponent` and `UrgeDistributionChartComponent` will render a simple data-table / bar-indicator as placeholder, clearly marked with an Arabic comment "رسم بياني سيُضاف في المرحلة 12".

**Rationale**: Phase 12 is dedicated to the charting library. Introducing a chart dependency in Phase 10 would be premature and would duplicate work. The service and data contracts are stable enough for Phase 12 to slot in without service changes.

---

## 9. Excluded Records Tracking

**Decision**: `UrgAnalyticsService` exposes `excludedRecordCount` in the state — the count of in-range records where `urgeLevel === null`. This is surfaced in `UrgeSummaryView` and displayed in the summary card.

**Rationale**: FR-010 and SC-004 require transparency about excluded records.

---

## 10. Time Period Filter

**Decision**: Re-use `DashboardFilterService.activeFilter()` (same as all other analytics services). No local filter state inside `UrgeAnalyticsService`.

**Rationale**: Consistent with all other analytics services. Filter state is shared and controlled at dashboard level.
