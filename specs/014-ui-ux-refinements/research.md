# Research: UI/UX Refinements

## 1. Elapse Color Fix

### Finding
The `trend-summary-card.component.scss` .decreasing class uses `var(--success-color, #22c55e)` (green) to indicate fewer relapses = positive.
However, the change request treats the elapsed/progress indicator in a **bad-habit context** where green is semantically wrong.

Multiple other components (urge charts, trend table) also hardcode `--success-color` with a `#22c55e` fallback.

### Decision
- Add a new semantic token `--color-elapse-indicator` to `_themes.scss` with an amber/orange value that clearly reads as "alerting" not "rewarding".
- Map `.decreasing` in trend-summary-card to use this token instead.
- Keep `--success-color` for genuinely positive contexts (e.g., decreasing urge intensity).

**Rationale**: A single new token avoids touching every existing success usage while fixing the semantics where it matters.

---

## 2. Card Drag Removal

### Finding
- `dashboard.component.html`: `cdkDropList` on the grid, `cdkDrag` on every `.dashboard-grid-item`
- `dashboard.component.ts`: imports `DragDropModule`, `CdkDragDrop`, `moveItemInArray`; has `onDrop()` handler
- `dashboard-card-shell.component.html`: card header has class `cdk-drag-handle`
- `dashboard-card-shell.component.scss`: `.card-header { cursor: grab; }` and `&:active { cursor: grabbing; }`

### Decision
- Remove `cdkDropList`, `cdkDrag` directives from the dashboard template
- Remove `DragDropModule` from the dashboard imports array
- Remove `onDrop()` method and its CDK imports from `dashboard.component.ts`
- Remove `cdk-drag-handle` class from the card shell header template
- Remove `cursor: grab` / `cursor: grabbing` from card shell SCSS

**Rationale**: The `DashboardLayoutService.reorderCards()` can stay — it may be useful for a future explicit reorder UI. Only the implicit drag interaction is removed.

---

## 3. Theme Token Alignment

### Finding
`_themes.scss` already defines `--color-bg-card` (dark: `#1e293b`, light: `#ffffff`) but:
- `dashboard-card-shell.component.scss` uses `--surface-color` (not in themes) falling back to hardcoded `#ffffff`
- The card header background also uses `--surface-color`

Other components use ad-hoc `--bg-surface-secondary`, `--text-muted`, etc. as custom property names that don't exist in `_themes.scss`.

### Decision
- In `dashboard-card-shell.component.scss`: replace `var(--surface-color, #ffffff)` with `var(--color-bg-card)`
- Add any missing semantic aliases to `_themes.scss` (both light and dark blocks):
  - `--color-surface` → alias for `--color-bg-card` for backward compat with components that already use it
  - `--color-text-muted` → a muted text value
  - `--color-bg-surface-secondary` → slightly elevated surface
- This covers the card shell and any other components already referencing these token names

**Rationale**: Using the existing token system avoids a big refactor. Adding aliases is safe and non-breaking.

---

## 4. Global Date Filter

### Finding
- `DashboardFilterService` is already `providedIn: 'root'` — it is effectively a singleton accessible app-wide.
- `DateRangeSelectorComponent` injects `DashboardFilterService` directly.
- The component is only rendered inside `dashboard.component.html`.
- All 9 analytics services (`PatternAnalyticsService`, `TriggerAnalyticsService`, etc.) already inject `DashboardFilterService` — they respond to filter changes automatically.

### Decision
- Move `<app-date-range-selector>` from `dashboard.component.html` to `header.component.html`
- Add `DateRangeSelectorComponent` to `HeaderComponent` imports
- Remove `DateRangeSelectorComponent` from `DashboardComponent` imports
- Remove `<app-date-range-selector>` from dashboard template (and its wrapping header `div`)

**Rationale**: Zero service changes required — the filter service is already global. Only the UI component placement changes. This delivers immediate cross-view filter consistency.

---

## 5. Large Date Range Handling

### Finding
Charts (bar charts, line charts) and heatmaps are rendered inline without scroll containers. When 90+ date points are plotted:
- Bar chart columns compress to sub-pixel width or overflow the flex container
- The hour-weekday heatmap's 24 × 7 grid with 90-day labeling breaks container boundaries

The chart library (inspected via component SCSS) uses fixed-width internal canvases/SVGs that don't auto-compress.

### Decision
- Wrap chart canvases in a `div.chart-scroll-container { overflow-x: auto; }` inside each affected chart component's template/SCSS
- For the hour-weekday heatmap, set a `min-width` on the inner grid so cells remain readable while the outer container scrolls
- No data aggregation required as the first pass — scrolling is sufficient and preserves data fidelity

**Rationale**: Overflow-x scrolling is the lowest-risk, zero-logic-change approach. Aggregation adds complexity and changes what the user sees.

---

## 6. Smart Wrapper Components for Broken Analytics Cards

### Finding (root cause confirmed)
`DashboardCardShellComponent.ngOnInit()` calls `container.createComponent(this.componentType)` but never sets any `@Input()` values on the resulting `ComponentRef`. Working cards (e.g., `DailySeriesCardComponent`) self-inject `TimeSeriesAnalyticsService`; broken cards accept data only via `@Input`.

### Decision
**Option A** (spec assumption): Create nine thin smart wrapper components. Each:
- Injects the appropriate analytics service
- Exposes `cardState` signal (shell contract)
- Renders the original dumb component passing signals/computed values as `@Input`
- Replaces the dumb component reference in `CARD_REGISTRY` inside `dashboard.component.ts`

**Nine wrappers grouped by service:**

| Wrapper (new) | Dumb component (existing) | Service |
|---|---|---|
| `WeekdayChartCardComponent` | `WeekdayChartComponent` | `PatternAnalyticsService` |
| `HourlyChartCardComponent` | `HourlyChartComponent` | `PatternAnalyticsService` |
| `PeriodSplitCardWrapperComponent` | `PeriodSplitCardComponent` | `PatternAnalyticsService` |
| `HourWeekdayHeatmapCardComponent` | `HourWeekdayHeatmapComponent` | `PatternAnalyticsService` |
| `PatternSummaryCardWrapperComponent` | `PatternSummaryCardComponent` | `PatternAnalyticsService` |
| `TriggerRankingCardComponent` | `TriggerRankingListComponent` | `TriggerAnalyticsService` |
| `TriggerSummaryCardWrapperComponent` | `TriggerSummaryCardComponent` | `TriggerAnalyticsService` |
| `TriggerTimelineCardComponent` | `TriggerTimelineComponent` | `TriggerAnalyticsService` |
| `TriggerDistributionCardComponent` | `TriggerDistributionChartComponent` | `TriggerAnalyticsService` |

**Rationale**: Option A preserves the dumb components (used in standalone analytics pages like `PatternsComponent` and `TriggersComponent`). Converting them to smart components would break those page-level usages.
