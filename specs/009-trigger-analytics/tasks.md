# Tasks: Trigger Analytics

**Input**: Design documents from `specs/009-trigger-analytics/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create all shared type definitions and extract the shared keyword utility that both the engine and service depend on.

- [x] T001 [P] Create view models in `src/app/features/analytics/triggers/models/trigger-view.model.ts` (TriggerStatus, TriggerBucketView, TriggerTrendEntry, TriggerTrendView, TriggerDistributionView, TriggerSummaryView, TriggerAnalyticsState)
- [x] T002 [P] Extract `extractKeywords()` from `src/app/core/analytics/engine/trigger.engine.ts` into new shared utility `src/app/core/analytics/utils/keyword.utils.ts` and update `trigger.engine.ts` to import from it
- [x] T003 Export `extractKeywords` from `src/app/core/analytics/index.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core service and page shell that MUST be complete before any user story component can be wired up.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T004 Implement `TriggerAnalyticsService` in `src/app/features/analytics/triggers/services/trigger-analytics.service.ts` with `state` (computed), `searchQuery` (writable signal), `selectedKeyword` (writable signal), `filteredTriggers` (computed), and `triggerTrend` (computed) — following the signal architecture of `PatternAnalyticsService`
- [x] T005 Replace stub `TriggersComponent` logic in `src/app/features/analytics/triggers/triggers.component.ts` (inject `TriggerAnalyticsService`, expose state to template)
- [x] T006 Replace stub layout in `src/app/features/analytics/triggers/triggers.component.html` and `src/app/features/analytics/triggers/triggers.component.scss` (RTL page layout shell — card grid, empty state, error state)

**Checkpoint**: Service computes trigger state from LocalStorage records; page shell renders empty/data/error status in Arabic RTL.

---

## Phase 3: User Story 1 — View Top Triggers at a Glance (Priority: P1) 🎯 MVP

**Goal**: Display a ranked list of triggers ordered by frequency, with count, percentage, and average urge per trigger.

**Independent Test**: Navigate to Trigger Analytics; verify a ranked list is shown with count, percentage share, and urge badges for each trigger. Top trigger is #1. Empty state shows Arabic message when no data.

### Implementation for User Story 1

- [x] T007 [P] [US1] Create `TriggerRankingListComponent` logic in `src/app/features/analytics/triggers/components/trigger-ranking-list/trigger-ranking-list.component.ts` (inputs: `triggers: TriggerBucketView[]`, `status: TriggerStatus`, `selectedKeyword: string | null`; output: `keywordSelected`)
- [x] T008 [US1] Implement `trigger-ranking-list.component.html` — Arabic RTL ranked list with rank badge, keyword text, count, percentage bar, and urge level indicator; highlight selected row; empty and loading states
- [x] T009 [US1] Implement `trigger-ranking-list.component.scss` — RTL layout, rank badge styling, urge level color scale, selected row highlight, "rare" trigger visual distinction
- [x] T010 [US1] Register `triggers-ranking` card descriptor in `src/app/features/dashboard/dashboard.component.ts` and wire `TriggerRankingListComponent` into `triggers.component.html`

**Checkpoint**: User Story 1 is fully functional. Top triggers visible with rank, count, percentage, and urge. Rare triggers visually distinguished. Empty state in Arabic.

---

## Phase 4: User Story 2 — Explore Trigger Frequency & Distribution (Priority: P2)

**Goal**: Display a horizontal bar chart showing each trigger's proportion of total relapses with exact counts.

**Independent Test**: Navigate to Trigger Analytics; verify a distribution chart renders with horizontal bars (growing left in RTL), Arabic keyword labels on the right, and a correct "other" aggregation for triggers beyond the top 20.

### Implementation for User Story 2

- [x] T011 [P] [US2] Create `TriggerDistributionChartComponent` logic in `src/app/features/analytics/triggers/components/trigger-distribution-chart/trigger-distribution-chart.component.ts` (inputs: `distribution: TriggerDistributionView`, `status: TriggerStatus`)
- [x] T012 [US2] Implement `trigger-distribution-chart.component.html` — RTL horizontal bar chart for top-20 triggers; "other" summary row; Arabic labels; empty and loading states
- [x] T013 [US2] Implement `trigger-distribution-chart.component.scss` — RTL horizontal bars (bars grow right-to-left), label alignment, count annotation, dark/light mode color tokens
- [x] T014 [US2] Register `triggers-distribution` card descriptor in `src/app/features/dashboard/dashboard.component.ts` and wire `TriggerDistributionChartComponent` into `triggers.component.html`

**Checkpoint**: User Stories 1 and 2 both functional. Distribution chart updates when date range filter changes.

---

## Phase 5: User Story 3 — Browse Trigger Timeline & Trends (Priority: P3)

**Goal**: Display a date-axis area/line chart showing occurrences of the selected trigger over time, with trend direction and peak date.

**Independent Test**: Click a trigger in the ranking list; verify the timeline chart updates to show date-bucketed counts for that trigger across the active date range, with zero-filled gaps and a visible trend direction label.

### Implementation for User Story 3

- [x] T015 [P] [US3] Create `TriggerTimelineComponent` logic in `src/app/features/analytics/triggers/components/trigger-timeline/trigger-timeline.component.ts` (inputs: `trend: TriggerTrendView | null`, `status: TriggerStatus`)
- [x] T016 [US3] Implement `trigger-timeline.component.html` — date-axis area chart (CSS height-based columns), Arabic date labels, trend direction badge (↑/↓/→), peak date highlight, empty state when no keyword selected, insufficient-data state
- [x] T017 [US3] Implement `trigger-timeline.component.scss` — RTL-compatible date axis, area fill gradient, peak column highlight, dark/light mode colors, responsive at 320px
- [x] T018 [US3] Register `triggers-timeline` card descriptor in `src/app/features/dashboard/dashboard.component.ts` and wire `TriggerTimelineComponent` into `triggers.component.html`; connect `keywordSelected` output from `TriggerRankingListComponent` to `service.selectedKeyword.set()`

**Checkpoint**: User Stories 1–3 functional. Clicking a trigger in the list updates the timeline chart. Trend direction displayed in Arabic.

---

## Phase 6: User Story 4 — Search & Filter Triggers (Priority: P3)

**Goal**: Provide a keyword search input that filters the trigger ranking list in real time.

**Independent Test**: Type Arabic text in the search box; verify the ranking list narrows to matching triggers. Clear the field; verify full list is restored. No-match case shows Arabic empty state.

### Implementation for User Story 4

- [x] T019 [P] [US4] Create `TriggerSearchComponent` logic in `src/app/features/analytics/triggers/components/trigger-search/trigger-search.component.ts` (input: `status: TriggerStatus`; output: `queryChanged: EventEmitter<string>`)
- [x] T020 [US4] Implement `trigger-search.component.html` — Arabic RTL search input with clear button, placeholder text in Arabic, debounced input emission, empty-query reset
- [x] T021 [US4] Implement `trigger-search.component.scss` — RTL input styling (icon on left, text flows right-to-left), clear button, focus state, dark/light mode
- [x] T022 [US4] Wire `TriggerSearchComponent` into `triggers.component.html`; connect `queryChanged` output to `service.searchQuery.set()`; switch `TriggerRankingListComponent` to consume `service.filteredTriggers()` instead of `state().allTriggers`

**Checkpoint**: User Stories 1–4 functional. Search filters the trigger list reactively. Clearing search restores full list.

---

## Phase 7: User Story 5 — Analyze Average Urge Intensity per Trigger (Priority: P2)

**Goal**: Surface a summary panel showing the trigger with the highest average urge, total keyword count, total occurrences, and rare trigger count — giving the user a prioritization-ready overview.

**Independent Test**: Navigate to Trigger Analytics with urge-bearing relapse data; verify the summary card correctly identifies the top trigger, the highest-urge trigger, and the rare trigger count.

### Implementation for User Story 5

- [x] T023 [P] [US5] Create `TriggerSummaryCardComponent` logic in `src/app/features/analytics/triggers/components/trigger-summary-card/trigger-summary-card.component.ts` (inputs: `summary: TriggerSummaryView`, `status: TriggerStatus`)
- [x] T024 [US5] Implement `trigger-summary-card.component.html` — Arabic RTL summary panel: top trigger name + count, highest-urge keyword + value, distinct keyword count, rare trigger count, triggerless record count footnote; empty and loading states
- [x] T025 [US5] Implement `trigger-summary-card.component.scss` — stat tiles layout, urge intensity color, subtle badge for rare count, dark/light mode
- [x] T026 [US5] Register `triggers-summary` card descriptor in `src/app/features/dashboard/dashboard.component.ts` and wire `TriggerSummaryCardComponent` into `triggers.component.html`

**Checkpoint**: All 5 user stories functional. Summary card reflects correct data and updates on date range change.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Quality, robustness, and validation across all user story components.

- [x] T027 [P] Write unit tests for `TriggerAnalyticsService` in `src/app/features/analytics/triggers/services/trigger-analytics.service.spec.ts` — covering all 13 contract test scenarios from `contracts/trigger-contracts.md`
- [x] T028 [P] Write unit tests for `keyword.utils.ts` in `src/app/core/analytics/utils/keyword.utils.spec.ts` — stop word filtering, short-token filtering, per-record deduplication
- [x] T029 Verify all components handle `status === 'empty'`, `status === 'loading'`, and `status === 'error'` states with Arabic messages — manual walkthrough per `quickstart.md` verification plan
- [x] T030 Verify RTL layout for all components at 320px, 768px, and 1280px viewport widths — ranking list, distribution chart, timeline, search, summary card
- [x] T031 Verify dark mode and light mode color tokens across urge intensity badges, distribution bars, and timeline area fill
- [x] T032 Performance check: load 10,000 relapse records with varied trigger text; confirm all analytics views render within 2 seconds and search responds within 500ms
- [x] T033 Code cleanup: remove console.log statements, run `npm run lint`, confirm `npm run build` succeeds with zero errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories
- **User Stories (Phases 3–7)**: All depend on Foundational phase completion
  - Can proceed sequentially in priority order: US1 → US2/US5 → US3/US4
  - US4 (Search) depends on US1 (ranking list) being wired first (T022 wraps US1's component)
  - US3 (Timeline) depends on US1 (keyword selection event) being wired first (T018 connects the output)
- **Polish (Phase 8)**: Depends on all user story phases being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — no story dependencies
- **US2 (P2)**: Can start after Phase 2 — independent of US1
- **US3 (P3)**: Can start after Phase 2 for component creation; wiring (T018) requires US1 to be complete
- **US4 (P3)**: Can start after Phase 2 for component creation; wiring (T022) requires US1 to be complete
- **US5 (P2)**: Can start after Phase 2 — independent of all other stories

### Within Each User Story

- Models (T001) before services (T004) before components
- Component logic (`.ts`) before template (`.html`) and styles (`.scss`)
- Component creation before dashboard registration and wiring
- Story complete before moving to next priority

### Parallel Opportunities

- T001, T002 (Phase 1): parallel — different files
- T004, T005, T006 can overlap once T001 is done (service depends on models, shell depends on service)
- T007 (US1 component logic) can start as soon as T004 is complete
- T011 (US2), T015 (US3), T019 (US4), T023 (US5) component `.ts` files can all be created in parallel once Phase 2 is complete
- T027, T028, T029, T030, T031 (Phase 8) are all parallel — different files

---

## Parallel Example: User Story 1 + User Story 2

```text
# After Phase 2 is complete, these can run in parallel:

Task US1: T007 → T008 → T009 → T010
Task US2: T011 → T012 → T013 → T014
Task US5: T023 → T024 → T025 → T026

# US3 and US4 component .ts creation can also start in parallel:
Task US3 setup: T015
Task US4 setup: T019
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T003)
2. Complete Phase 2: Foundational (T004–T006) — CRITICAL
3. Complete Phase 3: User Story 1 (T007–T010)
4. **STOP and VALIDATE**: Navigate to Trigger Analytics; confirm ranked trigger list renders with counts, urge badges, and Arabic empty state
5. Proceed to Phase 4+ for additional stories

### Incremental Delivery

1. Setup + Foundational → service and shell ready
2. Add US1 (Ranking List) → **MVP visible**
3. Add US2 (Distribution Chart) → distribution insights visible
4. Add US5 (Summary Card) → summary stats panel visible
5. Add US3 (Timeline) + US1 keyword selection → trend drill-down enabled
6. Add US4 (Search) → search filter enabled
7. Polish phase → tests, RTL validation, performance

---

## Notes

- **[P]** tasks operate on different files with no shared dependencies
- **[Story]** label maps each task to the user story it delivers
- `TriggerAnalyticsService` is the single source of truth — components must NOT call `getTriggerAnalysis()` directly
- `extractKeywords()` utility must be kept in sync between engine and service — any change to stop words or tokenization rules must be applied in `keyword.utils.ts` only
- All Arabic labels are hard-coded strings in templates (no i18n library); follow the pattern established in Phase 7/8 components
- Commit after each phase checkpoint to enable easy rollback if needed
