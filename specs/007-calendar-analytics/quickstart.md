# Quickstart: Calendar Analytics (Phase 7)

## What this phase delivers

- A GitHub-style 52-week heatmap showing daily relapse intensity for the active date range
- A monthly calendar view with day-level activity indicators and month navigation
- A day details popup triggered by clicking any day cell in either view
- A persistent daily summary section showing the selected day's statistics
- Full RTL Arabic UI, dark/light mode, and dashboard card integration

## Prerequisites

Phases 1–6 must be complete. Specifically:

- `RelapseRecordRepository` — provides `records` Signal
- `DashboardFilterService` — provides `activeFilter` Signal with `startDate`/`endDate`
- `DashboardCardDescriptor` contract — used to register cards in the dashboard shell
- `getHeatmap()` — existing analytics engine function in `src/app/core/analytics/`
- `dashboard-card-shell` component — wraps each card with loading/empty/error states
- SCSS theme variables — used for intensity colors and dark/light mode

## Key files to create or modify

```
src/app/core/analytics/
└── engine/
    └── heatmap.engine.ts             MODIFY: extend with month-grid helper if needed

src/app/features/analytics/calendar/
├── calendar.component.ts             MODIFY: replace stub; becomes feature page wrapper
├── calendar.component.html           MODIFY: layout for dashboard cards
├── calendar.component.scss           MODIFY: responsive RTL layout
├── models/
│   └── calendar-view.model.ts        NEW: CalendarDay, HeatmapGrid, CalendarMonthGrid, DayDetail, CalendarAnalyticsState
├── services/
│   └── calendar-analytics.service.ts NEW: Signal orchestration
└── components/
    ├── heatmap/                       NEW: GitHub-style CSS-grid heatmap
    ├── monthly-calendar/              NEW: month-by-month calendar grid
    ├── day-detail-popup/              NEW: dismissible overlay with day data
    └── day-summary-card/              NEW: always-visible daily summary panel

src/app/features/dashboard/
└── dashboard.component.ts            MODIFY: register Phase 7 card descriptors
```

## Data flow

```
RelapseRecordRepository.records() ──┐
                                    ├──► CalendarAnalyticsService.state (computed Signal)
DashboardFilterService.activeFilter()┘       │
                                             ├──► HeatmapComponent (heatmap grid)
                                             ├──► MonthlyCalendarComponent (month grid)
                                             └──► DaySummaryCardComponent (selected day)
                                                        ↑
                               User clicks day cell ────┘ (emits date → service.selectedDate)
                                                              │
                                                              └──► DayDetailPopupComponent (overlay)
```

## Intensity color scheme (SCSS)

Define these CSS custom properties in the global theme (override per dark/light mode):

```scss
--intensity-none:      /* e.g. #ebedf0 light / #161b22 dark */
--intensity-low:       /* e.g. #9be9a8 light / #0e4429 dark */
--intensity-medium:    /* e.g. #40c463 light / #006d32 dark */
--intensity-high:      /* e.g. #30a14e light / #26a641 dark */
--intensity-very-high: /* e.g. #216e39 light / #39d353 dark */
```

## Running tests

```bash
npm test -- --watch=false   # unit tests
npm run lint                # TypeScript and Angular lint
npm run build               # production build validation
```

## Key implementation notes

1. **Heatmap grid layout**: Render 7 rows (weekdays) × N columns (weeks) using CSS Grid with `grid-template-rows: repeat(7, 1fr)` and `grid-auto-flow: column`. Apply `direction: rtl` to the container for RTL week ordering.

2. **Month navigation**: `currentMonth` is a writable Signal in the service. `previousMonth()` and `nextMonth()` methods decrement/increment it. The `currentMonthGrid` computed Signal reacts automatically.

3. **Day selection**: `selectedDate` is a writable Signal. When a day cell is clicked in either the heatmap or monthly calendar, `service.setSelectedDate(date)` is called. Both popup and summary section react to this Signal.

4. **Empty dates in monthly calendar**: `leadingBlanks` empty cells are rendered before the first day and `trailingBlanks` after the last day to complete the 7-column grid.

5. **Invalid records**: Filter out records where `date` is missing/invalid or `count < 0`. Increment `invalidRecordCount` per excluded record. Do not block the calendar from rendering.
