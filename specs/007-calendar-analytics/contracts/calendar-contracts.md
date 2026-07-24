# Contracts: Calendar Analytics

This feature has no backend or external API contracts. All contracts are internal Angular UI/service contracts and must remain compatible with the dashboard shell established in Phase 5.

---

## Dashboard Card Registration Contract

Calendar analytics cards must be registered with the dashboard through `DashboardCardDescriptor`.

```ts
interface DashboardCardDescriptor {
  id: string;
  titleAr: string;
  component: Type<unknown>;
  defaultOrder: number;
}
```

### Required Card IDs

| Card ID | Purpose | Primary Requirements |
|---------|---------|----------------------|
| `calendar-heatmap` | GitHub-style 52-week heatmap | FR-001, FR-002, FR-003, FR-006, FR-007, FR-017 |
| `calendar-monthly` | Monthly calendar with navigation | FR-004, FR-005, FR-006, FR-007 |
| `calendar-day-summary` | Always-visible daily summary section | FR-011, FR-012 |

### Registration Rules

- Card IDs must be stable across releases so user layout preferences remain valid.
- Card titles must be in Arabic.
- Cards must support dashboard shell loading, empty, data, and error states.

---

## CalendarAnalyticsService Contract

The feature orchestration service derives all Phase 7 view state from local records and the active dashboard date range.

```ts
type CalendarStatus = 'loading' | 'empty' | 'data' | 'error';
type IntensityLevel = 'none' | 'low' | 'medium' | 'high' | 'very-high';

interface CalendarDay {
  date: string;                  // YYYY-MM-DD
  count: number;
  averageUrge: number | null;
  reasons: string[];
  notes: string[];
  intensity: IntensityLevel;
  intensityValue: number;        // 0–1 normalized
  isInActiveRange: boolean;
  isToday: boolean;
}

interface HeatmapWeek {
  weekIndex: number;
  days: CalendarDay[];           // always 7 entries
}

interface MonthLabel {
  monthIndex: number;            // 1–12
  weekIndex: number;             // column index in heatmap grid
  labelAr: string;               // Arabic abbreviated month name
}

interface HeatmapGrid {
  weeks: HeatmapWeek[];
  rangeStart: string;
  rangeEnd: string;
  activeRangeStart: string;
  activeRangeEnd: string;
  maxDayCount: number;
  monthLabels: MonthLabel[];
}

interface CalendarMonthGrid {
  year: number;
  month: number;
  labelAr: string;
  days: CalendarDay[];
  leadingBlanks: number;
  trailingBlanks: number;
  hasActivity: boolean;
}

interface DayDetail {
  date: string;
  labelAr: string;
  totalCount: number;
  averageUrge: number | null;
  uniqueReasons: string[];
  notes: string[];
  records: RelapseRecord[];
  isEmpty: boolean;
}

interface CalendarAnalyticsState {
  status: CalendarStatus;
  heatmapGrid: HeatmapGrid;
  currentMonthGrid: CalendarMonthGrid;
  selectedDay: DayDetail | null;
  selectedDate: string | null;
  currentMonth: { year: number; month: number };
  rangeStart: string;
  rangeEnd: string;
  invalidRecordCount: number;
  errorMessageAr: string | null;
}
```

### Service Behavior

- Expose a readonly `Signal<CalendarAnalyticsState>` named `state`.
- Expose a writable `Signal<string | null>` named `selectedDate` for day selection.
- Expose a writable `Signal<{ year: number; month: number }>` named `currentMonth` for month navigation.
- Recompute `heatmapGrid` and `currentMonthGrid` when records or the active date range change.
- Recompute `selectedDay` when `selectedDate` changes.
- Exclude invalid records (missing or invalid `date`, negative `count`) from calculations and increment `invalidRecordCount`.
- Return `'empty'` status when no valid records exist in the active range.
- Return `'error'` only when valid local data cannot be read or transformed.

---

## Heatmap Component Contract

The heatmap component receives a fully-prepared `HeatmapGrid` and renders it as a CSS grid without performing any data calculations.

```ts
// Input bindings for HeatmapComponent
interface HeatmapInputs {
  grid: HeatmapGrid;
  emptyMessageAr: string;
}

// Output events
interface HeatmapOutputs {
  daySelected: EventEmitter<string>;   // emits YYYY-MM-DD on cell click
}
```

### Heatmap Rules

- Render exactly 7 rows (one per weekday) and one column per week in `grid.weeks`.
- Apply the `CalendarDay.intensity` class to each cell for SCSS-driven color theming.
- Cells where `isInActiveRange === false` must use a visually distinct muted style.
- Emit `daySelected` with the clicked date string on cell click or keyboard activation.
- Display month labels above the grid columns using `grid.monthLabels`.
- Support RTL layout via CSS `direction: rtl` on the grid container.
- Provide a tooltip showing `count` and `labelAr` on hover/focus.
- Show `emptyMessageAr` when `grid.weeks` is empty.

---

## Monthly Calendar Component Contract

The monthly calendar component receives a `CalendarMonthGrid` and renders a 7-column day-of-week grid.

```ts
interface MonthlyCalendarInputs {
  monthGrid: CalendarMonthGrid;
  selectedDate: string | null;
  emptyMessageAr: string;
}

interface MonthlyCalendarOutputs {
  daySelected: EventEmitter<string>;   // emits YYYY-MM-DD on cell click
  previousMonth: EventEmitter<void>;
  nextMonth: EventEmitter<void>;
}
```

### Monthly Calendar Rules

- Render a header row with Arabic abbreviated weekday names in RTL order.
- Render leading and trailing blank cells to complete the grid rows.
- Apply `CalendarDay.intensity` class to each day cell.
- Highlight the `selectedDate` cell with a distinct selection style.
- Emit `daySelected`, `previousMonth`, and `nextMonth` on user interaction.
- Show `emptyMessageAr` when `monthGrid.hasActivity === false`.

---

## Day Details Popup Contract

The day details popup receives a `DayDetail` and renders as an overlay.

```ts
interface DayDetailPopupInputs {
  detail: DayDetail | null;
  isOpen: boolean;
}

interface DayDetailPopupOutputs {
  dismissed: EventEmitter<void>;
}
```

### Popup Rules

- Render only when `isOpen === true` and `detail !== null`.
- Display: date label, total count, average urge, unique reasons, notes, individual records.
- Show a friendly Arabic empty state when `detail.isEmpty === true`.
- Dismiss on backdrop click, Escape key, or close button click — emit `dismissed` in all cases.
- Must not cause layout shift to the calendar behind the popup on open/close.
- Must be RTL and fully accessible (focus trap, ARIA dialog role).

---

## Daily Summary Card Contract

The daily summary section receives `DayDetail | null` and renders as a persistent panel.

```ts
interface DailySummaryInputs {
  detail: DayDetail | null;
  emptyPromptAr: string;
}
```

### Summary Rules

- Display a prompt (`emptyPromptAr`) when `detail` is `null`.
- Display `date`, `totalCount`, `averageUrge`, `uniqueReasons`, and `notes` when `detail` is not `null`.
- Update immediately (Signal-driven, no async delay) when the selected day changes.
- Show an empty state when `detail.isEmpty === true`.

---

## Acceptance Coverage

| Requirement | Contract Coverage |
|-------------|-------------------|
| FR-001 – FR-003, FR-017 | `HeatmapGrid` model + heatmap component contract |
| FR-004 – FR-006 | `CalendarMonthGrid` model + monthly calendar component contract |
| FR-007 | `daySelected` output from both heatmap and monthly calendar components |
| FR-008 – FR-010 | `DayDetail` model + day details popup contract |
| FR-011 – FR-012 | `DailySummaryInputs` contract + service `selectedDate` Signal |
| FR-013 | Service recomputation on date range Signal change |
| FR-014 | Service `'empty'` state for zero-record datasets |
| FR-015 | Service `invalidRecordCount` and exclusion behavior |
| FR-016 | Dashboard card registration contract |
