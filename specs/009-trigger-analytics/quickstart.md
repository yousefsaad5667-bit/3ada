# Quickstart: Trigger Analytics (Phase 9)

**Feature**: 009-trigger-analytics
**Date**: 2026-07-24

---

## How Phase 9 Integrates with the Existing Codebase

### What Already Exists (Do NOT recreate)

| What | Location | Used By Phase 9 |
|------|----------|-----------------|
| `getTriggerAnalysis()` | `core/analytics/engine/trigger.engine.ts` | `TriggerAnalyticsService` — frequency, ranking, avg urge |
| `TriggerEntry` | `core/analytics/models/analytics.types.ts` | Input to service mapping |
| `DashboardFilterService` | `features/dashboard/services/dashboard-filter.service.ts` | Provides active date range signal |
| `RelapseRecordRepository` | `core/services/relapse-record.repository.ts` | Provides records signal |
| `DashboardCardDescriptor` | `features/dashboard/models/dashboard-card-descriptor.model.ts` | Dashboard integration |
| Arabic stop-word filtering | Inside `trigger.engine.ts` (private `extractKeywords`) | Already applied by engine |
| `isValidDate()` | `core/analytics/utils/date-range.utils.ts` | Used for record validation in service |

### What Is a Stub (Replace, Do NOT delete the file)

| File | Current State | Phase 9 Action |
|------|--------------|----------------|
| `features/analytics/triggers/triggers.component.ts` | Empty stub | Replace with full page layout wrapper |
| `features/analytics/triggers/triggers.component.html` | Minimal stub | Replace with component layout |
| `features/analytics/triggers/triggers.component.scss` | Empty stub | Replace with RTL page layout styles |

---

## Minimal Integration Scenario

The simplest integration that delivers User Story 1 (top trigger ranking):

```typescript
// In triggers.component.ts
service = inject(TriggerAnalyticsService);
state = this.service.state;
```

```html
<!-- In triggers.component.html -->
<app-trigger-ranking-list
  [triggers]="state().topTriggers"
  [status]="state().status"
  [selectedKeyword]="service.selectedKeyword()"
  (keywordSelected)="service.selectedKeyword.set($event)"
/>
```

The `TriggerAnalyticsService` automatically reads from `RelapseRecordRepository.records()` and `DashboardFilterService.activeFilter()` — no additional setup required.

---

## Directory Structure for Phase 9

```
src/app/features/analytics/triggers/
├── triggers.component.ts          MODIFY — replace stub; full page layout
├── triggers.component.html        MODIFY — replace stub
├── triggers.component.scss        MODIFY — replace stub; RTL page layout
├── models/
│   └── trigger-view.model.ts      NEW — TriggerAnalyticsState, TriggerBucketView,
│                                        TriggerTrendView, TriggerTrendEntry,
│                                        TriggerDistributionView, TriggerSummaryView,
│                                        TriggerStatus, TriggerInteractionState
├── services/
│   └── trigger-analytics.service.ts  NEW — Signal orchestration:
│                                           state (computed from records + filter)
│                                           searchQuery, selectedKeyword (writable)
│                                           filteredTriggers, triggerTrend (computed)
└── components/
    ├── trigger-ranking-list/       NEW — ranked list of triggers with urge badges
    │   ├── trigger-ranking-list.component.ts
    │   ├── trigger-ranking-list.component.html
    │   └── trigger-ranking-list.component.scss
    ├── trigger-search/             NEW — search input with debounced filter
    │   ├── trigger-search.component.ts
    │   ├── trigger-search.component.html
    │   └── trigger-search.component.scss
    ├── trigger-distribution-chart/ NEW — horizontal bar chart (RTL) for top-20 triggers
    │   ├── trigger-distribution-chart.component.ts
    │   ├── trigger-distribution-chart.component.html
    │   └── trigger-distribution-chart.component.scss
    ├── trigger-timeline/           NEW — date-axis area chart for per-trigger trend
    │   ├── trigger-timeline.component.ts
    │   ├── trigger-timeline.component.html
    │   └── trigger-timeline.component.scss
    └── trigger-summary-card/       NEW — summary stats: top trigger, highest urge, etc.
        ├── trigger-summary-card.component.ts
        ├── trigger-summary-card.component.html
        └── trigger-summary-card.component.scss

src/app/features/dashboard/
└── dashboard.component.ts         MODIFY — register Phase 9 card descriptors:
                                            triggers-ranking, triggers-distribution,
                                            triggers-timeline, triggers-summary
```

---

## Service Computation Flow

```
RelapseRecordRepository.records() ──┐
                                    ├──▶ TriggerAnalyticsService.state (computed)
DashboardFilterService.activeFilter()┘
  │
  ├── Filter valid records by date range
  ├── getTriggerAnalysis(inBoundsRecords) ──▶ TriggerEntry[]
  ├── Map TriggerEntry → TriggerBucketView (add percentage, rank, isTop, isRare)
  ├── Split into topTriggers (≤5) and rareTriggers
  ├── Build distribution (cap at 20, compute otherCount)
  ├── Build summary (totalKeywordCount, top, highestUrgeKeyword, etc.)
  └── Count triggerlessRecordCount (records with no keywords)

searchQuery signal ──────────────────▶ filteredTriggers (computed)
selectedKeyword signal ──────────────▶ triggerTrend (computed)
  │
  ├── Re-iterate inBoundsRecords filtering by selectedKeyword
  ├── Group by date → TriggerTrendEntry[]
  ├── Zero-fill for missing dates in range
  ├── Compute direction (7+ non-zero points required)
  └── Find mostActivePeriodLabelAr (weekly bucket max)
```

---

## Keyword Extraction — Important Notes

The `getTriggerAnalysis()` engine extracts keywords from **both** `record.reason` and `record.notes` fields. Arabic stop words and tokens shorter than 2 characters are filtered out. A keyword only counts **once per record** even if it appears multiple times in the same record's text.

When implementing trend computation in the service, **replicate the same extraction logic** for consistency — otherwise a record counted by the engine might not be found during trend filtering.

**Recommended approach**: Extract the private `extractKeywords` function from `trigger.engine.ts` into a shared utility file (`core/analytics/utils/keyword.utils.ts`) so both the engine and the service can import it without duplication.

---

## AM/PM — Not Applicable for Phase 9

Unlike Phase 8, trigger analysis does not depend on `record.time` or `record.ampm`. All records contribute to trigger analytics based on `record.reason`, `record.notes`, and `record.count`. Records without time fields are **fully included** (not skipped) in trigger analytics.
