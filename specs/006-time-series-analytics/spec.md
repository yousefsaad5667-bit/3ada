# Feature Specification: Time Series Analytics

**Feature Branch**: `006-time-series-analytics`

**Created**: 2026-07-04

**Status**: Draft

**Input**: User description: "phase 6 - Time Series Analytics"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Relapse Activity Over Time (Priority: P1)

A user opens the dashboard and reviews their relapse activity as daily, weekly, and monthly time series. Missing dates in the selected range are shown as zero so the user can distinguish no activity from missing information.

**Why this priority**: Time series visibility is the core value of this phase. It gives users the first real analytics cards in the dashboard and helps them understand whether their activity is changing over time.

**Independent Test**: Load records across multiple dates, select a date range, and verify daily, weekly, and monthly views display complete chronological datasets with zero-filled gaps.

**Acceptance Scenarios**:

1. **Given** relapse records exist inside the selected range, **When** the user views the time series analytics, **Then** daily, weekly, and monthly datasets are shown in chronological order.
2. **Given** some dates inside the selected range have no records, **When** the daily time series is displayed, **Then** those dates appear with a count of zero.
3. **Given** the user changes the dashboard date range, **When** the time series analytics refresh, **Then** all time series views reflect only records within the selected range.

---

### User Story 2 - Understand Trends and Momentum (Priority: P2)

A user wants to know whether relapse activity is improving, worsening, or staying stable. They review a moving average, cumulative count, trend direction, growth rate, and average count for the active date range.

**Why this priority**: Raw counts alone can be noisy. Trend and momentum summaries help users interpret behavior changes and identify whether recent patterns need attention.

**Independent Test**: Use a dataset with known increasing, decreasing, and flat periods, then verify the displayed trend direction, moving average, growth rate, cumulative count, and average match the expected results.

**Acceptance Scenarios**:

1. **Given** records form an increasing pattern over time, **When** the user views trend analytics, **Then** the trend is identified as increasing and the growth rate reflects the change between the start and end of the selected range.
2. **Given** records are spread across the selected range, **When** the moving average is displayed, **Then** it smooths day-to-day spikes while preserving chronological order.
3. **Given** the selected range contains records, **When** the cumulative count is displayed, **Then** each point equals the total count from the range start through that point.

---

### User Story 3 - Inspect Underlying Time Series Data (Priority: P3)

A user wants to verify what the charts are showing. They can view tabular raw datasets for daily, weekly, and monthly counts, including period labels, counts, and zero-filled missing periods.

**Why this priority**: Tables improve trust and accessibility by making chart data inspectable without relying only on visual interpretation.

**Independent Test**: Compare table rows against chart points for the same selected date range and verify labels, counts, and ordering match exactly.

**Acceptance Scenarios**:

1. **Given** a daily chart is visible, **When** the user opens or views its accompanying data table, **Then** each chart point is represented by a matching table row.
2. **Given** weekly and monthly aggregations are visible, **When** the user reviews their tables, **Then** each period is labeled clearly and sorted from oldest to newest.
3. **Given** a date range has no records, **When** the tables render, **Then** they show the applicable periods with zero counts or a clear empty state, depending on the selected view.

---

### User Story 4 - Handle Empty and Sparse Data (Priority: P4)

A user has few or no relapse records in the selected range. The analytics still render clearly, avoid misleading trend claims, and explain when more data is needed.

**Why this priority**: Early users or users with successful streaks may have sparse data. The feature must remain encouraging, accurate, and usable without forcing artificial insights.

**Independent Test**: Load no records, one record, and sparse records over a long range; verify charts, tables, trend summaries, and empty states remain accurate and readable.

**Acceptance Scenarios**:

1. **Given** the selected range has no records, **When** the analytics load, **Then** charts and tables show zero activity or an empty state without errors.
2. **Given** the selected range has too few data points for a meaningful trend, **When** trend analytics are displayed, **Then** the trend summary states that more data is needed instead of claiming a direction.
3. **Given** records exist only on a small number of dates, **When** the charts render, **Then** missing periods remain visible as zero so sparse activity is not visually compressed.

### Edge Cases

- What happens when the selected range contains no relapse records?
- What happens when all records fall on a single date?
- How are missing dates, weeks, or months represented between the selected range boundaries?
- How does the feature handle a custom date range where the start and end date are the same?
- What happens when counts are extremely high on one period compared with surrounding periods?
- How are partial weeks or partial months at the start and end of a selected range represented?
- What happens when stored records contain invalid or incomplete date/time values?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide time series analytics for relapse activity across daily, weekly, and monthly groupings.
- **FR-002**: The system MUST generate raw daily, weekly, and monthly count datasets for the active dashboard date range.
- **FR-003**: The system MUST fill missing daily periods inside the active date range with zero counts.
- **FR-004**: The system MUST include weekly and monthly periods that overlap the active date range, including partial periods at the range boundaries.
- **FR-005**: The system MUST display a daily time series chart that shows relapse counts over time.
- **FR-006**: The system MUST display weekly and monthly time series views that summarize relapse counts by period.
- **FR-007**: The system MUST display a moving average view for daily relapse counts when enough data points exist.
- **FR-008**: The system MUST display a cumulative count view for the active date range.
- **FR-009**: The system MUST calculate and display trend direction for the active date range as increasing, decreasing, stable, or insufficient data.
- **FR-010**: The system MUST calculate and display growth rate for the active date range when a meaningful comparison can be made.
- **FR-011**: The system MUST calculate and display average relapse count for the active date range.
- **FR-012**: The system MUST display distribution information that helps users understand how counts are spread across periods in the active range.
- **FR-013**: The system MUST provide tabular views of the raw daily, weekly, and monthly datasets used by the charts.
- **FR-014**: The system MUST update all time series analytics whenever the active dashboard date range changes.
- **FR-015**: The system MUST show clear empty states when no records exist for the selected date range.
- **FR-016**: The system MUST avoid presenting trend direction or growth rate as meaningful when there are too few data points to support the calculation.
- **FR-017**: The system MUST ignore invalid or incomplete records for time series calculations and surface a non-blocking notice that some records could not be included.
- **FR-018**: The system MUST keep chart and table values consistent for the same selected range and grouping.
- **FR-019**: The system MUST present time series periods in chronological order from oldest to newest.
- **FR-020**: The system MUST integrate with the dashboard shell so time series analytics appear as dashboard cards with loading, empty, and error states.

### Key Entities

- **Time Series Period**: A dated interval used for aggregation. Has attributes: start date, end date, display label, grouping type, and relapse count.
- **Time Series Dataset**: A chronological collection of time series periods for a selected date range and grouping.
- **Trend Summary**: A user-facing interpretation of activity direction. Has attributes: trend direction, growth rate, average count, supporting period range, and confidence state.
- **Moving Average Series**: A chronological series that smooths daily counts over a rolling window.
- **Cumulative Series**: A chronological series where each value equals the running total from the selected range start through that period.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view daily, weekly, and monthly relapse activity for a selected date range within 2 seconds for datasets up to 10,000 records.
- **SC-002**: 100% of dates inside a daily selected range are represented in the raw dataset, including zero-count dates.
- **SC-003**: Chart values and table values match exactly for daily, weekly, and monthly views in every tested date range.
- **SC-004**: At least 90% of users can correctly identify whether relapse activity is increasing, decreasing, or stable after reviewing the trend summary and chart.
- **SC-005**: Date range changes refresh all time series cards within 1 second for datasets up to 10,000 records.
- **SC-006**: Empty and sparse datasets render without errors in 100% of tested cases, including no records, one record, and single-day ranges.
- **SC-007**: Invalid or incomplete records do not prevent valid records from appearing in time series analytics.

## Assumptions

- The relapse records, date range selector, dashboard shell, and local data layer already exist from previous phases.
- This phase focuses on time-based count analytics only; calendar heatmaps, weekday/hour patterns, trigger analytics, and urge analytics are handled in later phases.
- The default active date range is inherited from the dashboard infrastructure.
- Daily periods use calendar dates in the user's local timezone.
- Weekly periods use a consistent week boundary throughout the app.
- Moving average calculations use daily counts and require enough points to avoid misleading summaries.
- Visualizations are expected to follow the dashboard card loading, empty, and error-state conventions established in Phase 5.
