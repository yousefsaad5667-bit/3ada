# Research: Charts & Visualization (Phase 12)

## Overview

Phase 12 introduces the actual charting layer for the Habit Tracker. The key decisions are: which rendering engine to use per chart type, how to integrate Chart.js with Angular 19 Signals, how to implement RTL/Arabic support, and how to architect a consistent API across all 10 chart types. All existing analytics services already produce the right data shapes — no engine changes are needed.

---

## 1. Charting Library Selection

**Decision**: Use **Chart.js 4** (already installed as `"chart.js": "^4.5.1"`) directly for 8 of the 10 chart types. Use a **custom SCSS+Angular CSS-grid renderer** for the standard heatmap and the calendar heatmap.

**Rationale**:
- Chart.js 4 covers line, area, bar (vertical + horizontal), pie, doughnut, histogram (via bar with custom bin data), and scatter natively.
- Chart.js heatmap support does not exist in the core library. Third-party plugins (`chartjs-chart-matrix`) add it but are poorly maintained and have no RTL support.
- A CSS-grid heatmap delivers better RTL behaviour, is zero-dependency, and renders faster than a canvas-based cell grid for the sizes used in this app (max ~365 cells for calendar, max ~168 for 7×24 hour heatmap).
- No additional npm packages are required.

**Alternatives considered**:
- `ngx-charts` — rejected: large bundle, no RTL support, poor dark-mode API.
- `Apache ECharts` (`ngx-echarts`) — considered seriously for heatmap support, but adds ~700 KB to bundle vs. zero cost for CSS-grid renderer.
- `chartjs-chart-matrix` — rejected: last maintained 2022, no RTL, no dark mode.
- `D3.js` — powerful but high complexity and large learning cost for contributors.

---

## 2. Angular Integration Strategy (No Wrapper Library)

**Decision**: Integrate Chart.js directly via `ElementRef<HTMLCanvasElement>` inside `AfterViewInit`. Use `DestroyRef.onDestroy()` to call `chart.destroy()`. No third-party Angular Chart.js wrapper (`ng2-charts`, `ngx-chartjs`, etc.) is used.

**Rationale**:
- Angular 19 Signals + `effect()` make reactive updates straightforward without an external wrapper.
- Wrapper libraries add abstraction overhead and often lag behind Chart.js releases.
- `DestroyRef` (Angular 16+) is the idiomatic modern teardown mechanism — no `ngOnDestroy` boilerplate.
- A single shared `BaseChartDirective` (a non-visual `@Directive`) abstracts the Chart.js lifecycle for the 8 canvas-based components.

**Pattern**:
```typescript
// Base pattern used by all Chart.js-backed components
effect(() => {
  const data = this.series(); // input signal
  if (this.chartInstance) {
    this.chartInstance.data = buildChartData(data);
    this.chartInstance.update('active');
  }
});
```

---

## 3. RTL & Arabic Support

**Decision**:
- Set `canvas` direction via `Chart.defaults.plugins.legend.rtl = true` globally in `chart-theme.util.ts`.
- All Arabic label strings are passed in by the consuming component (already produced in Arabic by the analytics services).
- Chart.js tooltip and legend text direction is forced via `Chart.defaults.font.family = 'inherit'` and the `rtl: true` plugin option.
- For the CSS-grid heatmaps: axis labels are Arabic strings; layout uses `dir="rtl"` on the host element.

**Alternatives considered**:
- Per-instance RTL config — rejected: global default is simpler and consistent across all instances.

---

## 4. Dark Mode Integration

**Decision**: Chart colours are resolved at render time by reading the application's current theme. A `ChartThemeService` (lightweight, singleton) exposes a `theme` Signal (`'dark' | 'light'`) that chart components `effect()`-watch. On theme change, `chart.update()` is called with a new colour palette.

**Palette strategy**:
- Light mode: neutral background `#ffffff`, grid lines `#e5e7eb`, primary colour `#6366f1`.
- Dark mode: background `#1e1e2e`, grid lines `#374151`, primary colour `#818cf8`.
- Palette constants defined in `chart-theme.util.ts`; each chart component references them — no inline colour strings.

---

## 5. Responsive Layout

**Decision**: Use `ResizeObserver` on the chart container `<div>` to call `chart.resize()`. Chart.js `responsive: true` and `maintainAspectRatio: false` are set on all instances. Container `<div>` uses `width: 100%; height: 100%`.

**Rationale**: Angular's change detection does not fire on viewport resize. `ResizeObserver` is the correct browser API; Chart.js has built-in support but relies on its own resize polling which can be delayed. Using `ResizeObserver` directly gives immediate response.

---

## 6. Export (PNG & SVG)

**Decision**:
- **PNG**: Call `canvas.toDataURL('image/png')` and trigger a download via a temporary `<a>` element.
- **SVG**: For Chart.js charts, use the [`chartjs-to-image`-less approach] — serialize the canvas to a data URL and embed in an `<svg>` `<image>` element, then serialize the SVG. This is a bitmap-in-SVG approach, not true vector SVG, but avoids the complexity of canvas-to-SVG transpilation.
- For CSS-grid heatmaps: use `dom-to-image`-free approach — inline `html2canvas`-free serialization: clone the heatmap DOM node, inline computed styles, and serialize via `XMLSerializer`. This produces a true SVG for the heatmap.

**Constraints**: No server-side rendering. All export is synchronous browser operations.

**Alternatives considered**:
- `html2canvas` — rejected: large bundle, inconsistent RTL rendering.
- `jsPDF` — out of scope (PDF not requested in spec).

---

## 7. Consistent API Design

**Decision**: All 10 chart components accept the following `@Input` signals (using the Angular 19 `input()` function):

```typescript
series   = input.required<ChartDataSeries[]>();  // data
config   = input<ChartConfig>({});               // labels, palette, aspect ratio, etc.
loading  = input<boolean>(false);
```

The heatmap components additionally accept:
```typescript
cells    = input.required<HeatmapCell[]>();  // replaces series
```

This satisfies SC-008: ≤3 inputs needed for a basic chart (data + config + optional loading).

---

## 8. Placeholder Replacement in Analytics Sub-Components

**Decision**: In this phase, the 4 Phase-10 analytics sub-components that currently render placeholder HTML tables/bars are updated to use the new chart components. Only the template is changed; the `@Input` data binding and service layer remain untouched.

**Mapping**:
| Analytics Component | Chart Component Used |
|---|---|
| `UrgeTimeSeriesChartComponent` | `<app-line-chart>` |
| `UrgeDistributionChartComponent` | `<app-bar-chart>` |
| `UrgeByHourChartComponent` | `<app-bar-chart>` |
| `UrgeByWeekdayChartComponent` | `<app-bar-chart>` |

---

## 9. Histogram Implementation

**Decision**: Implement histogram as a Bar Chart with pre-binned data. The histogram component accepts `series` in `ChartDataSeries[]` format where the consumer has already computed bucket boundaries and counts. The component does not perform binning itself.

**Rationale**: Consistent with the "chart components are pure renderers" principle. The Analytics Engine (Phase 4) is responsible for aggregation. The histogram component renders whatever bucket data it receives.

---

## 10. Calendar Heatmap Layout

**Decision**: The calendar heatmap renders a 53-week × 7-day CSS grid (same layout as GitHub contributions). Weeks run left-to-right (LTR inside the grid even in RTL contexts) with month labels above; day labels (Arabic: ح، ن، ث، ع، خ، ج، س) on the right side (RTL-appropriate).

**Cell intensity**: 5-step colour scale (0 = lightest, 4 = darkest). Thresholds computed dynamically from the dataset's min/max. Implemented as CSS custom properties (`--intensity-0` through `--intensity-4`) driven by the theme.
