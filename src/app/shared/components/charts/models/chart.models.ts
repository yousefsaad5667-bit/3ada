// ─────────────────────────────────────────────────────────────────────────────
// Shared Chart Models — charts/models/chart.models.ts
// All chart components are pure UI consumers; data arrives via @Input signals.
// ─────────────────────────────────────────────────────────────────────────────

/** A single labelled value in a series. `null` value = gap (rendered as missing point). */
export interface ChartDataPoint {
  label: string;        // Arabic label (date string, category name, hour, etc.)
  value: number | null; // null = gap
}

/** An ordered collection of data points for one series. */
export interface ChartDataSeries {
  label: string;         // Arabic series name shown in legend
  data: ChartDataPoint[];
  color?: string;        // optional override; defaults to palette
  fill?: boolean;        // true = area chart fill (fill: 'origin')
  hidden?: boolean;      // initial legend visibility
}

/** One cell in a two-dimensional heatmap or calendar heatmap. */
export interface HeatmapCell {
  rowKey: string;          // y-axis key
  colKey: string;          // x-axis key
  value: number;           // raw numeric value
  tooltipLabelAr: string;  // pre-formatted Arabic tooltip text
}

/** Declarative configuration passed alongside data. */
export interface ChartConfig {
  titleAr?: string;
  xAxisLabelAr?: string;
  yAxisLabelAr?: string;
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';
  aspectRatio?: number;      // height = width / aspectRatio; default 2
  showLegend?: boolean;      // default true
  showGrid?: boolean;        // default true
  exportFilename?: string;   // base filename for exported image (no extension)
  colorPalette?: string[];   // override default palette colours
  stacked?: boolean;         // for bar charts
  horizontal?: boolean;      // for bar charts
  smooth?: boolean;          // line/area tension: 0.4 vs 0
}

/** Internal theme type used by ChartThemeService. */
export type ChartTheme = 'light' | 'dark';

/** Colour palette resolved for a given theme. */
export interface ChartPalette {
  background: string;
  gridLines: string;
  tickColor: string;
  tooltipBackground: string;
  tooltipText: string;
  seriesColors: string[]; // cycled for multi-series
}

/** Triggered when the user clicks an export action inside a chart component. */
export interface ChartExportRequest {
  format: 'png' | 'svg';
  filename: string;      // resolved from ChartConfig.exportFilename or chart-type default
  pixelRatio?: number;   // PNG only; default 2 (retina)
}
