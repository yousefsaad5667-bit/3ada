# Implementation Plan: Calendar Analytics

**Branch**: `007-calendar-analytics` | **Date**: 2026-07-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/007-calendar-analytics/spec.md`

---

## Summary

Build the Phase 7 calendar analytics feature: a GitHub-style 52-week heatmap, a month-by-month calendar view, an interactive day details popup, and a persistent daily summary card. All four surfaces share a single `CalendarAnalyticsService` that derives view state from the existing `RelapseRecordRepository` records Signal and the `DashboardFilterService` active date range Signal. The heatmap and monthly calendar are rendered as custom Angular CSS-grid components with full RTL and Arabic support — no third-party chart library is introduced for Phase 7. Intensity computation reuses the existing `getHeatmap()` analytics engine function. Dashboard integration follows the `DashboardCardDescriptor` pattern from Phase 5.

---

## Technical Context

**Language/Version**: TypeScript 5.7.x with Angular 19.2.x, strict typing, standalone components, Angular Signals, SCSS

**Primary Dependencies**: Existing Angular runtime, existing `RelapseRecordRepository`, existing `DashboardFilterService`, existing `getHeatmap()` analytics engine, existing dashboard shell and `DashboardCardDescriptor` contract. No new chart library or UI framework dependency is introduced for this phase.

**Storage**: LocalStorage only, accessed through `RelapseRecordRepository`. This feature reads records and stores no new user preferences.

**Testing**: `ng test` / `npm test` with Karma and Jasmine; `npm run lint`; `npm run build`

**Target Platform**: Browser-only Angular SPA, offline-capable, Arabic UI, RTL layout, mobile-first responsive dashboard

**Project Type**: Angular frontend feature layered over the existing pure TypeScript analytics engine

**Performance Goals**: Heatmap renders within 2 seconds for 10,000 records; date range changes refresh all calendar views within 1 second for 10,000 records; day details popup responds within 500ms.

**Constraints**: No backend, no APIs, no authentication, no database, no IndexedDB, no SSR. No third-party calendar or heatmap library — custom CSS-grid rendering required due to RTL/Arabic constraints. ECharts and similar libraries rejected for lacking native RTL support. Avoid duplicating aggregation logic already in the engine.

**Scale/Scope**: Up to 100,000 relapse records; Phase 7 is limited to calendar and heatmap visualizations; weekday/hour patterns, trigger analytics, and urge analytics are handled in later phases.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| Angular Platform | PASS | Feature is implemented as Angular standalone components and a service with TypeScript and SCSS. No third-party library is added. |
| 100% Local-First Storage | PASS | Reads records through the existing LocalStorage repository. Introduces no remote service, alternate storage, or new persistence key. |
| Arabic Language & RTL | PASS | Heatmap, monthly calendar, popup, and summary card are planned for Arabic text, RTL column order, and SCSS-variable-driven intensity colors that respect dark/light mode. |
| Modern UI & UX | PASS | Dashboard cards include loading, data, empty, and error states. Day popup includes a dismissal mechanism. Day summary has a prompt state. Intensity classes provide accessible visual encoding. |
| Performance & Scalability | PASS | `getHeatmap()` engine runs in a single pass; intensity mapping is O(n) in records. Signal-based memoization prevents recomputation when unrelated Signals change. |
| Charting Library | PASS | No chart library is introduced for this phase. The heatmap and monthly calendar are purely CSS-grid Angular components. Constitution allows per-visualization library selection; none is needed here. |
| Architecture | PASS | Business calculations stay in `core/analytics`; all Phase 7 UI, state, and layout stay in `features/analytics/calendar`; dashboard integration uses descriptors. |
| Code Quality | PASS | Strict-typed models, a single orchestration service, reusable components, and focused unit tests are planned. |

**All gates pass. No complexity exceptions are required.**

---

## Project Structure

### Documentation (this feature)

```text
specs/007-calendar-analytics/
├── plan.md                        ← this file
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── calendar-contracts.md
├── checklists/
│   └── requirements.md
└── spec.md
```

### Source Code (repository root)

```text
src/app/core/analytics/
├── engine/
│   └── heatmap.engine.ts          EXISTING — reused as-is; extend only if month-grid helpers needed
└── index.ts                       MODIFY — export any new calendar-specific helpers if added

src/app/features/analytics/calendar/
├── calendar.component.ts          MODIFY — replace stub; route page wrapper
├── calendar.component.html        MODIFY — full-page layout: heatmap card, monthly calendar card, summary card
├── calendar.component.scss        MODIFY — responsive RTL page layout
├── models/
│   └── calendar-view.model.ts     NEW — CalendarDay, HeatmapWeek, HeatmapGrid, CalendarMonthGrid,
│                                        DayDetail, CalendarAnalyticsState
├── services/
│   └── calendar-analytics.service.ts  NEW — Signal orchestration:
│                                            state (computed), selectedDate (writable),
│                                            currentMonth (writable), setSelectedDate(), navigateMonth()
└── components/
    ├── heatmap/                   NEW — GitHub-style CSS-grid heatmap
    │   ├── heatmap.component.ts
    │   ├── heatmap.component.html
    │   └── heatmap.component.scss
    ├── monthly-calendar/          NEW — month-by-month calendar grid
    │   ├── monthly-calendar.component.ts
    │   ├── monthly-calendar.component.html
    │   └── monthly-calendar.component.scss
    ├── day-detail-popup/          NEW — dismissible overlay with full day data
    │   ├── day-detail-popup.component.ts
    │   ├── day-detail-popup.component.html
    │   └── day-detail-popup.component.scss
    └── day-summary-card/          NEW — always-visible daily summary panel
        ├── day-summary-card.component.ts
        ├── day-summary-card.component.html
        └── day-summary-card.component.scss

src/app/features/dashboard/
└── dashboard.component.ts         MODIFY — register Phase 7 card descriptors:
                                            calendar-heatmap, calendar-monthly, calendar-day-summary
```

**Structure Decision**: All calendar grid building, intensity mapping, and day-detail derivation live in `CalendarAnalyticsService`. All layout rendering, RTL grid CSS, and interaction events live in the four new component trees under `features/analytics/calendar/components/`. Dashboard integration uses the existing `DashboardCardDescriptor` descriptor pattern — no changes to the shell component are required beyond descriptor registration.

---

## Phase 0: Research

Completed in [research.md](./research.md).

Key decisions:

- Render heatmap and monthly calendar as custom Angular CSS-grid components — no third-party library — because ECharts and other heatmap/calendar libraries lack native RTL support and have Arabic text shaping bugs.
- Reuse `getHeatmap()` from the existing analytics engine for per-day count and intensity data.
- Use Angular Signals for orchestration, consistent with Phase 6.
- Classify intensity into five discrete CSS classes (`none`, `low`, `medium`, `high`, `very-high`) for accessibility and dark/light theming.
- Implement the day details popup as a custom Angular overlay component to maintain full RTL and accessibility control.

---

## Phase 1: Design & Contracts

Completed artifacts:

- [data-model.md](./data-model.md)
- [contracts/calendar-contracts.md](./contracts/calendar-contracts.md)
- [quickstart.md](./quickstart.md)

Post-design constitution check remains PASS: the design is Angular-only, local-only, RTL-capable, and preserves the engine/feature separation. No library dependency is added.

---

## Verification Plan

### Automated Tests

- `npm test -- --watch=false` for unit tests covering:
  - Intensity classification: 0 → `none`, boundary values → correct class
  - `HeatmapGrid` construction: correct week count, all 7 days per week, correct `isInActiveRange` flags
  - `CalendarMonthGrid` construction: correct day count for all months including February in leap and non-leap years, correct `leadingBlanks` and `trailingBlanks`
  - `DayDetail` derivation: correct `totalCount`, `averageUrge`, `uniqueReasons`, `notes`, `isEmpty`
  - Invalid record exclusion: records with missing/invalid dates and negative counts excluded, `invalidRecordCount` incremented
  - `CalendarAnalyticsService`: Signal recomputation on record or date range change, month navigation updates `currentMonthGrid`, day selection updates `selectedDay`
- `npm run lint` for strict TypeScript and Angular linting
- `npm run build` for production build validation

### Manual Verification

- Load records across 3+ months. Verify heatmap shows correct intensity colors, all days visible, month labels aligned to correct columns.
- Click a high-activity day: verify popup shows all records, correct total, reasons, urge, and notes.
- Click a zero-activity day: verify popup shows Arabic empty state message.
- Navigate months backward and forward: verify monthly calendar shows correct month, days, and activity indicators.
- Switch dashboard date range: verify heatmap and monthly calendar update; verify days outside the new range are visually muted.
- Test with zero records: heatmap and monthly calendar render cleanly without errors.
- Test RTL layout: heatmap weeks flow right-to-left, weekday labels align correctly, popup is RTL, summary card is RTL.
- Verify dark mode and light mode intensity colors are distinct and readable.
- Verify mobile layout at 320px width.
- Inject an invalid record in LocalStorage; verify valid records still render and `invalidRecordCount > 0`.

---

## Complexity Tracking

No constitution violations or complexity exceptions are required.
