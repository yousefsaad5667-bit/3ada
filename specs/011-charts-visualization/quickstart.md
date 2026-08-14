# Quickstart: Charts & Visualization

## For Developers Consuming Chart Components

All chart components live in `src/app/shared/components/charts/`. Every component is an Angular Standalone Component — import it directly, no module required.

---

## 1. Line / Area Chart (Time Series)

```typescript
import { LineChartComponent } from '@shared/components/charts/line-chart/line-chart.component';
import { ChartDataSeries } from '@shared/components/charts/models/chart.models';

// In your component:
timeSeries: ChartDataSeries[] = [
  {
    label: 'الانتكاسات اليومية',
    data: [
      { label: '2026-08-01', value: 3 },
      { label: '2026-08-02', value: 1 },
      { label: '2026-08-03', value: null }, // gap
    ]
  }
];
```

```html
<!-- Minimum usage -->
<app-line-chart [series]="timeSeries" />

<!-- With config -->
<app-line-chart
  [series]="timeSeries"
  [config]="{ titleAr: 'الإحصائيات اليومية', smooth: true }"
/>
```

---

## 2. Bar Chart (Distribution / Category)

```html
<app-bar-chart [series]="distributionSeries" />
```

---

## 3. Heatmap (Hour × Weekday)

```typescript
import { HeatmapCell } from '@shared/components/charts/models/chart.models';

cells: HeatmapCell[] = [
  { rowKey: '0', colKey: '0', value: 5, tooltipLabelAr: 'الأحد - 12 ص: 5' },
  // ...
];
rowLabels = ['12 ص', '1 ص', /* ... 22 more */];
colLabels = ['ح', 'ن', 'ث', 'ع', 'خ', 'ج', 'س'];
```

```html
<app-heatmap
  [cells]="cells"
  [rowLabels]="rowLabels"
  [colLabels]="colLabels"
/>
```

---

## 4. Calendar Heatmap (Year View)

```html
<app-calendar-heatmap [cells]="dailyCells" [year]="currentYear" />
```

---

## 5. Loading State

```html
<app-line-chart [series]="series()" [loading]="isLoading()" />
```

---

## 6. Export

The export button appears inside the chart card header. The component emits an `(exported)` output event after the download is triggered (for analytics tracking if needed).

```html
<app-line-chart [series]="series()" (exported)="onExported($event)" />
```

---

## Key Paths

| Path | Purpose |
|------|---------|
| `src/app/shared/components/charts/models/chart.models.ts` | All shared types |
| `src/app/shared/components/charts/utils/chart-theme.util.ts` | Theme palette constants |
| `src/app/shared/components/charts/utils/chart-export.util.ts` | PNG/SVG export helpers |
| `src/app/shared/components/charts/directives/base-chart.directive.ts` | Chart.js lifecycle directive |

---

## RTL Note

All chart component host elements set `dir="rtl"` automatically. You do **not** need to add RTL attributes to the parent. Arabic label strings must be provided by the caller (the analytics services already produce Arabic labels).
