# Phase 0 Research: Time Series Analytics

## Decision: Reuse and extend the existing analytics engine

**Decision**: Keep all count aggregation and statistical interpretation in `src/app/core/analytics/` as pure TypeScript functions. Phase 6 should extend the existing `time-series.engine.ts` and `statistics.engine.ts` with cumulative count, trend direction, growth rate, and invalid-record-safe helpers where those capabilities are missing.

**Rationale**: Phase 4 already established a reusable analytics engine with daily, weekly, monthly, moving average, and distribution functions. Reusing it prevents duplicated business logic in components and keeps later phases able to consume the same calculations.

**Alternatives considered**:

- Compute chart-specific datasets directly inside Angular components. Rejected because it duplicates logic and makes results harder to test.
- Create a feature-only analytics service with its own calculations. Rejected because trigger, urge, calendar, and pattern phases need the same shared engine discipline.

## Decision: Use Angular Signals for orchestration

**Decision**: Create a `TimeSeriesAnalyticsService` that derives view state from `RelapseRecordRepository.records` and `DashboardFilterService.activeFilter` using Signals/computed values.

**Rationale**: The current dashboard filter is already Signal-based. Signals keep the data flow synchronous, testable, and lightweight for local-only data. They also avoid unnecessary subscriptions for simple derived state.

**Alternatives considered**:

- RxJS streams for all card state. Rejected for this phase because the inputs are local synchronous Signals and RxJS is only required when the data flow becomes asynchronous or event-heavy.
- Component-local computation. Rejected because multiple cards need consistent datasets and notices.

## Decision: Render Phase 6 charts with Chart.js

**Decision**: Use Chart.js for Phase 6 line and bar time-series charts through Angular standalone wrapper components, plus accessible tables for exact values.

**Rationale**: The constitution requires choosing a suitable Angular-compatible chart library for each visualization. Chart.js is a focused fit for Phase 6 line/bar time-series charts: it is browser-only, responsive, actively maintained, themeable, supports tooltip RTL/text direction options, and keeps the implementation smaller than a broad visualization suite. Phase 12 can still evaluate broader wrappers for heatmaps, calendar heatmaps, exports, and advanced chart types.

**Alternatives considered**:

- Native SVG only. Rejected because the chart-library constitution principle applies to this phase and the user explicitly asked why a library was not being used.
- ECharts. Rejected for Phase 6 because it is broader and heavier than needed for simple time-series line/bar charts, though it may be appropriate for later heatmap/calendar phases.
- Angular wrapper packages. Rejected for Phase 6 because direct Chart.js usage keeps Angular version compatibility risk lower while still fitting cleanly inside Angular standalone components.

## Decision: Use the existing week boundary behavior

**Decision**: Weekly aggregation uses the existing ISO-style Monday-based week grouping in `time-series.engine.ts`.

**Rationale**: The current engine already groups weeks consistently and labels each overlapping week. Keeping this behavior avoids a breaking change and satisfies the spec requirement for a consistent week boundary.

**Alternatives considered**:

- Locale-specific Saturday or Sunday week starts. Rejected for this phase because the existing engine has already established behavior and the spec does not require a locale-specific week start.

## Decision: Treat invalid records as excluded-but-visible notices

**Decision**: Records with invalid dates or unusable counts are excluded from calculations. The feature exposes an invalid record count and shows a non-blocking notice when exclusions occur.

**Rationale**: The spec requires valid records to continue rendering even when some records are invalid or incomplete. A notice preserves user trust without blocking the main analytics view.

**Alternatives considered**:

- Fail the whole card on any invalid record. Rejected because it violates the resilience requirement.
- Silently ignore invalid records. Rejected because users need to know why totals may not match raw stored data.

## Decision: Replace placeholder dashboard value with real Phase 6 cards

**Decision**: Register time-series dashboard cards through the existing `DashboardCardDescriptor` contract. The implementation can replace placeholder cards or keep them only as development-only examples, but production dashboard value should come from Phase 6 cards.

**Rationale**: Phase 5 intentionally used dummy cards to validate infrastructure. Phase 6 is the first real analytics content and should prove the descriptor-based shell with actual user-facing cards.

**Alternatives considered**:

- Keep time-series analytics only on a separate route. Rejected because the spec requires dashboard card integration.
- Hardcode chart markup directly in `DashboardComponent`. Rejected because it couples the shell to a specific analytics phase.
