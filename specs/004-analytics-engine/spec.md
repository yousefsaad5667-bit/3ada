# Feature Specification: Analytics Engine

**Feature Branch**: `004-analytics-engine`

**Created**: 2026-07-04

**Status**: Draft

**Input**: User description: "Phase 4 — Analytics Engine: Build a reusable analytical engine with no UI. Every dashboard consumes this engine. Supports filtering (last 7/30/90 days, last year, custom range), aggregation (daily/weekly/monthly), and statistics (count, average, median, min, max, std deviation, distribution). Public API: getTimeSeries, getDailyCounts, getWeeklyCounts, getMonthlyCounts, getMovingAverage, getDistribution, getHeatmap, getWeekdayAnalysis, getHourAnalysis, getTriggerAnalysis, getUrgeAnalysis, getSummaryStatistics. Requirements: pure functions, no Angular dependencies, reusable, unit-testable."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Query Time Series Data (Priority: P1)

As a dashboard or chart component, I need to retrieve relapse counts aggregated over time (daily, weekly, or monthly) for a given date range so that I can render a time series chart without any knowledge of raw data storage.

**Why this priority**: This is the foundational capability that all time-based visualizations depend on. Without it, no chart in the entire application can display historical trends.

**Independent Test**: Can be tested in isolation by calling `getDailyCounts({ from, to })` with a fixed set of records and asserting that the returned array has the correct structure, date span, and counts — including zero-filled gaps for days with no activity.

**Acceptance Scenarios**:

1. **Given** a collection of relapse records across a 30-day period, **When** `getDailyCounts({ from, to })` is called with a date range covering those 30 days, **Then** it returns an array of 30 entries, each with a date label and count, with zero-filled entries for days with no activity.
2. **Given** a collection of records spanning multiple weeks, **When** `getWeeklyCounts({ from, to })` is called, **Then** it returns one entry per ISO week with the total count for each week.
3. **Given** a collection of records spanning multiple months, **When** `getMonthlyCounts({ from, to })` is called, **Then** it returns one entry per calendar month with the aggregated count.
4. **Given** no records exist for the specified date range, **When** any time-series function is called, **Then** it returns an array of zero-filled entries for the full range (not an empty array).

---

### User Story 2 — Compute Summary Statistics (Priority: P2)

As a dashboard summary card, I need to retrieve pre-computed statistical summaries (count, average, median, min, max, standard deviation) for a given date range and set of records so I can display them without performing any calculations myself.

**Why this priority**: Summary statistics are the most visible outputs on any dashboard. They provide at-a-glance insight and are consumed by multiple dashboard cards simultaneously.

**Independent Test**: Can be tested by calling `getSummaryStatistics(records, { from, to })` with a known dataset and asserting each returned field matches hand-calculated values for that exact dataset.

**Acceptance Scenarios**:

1. **Given** a set of records with known count values, **When** `getSummaryStatistics(records, dateRange)` is called, **Then** it returns the correct total, average, median, minimum, maximum, and standard deviation with no rounding errors exceeding two decimal places.
2. **Given** a single record, **When** `getSummaryStatistics` is called, **Then** median equals average equals min equals max equals that record's count, and standard deviation is 0.
3. **Given** an empty record set, **When** `getSummaryStatistics` is called, **Then** it returns zeroes for all metrics without throwing an error.

---

### User Story 3 — Analyze Behavioral Patterns (Priority: P3)

As a pattern analytics component, I need to query how relapse activity distributes across weekdays, hours of day, urge levels, and triggers so that I can surface behavioral insights to the user.

**Why this priority**: Pattern analytics are higher-level insights that require the foundational time-series layer (US1) to already be solid. They deliver the most actionable value but are not required for a working MVP.

**Independent Test**: Can be tested by calling `getWeekdayAnalysis(records)`, `getHourAnalysis(records)`, `getTriggerAnalysis(records)`, and `getUrgeAnalysis(records, dateRange)` with fixed datasets and asserting that each returns correctly ranked and labeled distributions.

**Acceptance Scenarios**:

1. **Given** records spread across different days of the week, **When** `getWeekdayAnalysis(records)` is called, **Then** it returns an array of 7 entries (Sunday–Saturday), each labeled in Arabic, with the correct count and percentage for each day.
2. **Given** records with time data, **When** `getHourAnalysis(records)` is called, **Then** it returns 24 entries (hours 0–23) with counts, and identifies the peak hour correctly.
3. **Given** records with reason/trigger text, **When** `getTriggerAnalysis(records)` is called, **Then** it returns a ranked list of extracted trigger keywords with their frequency and average urge level.
4. **Given** records with urge levels, **When** `getUrgeAnalysis(records, dateRange)` is called, **Then** it returns average, median, max, min urge values and a time series of urge levels over the date range.

---

### User Story 4 — Apply Date Range Filters (Priority: P1)

As any consuming component, I need to apply a named date range preset (last 7 days, last 30 days, last 90 days, last year) or a custom from/to range to all analytics queries so that the data scope is consistent across the entire dashboard.

**Why this priority**: All analytics functions depend on date filtering. An incorrect or inconsistent filter layer would corrupt every result across the engine. It must be verified first.

**Independent Test**: Can be tested by calling `getDateRangeBounds('last7')`, `getDateRangeBounds('last30')` etc. and asserting the returned `{ from, to }` dates are correct for the current day, then passing these into any analytics function and confirming only records within the range are included.

**Acceptance Scenarios**:

1. **Given** today is any date, **When** `getDateRangeBounds('last7')` is called, **Then** it returns `from` = 6 days ago (inclusive) and `to` = today (inclusive), both as `YYYY-MM-DD` strings.
2. **Given** a custom range is provided as `{ from: '2026-01-01', to: '2026-01-31' }`, **When** any analytics function is called with this range, **Then** only records whose date falls within January 2026 are included in results.
3. **Given** a date range where `from` is after `to`, **When** any analytics function is called, **Then** the engine returns an empty/zero result set without throwing an error.

---

### Edge Cases

- What happens when records contain `null` or missing `time`/`ampm` fields in hour analysis? → Hour analysis must gracefully skip records with no time data and report how many were excluded.
- What happens when `urgeLevel` is `null` on some records in urge analysis? → Urge functions must skip null values and compute statistics only over records where urge is present; they must return `null` for each metric if zero records have urge data.
- What happens when reason/notes fields are empty strings in trigger analysis? → Empty strings must be ignored; only non-empty, non-whitespace text is eligible for keyword extraction.
- What happens when a dataset contains 100,000+ records? → All pure functions must complete within 500 milliseconds for 100,000 records in a modern browser.
- What happens when the moving average window is larger than the dataset? → Return as many data points as available rather than failing.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The engine MUST expose all analytics as pure functions that accept record arrays and optional date range parameters and return plain data objects — no side effects, no Angular dependencies.
- **FR-002**: The engine MUST provide `getDailyCounts(records, dateRange)` returning an array of `{ date: string; count: number }` entries for every calendar day in the range, zero-filled where no records exist.
- **FR-003**: The engine MUST provide `getWeeklyCounts(records, dateRange)` returning one entry per ISO week with label and count.
- **FR-004**: The engine MUST provide `getMonthlyCounts(records, dateRange)` returning one entry per calendar month with label and count.
- **FR-005**: The engine MUST provide `getMovingAverage(series, windowSize)` that computes a simple moving average over a daily/weekly time series.
- **FR-006**: The engine MUST provide `getDistribution(records, field)` returning a ranked frequency distribution for a given numeric field (e.g., urgeLevel, count).
- **FR-007**: The engine MUST provide `getHeatmap(records, dateRange)` returning a map of date → count suitable for rendering a calendar heatmap.
- **FR-008**: The engine MUST provide `getWeekdayAnalysis(records)` returning per-weekday totals and percentages, with weekday labels in Arabic.
- **FR-009**: The engine MUST provide `getHourAnalysis(records)` returning per-hour-of-day totals across records that have time data.
- **FR-010**: The engine MUST provide `getTriggerAnalysis(records)` that extracts keyword frequencies from the `reason` and `notes` fields and returns a ranked list with count and average urge level per keyword.
- **FR-011**: The engine MUST provide `getUrgeAnalysis(records, dateRange)` returning summary statistics (average, median, min, max) and a time series of urge levels.
- **FR-012**: The engine MUST provide `getSummaryStatistics(records, dateRange)` returning total count, average per day, median, min, max, and standard deviation of the `count` field.
- **FR-013**: The engine MUST provide `getTimeSeries(records, dateRange, granularity)` as a unified entry point that delegates to daily/weekly/monthly functions based on the `granularity` argument.
- **FR-014**: The engine MUST provide `getDateRangeBounds(preset)` returning `{ from: string; to: string }` for each named preset (today, last7, last30, last90, lastYear) and pass through a custom range unchanged.
- **FR-015**: All functions MUST handle empty record arrays by returning valid zero-state results without throwing.
- **FR-016**: All functions MUST handle records with partially missing optional fields (null time, null urgeLevel, empty reason) without throwing.
- **FR-017**: The engine MUST NOT import any Angular modules, services, or decorators — it must be usable in plain TypeScript tests without an Angular test bed.

### Key Entities

- **RelapseRecord**: The input data unit. Fields: `id`, `date` (YYYY-MM-DD string), `time` (HH:mm or null), `ampm` ('am' | 'pm' | null), `count` (positive integer), `urgeLevel` (1–10 integer or null), `reason` (string or null), `notes` (string or null).
- **DateRange**: `{ from: string; to: string }` — both as YYYY-MM-DD strings, inclusive on both ends.
- **DatePreset**: Named enum — `'today' | 'last7' | 'last30' | 'last90' | 'lastYear' | 'custom'`.
- **TimeSeriesEntry**: `{ label: string; date: string; count: number }` — one data point in a time series.
- **WeekdayEntry**: `{ weekday: number; labelAr: string; count: number; percentage: number }` — one weekday in a distribution.
- **HourEntry**: `{ hour: number; label: string; count: number }` — one hour slot in an hour distribution.
- **TriggerEntry**: `{ keyword: string; count: number; avgUrge: number | null }` — one extracted keyword with frequency and urge correlation.
- **SummaryStatistics**: `{ total: number; dailyAverage: number; median: number; min: number; max: number; stdDev: number }`.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 12 public analytics functions return correct results for a hand-crafted 50-record test dataset, with zero discrepancies against manually calculated expected values.
- **SC-002**: All functions complete within 500 milliseconds when processing a dataset of 100,000 relapse records, ensuring the application remains responsive at scale.
- **SC-003**: Zero Angular imports exist anywhere in the analytics engine source files, verified by a static import scan.
- **SC-004**: All functions return valid zero-state results (no exceptions, no null crashes) when called with an empty record array, verified through explicit edge-case tests.
- **SC-005**: The `getWeekdayAnalysis` function returns all 7 weekday labels in Arabic, verified visually and by string comparison.
- **SC-006**: The `getTimeSeries` unified entry point correctly delegates to daily, weekly, or monthly aggregation based on the granularity argument, returning consistently structured output regardless of granularity.

---

## Assumptions

- All consuming components (dashboard cards, chart wrappers) are responsible for calling the appropriate engine function with the correct parameters; the engine does not hold any state.
- The engine receives already-loaded `RelapseRecord[]` arrays from a calling Angular service — it does not interact with LocalStorage directly.
- Keyword extraction for trigger analysis uses simple whitespace tokenization with Arabic stop-word filtering; no NLP library is required.
- Arabic weekday labels use the standard Gregorian calendar (Sunday = الأحد, Monday = الاثنين, etc.).
- The moving average window size defaults to 7 (weekly smoothing) when not specified by the caller.
- Date arithmetic uses the browser's built-in `Date` object only; no external date library is required.
- The engine is consumed exclusively by Angular services that inject it — the engine itself remains a plain TypeScript module.
