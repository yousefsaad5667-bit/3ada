# Research: Time Pattern Analytics (Phase 8)

**Feature**: 008-time-pattern-analytics
**Date**: 2026-07-24

---

## Decision 1: Engine Reuse vs. New Engine Functions

**Decision**: Reuse existing `getWeekdayAnalysis()` and `getHourAnalysis()` from `pattern.engine.ts`. No new engine functions are needed for Phase 8.

**Rationale**: Both functions are already implemented, tested, and exported through `core/analytics/index.ts`. `getWeekdayAnalysis()` returns a 7-entry `WeekdayEntry[]` array with counts and percentages per weekday. `getHourAnalysis()` returns 24 `HourEntry[]` entries and a `skipped` count for records without time. Both match the requirements exactly.

**Alternatives considered**: Adding dedicated `getHourWeekdayCross()` and `getAmPmSplit()` engine functions. Rejected: cross-product aggregation is simple enough to perform in the service layer using the existing hour and weekday data, keeping the engine pure and minimal.

---

## Decision 2: Hour-Weekday Heatmap Computation

**Decision**: Compute the 7×24 cross-aggregation in `PatternAnalyticsService` rather than in the engine.

**Rationale**: The `pattern.engine.ts` intentionally separates weekday and hour analyses. A cross-product (weekday × hour) requires iterating records once and binning by `(weekday, hour)` — a straightforward O(n) operation that fits cleanly in the service's `computed` signal. Adding a new engine function would not meaningfully simplify the service and would expand the engine's public API surface.

**Implementation**: Iterate valid (date + time) records, derive weekday via `new Date(record.date).getDay()`, derive hour via `getHourAnalysis`-style logic with ampm adjustment, and increment a `number[][]` matrix of size `[7][24]`. Normalize each cell against `maxCell` to produce `IntensityLevel` values.

---

## Decision 3: AM/PM Split Computation

**Decision**: Derive AM/PM split in the service by summing hour buckets 0–11 (AM) and 12–23 (PM) from the `getHourAnalysis()` result.

**Rationale**: No dedicated engine function is needed. The split is a simple reduction over already-computed hour entries. Midnight (00:00, hour index 0) is classified as AM, consistent with the spec assumption.

---

## Decision 4: Rendering Strategy — Bar Charts and Heatmap

**Decision**: Use pure Angular CSS-grid and SCSS for the 7×24 hour-weekday heatmap (identical approach to the Phase 7 GitHub-style heatmap). Use native HTML bar charts (CSS Flexbox/Grid height-based bars) for weekday and hourly distribution charts. No third-party chart library is introduced for Phase 8.

**Rationale**: The project constitution and Phase 7 research established that third-party chart libraries lack native RTL/Arabic support and have Arabic text shaping bugs. The weekday and hour bar charts are simple enough to render as CSS-height-driven bars with Arabic labels, consistent with the existing pattern. The 7×24 heatmap mirrors Phase 7's heatmap architecture.

**Alternatives considered**: ECharts bar charts (rejected — constitution Charting Library principle mandates choosing per visualization based on RTL capability; native CSS is the established approach for this project).

---

## Decision 5: Intensity Classification

**Decision**: Reuse the five-level `IntensityLevel` type (`none`, `low`, `medium`, `high`, `very-high`) from `calendar-view.model.ts` for the hour-weekday heatmap cells.

**Rationale**: Consistency with Phase 7 heatmap rendering. The same SCSS intensity variables (already in global styles from T025 in Phase 7) apply directly to the patterns heatmap cells.

---

## Decision 6: Summary Insight Logic

**Decision**: Peak weekday, peak hour, and least active weekday are derived in the service by finding the max/min entries in the `WeekdayEntry[]` and `HourEntry[]` arrays. Ties are handled by returning all entries sharing the maximum count.

**Rationale**: Simple array reduce operations. No engine involvement required. The "insufficient data" guard uses a threshold of ≥ 7 total count-weighted records with time data for hourly insights, and ≥ 1 record for weekday insights.

---

## Decision 7: Angular Signals Architecture

**Decision**: `PatternAnalyticsService` uses a single `computed<PatternAnalyticsState>` signal that reacts to both `RelapseRecordRepository.records()` and `DashboardFilterService.activeFilter()`, identical to `CalendarAnalyticsService` and `TimeSeriesAnalyticsService`.

**Rationale**: Consistent with the established Phase 6 and 7 service pattern. Signal memoization prevents recomputation when unrelated signals change.
