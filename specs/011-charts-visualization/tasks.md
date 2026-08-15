# Tasks: Charts & Visualization

**Input**: Design documents from `specs/011-charts-visualization/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/chart-contracts.md ✅ | quickstart.md ✅

**Tests**: Not explicitly requested — no test tasks generated.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US4)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the shared chart model types, utilities, and the Chart.js base directive that every chart component depends on.

- [ ] T001 Create shared chart models file at `src/app/shared/components/charts/models/chart.models.ts` — define `ChartDataPoint`, `ChartDataSeries`, `HeatmapCell`, `ChartConfig`, `ChartTheme`, `ChartPalette`, `ChartExportRequest` interfaces as per data-model.md
- [ ] T002 [P] Create `src/app/shared/components/charts/utils/chart-theme.util.ts` — define `LIGHT_PALETTE` and `DARK_PALETTE` constants, `resolvePalette(theme: ChartTheme): ChartPalette` function, and set Chart.js global RTL defaults (`Chart.defaults.plugins.legend.rtl = true`, `Chart.defaults.font.family = 'inherit'`)
- [ ] T003 [P] Create `src/app/shared/components/charts/utils/chart-export.util.ts` — implement `exportAsPng(canvas: HTMLCanvasElement, filename: string, pixelRatio?: number): void` and `exportAsSvg(canvas: HTMLCanvasElement, filename: string): void` utilities using `canvas.toDataURL` + `<a download>` pattern
- [ ] T004 Create `src/app/shared/components/charts/directives/base-chart.directive.ts` — Angular `@Directive` (not a component) that encapsulates Chart.js canvas lifecycle: `init(canvas, type, data, options)`, `update(data)`, `resize()`, `destroy()` via `DestroyRef.onDestroy()`

**Checkpoint**: Foundation types, theme utilities, export utilities, and Chart.js lifecycle directive are ready. All subsequent chart components build on these.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure shared by ALL chart components — empty state, loading skeleton, and the Chart.js `effect()` reactive update pattern — must be established before any chart is built.

**⚠️ CRITICAL**: No chart component work can begin until this phase is complete.

- [ ] T005 Create reusable empty-state fragment `src/app/shared/components/charts/partials/chart-empty-state.component.ts` — standalone Angular component displaying Arabic message "لا توجد بيانات للفترة المحددة" with icon, styled for both light and dark themes
- [ ] T006 [P] Create reusable loading-skeleton component `src/app/shared/components/charts/partials/chart-loading-skeleton.component.ts` — standalone component rendering a pulsing grey rectangle sized to its container, used by all chart types
- [ ] T007 [P] Create chart card wrapper `src/app/shared/components/charts/partials/chart-card.component.ts` — standalone component providing the card shell (title, export button row, content slot via `ng-content`), wires `(exportPng)` and `(exportSvg)` outputs

**Checkpoint**: Shared partials ready. Chart component implementation can now begin (all stories unblocked).

---

## Phase 3: User Story 1 - View Time Series Charts (Priority: P1) 🎯 MVP

**Goal**: Deliver `LineChartComponent` and `AreaChartComponent` backed by Chart.js, consuming `ChartDataSeries[]` input, with RTL Arabic tooltips, dark-mode support, empty/loading states, and PNG/SVG export.

**Independent Test**: Navigate to the Time Series Analytics page → select a date range → verify a line chart renders with correct data points, a tooltip appears on hover, and the chart reflows on window resize.

### Implementation for User Story 1

- [ ] T008 [P] [US1] Create `src/app/shared/components/charts/line-chart/line-chart.component.ts` — standalone Angular component with `series = input.required<ChartDataSeries[]>()`, `config = input<ChartConfig>({})`, `loading = input<boolean>(false)`, `exported = output<ChartExportRequest>()`; uses `BaseChartDirective`; Chart.js type `'line'`; `spanGaps: false`; `tension` from `config().smooth`
- [ ] T009 [P] [US1] Create `src/app/shared/components/charts/line-chart/line-chart.component.html` — card wrapper with `<chart-card>`, conditional `<chart-loading-skeleton>`, `<chart-empty-state>`, and `<canvas>` element
- [ ] T010 [P] [US1] Create `src/app/shared/components/charts/line-chart/line-chart.component.scss` — host styles: `width: 100%`, `display: block`, aspect-ratio driven height, dark-mode SCSS variable overrides
- [ ] T011 [P] [US1] Create `src/app/shared/components/charts/area-chart/area-chart.component.ts` — mirrors `LineChartComponent` but forces `fill: true` on all series (Chart.js `fill: 'origin'`); separate selector `<app-area-chart>`
- [ ] T012 [P] [US1] Create `src/app/shared/components/charts/area-chart/area-chart.component.html` — same template pattern as line chart
- [ ] T013 [P] [US1] Create `src/app/shared/components/charts/area-chart/area-chart.component.scss`
- [ ] T014 [US1] Wire `UrgeTimeSeriesChartComponent` to use `<app-line-chart>` — update `src/app/features/analytics/urge/components/urge-time-series-chart/urge-time-series-chart.component.html` to replace placeholder with `<app-line-chart [series]="..." [config]="..."/>`, mapping `UrgeTimeSeriesView` data to `ChartDataSeries[]`

**Checkpoint**: `<app-line-chart>` and `<app-area-chart>` render real Chart.js charts. Urge time-series placeholder is replaced with a live chart.

---

## Phase 4: User Story 2 - View Distribution Charts (Priority: P2)

**Goal**: Deliver `BarChartComponent`, `HorizontalBarChartComponent`, `PieChartComponent`, and `DoughnutChartComponent` — covering all distribution/category visualization needs of the analytics dashboards.

**Independent Test**: Navigate to Urge Distribution → verify a bar chart renders with all 10 urge levels labeled, interactive legend, and empty-state message when no data.

### Implementation for User Story 2

- [ ] T015 [P] [US2] Create `src/app/shared/components/charts/bar-chart/bar-chart.component.ts` — Chart.js type `'bar'`; supports `config().stacked` and `config().horizontal`; `indexAxis: 'x'` by default; inputs: `series`, `config`, `loading`, output `exported`
- [ ] T016 [P] [US2] Create `src/app/shared/components/charts/bar-chart/bar-chart.component.html`
- [ ] T017 [P] [US2] Create `src/app/shared/components/charts/bar-chart/bar-chart.component.scss`
- [ ] T018 [P] [US2] Create `src/app/shared/components/charts/horizontal-bar-chart/horizontal-bar-chart.component.ts` — thin wrapper over `BarChartComponent` logic with `indexAxis: 'y'` forced; selector `<app-horizontal-bar-chart>`
- [ ] T019 [P] [US2] Create `src/app/shared/components/charts/horizontal-bar-chart/horizontal-bar-chart.component.html`
- [ ] T020 [P] [US2] Create `src/app/shared/components/charts/horizontal-bar-chart/horizontal-bar-chart.component.scss`
- [ ] T021 [P] [US2] Create `src/app/shared/components/charts/pie-chart/pie-chart.component.ts` — Chart.js type `'pie'`; legend `position` from `config().legendPosition` (default `'bottom'`); RTL-aware
- [ ] T022 [P] [US2] Create `src/app/shared/components/charts/pie-chart/pie-chart.component.html`
- [ ] T023 [P] [US2] Create `src/app/shared/components/charts/pie-chart/pie-chart.component.scss`
- [ ] T024 [P] [US2] Create `src/app/shared/components/charts/doughnut-chart/doughnut-chart.component.ts` — Chart.js type `'doughnut'`; `cutout: '65%'`; legend and tooltip identical to pie chart
- [ ] T025 [P] [US2] Create `src/app/shared/components/charts/doughnut-chart/doughnut-chart.component.html`
- [ ] T026 [P] [US2] Create `src/app/shared/components/charts/doughnut-chart/doughnut-chart.component.scss`
- [ ] T027 [US2] Wire Urge analytics distribution sub-components — update `src/app/features/analytics/urge/components/urge-distribution-chart/urge-distribution-chart.component.html` to replace placeholder with `<app-bar-chart>`, mapping `DistributionEntry[]` to `ChartDataSeries[]`
- [ ] T028 [US2] Wire Urge by-hour and by-weekday sub-components — update `urge-by-hour-chart.component.html` and `urge-by-weekday-chart.component.html` to use `<app-bar-chart>` with mapped `UrgeHourEntry[]` / `UrgeWeekdayEntry[]` data

**Checkpoint**: Bar, horizontal bar, pie, and doughnut charts all render. All 4 Phase-10 placeholder sub-components now display real charts.

---

## Phase 5: User Story 3 - View Heatmap & Calendar Charts (Priority: P3)

**Goal**: Deliver `HeatmapComponent` (7×24 grid) and `CalendarHeatmapComponent` (53-week year view) using custom CSS-grid SCSS rendering — no Chart.js.

**Independent Test**: Navigate to Calendar Analytics → verify days are color-coded by relapse count, the 5-step intensity scale renders visually, and hovering a cell shows an Arabic tooltip with date and count.

### Implementation for User Story 3

- [ ] T029 [P] [US3] Create `src/app/shared/components/charts/heatmap/heatmap.component.ts` — standalone component; inputs: `cells = input.required<HeatmapCell[]>()`, `rowLabels = input.required<string[]>()`, `colLabels = input.required<string[]>()`, `config`, `loading`, output `exported`; computes `intensityMap` signal (maps value → 0–4 intensity level) and `maxValue` signal; `dir="rtl"` on host
- [ ] T030 [P] [US3] Create `src/app/shared/components/charts/heatmap/heatmap.component.html` — CSS grid layout: row labels column + cell grid; each cell is `<div class="cell intensity-N" [attr.title]="cell.tooltipLabelAr">`; `<chart-loading-skeleton>` and `<chart-empty-state>` guards; export button
- [ ] T031 [P] [US3] Create `src/app/shared/components/charts/heatmap/heatmap.component.scss` — CSS grid (columns = colLabels count + 1); `.cell` base styles; `.intensity-0` through `.intensity-4` with SCSS vars `--intensity-0` to `--intensity-4`; dark-mode overrides; hover tooltip via CSS `[title]` or a small `::after` pseudo-element
- [ ] T032 [P] [US3] Create `src/app/shared/components/charts/calendar-heatmap/calendar-heatmap.component.ts` — standalone component; inputs: `cells = input.required<HeatmapCell[]>()`, `year = input.required<number>()`, `config`, `loading`, output `exported`; `calendarGrid` computed signal that builds a `WeekColumn[]` structure (53 columns × 7 rows) filling missing days with `value: 0`; Arabic month labels computed
- [ ] T033 [P] [US3] Create `src/app/shared/components/charts/calendar-heatmap/calendar-heatmap.component.html` — 53-column CSS grid with month labels row above; day-name labels (ح ن ث ع خ ج س) on right side (RTL); each day `<div>` with `intensity-N` class and Arabic `[title]`; overflow-x scroll on mobile
- [ ] T034 [P] [US3] Create `src/app/shared/components/charts/calendar-heatmap/calendar-heatmap.component.scss` — grid layout; `.intensity-0..4` colour scale using CSS custom properties; responsive overflow-x; dark-mode overrides; colour legend strip at bottom

**Checkpoint**: Both heatmap components render correctly. Calendar heatmap shows a full year grid with correct intensity coloring. Standard heatmap renders a 7×24 weekday/hour grid.

---

## Phase 6: User Story 4 - Export Chart as Image (Priority: P4)

**Goal**: Make the export actions in all 10 chart components functional — PNG via canvas `toDataURL`, SVG via DOM serialization for heatmaps and bitmap-wrapped SVG for canvas charts.

**Independent Test**: Render any chart → click "تصدير PNG" → verify a file downloads with a correct filename and matching visual content.

### Implementation for User Story 4

- [ ] T035 [US4] Finalize `src/app/shared/components/charts/utils/chart-export.util.ts` — implement `exportAsSvgFromDom(element: HTMLElement, filename: string): void` for heatmap components using `XMLSerializer` on a cloned DOM node with inlined computed styles; verify `exportAsPng` works correctly with `pixelRatio: 2`
- [ ] T036 [US4] Wire export in `src/app/shared/components/charts/partials/chart-card.component.ts` — connect "تصدير PNG" and "تصدير SVG" button clicks to `chartExportUtil.exportAsPng()` / `exportAsSvg()`, accepting a `canvasRef` or `hostRef` signal-forwarded from the parent chart component
- [ ] T037 [US4] Update all 8 canvas-based chart components to forward their `ElementRef<HTMLCanvasElement>` to `chart-card` for export — add `@ViewChild('chartCanvas') canvasRef` and pass to `ChartCardComponent` via a content-projection or `@Input` approach (choose: `@Input() exportTarget = input<HTMLElement>()` on `ChartCardComponent`)
- [ ] T038 [US4] Update both heatmap components to forward their host `ElementRef` to `chart-card` for SVG DOM serialization export

**Checkpoint**: All 10 chart components have working PNG and SVG export. Downloaded files match on-screen charts in both light and dark modes.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Dark-mode reactive updates, ResizeObserver responsiveness, Arabic RTL final review, and empty/loading edge case hardening.

- [ ] T039 Create `src/app/shared/components/charts/services/chart-theme.service.ts` — lightweight singleton Angular `@Injectable` that exposes `theme = signal<ChartTheme>('light')`, reads `document.documentElement.getAttribute('data-theme')` on init, and uses `MutationObserver` to update the signal when the attribute changes
- [ ] T040 [P] Update all 8 canvas-based chart components to `inject(ChartThemeService)` and add an `effect(() => { updateChartColors(this.chartInstance, resolvePalette(theme())); this.chartInstance.update(); })` for live dark/light transitions
- [ ] T041 [P] Update both heatmap components to `inject(ChartThemeService)` and use `[attr.data-theme]` binding on the host so SCSS `--intensity-N` vars re-resolve on theme change
- [ ] T042 [P] Add `ResizeObserver` to all 8 canvas-based chart components — observe the host `<div>` container and call `chartInstance.resize()` on size changes; clean up observer in `DestroyRef.onDestroy()`
- [ ] T043 [P] Final RTL audit — review all chart component templates for correct `dir="rtl"`, Arabic placeholder text ("لا توجد بيانات للفترة المحددة"), Arabic export button labels ("تصدير PNG", "تصدير SVG"), and tooltip text direction
- [ ] T044 [P] Edge case hardening — ensure all components handle: single-point datasets (no crash on line chart), all-zero pie/doughnut (show empty-state), `null` values in `ChartDataSeries.data` (rendered as gaps), container width < 200px (chart scrolls horizontally, does not break layout)

**Checkpoint**: All 10 chart components are production-ready. Dark/light switching is live, responsive layout works at all breakpoints, RTL is consistent, and edge cases are handled gracefully.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — can start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — BLOCKS all chart components
- **Phases 3–6 (User Stories)**: All depend on Phase 2; stories can run in priority order or in parallel
- **Phase 7 (Polish)**: Depends on all story phases being complete

### User Story Dependencies

- **US1 (P1)**: Starts after Phase 2 — no dependency on other stories
- **US2 (P2)**: Starts after Phase 2 — no dependency on US1 (different components)
- **US3 (P3)**: Starts after Phase 2 — no dependency on US1/US2 (different renderer)
- **US4 (P4)**: Depends on US1+US2+US3 complete — export wires into all chart cards

### Within Each User Story

- Models/types (Phase 1) before component creation
- Directive (T004) before any canvas chart component
- Partials (Phase 2) before any chart component that renders them
- Canvas components (US1/US2): `.ts` → `.html` → `.scss` order within each component
- Heatmap components (US3): SCSS grid design should be drafted before `.html` cell structure

### Parallel Opportunities

- T002, T003 (Phase 1) — parallel
- T005, T006, T007 (Phase 2) — parallel after T001/T004
- T008–T013 within US1 — all 6 files parallel (different files)
- T015–T026 within US2 — all 12 files parallel (different components)
- T029–T034 within US3 — all 6 files parallel (different components)
- T040, T041, T042, T043, T044 (Phase 7) — all parallel

---

## Parallel Example: User Story 1

```
Parallel execution (all at once):
  Task T008: line-chart.component.ts
  Task T009: line-chart.component.html
  Task T010: line-chart.component.scss
  Task T011: area-chart.component.ts
  Task T012: area-chart.component.html
  Task T013: area-chart.component.scss

Then sequential:
  Task T014: wire UrgeTimeSeriesChartComponent (depends on T008–T010 complete)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T004)
2. Complete Phase 2: Foundational (T005–T007)
3. Complete Phase 3: User Story 1 — Line & Area Charts (T008–T014)
4. **STOP and VALIDATE**: Time Series Analytics page shows real Chart.js line chart

### Incremental Delivery

1. Phase 1 + 2 → Foundation ready
2. Phase 3 (US1) → Line/Area charts live → Replace time-series placeholder ✅
3. Phase 4 (US2) → Bar/Pie/Doughnut charts live → Replace distribution placeholders ✅
4. Phase 5 (US3) → Heatmap + Calendar live ✅
5. Phase 6 (US4) → Export working across all charts ✅
6. Phase 7 → Polish, dark mode, RTL final ✅

---

## Notes

- `[P]` tasks operate on different files — safe to execute in parallel
- `[Story]` label maps each task to its spec.md user story for traceability
- Arabic strings: use the exact text from research.md / contracts (`"لا توجد بيانات للفترة المحددة"`, `"تصدير PNG"`, etc.)
- Chart.js global config (RTL, font) MUST be set in `chart-theme.util.ts` before any `Chart` instance is created — ensure it is imported early (e.g., in app initializer or in `base-chart.directive.ts` at module load time)
- Heatmap SVG export: clone the host element, inline `getComputedStyle()` for `.cell` and intensity classes before serializing — CSS custom properties do not survive `XMLSerializer` without inlining
- All 44 tasks must be checked off before `/speckit-implement` is run
