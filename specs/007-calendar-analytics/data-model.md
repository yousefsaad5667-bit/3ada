# Data Model: Calendar Analytics

## Entity: CalendarDay

Represents a single date with all pre-computed display attributes for the calendar and heatmap views.

**Fields**:

- `date`: `YYYY-MM-DD` — the calendar date
- `count`: total relapse count for this date (zero when no records)
- `averageUrge`: average urge level for this date, or `null` when no records have urge data
- `reasons`: deduplicated list of logged reasons for this date (may be empty)
- `notes`: list of all notes logged for this date (may be empty)
- `intensity`: `'none' | 'low' | 'medium' | 'high' | 'very-high'` — discrete visual class derived from normalized count
- `intensityValue`: normalized float 0–1, sourced from `HeatmapEntry.intensity`
- `isInActiveRange`: whether the date falls within the active dashboard date range
- `isToday`: whether the date matches the current calendar date

**Validation Rules**:

- `date` must be a valid `YYYY-MM-DD` string.
- `count` must be ≥ 0.
- `intensity` must be `'none'` when `count === 0`.
- `averageUrge` is `null` when no records with urge data exist for this date.

---

## Entity: HeatmapWeek

Represents one column of the GitHub-style heatmap (7 days, Sunday through Saturday or Saturday through Friday for RTL).

**Fields**:

- `weekIndex`: zero-based column index in the heatmap grid (0 = leftmost week)
- `days`: `CalendarDay[]` of exactly 7 entries; days before the dataset start or after the dataset end have `count = 0` and `isInActiveRange = false`

**Validation Rules**:

- `days` always contains exactly 7 entries.
- Weeks are ordered from oldest (index 0) to newest.

---

## Entity: HeatmapGrid

Represents the full GitHub-style heatmap spanning the rendered 52-week period.

**Fields**:

- `weeks`: ordered `HeatmapWeek[]` — 52 or 53 weeks depending on the period boundary
- `rangeStart`: start of the rendered period (`YYYY-MM-DD`)
- `rangeEnd`: end of the rendered period (`YYYY-MM-DD`)
- `activeRangeStart`: active dashboard filter start
- `activeRangeEnd`: active dashboard filter end
- `maxDayCount`: maximum relapse count on any single day in the active range (used for intensity normalization)
- `monthLabels`: list of month label markers for column-header display (month abbreviation + first week index)

**Validation Rules**:

- `weeks` must cover all dates from `rangeStart` to `rangeEnd`.
- `monthLabels` entries must correspond to valid week indices in `weeks`.

---

## Entity: CalendarMonthGrid

Represents a single month in the monthly calendar view.

**Fields**:

- `year`: four-digit year
- `month`: 1–12
- `labelAr`: Arabic month+year display label (e.g., "يوليو 2026")
- `days`: `CalendarDay[]` for every calendar date in this month (28–31 entries)
- `leadingBlanks`: number of blank cells before the first day (based on first weekday of month)
- `trailingBlanks`: number of blank cells after the last day to complete the final row
- `hasActivity`: `true` when at least one day in the month has `count > 0`

**Validation Rules**:

- `days` count must equal the correct number of days in the given year/month (including leap years).
- `leadingBlanks + days.length + trailingBlanks` must be divisible by 7 (complete grid rows).

---

## Entity: DayDetail

Represents the full display data for a single selected date, used by both the day details popup and the daily summary section.

**Fields**:

- `date`: `YYYY-MM-DD`
- `labelAr`: Arabic formatted date label
- `totalCount`: total relapse count for this date
- `averageUrge`: average urge level or `null`
- `uniqueReasons`: deduplicated, sorted list of reasons
- `notes`: list of all notes (one per record that has notes)
- `records`: list of individual relapse records for this date, ordered by time
- `isEmpty`: `true` when `totalCount === 0`

**Validation Rules**:

- `totalCount` must equal the sum of `count` across all `records`.
- `isEmpty` must be `true` if and only if `totalCount === 0`.

---

## Entity: CalendarAnalyticsState

Represents the complete feature-level view state consumed by all calendar analytics cards.

**Fields**:

- `status`: `'loading' | 'empty' | 'data' | 'error'`
- `heatmapGrid`: `HeatmapGrid`
- `currentMonthGrid`: `CalendarMonthGrid` — the month currently shown in the monthly calendar view
- `selectedDay`: `DayDetail | null` — populated when the user selects a day
- `selectedDate`: `YYYY-MM-DD | null`
- `currentMonth`: `{ year: number; month: number }` — tracks which month the monthly calendar is displaying
- `rangeStart`: active dashboard filter start
- `rangeEnd`: active dashboard filter end
- `invalidRecordCount`: count of excluded invalid records
- `errorMessageAr`: Arabic error message or `null`

**Relationships**:

- Reads valid source records from `RelapseRecordRepository`.
- Reads active date range from `DashboardFilterService`.
- Feeds the heatmap card, monthly calendar card, day details popup, and daily summary card.

**Validation Rules**:

- `status` is `'empty'` when no valid records exist in the active range.
- `status` is `'data'` when at least one valid count exists in the active range.
- `selectedDay` must be `null` when `selectedDate` is `null`.
- `selectedDay.date` must equal `selectedDate` when both are non-null.

---

## State Transitions

```text
loading  →  data        when records and date range load successfully
loading  →  empty       when no valid records exist in the active range
loading  →  error       when records cannot be read or transformed
data     →  loading     when date range or records change
empty    →  loading     when date range or records change
error    →  loading     when retry is attempted
data     ←→ data        when user selects a different day (selectedDay updates, status stays 'data')
data     ←→ data        when user navigates months (currentMonthGrid updates, status stays 'data')
```

---

## Source Data

`RelapseRecord` remains the source entity from earlier phases:

- `id`
- `date` — used for all calendar grouping
- `time` — used for intra-day record ordering in DayDetail
- `ampm` — used for display in DayDetail records
- `count` — used for all intensity and count calculations
- `urgeLevel` — used for `averageUrge` in CalendarDay and DayDetail
- `reason` — used for `uniqueReasons` in CalendarDay and DayDetail
- `notes` — used for `notes` in CalendarDay and DayDetail
- `createdAt`
- `updatedAt`

Phase 7 uses all fields except `id`, `createdAt`, and `updatedAt` for display; `date` and `count` are used for intensity calculations.

---

## Intensity Classification

The intensity class for each `CalendarDay` is derived from `HeatmapEntry.intensity` (0–1):

| Intensity Value | Class | Description |
|----------------|-------|-------------|
| 0 | `none` | No activity |
| 0.01 – 0.25 | `low` | Light activity |
| 0.26 – 0.50 | `medium` | Moderate activity |
| 0.51 – 0.75 | `high` | High activity |
| > 0.75 | `very-high` | Peak activity |

These classes map to SCSS theme variables for consistent dark/light mode rendering.
