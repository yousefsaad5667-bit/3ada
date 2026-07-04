# Feature Specification: Dashboard Infrastructure

**Feature Branch**: `005-dashboard-infrastructure`

**Created**: 2026-07-04

**Status**: Draft

**Input**: User description: "phase 5 — Dashboard Infrastructure"

## Clarifications

### Session 2026-07-04

- Q: What is the mechanism for restoring (un-hiding) a hidden card? → A: A placeholder tile remains visible in the grid at the card's last position, showing the card title and a one-click "Show" button to restore it inline.
- Q: What is the primary mechanism for reordering dashboard cards? → A: Drag-and-drop on desktop; touch-drag on mobile (single UX paradigm, both natively supported).
- Q: When stored layout preferences are corrupted or unreadable, what should the system do? → A: Silently discard corrupted preferences and load the default layout with no notification.
- Q: Which date range preset is active by default when the dashboard loads? → A: Last 7 Days.
- Q: Should Phase 5 include any concrete cards? → A: Implement the shell with placeholder/dummy cards to validate the infrastructure (loading, empty, error, data states).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View the Dashboard (Priority: P1)

A user opens the application and lands on the main dashboard. They see a structured layout of analytical cards arranged in a responsive grid. Each card displays a loading state while data is being prepared, then transitions to show content. If no data exists, an appropriate empty state is shown.

**Why this priority**: The dashboard shell is the primary entry point for all analytics. Without it, no visualizations can be displayed to the user.

**Independent Test**: Navigate to the dashboard route and verify a grid of cards is rendered with appropriate loading, empty, or data states. Delivers immediate value by providing the user's home for all insights.

**Acceptance Scenarios**:

1. **Given** the user opens the app, **When** the dashboard loads, **Then** a responsive card grid is displayed with visible loading indicators for each card.
2. **Given** the data has finished loading, **When** the user views the dashboard, **Then** each card shows its analytical content with no spinner visible.
3. **Given** no relapse records exist, **When** the dashboard loads, **Then** each card shows a clear empty state message with a call-to-action to add records.

---

### User Story 2 - Filter Analytics by Date Range (Priority: P2)

A user wants to narrow down the analytics to a specific time window. They use the date range selector to choose from predefined options (Last 7 Days, Last 30 Days, Last 90 Days, Last Year) or a custom range. All dashboard cards update simultaneously to reflect the selected period.

**Why this priority**: Date filtering is the primary analytical control; without it, all cards display lifetime data and users cannot identify trends within meaningful timeframes.

**Independent Test**: Select a date range option and verify all cards re-render with filtered data matching only the chosen period.

**Acceptance Scenarios**:

1. **Given** the dashboard is loaded for the first time, **When** it initializes, **Then** the "Last 7 Days" filter is active by default.
2. **Given** the dashboard is visible, **When** the user selects "Last 30 Days", **Then** all cards update to show data for the past 30 days only.
3. **Given** the user selects "Custom Range", **When** they pick a start and end date, **Then** all cards update to show data within those exact dates.
4. **Given** a date range is selected that has no records, **When** the cards update, **Then** each card shows an empty state specific to that range.

---

### User Story 3 - Customize Dashboard Layout (Priority: P3)

A user rearranges the cards to match their personal priorities: they reorder cards, hide cards they find less useful, and reload the app to find their preferences restored exactly.

**Why this priority**: Personalization improves engagement and long-term retention, but the dashboard delivers full value without it.

**Independent Test**: Reorder two cards, hide one, close and reopen the app — verify the order and visibility are preserved.

**Acceptance Scenarios**:

1. **Given** the dashboard is displayed on desktop, **When** the user drags a card to a new position, **Then** the card is rendered in the new slot and the layout persists after a page refresh. On mobile, the same outcome is achieved via touch-drag.
2. **Given** the user hides a card via its context menu, **When** the dashboard reloads, **Then** the card's content is replaced by a collapsed placeholder tile showing the card title and a "Show" button.
3. **Given** a hidden card placeholder is visible, **When** the user clicks "Show", **Then** the card immediately expands to its full content state at the same grid position.
4. **Given** the user has customized the layout, **When** they choose to reset to default, **Then** the original card order and visibility are restored.

---

### User Story 4 - Handle Errors Gracefully (Priority: P4)

A user's device has corrupted or missing local data. When the dashboard loads, instead of a blank screen or crash, the affected card(s) display a clear error state with a retry option. Other cards still function normally.

**Why this priority**: Resilience is important for trust but does not define the core user flow.

**Independent Test**: Simulate a data-read failure for a single card and verify only that card shows an error state while the rest render normally.

**Acceptance Scenarios**:

1. **Given** data for a specific card cannot be loaded, **When** the dashboard renders, **Then** only that card shows an error state with a retry button; all other cards load normally.
2. **Given** an error card is visible, **When** the user clicks the retry button, **Then** the card attempts to reload its data.

---

### Edge Cases

- What happens when all records fall outside the selected date range?
- How does the grid behave when there is only one card visible (all others hidden)?
- What happens if the user sets a custom range where start date is after end date?
- How is the layout preference handled if stored preference references a card that no longer exists?
- What happens if the user's stored layout preference is corrupted or unreadable? → Handled by silent fallback to default layout.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST display a responsive card-based grid as the primary dashboard layout.
- **FR-002**: The system MUST support the following predefined date range filters: Last 7 Days (Default), Last 30 Days, Last 90 Days, Last Year, and Custom Range.
- **FR-003**: The system MUST update all visible dashboard cards simultaneously when the date range selection changes.
- **FR-004**: Each dashboard card MUST display a loading state while its data is being computed or retrieved.
- **FR-005**: Each dashboard card MUST display an empty state when no data exists for the current filter selection.
- **FR-006**: Each dashboard card MUST display an error state with a retry action when data cannot be loaded.
- **FR-007**: The system MUST provide a manual refresh mechanism that re-triggers data loading for all cards.
- **FR-008**: The system MUST allow users to reorder dashboard cards via drag-and-drop on desktop and touch-drag on mobile devices.
- **FR-009**: The system MUST allow users to hide individual dashboard cards via a per-card context menu.
- **FR-010**: The system MUST persist dashboard layout preferences (card order and visibility) so they survive page refreshes and app restarts. If preferences are corrupted or unreadable, the system MUST silently fallback to the default layout without notifying the user.
- **FR-011**: The system MUST provide a way to reset the dashboard layout to its default configuration.
- **FR-012**: The custom date range selector MUST prevent selecting a start date that is after the end date, or clearly surface this as an error.
- **FR-013**: The dashboard shell MUST be a reusable container — individual card content is provided by other features (analytics modules).
- **FR-014**: When a card is hidden, the system MUST display a collapsed placeholder tile in the card's last grid position, showing the card title and a "Show" button that restores the card inline with one click.
- **FR-015**: For Phase 5, the system MUST implement at least two placeholder/dummy cards to validate the dashboard infrastructure (loading, empty, error, and data states).

### Key Entities

- **Dashboard Card**: A self-contained UI panel that hosts a single analytical visualization. Has attributes: id, title, order, visible, loading state, error state.
- **Date Range Filter**: A control defining the time window applied to all dashboard cards. Has attributes: preset (enum), custom start date, custom end date.
- **Dashboard Preferences**: A persisted user configuration. Has attributes: card order (array of card ids), hidden cards (array of card ids).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The dashboard layout renders and becomes interactive within 2 seconds on first load with a dataset of up to 10,000 records.
- **SC-002**: Switching between date range presets updates all visible cards within 1 second.
- **SC-003**: Dashboard layout preferences survive app restarts with 100% fidelity — no order or visibility changes are lost.
- **SC-004**: Each card correctly isolates its error state — a failure in one card does not affect the rendering of any other card.
- **SC-005**: The dashboard grid is fully usable and readable on screens from 320px to 1920px wide without horizontal scrolling.
- **SC-006**: Empty states are displayed for every card whenever no records exist for the active date range.

## Assumptions

- The analytics data powering each card is computed by the Analytics Engine (Phase 4); the Dashboard Infrastructure does not own data computation.
- Cards are identified by stable identifiers defined at card registration time; the dashboard shell does not hardcode card content.
- All data storage for preferences uses the local persistence layer established in Phase 2 (LocalStorage abstraction).
- The initial set of cards for this phase will be dummy/placeholder cards; real analytics cards will be built in Phase 6+.
- Mobile support for card reordering is confirmed in scope: touch-drag is the mobile equivalent of desktop drag-and-drop.
- Dark mode is not required in this phase but the design system must not block it.
