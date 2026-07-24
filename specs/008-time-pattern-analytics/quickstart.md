# Quickstart: Time Pattern Analytics (Phase 8)

**Feature**: 008-time-pattern-analytics
**Date**: 2026-07-24

---

## How Phase 8 Integrates with the Existing Codebase

### What Already Exists (Do NOT recreate)

| What | Location | Used By Phase 8 |
|------|----------|-----------------|
| `getWeekdayAnalysis()` | `core/analytics/engine/pattern.engine.ts` | `PatternAnalyticsService` — weekday distribution |
| `getHourAnalysis()` | `core/analytics/engine/pattern.engine.ts` | `PatternAnalyticsService` — hourly distribution, AM/PM, heatmap |
| `WeekdayEntry`, `HourEntry` | `core/analytics/models/analytics.types.ts` | Input to service mapping |
| `IntensityLevel` | `features/analytics/calendar/models/calendar-view.model.ts` | Reused for heatmap cell styling |
| `DashboardFilterService` | `features/dashboard/services/dashboard-filter.service.ts` | Provides active date range |
| `RelapseRecordRepository` | `core/services/relapse-record.repository.ts` | Provides records signal |
| `DashboardCardDescriptor` | `features/dashboard/models/dashboard-card-descriptor.model.ts` | Dashboard integration |
| Intensity SCSS variables | `src/styles.scss` (global) | Reused for heatmap cell colors |

### What Is a Stub (Replace, Do NOT delete the file)

| File | Current State | Phase 8 Action |
|------|--------------|----------------|
| `features/analytics/patterns/patterns.component.ts` | Empty stub | Replace with full page layout wrapper |
| `features/analytics/patterns/patterns.component.html` | Empty stub | Replace with component layout |
| `features/analytics/patterns/patterns.component.scss` | Empty stub | Replace with RTL page layout styles |

---

## Minimal Integration Scenario

The simplest integration that delivers User Story 1 (weekday distribution):

```typescript
// In patterns.component.ts
service = inject(PatternAnalyticsService);
state = this.service.state;
```

```html
<!-- In patterns.component.html -->
<app-weekday-chart
  [weekdays]="state().weekdays"
  [status]="state().status"
/>
```

The `PatternAnalyticsService` automatically reads from `RelapseRecordRepository.records()` and `DashboardFilterService.activeFilter()` — no additional setup required.

---

## Directory Structure for Phase 8

```
src/app/features/analytics/patterns/
├── patterns.component.ts          MODIFY — replace stub; full page layout
├── patterns.component.html        MODIFY — replace stub
├── patterns.component.scss        MODIFY — replace stub; RTL page layout
├── models/
│   └── pattern-view.model.ts      NEW — PatternAnalyticsState, WeekdayBucketView, etc.
├── services/
│   └── pattern-analytics.service.ts  NEW — Signal orchestration
└── components/
    ├── weekday-chart/              NEW — weekday distribution bar chart
    │   ├── weekday-chart.component.ts
    │   ├── weekday-chart.component.html
    │   └── weekday-chart.component.scss
    ├── hourly-chart/               NEW — 24-hour distribution bar chart
    │   ├── hourly-chart.component.ts
    │   ├── hourly-chart.component.html
    │   └── hourly-chart.component.scss
    ├── period-split-card/          NEW — AM vs PM donut/split chart
    │   ├── period-split-card.component.ts
    │   ├── period-split-card.component.html
    │   └── period-split-card.component.scss
    ├── hour-weekday-heatmap/       NEW — 7×24 temporal heatmap
    │   ├── hour-weekday-heatmap.component.ts
    │   ├── hour-weekday-heatmap.component.html
    │   └── hour-weekday-heatmap.component.scss
    └── pattern-summary-card/       NEW — peak insights summary
        ├── pattern-summary-card.component.ts
        ├── pattern-summary-card.component.html
        └── pattern-summary-card.component.scss
```

---

## Service Computation Flow

```
RelapseRecordRepository.records() ──┐
                                    ├──▶ PatternAnalyticsService.state (computed)
DashboardFilterService.activeFilter()┘
  │
  ├── Filter valid records by date range
  ├── getWeekdayAnalysis(validRecords) ──▶ weekdays[]
  ├── getHourAnalysis(validRecords) ──────▶ hours[], skippedCount
  ├── Cross-aggregate for heatmap ─────────▶ cells[7][24]
  ├── Sum AM/PM from hours[] ─────────────▶ periodSplit
  └── Derive peaks from weekdays/hours ──▶ summary
```

---

## Ampm / Time Parsing Reminder

The existing `getHourAnalysis()` already handles the `ampm` field:
- If `record.ampm === 'pm'` and `hour < 12` → add 12 (e.g., `2 pm` → hour 14)
- If `record.ampm === 'am'` and `hour === 12` → set to 0 (midnight correction)

The hour-weekday heatmap in the service must replicate this same logic for consistency.
