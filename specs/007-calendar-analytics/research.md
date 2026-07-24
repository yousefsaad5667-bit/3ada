# Phase 0 Research: Calendar Analytics

## Decision: Render the heatmap as a custom Angular CSS-grid component, not a chart library

**Decision**: Build the GitHub-style heatmap as a custom Angular standalone component using a CSS grid layout driven by computed `HeatmapEntry[]` data from the existing `getHeatmap()` engine function. No third-party chart library is introduced for the heatmap.

**Rationale**: The constitution requires RTL layout throughout the application. ECharts has no native RTL mode — its Calendar coordinate system cannot be automatically mirrored. Research confirms that a `direction: rtl` CSS override does not flip the ECharts coordinate system or axes, and Arabic text shaping is inconsistent between its Canvas and SVG renderers. A custom CSS-grid heatmap gives full RTL and Arabic control, lightweight DOM size, easy theming via SCSS variables, and keeps the implementation consistent with the Angular-only constraint. The existing `getHeatmap()` engine already produces the per-day count and intensity values needed to color each cell; the component only needs to group those into weeks and lay them out as a grid.

**Alternatives considered**:

- ECharts (`ngx-echarts`) Calendar heatmap. Rejected because it has no native RTL support, has Arabic text shaping bugs in both renderers, and would introduce a heavy dependency for a purely layout-driven visualization.
- Chart.js (already present). Rejected because Chart.js has no calendar/heatmap chart type and a workaround would require a canvas pixel-painting approach with no accessibility.
- D3.js. Rejected because introducing D3 for a layout that is achievable with Angular and CSS grid would violate the "minimal bundle" criterion and add a steep maintenance burden.

---

## Decision: Render the monthly calendar as a custom Angular CSS-grid component

**Decision**: The monthly calendar view is a pure Angular component. It receives a `CalendarMonth` model (year, month, ordered `CalendarDay[]`) and renders a 7-column CSS grid of day cells. No chart library is involved.

**Rationale**: A monthly calendar is a data grid, not a statistical visualization. It is fully expressible as an Angular template with RTL column order and SCSS styling. Using a chart library for it would be unnecessary and risk RTL/Arabic text issues.

**Alternatives considered**:

- Using a third-party calendar component. Rejected because third-party calendar components are opinionated about date localization, week-start rules, and accessibility and would require significant wrapping to meet the RTL and Arabic requirements.

---

## Decision: Reuse and extend the existing `getHeatmap()` engine function

**Decision**: The Phase 7 heatmap uses `getHeatmap()` from `src/app/core/analytics/engine/heatmap.engine.ts` directly. The function already produces `HeatmapEntry[]` with `date`, `count`, and `intensity` (0–1 normalized). The `CalendarAnalyticsService` maps these into a 52-week grid structure and a month-by-month structure.

**Rationale**: Phase 4 established reusable engine functions. `getHeatmap()` already implements the counting and normalization logic required by FR-001 through FR-003 and FR-017. Re-implementing this in the service would duplicate logic and violate the separation-of-concerns rule from the constitution.

**Alternatives considered**:

- Computing heatmap data inside the Angular component. Rejected because it duplicates engine logic and makes results untestable in isolation.
- Adding a new `getCalendarHeatmap()` helper. Rejected because `getHeatmap()` already provides the required output. The grid-layout grouping belongs in the service layer, not in the pure engine.

---

## Decision: Implement the day details popup as a custom Angular standalone overlay component

**Decision**: The day details popup is a custom Angular standalone component positioned via CSS (absolute/fixed positioning) or the Angular CDK Overlay. It displays `DayDetail` data derived from the service.

**Rationale**: The application already uses Angular CDK (likely available since Angular Material is a common companion); a lightweight overlay avoids browser-native `<dialog>` inconsistencies with RTL. The popup must be dismissible and must not disrupt the calendar state.

**Alternatives considered**:

- Using a native HTML `<dialog>` element. Viable but limited RTL and animation control.
- Angular Material `MatDialog`. Acceptable if Angular Material is already in the project, but introduces a dependency and Material styling that may conflict with the existing design system.
- Custom absolutely-positioned div. Simplest approach; chosen if Angular CDK is not already available.

---

## Decision: Use Angular Signals for orchestration (consistent with Phase 6)

**Decision**: `CalendarAnalyticsService` exposes a `computed` Signal for `CalendarAnalyticsState`, mirroring the pattern in `TimeSeriesAnalyticsService`.

**Rationale**: The codebase already uses Signals in Phase 5 and Phase 6. Consistency and signal-based change detection are already established patterns. The data flow is synchronous (LocalStorage-backed), making Signals the lightest correct choice.

**Alternatives considered**:

- RxJS subjects and observables. Rejected for the same reason as in Phase 6: the inputs are synchronous Signals and there is no async event stream.

---

## Decision: Intensity classification into 5 discrete levels

**Decision**: Intensity is classified into five discrete CSS classes — `none`, `low`, `medium`, `high`, `very-high` — derived from the normalized `HeatmapEntry.intensity` value (0–1). Thresholds: 0 → `none`, 0.01–0.25 → `low`, 0.26–0.50 → `medium`, 0.51–0.75 → `high`, > 0.75 → `very-high`.

**Rationale**: Discrete classes are consistent with the GitHub heatmap aesthetic, accessible to users who cannot perceive continuous gradients, and easy to theme in SCSS for both dark and light modes.

**Alternatives considered**:

- CSS `opacity` or `filter: brightness()` on a single color for a continuous gradient. Rejected because it is harder to make accessible and produces visually indistinct cells for low-count days.
