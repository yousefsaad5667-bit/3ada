# Implementation Plan: Trigger Analytics

**Branch**: `009-trigger-analytics` | **Date**: 2026-07-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/009-trigger-analytics/spec.md`

---

## Summary

Build the Phase 9 Trigger Analytics feature: a ranked trigger frequency list with urge badges, horizontal distribution chart, per-trigger trend timeline, keyword search, and a summary statistics card. All surfaces share a single `TriggerAnalyticsService` that derives view state from the existing `RelapseRecordRepository.records()` Signal and the `DashboardFilterService.activeFilter()` Signal. The existing engine function `getTriggerAnalysis()` from Phase 4 is reused as-is. The stub `TriggersComponent` in `features/analytics/triggers/` is replaced with a full implementation. Dashboard integration follows the `DashboardCardDescriptor` pattern from Phase 5. No third-party chart or visualization library is introduced — all charts are pure Angular CSS-grid/Flexbox components with RTL and Arabic support.

---

## Technical Context

**Language/Version**: TypeScript 5.7.x with Angular 19.2.x, strict typing, standalone components, Angular Signals, SCSS

**Primary Dependencies**: Existing Angular runtime, existing `RelapseRecordRepository`, existing `DashboardFilterService`, existing `getTriggerAnalysis()` analytics engine function, existing dashboard shell and `DashboardCardDescriptor` contract. No new library dependency is introduced.

**Storage**: LocalStorage only, accessed through `RelapseRecordRepository`. This feature reads records and stores no new data.

**Testing**: `ng test` / `npm test` with Karma and Jasmine; `npm run lint`; `npm run build`

**Target Platform**: Browser-only Angular SPA, offline-capable, Arabic UI, RTL layout, mobile-first responsive dashboard

**Project Type**: Angular frontend feature layered over the existing pure TypeScript analytics engine

**Performance Goals**: All trigger analytics views render within 2 seconds for 10,000 records; search filters update within 500ms of user input.

**Constraints**: No backend, no APIs, no authentication, no database, no IndexedDB, no SSR. No third-party chart library — custom CSS horizontal bar chart and timeline chart required for RTL/Arabic compatibility. Engine function `getTriggerAnalysis()` is reused as-is; no engine modifications in this phase. Keyword extraction logic should be extracted to a shared utility to avoid duplication between engine and service.

**Scale/Scope**: Up to 100,000 relapse records. Phase 9 is limited to trigger analytics derived from `reason`/`notes` text fields. Urge analytics (Phase 10), chart visualization library (Phase 12), and performance optimization (Phase 14) are out of scope.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| Angular Platform | PASS | Feature implemented as Angular standalone components and a service with TypeScript and SCSS. No third-party library added. |
| 100% Local-First Storage | PASS | Reads records through the existing LocalStorage repository. No remote service, alternate storage, or new persistence key. |
| Arabic Language & RTL | PASS | Trigger ranking list, distribution chart, timeline, search input, and summary card are planned for Arabic text, RTL layout, and SCSS styling. Keyword extraction already handles Arabic text natively. |
| Modern UI & UX | PASS | All cards include loading, data, empty, and error states. Search has empty-state handling. Trigger list has rank badges and urge level indicators. |
| Performance & Scalability | PASS | `getTriggerAnalysis()` is O(n) in records. Trend computation is an additional O(n) pass only when a keyword is selected. Signal-based memoization prevents recomputation when unrelated Signals change. Search filter is O(k) on the keywords array, not the records array. |
| Charting Library | PASS | No chart library introduced. All distribution charts and the timeline are pure CSS Angular components. |
| Architecture | PASS | Business calculations stay in `core/analytics`; all Phase 9 UI, state, and layout stay in `features/analytics/triggers`; dashboard integration uses descriptors. |
| Code Quality | PASS | Strict-typed models, a single orchestration service, reusable components, and focused unit tests planned. Keyword extraction utility extracted to shared location to prevent duplication. |

**All gates pass. No complexity exceptions required.**

---

## Project Structure

### Documentation (this feature)

```text
specs/009-trigger-analytics/
├── plan.md                        <- this file
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
|   └── trigger-contracts.md
├── checklists/
|   └── requirements.md
└── spec.md
```

### Source Code (repository root)

```text
src/app/core/analytics/
├── engine/
│   └── trigger.engine.ts          EXISTING — reused as-is (getTriggerAnalysis)
├── utils/
│   └── keyword.utils.ts           NEW — extractKeywords() extracted from trigger.engine.ts
│                                        for shared use by engine and service
└── index.ts                       MODIFY — export extractKeywords from keyword.utils.ts

src/app/features/analytics/triggers/
├── triggers.component.ts          MODIFY — replace stub; full page layout wrapper
├── triggers.component.html        MODIFY — replace stub; RTL layout with all four cards + search
├── triggers.component.scss        MODIFY — replace stub; responsive RTL page layout
├── models/
│   └── trigger-view.model.ts      NEW — TriggerAnalyticsState, TriggerBucketView,
│                                        TriggerTrendView, TriggerTrendEntry,
│                                        TriggerDistributionView, TriggerSummaryView,
│                                        TriggerStatus
├── services/
│   └── trigger-analytics.service.ts  NEW — Signal orchestration:
│                                           state (computed from records + filter)
│                                           searchQuery, selectedKeyword (writable signals)
│                                           filteredTriggers, triggerTrend (computed)
└── components/
    ├── trigger-ranking-list/       NEW — ranked trigger list with urge badges and selection
    │   ├── trigger-ranking-list.component.ts
    │   ├── trigger-ranking-list.component.html
    │   └── trigger-ranking-list.component.scss
    ├── trigger-search/             NEW — Arabic RTL search input
    │   ├── trigger-search.component.ts
    │   ├── trigger-search.component.html
    │   └── trigger-search.component.scss
    ├── trigger-distribution-chart/ NEW — horizontal bar chart for top-20 triggers (RTL)
    │   ├── trigger-distribution-chart.component.ts
    │   ├── trigger-distribution-chart.component.html
    │   └── trigger-distribution-chart.component.scss
    ├── trigger-timeline/           NEW — date-axis area chart for selected trigger trend
    │   ├── trigger-timeline.component.ts
    │   ├── trigger-timeline.component.html
    │   └── trigger-timeline.component.scss
    └── trigger-summary-card/       NEW — summary stats panel
        ├── trigger-summary-card.component.ts
        ├── trigger-summary-card.component.html
        └── trigger-summary-card.component.scss

src/app/features/dashboard/
└── dashboard.component.ts         MODIFY — register Phase 9 card descriptors:
                                            triggers-ranking, triggers-distribution,
                                            triggers-timeline, triggers-summary
```

**Structure Decision**: All keyword aggregation, trend computation, rare classification, and distribution building live in `TriggerAnalyticsService`. All layout rendering, RTL CSS, and interaction events live in the five new component trees under `features/analytics/triggers/components/`. Dashboard integration uses the existing `DashboardCardDescriptor` pattern. The shared `extractKeywords` utility lives in `core/analytics/utils/` to avoid engine/service duplication.

---

## Phase 0: Research

Completed in [research.md](./research.md).

Key decisions:
- Reuse `getTriggerAnalysis()` from the existing analytics engine — no engine changes.
- Compute per-trigger trend in the service via a second O(n) pass over filtered records.
- Extract `extractKeywords()` from the engine to a shared utility to avoid duplication.
- Classify rare triggers in the service using a 5% threshold (or < 3 count).
- Implement search as a `WritableSignal<string>` with a `computed` filtered result.
- Render all charts as pure CSS Angular components (no third-party chart library).
- "Most active period" computed only for the selected trigger to avoid O(n×k) complexity.

---

## Phase 1: Design & Contracts

Completed artifacts:

- [data-model.md](./data-model.md)
- [contracts/trigger-contracts.md](./contracts/trigger-contracts.md)
- [quickstart.md](./quickstart.md)

Post-design constitution check remains PASS: the design is Angular-only, local-only, RTL-capable, and preserves the engine/feature separation. No library dependency is added.

---

## Verification Plan

### Automated Tests

- `npm test -- --watch=false` for unit tests covering:
  - `TriggerAnalyticsService`:
    - Empty dataset: `status === 'empty'`, `allTriggers.length === 0`
    - Records with only stop words: `status === 'empty'`, `triggerlessRecordCount > 0`
    - Records with valid Arabic keywords: correct counts, percentages sum to 100
    - Keyword weighting: record with `count: 3` contributes 3 to keyword count
    - Average urge computation: weighted average correct across multiple records
    - Rare trigger classification: < 5% share AND < 3 count leads to `isRare: true`
    - Top trigger: highest count leads to `rank === 1`, `isTop === true`
    - Date range filtering: only in-bounds records contribute
    - Search filter: `searchQuery = 'عمل'` returns only matching keywords
    - Trend for keyword: date-binned counts correct, zero-filled for missing dates
    - Trend direction: 7+ non-zero increasing points leads to `'increasing'`
    - Null selected keyword: `triggerTrend === null`
    - Distribution cap: > 20 keywords leads to `topTriggers.length === 20`, `otherCount > 0`
  - `keyword.utils.ts`:
    - Stop words filtered correctly
    - Tokens shorter than 2 characters filtered
    - De-duplication within record works correctly
- `npm run lint` for strict TypeScript and Angular linting
- `npm run build` for production build validation

### Manual Verification

- Load records with Arabic trigger text: verify ranking list shows keywords sorted by frequency.
- Verify each trigger entry shows occurrence count, percentage, and average urge badge.
- Type a keyword in the search box: verify list filters reactively in Arabic RTL.
- Clear search: verify full list restored.
- Click a trigger in the list: verify timeline updates to show that trigger's date trend.
- Switch dashboard date range: verify all trigger analytics views update correctly.
- Load records with no `reason`/`notes`: verify empty state with Arabic message is shown.
- Load only stop-word text: verify empty state is shown (no keywords extracted).
- Verify rare triggers are visually distinguished in the ranking list.
- Verify distribution chart bars grow from right (RTL) with Arabic keyword labels.
- Test with zero records: all views render cleanly with Arabic empty state messages.
- Test RTL layout: ranking list numbers on left, keyword text on right, bars grow right-to-left.
- Verify dark mode and light mode intensity/urge colors are distinct and readable.
- Verify mobile layout at 320px width.

---

## Complexity Tracking

No constitution violations or complexity exceptions are required.
