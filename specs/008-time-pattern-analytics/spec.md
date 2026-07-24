# Feature Specification: Time Pattern Analytics

**Feature Branch**: `008-time-pattern-analytics`

**Created**: 2026-07-24

**Status**: Draft

**Input**: User description: "phase 8 at PLAN.md — Time Pattern Analytics: Discover temporal behavior patterns."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Weekday Activity Distribution (Priority: P1)

A user opens the Time Pattern Analytics section and sees a bar chart showing total relapse counts broken down by day of the week (Saturday through Friday, or Sunday through Saturday depending on locale). The tallest bar immediately reveals which weekday is the most problematic, and the user can compare activity across all seven days without scrolling or further interaction.

**Why this priority**: Weekday distribution is the highest-signal insight in temporal analytics — many users relapse in predictable weekly cycles, and surfacing the peak weekday allows them to build targeted prevention strategies for that specific day. It is the simplest and most actionable temporal view.

**Independent Test**: Load at least 20 records distributed across multiple weekdays. Open Time Pattern Analytics and verify that the weekday distribution chart shows exactly seven bars, that the heights correspond correctly to total counts per weekday, and that the peak day label is highlighted or annotated.

**Acceptance Scenarios**:

1. **Given** relapse records exist across multiple weekdays, **When** the user views the weekday distribution chart, **Then** each of the seven weekdays is represented by a bar whose height reflects the total relapse count on that weekday within the active date range.
2. **Given** no records exist on a specific weekday, **When** the chart renders, **Then** that weekday's bar is shown with zero height — not omitted — so all seven days are always visible.
3. **Given** the user changes the active date range, **When** the weekday chart refreshes, **Then** the bars update to reflect only the counts within the new range.

---

### User Story 2 - View Hourly Activity Distribution (Priority: P2)

A user views an hour-by-hour breakdown showing total relapses for each hour of the day (00:00 to 23:00). A bar chart or column chart makes it clear which hours of the day see the most activity. The user can immediately identify their riskiest hours without reading a table.

**Why this priority**: Hour-of-day analysis pinpoints the exact time windows when the user is most vulnerable, enabling targeted interventions (e.g., scheduling support activities during peak hours). It complements weekday analysis by adding within-day granularity.

**Independent Test**: Log records with explicit times across at least five distinct hours. Open the hourly distribution view and verify all 24 hours are represented, that each bar height matches the recorded count for that hour, and that hours with no records show zero bars.

**Acceptance Scenarios**:

1. **Given** records exist with time data across multiple hours, **When** the user views the hourly distribution, **Then** all 24 hours are displayed and each bar height reflects the total relapse count during that hour.
2. **Given** a record has no time logged, **When** hourly distribution is computed, **Then** that record is excluded from the hourly chart and counted in an "unspecified time" indicator, so the chart remains accurate.
3. **Given** the user changes the active date range, **When** the hourly chart updates, **Then** only records within the new range influence the hourly counts.

---

### User Story 3 - Compare AM vs PM Activity (Priority: P3)

A user sees a simple AM vs PM comparison showing the total number of relapses that occurred in the morning (00:00–11:59) versus the afternoon and evening (12:00–23:59). A visual indicator (pie chart, donut chart, or split bar) makes the proportion immediately clear.

**Why this priority**: The AM/PM split is a fast, memorable summary for users who want a high-level picture of their daily activity pattern without the granularity of an hourly breakdown. It is a quick-glance insight that complements the full hourly distribution.

**Independent Test**: Log records with a mix of AM and PM times and verify that the AM vs PM chart displays the correct totals for each half-day, with the percentages or proportions accurately reflecting the data.

**Acceptance Scenarios**:

1. **Given** records exist with both AM and PM times, **When** the user views the AM vs PM comparison, **Then** the chart shows the correct count and percentage share for each half-day period.
2. **Given** all records fall in the AM period, **When** the AM vs PM chart renders, **Then** AM shows 100% and PM shows 0%, with the PM segment visible but empty or labeled accordingly.
3. **Given** no time data is recorded on any record, **When** the AM vs PM chart renders, **Then** a clear message indicates that time data is unavailable for this analysis.

---

### User Story 4 - View Hour-Weekday Heatmap (Priority: P4)

A user views a heatmap grid where the rows represent hours of the day and the columns represent days of the week. Each cell is shaded by intensity reflecting how many relapses occurred at that specific hour on that specific weekday. The user can spot recurring time-of-week risk windows — for example, "Friday evenings are consistently dangerous."

**Why this priority**: The hour-weekday heatmap reveals compound patterns that neither the weekday distribution nor the hourly distribution can show individually. It is the richest temporal insight and the most useful for identifying specific high-risk time windows.

**Independent Test**: Log records targeting specific weekday-hour combinations (e.g., multiple records on Monday at 20:00 and Thursday at 08:00). Open the heatmap and verify that those cells show higher intensity while unoccupied cells show zero intensity, and that the grid covers all 7 × 24 combinations.

**Acceptance Scenarios**:

1. **Given** records exist for specific weekday-hour combinations, **When** the user views the hour-weekday heatmap, **Then** each cell's shade reflects the relapse count for that weekday-hour pair, with higher counts producing darker or more intense shading.
2. **Given** a weekday-hour cell has zero records, **When** the heatmap renders, **Then** that cell appears with the lowest intensity style, clearly distinguishable from cells with activity.
3. **Given** the user changes the active date range, **When** the heatmap refreshes, **Then** intensity values update to reflect only the records within the new range.

---

### User Story 5 - Identify Peak Times and Summary Insights (Priority: P5)

A user views a summary section that calls out the most important temporal findings in plain language: the peak weekday (highest total count), the peak hour (highest hourly count), the most active overall period (AM or PM), and the least active weekday. This section distills the analytical charts into actionable takeaways.

**Why this priority**: Not all users will interpret charts directly. The summary insight panel translates the data into concrete, named findings so users can act on them immediately without needing to read every chart.

**Independent Test**: Load a dataset with a clear peak weekday and peak hour. Open the summary panel and verify that the displayed peak weekday, peak hour, and AM/PM dominance match the underlying data.

**Acceptance Scenarios**:

1. **Given** records exist across multiple weekdays and hours, **When** the user views the summary panel, **Then** the panel correctly identifies and labels the peak weekday, peak hour, most active period (AM/PM), and least active weekday.
2. **Given** multiple weekdays tie for the highest count, **When** the peak weekday is displayed, **Then** the summary panel shows all tied weekdays or clearly indicates there is a tie.
3. **Given** insufficient data exists (fewer than 7 records or all from a single hour), **When** the summary panel renders, **Then** it displays a message indicating that more data is needed for reliable pattern identification.

---

### User Story 6 - Handle Empty and Sparse Time Data (Priority: P6)

A user who has records with no time field, or who has very few records, still sees all charts rendered cleanly without errors. Charts that require time data display a friendly message when time is unavailable, and charts that only use dates (like weekday distribution) render normally.

**Why this priority**: Users may have records created before time logging was introduced, or may simply not log times. The feature must remain stable and informative even with partial or missing temporal data.

**Independent Test**: Load records with no time field. Verify that the weekday distribution renders correctly, that the hourly distribution and AM/PM charts display an empty state message rather than crashing, and that the heatmap shows all cells as zero without error.

**Acceptance Scenarios**:

1. **Given** all records lack a time field, **When** the hourly distribution renders, **Then** it shows a clear empty state indicating time data is unavailable, rather than a broken or zero-only chart.
2. **Given** the dataset is completely empty, **When** all Time Pattern Analytics charts load, **Then** every chart renders cleanly with appropriate empty state messages and no errors.
3. **Given** some records have time data and others do not, **When** the hourly distribution renders, **Then** only records with valid time data are included, and the count of excluded records is displayed to the user.

---

### Edge Cases

- What happens when a record's time field is present but malformed (e.g., "99:99" or an empty string)?
- How does the weekday distribution handle records that span midnight (unlikely but possible with date/time edge cases)?
- What happens when all records fall on a single weekday — does the chart still show all seven days?
- How does the hour-weekday heatmap handle daylight saving time transitions where the same clock hour occurs twice?
- What happens if the user has records spanning multiple years — does "hour 20 on Monday" aggregate across all Mondays in the dataset?
- How does the AM vs PM split handle exactly midnight (00:00) — is it AM or PM?
- What happens when the active date range contains only a single day?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST display a weekday distribution chart showing total relapse counts for each of the seven days of the week within the active date range.
- **FR-002**: The system MUST display all seven weekdays in the distribution chart even when some days have zero records.
- **FR-003**: The system MUST display an hourly distribution chart showing total relapse counts for each of the 24 hours of the day, based on records with valid time data within the active date range.
- **FR-004**: The system MUST display all 24 hours in the hourly distribution even when some hours have zero records.
- **FR-005**: The system MUST display an AM vs PM comparison showing total relapse counts and percentage share for the morning (00:00–11:59) and afternoon/evening (12:00–23:59) periods.
- **FR-006**: The system MUST display a 7×24 hour-weekday heatmap where each cell's intensity reflects the count of relapses at that specific weekday-hour combination within the active date range.
- **FR-007**: The system MUST display a summary panel identifying the peak weekday, peak hour, dominant half-day period (AM or PM), and least active weekday.
- **FR-008**: The system MUST exclude records with missing or invalid time fields from time-based analyses (hourly distribution, AM vs PM, hour-weekday heatmap) and display the count of excluded records.
- **FR-009**: The system MUST include records with any time data in weekday distribution, regardless of whether a time field is present.
- **FR-010**: The system MUST update all Time Pattern Analytics charts when the active dashboard date range changes.
- **FR-011**: The system MUST display a friendly empty state for each time-based chart when no records with valid time data exist within the active date range.
- **FR-012**: The system MUST render all charts without errors when the dataset is completely empty.
- **FR-013**: The system MUST integrate with the dashboard shell so Time Pattern Analytics charts appear as dashboard cards with loading, empty, and error states.
- **FR-014**: The system MUST display the peak weekday summary as a tied result when multiple weekdays share the highest count.

### Key Entities

- **Weekday Bucket**: An aggregation of relapse counts for a specific day of the week (e.g., Monday). Has attributes: weekday index (0–6), weekday label in Arabic, total count, and percentage share of the weekly total.
- **Hour Bucket**: An aggregation of relapse counts for a specific hour of the day (0–23). Has attributes: hour index, hour label in 12-hour Arabic format, total count, percentage share of the daily total, and half-day period (AM or PM).
- **Hour-Weekday Cell**: A single cell in the 7×24 temporal heatmap. Has attributes: weekday index, hour index, count, and intensity level.
- **Period Split**: A comparison of AM (00:00–11:59) vs PM (12:00–23:59) activity. Has attributes: AM count, PM count, total count, AM percentage, and PM percentage.
- **Time Pattern Summary**: A derived summary object with attributes: peak weekday (label and count), peak hour (label and count), dominant period (AM or PM), least active weekday (label and count), and a flag indicating whether sufficient data exists for reliable insight.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All Time Pattern Analytics charts render within 2 seconds for datasets up to 10,000 records.
- **SC-002**: The weekday distribution chart correctly represents all 7 weekdays in 100% of tested cases, including when some days have zero records.
- **SC-003**: The hourly distribution chart correctly represents all 24 hours in 100% of tested cases.
- **SC-004**: The hour-weekday heatmap correctly populates all 168 cells (7 × 24) in 100% of tested cases.
- **SC-005**: The AM vs PM split totals sum to exactly 100% of time-attributed records in 100% of tested cases.
- **SC-006**: Date range changes refresh all Time Pattern Analytics charts within 1 second for datasets up to 10,000 records.
- **SC-007**: Time Pattern Analytics charts render without errors in 100% of tested cases when the dataset is empty, contains records with no time data, or contains a single record.
- **SC-008**: At least 90% of users can identify the peak weekday from the weekday distribution chart without reading numeric labels.

## Assumptions

- Relapse records, date range selector, dashboard shell, and local data layer already exist from previous phases.
- Records that lack a time field are valid for weekday-based analyses but are excluded from hourly, AM/PM, and hour-weekday analyses.
- The hour-weekday heatmap aggregates across all dates in the active range — counts from all Mondays in the range contribute to the "Monday" column.
- Midnight (00:00) is classified as AM for the AM vs PM split.
- The analytics engine's `getWeekdayAnalysis()` and `getHourAnalysis()` functions from Phase 4 exist and are reused for this phase.
- The day of the week ordering in charts follows the project's locale setting established in earlier phases.
- Time Pattern Analytics is a separate section within the analytics dashboard, not embedded within calendar or time-series sections.
- Records are assumed to have times stored in 24-hour format consistent with the existing data model.
- Peak weekday and peak hour summary items use the active date range, not all-time data.
