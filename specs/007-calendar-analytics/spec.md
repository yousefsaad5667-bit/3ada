# Feature Specification: Calendar Analytics

**Feature Branch**: `007-calendar-analytics`

**Created**: 2026-07-08

**Status**: Draft

**Input**: User description: "phase 7 - Calendar Analytics"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Annual Relapse Activity as a GitHub-Style Heatmap (Priority: P1)

A user opens the calendar analytics section and sees a full-year GitHub-style heatmap where each cell represents a single day. Cell color intensity reflects the number of relapses on that day — darker cells indicate higher activity. The user can immediately spot clusters of activity, long streaks of no relapses, and outlier days without reading individual numbers.

**Why this priority**: The heatmap delivers the most condensed, high-impact view of an entire year at a glance. It is the defining visual of this phase and the first thing users see when they arrive at calendar analytics.

**Independent Test**: Load records spanning at least 60 days, open the heatmap view, and verify that every day in the year is shown, that days with records have proportionally darker cells, and that days with no records appear as empty/light cells.

**Acceptance Scenarios**:

1. **Given** relapse records exist for multiple dates in the past year, **When** the user views the heatmap, **Then** each day cell is shaded according to that day's relapse count relative to the highest daily count in the dataset.
2. **Given** a day has no relapse records, **When** the heatmap is displayed, **Then** that day's cell appears with the lowest intensity color or an empty style, clearly distinct from days with activity.
3. **Given** the user changes the active date range, **When** the heatmap refreshes, **Then** only days within that range are highlighted while the full year grid remains visible.

---

### User Story 2 - Navigate a Monthly Calendar View (Priority: P2)

A user switches to a monthly calendar layout showing one month at a time. Each day cell is labeled with its date and visually reflects the number of relapses through intensity or a count badge. The user can navigate backward and forward between months.

**Why this priority**: The monthly calendar provides a familiar, fine-grained navigational structure for users who want to review specific weeks or locate a particular date's activity. It complements the heatmap's year-wide overview.

**Independent Test**: Load records spread across two consecutive months, open the monthly calendar, confirm that every day in the month is represented, that relapse counts appear correctly per day, and that navigating to the adjacent month shows that month's data accurately.

**Acceptance Scenarios**:

1. **Given** a month contains relapse records on some days, **When** the user views that month's calendar, **Then** each day cell shows its date and a visual indicator of relapse activity for that day.
2. **Given** the user taps the "next month" control, **When** the calendar updates, **Then** the new month's grid is shown with correct day labels and intensity values for that month's data.
3. **Given** a month has no relapse records, **When** the user navigates to it, **Then** the month renders with all days visible but with no intensity shading or activity indicators.

---

### User Story 3 - View Day Details in a Popup (Priority: P3)

A user taps or clicks on any day cell in either the heatmap or the monthly calendar. A popup or panel appears showing the full details for that day: all individual relapse records, total relapse count, all reasons logged, average urge level, and any notes.

**Why this priority**: Day-level detail turns the calendar from a read-only visualization into an interactive investigation tool. It allows users to understand exactly what happened on high-activity days without leaving the calendar view.

**Independent Test**: Log three records on a single day with varied reasons, urge levels, and notes. Click that day cell and verify that the popup shows all three records, the correct total count, all reasons, the correct average urge level, and all notes.

**Acceptance Scenarios**:

1. **Given** a day has relapse records, **When** the user clicks on that day's cell, **Then** a popup or detail panel appears listing all records for that day, the total count, all associated reasons, the average urge level, and any notes.
2. **Given** a day has no relapse records, **When** the user clicks on that day's cell, **Then** the popup appears with a clear empty state message indicating no activity was recorded for that day.
3. **Given** the day details popup is open, **When** the user clicks away or dismisses it, **Then** the popup closes and the calendar remains in its previous state without data loss.

---

### User Story 4 - View a Daily Summary Section (Priority: P4)

A user selects a day from the calendar and views a structured summary card beneath or alongside the calendar. The summary shows the selected day's total relapse count, average urge level, unique reasons, and any notes logged for that day — without requiring a popup.

**Why this priority**: Some users prefer an always-visible summary panel over an ephemeral popup, especially on larger screens. The daily summary provides complementary or alternative access to the same per-day data.

**Independent Test**: Select a day with records through the calendar; verify the summary card updates to reflect that day's data. Select a day with no records; verify the summary card shows an appropriate empty state.

**Acceptance Scenarios**:

1. **Given** the user selects a day with records, **When** the daily summary card updates, **Then** it shows the selected date, total count, average urge, the list of reasons, and any notes for that day.
2. **Given** no day is selected, **When** the daily summary is visible, **Then** it shows a prompt asking the user to select a day, or defaults to today's data if available.
3. **Given** the user changes the active date range, **When** the currently selected date falls outside the new range, **Then** the daily summary resets to an unselected or default state.

---

### User Story 5 - Handle Empty and Sparse Data (Priority: P5)

A user who has few or no records still sees the full calendar grids without errors. Empty months render cleanly, and the popup or summary for days with no records shows a friendly empty state rather than blank or broken UI.

**Why this priority**: Users may open calendar analytics at any stage of their journey, including when they have very few entries. The feature must remain usable and encouraging across all data volumes.

**Independent Test**: Load no records and verify both heatmap and monthly calendar render correctly. Load a single record and verify only that day reflects activity while all other days appear correctly empty.

**Acceptance Scenarios**:

1. **Given** the dataset contains no records, **When** the heatmap loads, **Then** it renders all day cells with no intensity shading and no errors.
2. **Given** the dataset contains one record on a single day, **When** the monthly calendar renders the corresponding month, **Then** only that day cell shows activity and all other cells appear empty.
3. **Given** the user navigates to a month with no records, **When** that month's calendar is shown, **Then** a message indicates no activity for this month or all cells are rendered empty without error.

---

### Edge Cases

- What happens when a day has an unusually high relapse count compared to all other days in the heatmap?
- How does the calendar handle months at the boundary of the selected date range where only part of the month falls within the range?
- What happens when the user clicks on a day that falls outside the current active date range?
- How does the heatmap render for a user who has records spanning multiple years?
- What happens when a relapse record has an invalid or missing date?
- How does the monthly calendar handle months with 28, 29, 30, and 31 days, including February in leap years?
- What happens when two records for the same day have conflicting timestamps?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST display a GitHub-style heatmap showing daily relapse intensity for at least the most recent 52-week period.
- **FR-002**: The system MUST shade each heatmap cell with an intensity level proportional to that day's relapse count relative to the maximum daily count in the active dataset.
- **FR-003**: The system MUST represent days with zero relapses with a clearly distinct, low-intensity style in the heatmap.
- **FR-004**: The system MUST display a monthly calendar view showing one month at a time with day-level activity indicators.
- **FR-005**: The system MUST allow the user to navigate between months in the monthly calendar view using previous and next controls.
- **FR-006**: The system MUST show daily relapse intensity in each calendar day cell in both the heatmap and the monthly calendar.
- **FR-007**: The system MUST allow the user to click or tap any day cell in the heatmap or monthly calendar to open a day details popup.
- **FR-008**: The day details popup MUST display all individual relapse records for that day, the total relapse count, all logged reasons, the average urge level, and all notes.
- **FR-009**: The day details popup MUST display a clear empty state when no records exist for the selected day.
- **FR-010**: The day details popup MUST be dismissible and return the calendar to its previous state on dismissal.
- **FR-011**: The system MUST display a daily summary section that shows the selected day's total count, average urge level, unique reasons, and notes.
- **FR-012**: The daily summary MUST update immediately when the user selects a different day.
- **FR-013**: The system MUST update all calendar views whenever the active dashboard date range changes.
- **FR-014**: The system MUST render all calendar grids without errors when the dataset contains no records.
- **FR-015**: The system MUST ignore invalid or incomplete records for calendar calculations and continue rendering with valid records only.
- **FR-016**: The system MUST integrate with the dashboard shell so calendar analytics appear as dashboard cards with loading, empty, and error states.
- **FR-017**: The heatmap MUST display day cells for every day in the rendered period, including days outside the active date range, but distinguish them visually from active-range days.

### Key Entities

- **Calendar Day**: A single date with computed attributes: relapse count, average urge level, list of reasons, list of notes, and intensity level.
- **Heatmap Grid**: A time-ordered grid of calendar days spanning the rendered period. Has attributes: start date, end date, and a collection of calendar days organized by week.
- **Monthly Calendar Grid**: A calendar-month grid with attributes: year, month, starting weekday, and a collection of calendar days for that month.
- **Day Detail**: A user-facing record of all activity for a single date. Has attributes: date, total relapse count, list of records, list of unique reasons, average urge level, and concatenated notes.
- **Intensity Level**: A normalized classification (e.g., none, low, medium, high, very high) derived from a day's count relative to the dataset maximum. Used for visual encoding in heatmap and calendar cells.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The heatmap renders all day cells for the most recent 52-week period within 2 seconds for datasets up to 10,000 records.
- **SC-002**: 100% of days in the rendered heatmap period are represented with a cell, including days with zero activity.
- **SC-003**: Day details appear within 500 milliseconds of the user clicking a day cell.
- **SC-004**: The monthly calendar correctly renders every day in all 12 months including February in both leap and non-leap years in 100% of tested cases.
- **SC-005**: At least 90% of users can identify the highest-activity day in a heatmap without reading individual count labels.
- **SC-006**: Calendar views render without errors in 100% of tested cases when the dataset is empty, contains a single record, or contains records only on one day.
- **SC-007**: Date range changes refresh all calendar views within 1 second for datasets up to 10,000 records.

## Assumptions

- The relapse records, date range selector, dashboard shell, and local data layer already exist from previous phases.
- This phase focuses on calendar and heatmap visualizations; weekday/hour pattern analysis and trigger analytics are handled in later phases.
- The heatmap covers a rolling 52-week window by default; the active date range filter controls which cells are highlighted as having data.
- Calendar day intensity is computed relative to the maximum daily count within the active dataset, not across all historical records.
- The first day of the week in the calendar grid follows the project's locale setting established in earlier phases.
- Day details show all records regardless of the time of day within that date.
- The daily summary section and the day details popup show the same underlying data; one is persistent, the other is modal.
- Visualizations follow the dashboard card loading, empty, and error-state conventions established in Phase 5.
