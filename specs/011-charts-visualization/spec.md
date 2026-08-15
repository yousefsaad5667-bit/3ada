# Feature Specification: Charts & Visualization

**Feature Branch**: `011-charts-visualization`

**Created**: 2026-08-14

**Status**: Draft

**Input**: User description: "Implement reusable visualization components (Phase 12 — Charts & Visualization from PLAN.md)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Time Series Charts (Priority: P1)

A user navigating to the Time Series Analytics dashboard sees relapse counts plotted over time as a smooth line or area chart. They can hover over any data point to see an exact count and date, and the chart adapts to the selected date range without a page reload.

**Why this priority**: Time-series charts are the most fundamental visualization consumed by the highest-traffic analytics views; without them the analytics experience is unusable.

**Independent Test**: Navigate to the Time Series Analytics page, select any date range, and verify a line/area chart renders with correct data, responsive layout, and working tooltips.

**Acceptance Scenarios**:

1. **Given** the user has relapse records spanning multiple months, **When** they open the Time Series Analytics view with a 30-day filter, **Then** a line chart renders showing daily counts for exactly those 30 days, with zero-filled gaps for days with no records.
2. **Given** a rendered line chart, **When** the user hovers over a data point, **Then** a tooltip appears showing the date and count.
3. **Given** a rendered chart, **When** the viewport is resized to a mobile width, **Then** the chart reflows to fill the available width without horizontal overflow.

---

### User Story 2 - View Distribution Charts (Priority: P2)

A user on the Urge Analytics or Trigger Analytics page sees a bar chart or pie/doughnut chart that shows how relapses or urge levels are distributed across categories. Legends clearly label each segment, and clicking a legend item toggles the corresponding series.

**Why this priority**: Distribution charts power the Urge and Trigger analytics dashboards; they are the second most common visualization type in the application.

**Independent Test**: Navigate to the Urge Distribution or Trigger Distribution view and verify a bar or doughnut chart renders with all categories labeled, interactive legend, and correct proportions.

**Acceptance Scenarios**:

1. **Given** urge-level distribution data, **When** the Urge Distribution chart renders, **Then** each urge level (1-10) appears as a distinct bar or segment with a label and percentage.
2. **Given** a rendered pie/doughnut chart, **When** the user clicks a legend item, **Then** the corresponding segment is hidden or highlighted and the chart updates visually.
3. **Given** no data for the selected range, **When** the chart tries to render, **Then** an empty-state message is displayed instead of a blank or broken chart.

---

### User Story 3 - View Heatmap & Calendar Charts (Priority: P3)

A user on the Calendar Analytics or Time Pattern Analytics page sees a GitHub-style heatmap or an hour/weekday heatmap showing intensity of activity. The intensity is represented by color saturation, with a legend explaining the color scale.

**Why this priority**: Heatmaps are specialized and used on fewer pages, but are essential for the calendar and time-pattern views.

**Independent Test**: Navigate to the Calendar Heatmap view, verify cells are color-coded by relapse count, the legend is visible, and hovering a cell shows its date and count.

**Acceptance Scenarios**:

1. **Given** daily relapse counts over a year, **When** the calendar heatmap renders, **Then** each day cell is shaded proportionally to its count, with days having zero records shown in the lightest shade.
2. **Given** an hour-of-day heatmap, **When** the chart renders with weekday-by-hour data, **Then** cells are arranged in a 7x24 grid with weekday labels on one axis and hour labels on the other.
3. **Given** a rendered heatmap, **When** the user hovers a cell, **Then** a tooltip displays the axis labels and the underlying numeric value.

---

### User Story 4 - Export Chart as Image (Priority: P4)

A user can export any rendered chart as a PNG or SVG file directly from the chart UI. Exported images preserve the current data, colors, and dark/light theme.

**Why this priority**: Export is a power-user feature; the analytics dashboards deliver value without it, making this lower priority.

**Independent Test**: Render any chart, trigger the export action, and verify a PNG/SVG file downloads with a filename that reflects the chart type and date.

**Acceptance Scenarios**:

1. **Given** a rendered chart, **When** the user selects "Export as PNG", **Then** a PNG file is downloaded that visually matches the on-screen chart.
2. **Given** a rendered chart in dark mode, **When** the user exports it, **Then** the exported image retains the dark-mode color scheme.

---

### Edge Cases

- What happens when a chart receives an empty dataset?
- How does the system handle a dataset with a single data point on a line chart?
- How does a pie/doughnut chart behave when all values are zero?
- What happens when the chart container is extremely narrow (< 200px)?
- How does the heatmap render when only a single day has data in a large date range?
- What happens when export is triggered while data is still loading?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a Line Chart component that plots a numeric series over time with support for multiple series on the same axes.
- **FR-002**: The system MUST provide an Area Chart component that fills the area beneath a time series line.
- **FR-003**: The system MUST provide a Bar Chart component supporting vertical grouping and stacking.
- **FR-004**: The system MUST provide a Horizontal Bar Chart component for ranked category comparisons.
- **FR-005**: The system MUST provide a Pie Chart component and a Doughnut Chart component for proportional distribution.
- **FR-006**: The system MUST provide a Heatmap component rendering a two-dimensional grid of intensity-colored cells.
- **FR-007**: The system MUST provide a Calendar Heatmap component rendering a year-at-a-glance view with day-level intensity cells.
- **FR-008**: The system MUST provide a Histogram component for frequency distribution of numeric values.
- **FR-009**: The system MUST provide a Scatter Plot component for correlation visualization.
- **FR-010**: Every chart component MUST display an empty-state placeholder when its dataset contains no records.
- **FR-011**: Every chart component MUST display a loading-state indicator while data is being prepared.
- **FR-012**: Every chart component MUST render tooltips on hover/tap that show the relevant label(s) and value(s).
- **FR-013**: Every chart component MUST include an optional legend that can be toggled to show/hide individual series or categories.
- **FR-014**: Every chart component MUST support a dark-mode color palette that activates automatically when the application is in dark mode.
- **FR-015**: Every chart component MUST be responsive, filling its container width and adjusting height proportionally or to a configurable aspect ratio.
- **FR-016**: Every chart component MUST expose an "Export as PNG" action that downloads the chart as a raster image.
- **FR-017**: Every chart component MUST expose an "Export as SVG" action that downloads the chart as a vector image.
- **FR-018**: All chart components MUST expose a consistent, technology-agnostic data input API so that consumers are not coupled to any specific charting library.
- **FR-019**: The chart components MUST be selectable per visualization type — different chart types may use different underlying rendering engines as long as the external API remains consistent.

### Key Entities

- **ChartDataSeries**: A labeled, ordered sequence of numeric data points; may carry optional metadata (color, visibility). Used by line, area, bar charts.
- **ChartDataPoint**: A single (label, value) pair within a series, where label is typically a date string or category name.
- **HeatmapCell**: A (row-key, col-key, value) triple representing one cell of a two-dimensional heatmap or calendar grid.
- **ChartConfig**: A declarative configuration object describing axis labels, legend position, color palette, aspect ratio, and export filename.
- **ChartExportRequest**: A request object specifying the chart identifier, desired format (PNG or SVG), and optional resolution multiplier.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All nine chart types (line, area, bar, horizontal bar, pie, doughnut, heatmap, calendar heatmap, histogram, scatter) render correctly with realistic production-sized datasets (up to 10,000 data points) without visible lag.
- **SC-002**: Every chart fills its container and remains readable at screen widths from 320px to 2560px without requiring horizontal scrolling.
- **SC-003**: Tooltips appear within 100ms of the pointer entering a data point or cell.
- **SC-004**: Exported PNG and SVG files are produced within 3 seconds of the user triggering the export action.
- **SC-005**: The empty-state placeholder is displayed within one render cycle when the chart receives an empty or null dataset, with no console errors.
- **SC-006**: All chart components pass visual-regression tests in both light and dark modes, with no unintended color bleed between modes.
- **SC-007**: Switching the application between dark and light modes updates all currently rendered charts without requiring a page reload.
- **SC-008**: The consistent chart API requires no more than 3 input properties to render a basic chart (data, config, and component selector).

## Assumptions

- The application already has a working dark-mode toggle and a theme signal/observable that chart components can subscribe to.
- All chart data is pre-processed by the Analytics Engine (Phase 4); chart components are consumers only and perform no aggregation themselves.
- Mobile touch events (tap for tooltip) are in scope for tooltip interaction but advanced gestures (e.g., series-level zoom/pan) are out of scope for this phase.
- Export functionality does not require a server-side rendering step; it is performed entirely within the browser.
- Accessibility (ARIA labels, keyboard navigation for chart elements) is desirable but is not a blocking requirement for this phase; it will be addressed in Phase 15 — Final Polish.
- The Scatter Plot is included in the component library but may not be actively used by any analytics view until a future phase; it must still meet all common chart requirements (tooltips, dark mode, export, empty state).
