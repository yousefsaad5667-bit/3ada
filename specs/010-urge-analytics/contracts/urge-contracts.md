# UI Contracts: Urge Analytics (Phase 10)

This document defines the component contracts — inputs, outputs, and display rules — for all UI components in the `analytics/urge` feature. Because this is a local SPA (no external API), contracts are expressed as Angular component interfaces.

---

## `UrgeComponent` (page root)

**Route**: `analytics/urge`

**Selector**: `app-urge`

**Responsibility**: Injects `UrgeAnalyticsService`, reads `state` signal, delegates rendering to sub-components. Handles page-level empty and error states.

**Template structure**:
```
<app-urge>
  [page header — Arabic title "تحليل الرغبة الشديدة"]
  [empty state — shown when status === 'empty']
  [error state — shown when status === 'error']
  [content — shown when status === 'data']
    <app-urge-summary-card>
    <app-urge-time-series-chart>
    <app-urge-distribution-chart>
    <app-urge-by-hour-chart>
    <app-urge-by-weekday-chart>
    <app-urge-by-trigger-list>
    <app-urge-correlation-card>
</app-urge>
```

---

## `UrgeSummaryCardComponent`

**Selector**: `app-urge-summary-card`

**Input**:
```typescript
@Input({ required: true }) summary: UrgeSummaryView;
```

**Display contract**:

| Field | Arabic Label | Format |
|---|---|---|
| `average` | المتوسط | 1 decimal place; null → "—" |
| `max` | الأعلى | Integer; null → "—" |
| `min` | الأدنى | Integer; null → "—" |
| `median` | الوسيط | 1 decimal place; null → "—" |
| `trendDirection` | الاتجاه | Icon + Arabic word |
| `includedRecordCount` | السجلات المحللة | Integer |
| `excludedRecordCount` | سجلات بدون بيانات | Integer; hidden when 0 |

**Trend direction map**:
- `increasing` → ↑ ارتفاع (red)
- `decreasing` → ↓ انخفاض (green)
- `stable` → → ثابت (neutral)
- `insufficient-data` → لا تتوفر بيانات كافية للاتجاه (muted)

---

## `UrgeTimeSeriesChartComponent`

**Selector**: `app-urge-time-series-chart`

**Input**:
```typescript
@Input({ required: true }) timeSeries: UrgeTimeSeriesView;
```

**Display contract**:
- Shows raw daily urge series and moving average side-by-side in a data list (Phase 10 placeholder; replaced by line chart in Phase 12).
- When `rawSeries.length === 0`: show Arabic message "لا تتوفر بيانات للفترة المحددة".
- Moving average window label: "المتوسط المتحرك (٧ أيام)".
- Trend direction indicator displayed as a badge above the chart area.

---

## `UrgeDistributionChartComponent`

**Selector**: `app-urge-distribution-chart`

**Input**:
```typescript
@Input({ required: true }) distribution: DistributionEntry[];
```

**Display contract**:
- Renders 10 fixed buckets (level 1–10) as horizontal bar indicators (width proportional to `percentage`).
- Label per row: `"مستوى {label}"` | count | percentage%.
- Empty bucket rows still displayed (width 0) — never hidden.
- When array is empty: show "لا تتوفر بيانات".

**Bucket severity labels** (displayed as badge):
- 1–3: خفيف (mild, green)
- 4–6: متوسط (moderate, amber)
- 7–10: شديد (severe, red)

---

## `UrgeByHourChartComponent`

**Selector**: `app-urge-by-hour-chart`

**Input**:
```typescript
@Input({ required: true }) byHour: UrgeHourEntry[];
```

**Display contract**:
- Shows 24 hour slots as a ranked list sorted by `avgUrge` descending (only slots with `avgUrge !== null`).
- Slots with `avgUrge === null` shown at bottom with "لا بيانات".
- Highest-avgUrge slot highlighted with a badge "الأعلى".
- When all slots are null: "لا تتوفر بيانات الوقت للفترة المحددة".

---

## `UrgeByWeekdayChartComponent`

**Selector**: `app-urge-by-weekday-chart`

**Input**:
```typescript
@Input({ required: true }) byWeekday: UrgeWeekdayEntry[];
```

**Display contract**:
- Shows all 7 days; bar indicator width proportional to `avgUrge` / 10.
- Slot with highest avgUrge: badge "أعلى يوم".
- Slots with `avgUrge === null`: bar width 0 + label "لا بيانات".
- When all slots are null: "لا تتوفر بيانات كافية".

---

## `UrgeByTriggerListComponent`

**Selector**: `app-urge-by-trigger-list`

**Input**:
```typescript
@Input({ required: true }) byTrigger: UrgeTriggerEntry[];
```

**Display contract**:
- Ordered list sorted by `avgUrge` descending.
- Columns: Rank | Keyword | avgUrge (1 decimal) | recordCount | isLimitedSample badge.
- `isLimitedSample` → shows badge "عينة محدودة" (muted, informational).
- When list is empty: "لا تتوفر بيانات المحفزات".
- Max visible rows: 20 (no pagination needed in Phase 10).

---

## `UrgeCorrelationCardComponent`

**Selector**: `app-urge-correlation-card`

**Input**:
```typescript
@Input({ required: true }) correlation: UrgeCorrelationResult;
```

**Display contract**:

| direction | Arabic heading | Colour | Icon |
|---|---|---|---|
| `positive` | ارتباط إيجابي | red/warning | ↑↑ |
| `negative` | ارتباط سلبي | green | ↑↓ |
| `neutral` | لا ارتباط واضح | neutral | ≈ |
| `insufficient-data` | بيانات غير كافية | muted | — |

- `explanationAr` displayed as a paragraph below the heading.
- `pearsonR` displayed as "(r = X.XX)" when non-null.
- `weeklyDataPoints` displayed as "بناءً على {N} أسبوع".
- When `direction === 'insufficient-data'`: replace all metrics with: "يلزم {minimumDataPoints} أسابيع من البيانات على الأقل لحساب الارتباط. لديك حالياً {weeklyDataPoints}."

---

## Empty State

**Used by**: `UrgeComponent` when `status === 'empty'`

```
Icon: 📊 (or SVG equivalent)
Heading: لا تتوفر بيانات الرغبة الشديدة
Body: ابدأ بتسجيل مستوى الرغبة الشديدة عند إضافة انتكاسة جديدة.
```

---

## Error State

**Used by**: `UrgeComponent` when `status === 'error'`

```
Heading: حدث خطأ
Body: {errorMessageAr}
```
