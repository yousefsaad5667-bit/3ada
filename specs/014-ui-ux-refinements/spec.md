# Feature Specification: UI/UX Refinements

**Feature Branch**: `014-ui-ux-refinements`

**Created**: 2026-08-15

**Status**: Draft

**Input**: User description: "UI/UX Refinements — elapse color fix, card drag removal, theme variable fixes, global date filter, large data period handling, and analytics cards showing no data due to dumb component input mismatch."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Contextually Correct Elapse Color (Priority: P1)

A user tracking a bad habit views a relapse card on the dashboard. Currently the elapsed-time indicator is green, which visually implies a positive/healthy state. This is semantically wrong — elapsed time since a relapse should feel like a warning, not a reward.

**Why this priority**: Color semantics directly affect user interpretation of their progress. Incorrect color conveys the opposite emotional meaning and undermines the product's purpose.

**Independent Test**: Open the dashboard with at least one relapse record; verify the elapsed-time indicator is displayed in an alert color (orange or red) rather than green.

**Acceptance Scenarios**:

1. **Given** a relapse record exists, **When** the user views the dashboard, **Then** the elapsed-time indicator color is orange or red — never green.
2. **Given** no relapse record exists, **When** the user views the dashboard, **Then** no elapsed-time indicator is displayed (or a neutral placeholder is shown).

---

### User Story 2 - Fixed (Non-Draggable) Dashboard Cards (Priority: P1)

A user on the dashboard accidentally drags a card to a new position, causing confusion and an unexpected layout. Cards should be static — their purpose is to display information, not to be rearranged.

**Why this priority**: Unintended drag interactions disrupt the user's reading flow and produce a broken-looking layout. Removing this behavior reduces error and cognitive overhead.

**Independent Test**: Attempt to drag any dashboard card; the card must not move from its original position.

**Acceptance Scenarios**:

1. **Given** the dashboard is loaded, **When** the user clicks and drags any card, **Then** the card remains in place and no drag visual or ghost is shown.
2. **Given** the dashboard is loaded on a touch device, **When** the user long-presses and drags a card, **Then** the card remains fixed.

---

### User Story 3 - Theme-Adaptive Card Appearance (Priority: P1)

A user switches between light and dark mode. In dark mode, cards appear with a bright white background that is jarring. In light mode, certain text labels become invisible because they use hardcoded white text.

**Why this priority**: Broken theming is a critical visual regression — it makes the app unusable in one or both modes for all users.

**Independent Test**: Toggle between light and dark mode; verify all dashboard cards display readable text and appropriate backgrounds in both modes.

**Acceptance Scenarios**:

1. **Given** dark mode is active, **When** the user views any dashboard card, **Then** the card background is dark and all text is legible.
2. **Given** light mode is active, **When** the user views any dashboard card, **Then** all text is legible (no white text on white/light background).
3. **Given** the system theme changes automatically (OS preference), **When** the app responds to the change, **Then** cards update their appearance without requiring a page reload.

---

### User Story 4 - Global Date Filter Across All Views (Priority: P2)

A user selects "Last 30 days" in the date filter on the dashboard. They then navigate to another analytics view and find it still shows a different (default) period. This inconsistency forces the user to set the filter multiple times.

**Why this priority**: A disconnected filter breaks the expectation of consistent data context and erodes trust in the displayed data.

**Independent Test**: Change the date filter in any component; verify that all other visible analytics components immediately reflect the same period.

**Acceptance Scenarios**:

1. **Given** multiple analytics views are on screen, **When** the user changes the period in the global filter, **Then** all views simultaneously update to reflect the selected date range.
2. **Given** the user selects a period, **When** they navigate to a different section, **Then** the same period is still active in the new section.
3. **Given** the app first loads, **When** no period has been explicitly chosen, **Then** a sensible default period (e.g., last 30 days) is applied globally.

---

### User Story 5 - Graceful Handling of Large Date Ranges (Priority: P2)

A user selects a 90-day date range. Charts and heatmaps overflow their containers, break the layout, or become unreadable.

**Why this priority**: Any date range the filter allows must produce a usable, non-broken UI. Layout overflow is a hard functional failure.

**Independent Test**: Select a 90-day (or longer) range; verify all charts and heatmaps remain within their containers and are readable.

**Acceptance Scenarios**:

1. **Given** a 90-day range is selected, **When** charts render, **Then** they display without breaking or overflowing the page layout.
2. **Given** a 90-day range is selected, **When** heatmaps render, **Then** cell sizes adapt or horizontal scrolling is enabled so all data remains visible and readable.
3. **Given** a very large range (180+ days), **When** the user views a chart, **Then** data is condensed or paginated so that the chart remains interpretable.

---

### User Story 6 - Analytics Cards Displaying Real Data (Priority: P1)

Nine analytics cards (Trigger Ranking, Trigger Summary, Trigger Timeline, Pattern Summary, Trigger Distribution, Hourly Chart, Period Split, Hour-Weekday Heatmap, Weekday Chart) all show "No Data" even though 150+ records exist.

**Why this priority**: Displaying "No Data" when data is present renders the analytics feature entirely non-functional for users.

**Independent Test**: With at least one relapse record in storage, open any of the nine affected cards; verify each displays real data.

**Acceptance Scenarios**:

1. **Given** relapse records exist in local storage, **When** any of the nine affected analytics cards mounts, **Then** it fetches and displays its data automatically.
2. **Given** the date range is changed via the global filter, **When** an affected card receives the new period, **Then** it re-fetches and re-renders with updated data.
3. **Given** no records exist, **When** an affected card mounts, **Then** it correctly displays a "No Data" message (genuinely empty, not a wiring failure).

---

### Edge Cases

- What happens when the user's OS theme changes while the app is open?
- How does a chart behave if the date range contains zero data points for some periods?
- What if an analytics service throws an error — does the card show "No Data" or an error state?
- How does the global filter handle rapid switching between a large and small range?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The elapsed-time indicator on all habit/relapse cards MUST use an alert color (orange or red) rather than green.
- **FR-002**: All dashboard cards MUST be non-draggable; drag-and-drop interaction MUST be fully disabled for card elements.
- **FR-003**: Dashboard card backgrounds and text colors MUST be defined using theme-aware design tokens (CSS custom properties or equivalent) that automatically adapt to both light and dark modes.
- **FR-004**: No hardcoded color values for card backgrounds or text MUST remain in the component styles.
- **FR-005**: A single, global date-range filter MUST be present in a shared layout component and MUST NOT be duplicated inside individual dashboard components.
- **FR-006**: All analytics components MUST read the currently selected period from the global filter state and update their displayed data whenever that period changes.
- **FR-007**: Charts and heatmaps MUST handle date ranges of 90 days or more without overflowing their layout containers.
- **FR-008**: For large date ranges, the system MUST implement at least one of: horizontal scrolling within the chart container, data aggregation (e.g., weekly buckets), or paginated data views.
- **FR-009**: The nine affected analytics cards (Trigger Ranking, Trigger Summary, Trigger Timeline, Pattern Summary, Trigger Distribution, Hourly Chart, Period Split, Hour-Weekday Heatmap, Weekday Chart) MUST independently fetch their own data from the appropriate analytics services.
- **FR-010**: The affected analytics cards MUST NOT rely solely on externally injected input data when hosted in the dynamic card shell; they MUST be capable of self-initializing their data.

### Key Entities

- **Global Filter State**: Represents the currently selected date range (start date, end date, period label) shared across all analytics components.
- **Analytics Card**: A dashboard widget that queries an analytics service and renders a chart or list. Affected cards currently have a "dumb" (input-driven) contract that must become or gain a smart self-fetching wrapper.
- **Theme Token**: A named design variable (e.g., CSS custom property) that resolves to a different color in light vs. dark mode.
- **Elapsed-Time Indicator**: A visual element on a relapse card showing time since the last relapse, styled to reflect severity rather than success.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All nine previously broken analytics cards display real data for any date range containing records, with zero false "No Data" states.
- **SC-002**: Switching between light and dark mode produces no unreadable text or visually broken card backgrounds across all dashboard and analytics views.
- **SC-003**: Changing the global date filter once updates all visible analytics components simultaneously; no component requires a separate filter interaction.
- **SC-004**: Selecting any supported date range (including 90+ days) does not cause any chart or heatmap to overflow its designated container or break the page layout.
- **SC-005**: No dashboard card can be dragged or repositioned by the user under any input method (mouse, touch).
- **SC-006**: The elapsed-time indicator is never displayed in green; it uses only alert-appropriate colors (orange or red spectrum).

## Assumptions

- The app uses a CSS custom property system (or equivalent theming mechanism) that can be extended to cover card backgrounds and text without a full CSS rewrite.
- Dumb component cards will be wrapped by new smart container components rather than having their internal contracts rewritten, to minimize regression risk (Option A from the change request).
- The global filter state will be implemented as a shared service (or equivalent reactive state) accessible to all analytics components.
- Horizontal scrolling within chart containers is the preferred first approach for large date ranges; aggregation is a fallback.
- The nine affected analytics cards all share the same root cause (no dynamic input passing from the card shell); no other cards are assumed to be affected unless discovered during implementation.
- Mobile/responsive layout is in scope for theme fixes and filter placement, but touch-based chart scrolling is a stretch goal.
