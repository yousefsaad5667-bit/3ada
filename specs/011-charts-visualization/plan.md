# Implementation Plan: Charts & Visualization

**Branch**: `011-charts-visualization` | **Date**: 2026-08-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/011-charts-visualization/spec.md`

## Summary

Build a shared charting layer (`src/app/shared/components/charts/`) of 10 reusable Angular Standalone Components — one per chart type defined in the spec — backed by **Chart.js 4** (already installed) for line, area, bar, horizontal bar, pie, doughnut, histogram, and scatter charts, and a **custom SCSS-based renderer** for the two heatmap types (standard grid heatmap and calendar heatmap) where Chart.js lacks native support. Every component exposes a consistent, library-agnostic `@Input` API. The existing analytics placeholder renderers (Phase 10 sub-components) will be wired to the new chart components in this same phase without changing the service or data-model layer.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Angular 19

**Primary Dependencies**: `chart.js ^4.5.1` (already installed — no new npm install needed for main charts). Custom SCSS heatmap renderer for heatmap/calendar types.

**Storage**: N/A — this feature is pure UI; data arrives via `@Input` from analytics services already in place.

**Testing**: Jasmine / Karma (`ng test`) — spec files colocated with source.

**Target Platform**: Browser (SPA, fully offline). All chart rendering happens in-browser.

**Project Type**: Angular SPA — single-project, feature-based structure under `src/`.

**Performance Goals**: All chart types must render within one animation frame for datasets up to 10,000 points; heatmap cells must paint in a single CSS pass.

**Constraints**: No backend. No server-side rendering. Arabic UI + RTL layout throughout. Chart.js used directly (no additional Angular wrapper library) via `destroyRef`-safe lifecycle management. Export (PNG/SVG) performed via browser canvas API (PNG) and inline SVG serialization (SVG).

**Scale/Scope**: 10 chart components. Heatmap and calendar heatmap use custom rendering. Remaining 8 use Chart.js via a thin `BaseChartDirective` abstraction.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Angular Platform | ✅ PASS | Standalone components, Angular Signals, TypeScript, SCSS. Chart.js used via canvas — no forbidden libs. |
| II. Local-First (LocalStorage only) | ✅ PASS | Chart components are pure UI consumers; zero storage access. |
| III. Arabic Language & RTL | ✅ PASS | All labels/tooltips/legends in Arabic; Chart.js locale plugin used; heatmap axis labels Arabic. RTL layout via `dir="rtl"` on host. |
| IV. Modern UI & UX | ✅ PASS | Loading states, empty states, dark/light mode via SCSS vars, smooth canvas animations, responsive via ResizeObserver. |
| V. Performance & Scalability | ✅ PASS | Chart.js decimation plugin enabled for large series; heatmap uses CSS grid (no JS layout). |
| Charting Library | ✅ PASS | Chart.js (already installed) for standard charts; custom SCSS for heatmaps — best tool per type. |
| Architecture | ✅ PASS | Shared component folder; consistent `@Input` API; separated from analytics services. |
| Code Quality | ✅ PASS | Strict typing; interfaces for all inputs; `DestroyRef`-based cleanup; no duplicated chart logic. |

**Post-Design Re-check**: ✅ All gates pass. No violations.

## Project Structure

### Documentation (this feature)

```text
specs/011-charts-visualization/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── chart-contracts.md
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
src/app/shared/components/charts/
├── models/
│   └── chart.models.ts                     [NEW] ChartDataSeries, ChartDataPoint,
│                                                 HeatmapCell, ChartConfig,
│                                                 ChartExportRequest, ChartTheme
├── directives/
│   └── base-chart.directive.ts             [NEW] shared Chart.js lifecycle (init/destroy/update)
├── utils/
│   ├── chart-export.util.ts                [NEW] PNG + SVG export helpers
│   └── chart-theme.util.ts                 [NEW] dark/light palette resolver
│
├── line-chart/
│   ├── line-chart.component.ts             [NEW]
│   ├── line-chart.component.html           [NEW]
│   └── line-chart.component.scss           [NEW]
│
├── area-chart/
│   ├── area-chart.component.ts             [NEW]
│   ├── area-chart.component.html           [NEW]
│   └── area-chart.component.scss           [NEW]
│
├── bar-chart/
│   ├── bar-chart.component.ts              [NEW]
│   ├── bar-chart.component.html            [NEW]
│   └── bar-chart.component.scss            [NEW]
│
├── horizontal-bar-chart/
│   ├── horizontal-bar-chart.component.ts   [NEW]
│   ├── horizontal-bar-chart.component.html [NEW]
│   └── horizontal-bar-chart.component.scss [NEW]
│
├── pie-chart/
│   ├── pie-chart.component.ts              [NEW]
│   ├── pie-chart.component.html            [NEW]
│   └── pie-chart.component.scss            [NEW]
│
├── doughnut-chart/
│   ├── doughnut-chart.component.ts         [NEW]
│   ├── doughnut-chart.component.html       [NEW]
│   └── doughnut-chart.component.scss       [NEW]
│
├── histogram/
│   ├── histogram.component.ts              [NEW]
│   ├── histogram.component.html            [NEW]
│   └── histogram.component.scss           [NEW]
│
├── scatter-plot/
│   ├── scatter-plot.component.ts           [NEW]
│   ├── scatter-plot.component.html         [NEW]
│   └── scatter-plot.component.scss        [NEW]
│
├── heatmap/
│   ├── heatmap.component.ts                [NEW] CSS-grid SCSS heatmap
│   ├── heatmap.component.html              [NEW]
│   └── heatmap.component.scss             [NEW]
│
└── calendar-heatmap/
    ├── calendar-heatmap.component.ts       [NEW] year-at-a-glance CSS-grid calendar
    ├── calendar-heatmap.component.html     [NEW]
    └── calendar-heatmap.component.scss    [NEW]

# Analytics placeholder replacements (wire chart components into existing sub-components)
src/app/features/analytics/urge/components/
├── urge-time-series-chart/
│   └── urge-time-series-chart.component.html   [EXTEND] replace placeholder with <app-line-chart>
├── urge-distribution-chart/
│   └── urge-distribution-chart.component.html  [EXTEND] replace placeholder with <app-bar-chart>
├── urge-by-hour-chart/
│   └── urge-by-hour-chart.component.html       [EXTEND] replace placeholder with <app-bar-chart>
└── urge-by-weekday-chart/
    └── urge-by-weekday-chart.component.html    [EXTEND] replace placeholder with <app-bar-chart>

# (Other analytics features follow same pattern — out of scope for Phase 11 but unblocked)
```

**Structure Decision**: All chart components live in `src/app/shared/components/charts/` — the existing shared-component convention. Chart.js instances are managed via `AfterViewInit` + `DestroyRef`. No Angular module wrappers. Each component is independently importable as an Angular Standalone Component.

## Complexity Tracking

No constitution violations. No complexity justification required.
