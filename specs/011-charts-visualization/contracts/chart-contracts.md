# UI Contracts: Charts & Visualization

## Overview

This document defines the public-facing component API contracts for the chart library. These contracts are the stable interfaces that analytics consumers must satisfy. Changing these contracts is a breaking change.

---

## Canvas-Based Charts

All eight Chart.js-backed components share the same input surface:

### Selector Pattern
`<app-line-chart>`, `<app-area-chart>`, `<app-bar-chart>`, `<app-horizontal-bar-chart>`, `<app-pie-chart>`, `<app-doughnut-chart>`, `<app-histogram>`, `<app-scatter-plot>`

### Inputs

| Input | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `series` | `ChartDataSeries[]` | ✅ Yes | — | Data series array |
| `config` | `ChartConfig` | No | `{}` | Display configuration |
| `loading` | `boolean` | No | `false` | Shows loading skeleton |

### Outputs

| Output | Type | Emitted When |
|--------|------|-------------|
| `exported` | `ChartExportRequest` | User triggers PNG/SVG export |

### Minimum Usage Example

```html
<app-line-chart [series]="timeSeries()" />
```

---

## Heatmap

### Selector
`<app-heatmap>`

### Inputs

| Input | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `cells` | `HeatmapCell[]` | ✅ Yes | — | Grid cell data |
| `rowLabels` | `string[]` | ✅ Yes | — | Arabic row-axis labels |
| `colLabels` | `string[]` | ✅ Yes | — | Arabic col-axis labels |
| `config` | `ChartConfig` | No | `{}` | Display configuration |
| `loading` | `boolean` | No | `false` | Shows loading skeleton |

### Outputs

| Output | Type | Emitted When |
|--------|------|-------------|
| `exported` | `ChartExportRequest` | User triggers SVG export |

### Minimum Usage Example

```html
<app-heatmap
  [cells]="hourCells()"
  [rowLabels]="hourLabels"
  [colLabels]="weekdayLabels"
/>
```

---

## Calendar Heatmap

### Selector
`<app-calendar-heatmap>`

### Inputs

| Input | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `cells` | `HeatmapCell[]` | ✅ Yes | — | One entry per calendar day |
| `year` | `number` | ✅ Yes | — | Year to render (e.g., 2026) |
| `config` | `ChartConfig` | No | `{}` | Display configuration |
| `loading` | `boolean` | No | `false` | Shows loading skeleton |

### Outputs

| Output | Type | Emitted When |
|--------|------|-------------|
| `exported` | `ChartExportRequest` | User triggers SVG export |

### Minimum Usage Example

```html
<app-calendar-heatmap [cells]="dailyCells()" [year]="2026" />
```

---

## Common Behaviours (All Components)

| Behaviour | Implementation |
|-----------|---------------|
| Empty state | When `series` / `cells` is empty: show Arabic message "لا توجد بيانات للفترة المحددة" |
| Loading state | When `loading = true`: show pulsing skeleton placeholder sized to chart container |
| Dark mode | Automatically applied when host document has `[data-theme="dark"]` attribute |
| RTL | Host elements have `dir="rtl"`; Chart.js RTL plugin set globally |
| Responsive | Charts fill 100% container width; height governed by `config.aspectRatio` (default 2) |
| Export PNG | Canvas `.toDataURL('image/png')` downloaded via `<a download>` |
| Export SVG | Heatmaps: DOM serialization. Canvas charts: bitmap-wrapped SVG |
