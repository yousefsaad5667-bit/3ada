# Feature Specification: Urge Analytics

**Feature Branch**: `010-urge-analytics`

**Created**: 2026-07-25

**Status**: Draft

**Input**: User description: "phase 10 — Urge Analytics: analyze craving intensity. Specifications: Average Urge, Maximum Urge, Minimum Urge, Median Urge, Urge Time Series, Urge Distribution, Urge by Hour, Urge by Weekday, Urge by Trigger, Moving Average, Trend, Correlation with Relapse Count. Questions answered: Are urges increasing? Are urges decreasing? Which trigger creates the strongest urges? Which weekday has the highest average urge? Which hour has the strongest urges?"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Urge Intensity Summary (Priority: P1)

A user who tracks their cravings wants to quickly understand their overall urge patterns through a summary panel that displays average, maximum, minimum, and median urge intensity values across a selected time period. This gives them an at-a-glance health check of their craving behaviour.

**Why this priority**: This is the most fundamental view — aggregated statistics are the entry point for understanding any data set. It is the minimum viable slice that immediately delivers value without requiring chart interactivity.

**Independent Test**: Can be fully tested by viewing the summary panel with a known data set and confirming the four statistical values match hand-calculated results from that data.

**Acceptance Scenarios**:

1. **Given** the user has at least one relapse entry with an urge intensity value, **When** they open the Urge Analytics section, **Then** the system displays the average, maximum, minimum, and median urge values for the selected period.
2. **Given** the user selects a different time range filter, **When** the filter is applied, **Then** all four summary metrics update to reflect only entries in that range.
3. **Given** the user has no relapse entries with urge data in the selected period, **When** they view the summary, **Then** the system displays a clear empty-state message instead of incorrect or zero values.

---

### User Story 2 - Urge Trend Over Time (Priority: P2)

A user wants to see how their craving intensity evolves day by day, including a smoothed moving average line alongside the raw daily values, so they can distinguish noise from a genuine increasing or decreasing trend.

**Why this priority**: The most actionable insight from urge data is whether things are getting better or worse over time. The trend view directly answers "Are urges increasing?" and "Are urges decreasing?", making it the second most critical story.

**Independent Test**: Can be fully tested by reviewing a time-series display with synthetic daily urge data and confirming the moving average smooths across the correct window of days, and a trend indicator (e.g., label or arrow) reflects the statistical direction.

**Acceptance Scenarios**:

1. **Given** the user has multiple relapse entries spanning several days, **When** they view the urge time-series display, **Then** the system shows daily urge values plotted chronologically with a moving-average overlay.
2. **Given** the user's urge values are consistently declining over the period, **When** the trend is computed, **Then** the system indicates a downward trend.
3. **Given** the user's urge values are consistently rising, **When** the trend is computed, **Then** the system indicates an upward trend.
4. **Given** fewer entries than the moving-average window size exist, **When** the moving average is computed, **Then** the system computes it for the available entries without error or blank display.

---

### User Story 3 - Urge Distribution & Frequency Analysis (Priority: P3)

A user wants to understand how urge intensity is distributed — for example, do most urges cluster around mild intensity, or are severe urges common? — through a distribution view that breaks intensity into ranges and counts how many entries fall into each bucket.

**Why this priority**: Distribution analysis deepens understanding beyond averages and trends, helping users identify whether extreme urges are rare or frequent. It is valuable but depends on having the summary and trend foundation first.

**Independent Test**: Can be fully tested by loading a known set of urge values with a spread across the intensity scale and confirming the distribution groups them into the correct buckets with accurate counts.

**Acceptance Scenarios**:

1. **Given** the user has relapse entries with varying urge intensities, **When** they view the urge distribution, **Then** the system groups entries into intensity ranges and displays the count and proportion for each bucket.
2. **Given** all entries share the same urge intensity value, **When** the distribution is displayed, **Then** the system shows a single populated bucket with the others at zero.

---

### User Story 4 - Urge Breakdown by Time of Day and Weekday (Priority: P4)

A user wants to know which hours of the day and which days of the week consistently produce the strongest urges, enabling them to prepare coping strategies for high-risk periods.

**Why this priority**: Temporal breakdown transforms raw analytics into actionable prevention. However, it requires sufficient data depth and builds on the foundation of the higher-priority stories.

**Independent Test**: Can be fully tested by supplying relapse entries at known times and days, then confirming the "urge by hour" and "urge by weekday" views correctly aggregate and rank those times.

**Acceptance Scenarios**:

1. **Given** the user has entries spread across multiple hours, **When** they view the "urge by hour" breakdown, **Then** the system shows average urge intensity for each hour of the day (0–23), highlighting the hour with the highest average.
2. **Given** the user has entries spanning multiple weekdays, **When** they view the "urge by weekday" breakdown, **Then** the system shows average urge intensity for each day of the week, highlighting the day with the highest average.
3. **Given** no entries exist for a specific hour or weekday, **When** that slot is displayed, **Then** the system shows it as zero or marks it as no data rather than omitting it.

---

### User Story 5 - Urge Intensity by Trigger (Priority: P5)

A user wants to know which relapse triggers produce the highest average urge intensity, so they can prioritise work on the most emotionally demanding triggers.

**Why this priority**: This cross-cuts both trigger data and urge data and surfaces the single most actionable question: "which trigger creates the strongest urges?" It is less foundational than temporal analysis but is a natural next step once the user understands when urges peak.

**Independent Test**: Can be fully tested by loading entries that each carry a specific trigger tag and a urge value, then confirming the "urge by trigger" view ranks triggers from highest to lowest average intensity.

**Acceptance Scenarios**:

1. **Given** the user has entries tagged with different triggers and urge values, **When** they view the "urge by trigger" breakdown, **Then** the system lists triggers ranked by average urge intensity from highest to lowest.
2. **Given** a trigger has only a single associated entry, **When** it appears in the ranking, **Then** its average equals that entry's urge value and is labelled to indicate limited sample size.
3. **Given** an entry has no trigger tag, **When** the breakdown is displayed, **Then** that entry is counted under an "Untagged" or "No trigger" category.

---

### User Story 6 - Urge–Relapse Correlation Insight (Priority: P6)

A user wants to understand whether higher urge intensity is associated with more frequent relapse events over time, receiving a simple correlation signal (positive, negative, or neutral) to inform their recovery strategy.

**Why this priority**: Correlation is the most analytically complex story and requires sufficient data to be meaningful. It delivers important clinical insight but is the last story to unlock after all foundational views are established.

**Independent Test**: Can be fully tested by constructing two synthetic data sets — one where high-urge periods coincide with high-relapse days and one where they do not — and confirming the system reports a positive correlation for the first and a near-zero correlation for the second.

**Acceptance Scenarios**:

1. **Given** the user has both urge-intensity data and relapse-count data over time, **When** they view the correlation insight, **Then** the system displays a correlation signal indicating whether higher urge periods coincide with higher relapse frequency.
2. **Given** insufficient data to compute a statistically meaningful correlation (fewer than a defined minimum number of data points), **When** the correlation view is accessed, **Then** the system displays a message indicating more data is needed rather than showing a misleading result.
3. **Given** there is a strong positive correlation between urge intensity and relapse count, **When** the correlation is displayed, **Then** the system presents an explanatory note helping the user interpret what the correlation means in plain language.

---

### Edge Cases

- What happens when the user has no urge data at all? — System displays a clear empty state with guidance to start logging relapses with urge values.
- What happens when urge values are all identical? — Median equals mean, distribution shows a single bucket; moving average is a flat line.
- What happens when only a single data point exists? — Max, min, average, and median are all equal; moving average window degrades gracefully to the single point.
- How does the system handle entries where urge intensity was not recorded? — Entries without urge values are excluded from all calculations and the count of included entries is displayed.
- What happens if the selected time range returns data from only one weekday or hour? — The breakdown for other slots shows zero/no-data; the system does not hide empty slots.
- How is the moving-average window size selected? — A sensible default window (e.g., 7 days) is used; if the user has fewer days of data than the window, a shorter window is used automatically.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST compute and display average, maximum, minimum, and median urge intensity for all entries in the selected time period.
- **FR-002**: System MUST plot urge intensity values chronologically as a time series, with one data point per day (or per entry where multiple occur on the same day, averaged).
- **FR-003**: System MUST overlay a moving-average line on the urge time series using a default window, degrading gracefully when fewer data points than the window size exist.
- **FR-004**: System MUST derive and display a trend direction (increasing, decreasing, or stable) from the urge time series data.
- **FR-005**: System MUST group urge intensity values into discrete ranges and display the count and percentage of entries in each range.
- **FR-006**: System MUST display average urge intensity broken down by hour of the day (0–23).
- **FR-007**: System MUST display average urge intensity broken down by day of the week (Monday–Sunday).
- **FR-008**: System MUST display average urge intensity grouped by trigger tag, ranked from highest to lowest average intensity.
- **FR-009**: System MUST compute and display a correlation signal between average urge intensity per period and relapse count per period.
- **FR-010**: System MUST exclude entries where urge intensity was not recorded from all calculations, and indicate how many entries were excluded.
- **FR-011**: System MUST display a meaningful empty state whenever there is insufficient data to render any view.
- **FR-012**: System MUST provide a time-period filter (e.g., last 7 days, last 30 days, last 90 days, all time) that updates all views consistently.
- **FR-013**: System MUST label entries with only a single data point in trigger-ranked views to indicate limited sample size.
- **FR-014**: System MUST display a "more data needed" notice in place of the correlation view when the data set is below a minimum threshold required for a meaningful result.

### Key Entities *(include if feature involves data)*

- **Urge Record**: A relapse entry enriched with an intensity value (a numeric scale, e.g., 1–10) and a timestamp; the core unit of all urge analytics calculations.
- **Urge Summary**: An aggregated snapshot (average, max, min, median) computed from a filtered set of urge records.
- **Urge Time Point**: A single date-level aggregation of urge records used as one point in the time series and moving average.
- **Urge Bucket**: A range-defined grouping of urge records used to build the distribution view (e.g., 1–3 mild, 4–6 moderate, 7–10 severe).
- **Temporal Slot**: An hour (0–23) or weekday (Mon–Sun) used as the key for time-of-day and weekday breakdowns.
- **Trigger Urge Group**: A named trigger with its associated set of urge records and computed average intensity.
- **Correlation Result**: A derived value representing the direction and strength of association between urge intensity periods and relapse count periods.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view all four summary statistics (average, max, min, median) for any selected period in under 2 seconds of loading the view.
- **SC-002**: The time series and moving average correctly reflect all urge records within the selected period, with zero computational errors detectable through manual spot-checking.
- **SC-003**: The urge distribution correctly assigns every urge record to exactly one intensity bucket with no double-counting or omissions.
- **SC-004**: The hourly and weekday breakdowns account for 100% of the urge records in the selected period (either in a labelled slot or in an "excluded" count).
- **SC-005**: The trigger ranking lists all triggers present in the data set in the selected period with no triggers silently omitted.
- **SC-006**: The correlation view displays a plain-language interpretation alongside the numerical signal, such that a non-technical user can understand what the result means.
- **SC-007**: The system gracefully handles empty states and data-quality edge cases (missing urge values, single-entry periods, all-identical values) without displaying errors or blank/broken visuals.
- **SC-008**: All analytics views update consistently and completely when the user changes the time-period filter, with no stale data visible from a prior selection.

## Assumptions

- The urge intensity scale is a whole-number range (e.g., 1–10); the scale bounds are defined by the existing relapse logging feature and are not redefined here.
- The time-series aggregation groups entries by calendar day in the user's local time zone.
- The moving-average default window is 7 days; this value may be made configurable in a future phase.
- Correlation is computed as a directional signal (positive / negative / neutral) rather than a precise statistical coefficient; exact methodology is an implementation decision.
- A minimum of 10 data points is assumed to be the threshold below which correlation is suppressed and replaced with a "more data needed" message.
- Mobile support and export functionality are deferred to a later phase focused on charts and visualisation (Phase 12).
- The analytics views are read-only; users cannot edit urge data from within the analytics section.
- Existing authentication and data-access controls from earlier phases apply without modification.
