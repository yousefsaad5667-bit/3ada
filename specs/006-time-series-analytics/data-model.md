# Data Model: Time Series Analytics

## Entity: TimeSeriesPeriod

Represents one dated aggregation bucket in a daily, weekly, or monthly dataset.

**Fields**:

- `grouping`: `daily | weekly | monthly`
- `startDate`: inclusive period start as `YYYY-MM-DD`
- `endDate`: inclusive period end as `YYYY-MM-DD`
- `anchorDate`: date used for ordering and chart placement
- `labelAr`: Arabic display label for the period
- `count`: total relapse count in the period
- `isPartial`: whether the period is clipped by the active date range

**Validation Rules**:

- `startDate`, `endDate`, and `anchorDate` must be valid calendar dates.
- `startDate` must be before or equal to `endDate`.
- `count` must be a finite number greater than or equal to zero.
- Periods must be sorted by `anchorDate` from oldest to newest.

## Entity: TimeSeriesDataset

Represents the complete chronological dataset for one grouping and active date range.

**Fields**:

- `grouping`: `daily | weekly | monthly`
- `rangeStart`: active date range start
- `rangeEnd`: active date range end
- `periods`: ordered `TimeSeriesPeriod[]`
- `totalCount`: sum of all period counts
- `hasActivity`: true when at least one period count is greater than zero
- `zeroFilled`: true when empty periods are represented with zero counts

**Relationships**:

- Contains many `TimeSeriesPeriod` records.
- Feeds chart components and table components for the same grouping.

**Validation Rules**:

- Daily datasets must include every date between `rangeStart` and `rangeEnd`.
- Weekly and monthly datasets must include every overlapping period between `rangeStart` and `rangeEnd`.
- `totalCount` must equal the sum of all period counts.

## Entity: MovingAverageSeries

Represents smoothed daily count values for the selected date range.

**Fields**:

- `windowSize`: number of daily periods included in each rolling calculation
- `points`: ordered list of date/label/value entries
- `hasEnoughData`: whether the selected range supports a meaningful moving average

**Relationships**:

- Derived from the daily `TimeSeriesDataset`.

**Validation Rules**:

- `windowSize` must be at least 1.
- Points must remain in the same order as the daily dataset.
- When there are too few points, the card must show an insufficient-data state rather than a misleading claim.

## Entity: CumulativeSeries

Represents running total values across the selected date range.

**Fields**:

- `points`: ordered list of date/label/value entries
- `finalCount`: final cumulative total for the selected range

**Relationships**:

- Derived from the daily `TimeSeriesDataset`.

**Validation Rules**:

- Each point value must equal the sum of all daily counts from the first date through that point.
- `finalCount` must equal the daily dataset `totalCount`.

## Entity: TrendSummary

Represents user-facing interpretation of activity direction and momentum.

**Fields**:

- `direction`: `increasing | decreasing | stable | insufficient-data`
- `growthRatePercent`: numeric percentage or `null` when not meaningful
- `averageDailyCount`: average relapse count per day in the active range
- `comparisonStartCount`: starting comparison value
- `comparisonEndCount`: ending comparison value
- `confidence`: `meaningful | limited | insufficient`
- `messageAr`: Arabic user-facing summary

**Relationships**:

- Derived from the daily dataset and moving average series.
- Displayed by the trend summary card.

**Validation Rules**:

- Direction must be `insufficient-data` when fewer than two meaningful comparison points exist.
- Growth rate must be `null` when the starting comparison value is zero and no meaningful percentage comparison exists.
- Trend direction must not contradict the comparison values.

## Entity: CountDistribution

Represents how period counts are spread across the selected range.

**Fields**:

- `buckets`: distribution buckets with label, min, max, count, and percentage
- `sourceGrouping`: grouping used to create the distribution

**Relationships**:

- Derived from daily period counts for this phase.
- Displayed as a compact chart/table section in the summary card.

**Validation Rules**:

- Bucket percentages must total approximately 100% when activity exists.
- Empty datasets must return an empty distribution or all-zero distribution state.

## Entity: TimeSeriesAnalyticsState

Represents the complete feature-level view state consumed by cards.

**Fields**:

- `status`: `loading | empty | data | error`
- `rangeStart`: active range start
- `rangeEnd`: active range end
- `daily`: `TimeSeriesDataset`
- `weekly`: `TimeSeriesDataset`
- `monthly`: `TimeSeriesDataset`
- `movingAverage`: `MovingAverageSeries`
- `cumulative`: `CumulativeSeries`
- `trend`: `TrendSummary`
- `distribution`: `CountDistribution`
- `invalidRecordCount`: number of excluded invalid records
- `errorMessageAr`: Arabic error message or `null`

**Relationships**:

- Reads valid source records from `RelapseRecordRepository`.
- Reads active date range from `DashboardFilterService`.
- Feeds all Phase 6 cards and the full `TimeSeriesComponent` route.

**Validation Rules**:

- `status` is `empty` when no valid records exist in the selected range.
- `status` is `data` when at least one valid count exists in the selected range.
- `invalidRecordCount` must not affect valid record totals except by exclusion.

## State Transitions

```text
loading -> data
loading -> empty
loading -> error
data -> loading       when date range changes or records refresh
empty -> loading      when date range changes or records refresh
error -> loading      when retry is requested
```

## Source Data

`RelapseRecord` remains the source entity from earlier phases:

- `id`
- `date`
- `time`
- `ampm`
- `count`
- `urgeLevel`
- `reason`
- `notes`
- `createdAt`
- `updatedAt`

Phase 6 uses `date` and `count` for calculations. Other fields are ignored by this phase.
