# Feature Specification: Trigger Analytics

**Feature Branch**: `009-trigger-analytics`

**Created**: 2026-07-24

**Status**: Draft

**Input**: User description: "Phase 9 — Trigger Analytics: Analyze relapse causes including trigger frequency, distribution, keyword extraction, and trend analysis"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Top Triggers at a Glance (Priority: P1)

A user wants to understand which triggers most commonly lead to their relapses. They navigate to the Trigger Analytics section and immediately see a ranked list of their top triggers — the situations, emotions, or events they logged when recording a relapse — along with how often each one appeared.

**Why this priority**: This is the core value proposition of the feature. Knowing the most common relapse causes directly enables the user to focus their recovery efforts. All other views build on this foundational insight.

**Independent Test**: Can be fully tested by navigating to Trigger Analytics and verifying that a ranked trigger list is displayed reflecting logged relapse data, and delivers direct actionable insight even without any other analytics view.

**Acceptance Scenarios**:

1. **Given** a user has logged multiple relapses with different triggers, **When** they open the Trigger Analytics section, **Then** they see a ranked list of triggers ordered from most to least frequent.
2. **Given** a user has logged relapses, **When** viewing top triggers, **Then** each trigger entry shows its name, total occurrence count, and percentage of total relapses.
3. **Given** a user has no relapse records, **When** they open Trigger Analytics, **Then** they see an empty-state message explaining that triggers will appear once relapses are logged.

---

### User Story 2 - Explore Trigger Frequency & Distribution (Priority: P2)

A user wants to see how triggers are distributed across their relapse history — not just which triggers appear most often, but also how they compare to each other in terms of proportion and how their frequency has shifted over time.

**Why this priority**: Distribution and frequency views deepen the user's understanding beyond simple counts. They reveal patterns like a trigger becoming more or less prominent over time, which drives meaningful behavioral change.

**Independent Test**: Can be fully tested by verifying that trigger frequency counts and a distribution chart are displayed and correctly reflect the underlying relapse data.

**Acceptance Scenarios**:

1. **Given** relapse data with multiple triggers, **When** viewing the trigger distribution, **Then** each trigger's share of total relapses is shown visually (e.g., pie/bar chart) with exact counts.
2. **Given** a selected time range, **When** the user filters trigger data, **Then** the distribution updates to reflect only relapses within that period.
3. **Given** a trigger with zero occurrences in the selected period, **When** the user views the distribution, **Then** that trigger is hidden or marked as inactive for clarity.

---

### User Story 3 - Browse Trigger Timeline & Trends (Priority: P3)

A user wants to track how specific triggers have evolved over time — whether a particular trigger became more common after a life event or declined as their coping strategies improved.

**Why this priority**: Trend visibility gives the user a longitudinal perspective on their recovery journey, helping them understand the impact of interventions or life changes on specific triggers.

**Independent Test**: Can be fully tested by verifying that a timeline of trigger occurrences is displayed, with at least one trigger selectable to show its trend over time.

**Acceptance Scenarios**:

1. **Given** relapse history spanning multiple weeks, **When** the user views the trigger timeline, **Then** occurrences are plotted chronologically on a time axis.
2. **Given** the user selects a specific trigger, **When** viewing the trend view, **Then** only that trigger's occurrences are highlighted on the timeline.
3. **Given** a trigger's frequency changes significantly between two time periods, **When** viewing the trend, **Then** the change is visually apparent (e.g., upward/downward slope).

---

### User Story 4 - Search & Filter Triggers (Priority: P3)

A user wants to search for a specific trigger keyword or filter the list to find relapses associated with a particular cause, especially when they have a large number of distinct triggers logged.

**Why this priority**: As relapse history grows, the trigger list can become long. Search and filtering ensure the feature remains usable and actionable regardless of data volume.

**Independent Test**: Can be fully tested by entering a search term and verifying the trigger list filters to show only matching triggers.

**Acceptance Scenarios**:

1. **Given** a user types a keyword in the search field, **When** they submit or type, **Then** the trigger list filters to show only triggers containing that keyword.
2. **Given** a filtered result with no matches, **When** the user searches, **Then** an empty-state message is displayed.
3. **Given** the user clears the search field, **When** the filter is reset, **Then** the full unfiltered trigger list is restored.

---

### User Story 5 - Analyze Average Urge Intensity per Trigger (Priority: P2)

A user wants to know not just how often each trigger appears, but also how strong the urge associated with each trigger typically is. This helps them prioritize high-risk triggers that are both frequent and intense.

**Why this priority**: Combining trigger frequency with average urge strength gives a more complete picture of risk. A rare but high-intensity trigger may warrant more attention than a frequent low-intensity one.

**Independent Test**: Can be fully tested by verifying that each trigger in the list displays its average urge score computed from associated relapse records.

**Acceptance Scenarios**:

1. **Given** relapse records with both trigger and urge intensity fields, **When** viewing trigger analytics, **Then** each trigger shows its average urge intensity score.
2. **Given** a trigger with varying urge intensities across relapses, **When** viewing its average, **Then** the displayed value is the arithmetic mean of all logged urge scores for that trigger.
3. **Given** a trigger has only one associated relapse, **When** viewing its average urge, **Then** the single urge value is shown without error.

---

### Edge Cases

- What happens when a relapse record has no trigger logged? The record is excluded from trigger analytics counts; a summary of trigger-less relapses may be shown separately as "Unspecified."
- What happens when two triggers have identical names but different casing? They are treated as the same trigger (case-insensitive matching) to prevent fragmentation.
- How does the system handle a trigger that appears in only one relapse record? It is displayed normally with a count of 1 and its urge value; no special treatment required.
- What happens when the selected date range contains no relapses? All trigger analytics views show an empty state with a clear message.
- What if a trigger name is very long? It is truncated with an ellipsis in list and chart views, with the full name accessible via tooltip.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST display a ranked list of triggers ordered by frequency (most occurrences first).
- **FR-002**: The system MUST show the occurrence count and percentage share of total relapses for each trigger.
- **FR-003**: The system MUST display a trigger distribution visualization (chart) showing each trigger's proportion of total relapses.
- **FR-004**: The system MUST display a chronological timeline of trigger occurrences across the user's relapse history.
- **FR-005**: Users MUST be able to select a specific trigger to highlight or isolate its trend on the timeline.
- **FR-006**: The system MUST calculate and display the average urge intensity score for each trigger.
- **FR-007**: Users MUST be able to search triggers by keyword, with the list filtering in real time.
- **FR-008**: The system MUST support date-range filtering so all trigger analytics views reflect only the selected period.
- **FR-009**: The system MUST display an appropriate empty state when no relapse data or no matching triggers are available.
- **FR-010**: The system MUST identify and display "rare triggers" — triggers that appear only a small number of times relative to total relapses.
- **FR-011**: The system MUST identify and surface the "most active period" associated with each top trigger (e.g., the week or month with the highest trigger frequency).
- **FR-012**: Trigger names MUST be matched case-insensitively to prevent duplicate entries from minor casing differences.
- **FR-013**: Relapse records without a trigger value MUST be excluded from trigger-specific counts; the total count of trigger-less relapses MAY be surfaced as a summary statistic.

### Key Entities *(include if feature involves data)*

- **Trigger**: A cause or circumstance logged by the user when recording a relapse. Key attributes: name (text), associated relapse records, frequency count, average urge intensity, trend over time.
- **Relapse Record**: An existing entity representing a single relapse event. Relevant attributes for this feature: trigger name, urge intensity score, timestamp.
- **Trigger Analytics Summary**: A computed view aggregating trigger-level statistics — frequency, percentage share, average urge, peak period, trend direction — derived from relapse records.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can identify their top 3 most common relapse triggers within 10 seconds of opening the Trigger Analytics section.
- **SC-002**: All trigger analytics views — list, distribution chart, timeline, and search — load and render in under 2 seconds for datasets of up to 10,000 relapse records.
- **SC-003**: Trigger search returns filtered results within 500 milliseconds of the user completing their input.
- **SC-004**: 90% of users who use the Trigger Analytics section can correctly identify their most common trigger in a usability test without any assistance.
- **SC-005**: The trigger distribution chart accurately reflects underlying data — a manual count of relapse records per trigger matches displayed values with zero discrepancy.
- **SC-006**: Average urge intensity per trigger is computed correctly — spot-checking 5 triggers against raw relapse data shows no calculation errors.
- **SC-007**: Date-range filtering correctly scopes all analytics views — trigger counts when filtering to a specific month match a manual count of relapses in that month.

---

## Assumptions

- Trigger data is already captured as part of the existing relapse logging flow (Phase 3 — Relapse Management); this feature reads existing data and does not introduce new data entry.
- A single relapse record is associated with at most one trigger value; multi-trigger logging per relapse is out of scope for this phase.
- Urge intensity is stored as a numeric score on a defined scale (e.g., 1–10) as established in earlier phases; this feature uses that scale as-is without modification.
- All relapse data is stored locally on the device; no server-side data processing is required.
- The keyword extraction mentioned in the plan refers to surfacing distinct trigger terms from free-text entries, not to NLP-based entity extraction; simple tokenization and frequency counting are sufficient.
- The "Rare Triggers" category is defined as triggers appearing in fewer than 5% of total relapses (or fewer than 3 occurrences if total relapses are below 20); this threshold is a default and may be adjusted in future phases.
- Mobile-responsive layout is required; the feature must be usable on both desktop and mobile screen sizes.
