# Data Model: Charts & Visualization (Phase 12)

## Source Entities

Chart components are **pure UI consumers**. They do not read from storage. All data arrives via `@Input` already typed by the analytics services. The primary source types are the existing engine output types (`TimeSeriesEntry`, `DistributionEntry`, `TriggerEntry`, etc.).

---

## Shared Chart Models — `chart.models.ts` (new file)

### `ChartDataPoint`

A single labelled value in a series.

```typescript
interface ChartDataPoint {
  label: string;          // Arabic label (date string, category name, hour, etc.)
  value: number | null;   // null = gap (rendered as missing point on line charts)
}
```

### `ChartDataSeries`

An ordered collection of data points for one series.

```typescript
interface ChartDataSeries {
  label: string;            // Arabic series name shown in legend
  data: ChartDataPoint[];
  color?: string;           // optional override; defaults to palette
  fill?: boolean;           // true = area chart fill; false = line only
  hidden?: boolean;         // initial legend visibility
}
```

### `HeatmapCell`

One cell in a two-dimensional heatmap or calendar heatmap.

```typescript
interface HeatmapCell {
  rowKey: string;           // y-axis key (weekday label for calendar, hour for time heatmap)
  colKey: string;           // x-axis key (week number for calendar, weekday for time heatmap)
  value: number;            // raw numeric value
  tooltipLabelAr: string;   // pre-formatted Arabic tooltip text (e.g., "السبت 14 أغسطس: 3")
}
```

### `ChartConfig`

Declarative configuration passed alongside data.

```typescript
interface ChartConfig {
  titleAr?: string;           // Arabic chart title (optional)
  xAxisLabelAr?: string;      // Arabic x-axis label
  yAxisLabelAr?: string;      // Arabic y-axis label
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';
  aspectRatio?: number;       // height = width / aspectRatio; default 2
  showLegend?: boolean;       // default true
  showGrid?: boolean;         // default true
  exportFilename?: string;    // base filename for exported image (no extension)
  colorPalette?: string[];    // override default palette colours
  stacked?: boolean;          // for bar charts
  horizontal?: boolean;       // for bar charts (equivalent to horizontal-bar-chart input)
  smooth?: boolean;           // for line/area: tension: 0.4 vs 0 (default false)
}
```

### `ChartTheme`

Internal type used by `ChartThemeService`.

```typescript
type ChartTheme = 'light' | 'dark';

interface ChartPalette {
  background: string;
  gridLines: string;
  tickColor: string;
  tooltipBackground: string;
  tooltipText: string;
  seriesColors: string[];   // cycled for multi-series
}
```

### `ChartExportRequest`

Triggered when the user clicks an export action inside a chart component.

```typescript
interface ChartExportRequest {
  format: 'png' | 'svg';
  filename: string;         // resolved from ChartConfig.exportFilename or chart type default
  pixelRatio?: number;      // PNG only; default 2 (retina)
}
```

---

## Component Input Contracts

### Canvas-based charts (line, area, bar, horizontal-bar, pie, doughnut, histogram, scatter)

```typescript
series  = input.required<ChartDataSeries[]>();
config  = input<ChartConfig>({});
loading = input<boolean>(false);
```

### Heatmap

```typescript
cells       = input.required<HeatmapCell[]>();
rowLabels   = input.required<string[]>();   // Arabic row-axis labels (ordered)
colLabels   = input.required<string[]>();   // Arabic col-axis labels (ordered)
config      = input<ChartConfig>({});
loading     = input<boolean>(false);
```

### Calendar Heatmap

```typescript
cells       = input.required<HeatmapCell[]>();  // one per calendar day
year        = input.required<number>();          // the year to render
config      = input<ChartConfig>({});
loading     = input<boolean>(false);
```

---

## State Transitions (per chart component)

```
@Input series/cells arrives
        │
        ├─ loading === true     → render skeleton/spinner overlay
        ├─ series/cells empty   → render empty-state placeholder (Arabic message)
        └─ data present         → render Chart.js instance / CSS-grid heatmap
                │
                ├─ theme Signal changes  → update palette + chart.update()
                ├─ series Signal changes → update chart data + chart.update('active')
                └─ container resizes     → ResizeObserver → chart.resize()
```

---

## Validation Rules

| Rule | Detail |
|------|--------|
| `ChartDataPoint.value = null` | Rendered as a gap (line chart: `spanGaps: false`); treated as 0 for bar/pie |
| Empty `series[]` | Triggers empty-state; chart instance is not created |
| `HeatmapCell.value < 0` | Clamped to 0 for intensity calculation |
| `ChartConfig.aspectRatio` | Must be > 0; defaults to 2 if omitted or invalid |
| `exportFilename` | Sanitized: spaces → underscores, Arabic chars preserved as-is |
| Series `color` override | Must be a valid CSS colour string; validated via `CSS.supports('color', value)` |

---

## Mapping from Analytics Engine Outputs to Chart Inputs

| Analytics Output Type | Target Chart Component | Transformation |
|---|---|---|
| `TimeSeriesEntry[]` | `LineChartComponent` | Map to `ChartDataSeries[]` (label = date, value = count/avgUrge) |
| `DistributionEntry[]` | `BarChartComponent` | Map to `ChartDataSeries[]` (one series, label = bucket range) |
| `TriggerEntry[]` | `HorizontalBarChartComponent` | Map to `ChartDataSeries[]` (label = keyword, value = count or avgUrge) |
| `UrgeHourEntry[]` | `BarChartComponent` | Map to `ChartDataSeries[]` (label = Arabic hour, value = avgUrge) |
| `UrgeWeekdayEntry[]` | `BarChartComponent` | Map to `ChartDataSeries[]` (label = Arabic weekday, value = avgUrge) |
| `HeatmapData` (future) | `HeatmapComponent` | Map to `HeatmapCell[]` |
| Daily counts (year) | `CalendarHeatmapComponent` | Map to `HeatmapCell[]` (one per day) |
