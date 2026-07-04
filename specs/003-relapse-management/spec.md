# Feature Specification: Relapse Management

**Feature Branch**: `003-relapse-management`

**Created**: 2026-07-04

**Status**: Draft

**Input**: User description: "Phase 3 — Relapse Management: Allow users to manage relapse records. Each record contains: Id, Date, Time, AMPM, Count, UrgeLevel, Reason, Notes. Features: Create, Edit, Delete, Duplicate, View history, Search, Sort, Date filtering, Pagination (optional), Validation. UI: Record Form, History Table, Filters, Search Box, Delete Confirmation."

---

## Clarifications

### Session 2026-07-04

- Q: Should pagination be implemented? → A: Optional — implement if the list becomes unwieldy with large datasets, but infinite scroll or load-more may be used as an alternative.
- Q: Should the "Duplicate" action copy all fields including date/time exactly? → A: Yes — duplicate copies all fields and opens the edit form pre-filled, allowing the user to adjust before saving.
- Q: What does "Search" search across? → A: Full-text search across `reason` and `notes` fields.
- Q: How should the "Add" and "Edit" record forms be presented to the user? → A: A modal dialog (overlays the history list, keeps context visible).
- Q: How should the relapse records be visually represented in the history view? → A: A tabular data grid (columns and rows, better for dense data viewing on large screens).
- Q: Where should the search box and date filters be located? → A: Always visible above the history list.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Log a New Relapse Record (Priority: P1)

An Arabic-speaking user has just experienced a relapse and wants to log it immediately while it is fresh. They open the app, tap the "Add" button, fill in the date, count, and optionally the time, urge level, reason, and notes, then save. The record appears at the top of their history list.

**Why this priority**: Recording relapse events is the core value proposition of the app. Without this, no analytics or history exist. Every other feature depends on data created here.

**Independent Test**: Open the app → tap Add → fill in a date and count of 1 → save → confirm the record appears in the history list and persists after a page refresh.

**Acceptance Scenarios**:

1. **Given** the user is on the Relapse Management page, **When** they tap the "Add Record" button, **Then** an empty record form opens with today's date pre-filled.
2. **Given** the form is open with a valid date and count, **When** the user taps "Save", **Then** the record is saved and immediately visible at the top of the history list without a page reload.
3. **Given** the form is open with a missing required field (date or count), **When** the user taps "Save", **Then** an Arabic inline validation error message is shown next to the missing field and nothing is saved.
4. **Given** the form has an invalid value (e.g., count = 0, urge level = 11), **When** the user taps "Save", **Then** an Arabic error message is shown and the invalid value is highlighted.

---

### User Story 2 — View, Search, Filter, and Sort History (Priority: P2)

A user wants to review their relapse history. They can see all records in a list ordered by most recent first, search for records containing specific keywords in reason/notes, filter by date range, and sort by date or count.

**Why this priority**: Without a readable history, the user cannot self-reflect or trust that their data was saved correctly. This is the second most critical capability, enabling awareness and review.

**Independent Test**: Add 5+ records with different dates and reasons → use the search box to search for a specific keyword → confirm only matching records appear → clear the search → apply a date filter → confirm only records within the range appear → change sort order and confirm the list reorders.

**Acceptance Scenarios**:

1. **Given** records exist, **When** the user opens the history view, **Then** all records are listed with most recent first, each showing date, count, urge level (if set), and a snippet of the reason.
2. **Given** records exist with varying reasons, **When** the user types a keyword in the search box, **Then** only records whose reason or notes contain that keyword are shown; the list updates as they type.
3. **Given** records span multiple months, **When** the user applies a date range filter (e.g., "Last 7 days"), **Then** only records within that range are shown and the total count updates accordingly.
4. **Given** a filtered list, **When** the user clears all filters, **Then** all records are shown again.
5. **Given** a list of records, **When** the user changes the sort order (e.g., by date ascending, by count descending), **Then** the list immediately reorders without a page reload.

---

### User Story 3 — Edit, Delete, and Duplicate Records (Priority: P3)

A user realizes they made an error in a previously logged record (wrong date, wrong count), wants to delete a record they added by mistake, or wants to quickly create a new record similar to a past one by duplicating it.

**Why this priority**: Data correctness is essential for meaningful analytics. Editing and deletion allow users to maintain accurate records. Duplication reduces friction when logging repeated relapse events with similar context.

**Independent Test**: Select an existing record → edit the count → save → confirm the updated value is displayed → select another record → delete it → confirm it disappears from the list → select a third record → duplicate it → confirm a new pre-filled form opens → save → confirm a new record appears.

**Acceptance Scenarios**:

1. **Given** the user selects a record, **When** they tap "Edit", **Then** the record form opens pre-filled with all existing field values.
2. **Given** the edit form is open with changes, **When** the user saves, **Then** the updated record replaces the old one in the list with the correct new values.
3. **Given** the user selects a record and taps "Delete", **When** they confirm the deletion in the Arabic confirmation dialog, **Then** the record is permanently removed from the list.
4. **Given** the user taps "Delete" but then cancels the confirmation, **Then** the record is NOT deleted and remains in the list unchanged.
5. **Given** the user selects a record and taps "Duplicate", **When** they confirm or save the pre-filled form, **Then** a new record is created as a copy of the original and appears in the list.

---

### Edge Cases

- What happens when the user submits a date in the future? The app must show an Arabic validation error: future dates are not allowed for relapse records.
- What happens when there are no records at all? An Arabic empty-state message is shown in place of the history list with a prompt to add the first record.
- What happens when the search query matches no records? An Arabic "no results" message is shown; the empty state clearly distinguishes between "no records exist" and "no records match your search".
- What if the user enters an extremely long reason or notes string? Fields are capped at their defined character limits (500 chars for reason, 1000 for notes) with a character counter shown in the form.
- What if the user tries to delete all records at once? The feature does not include a "delete all" button — individual deletion only. A global reset is available only through Settings (Import/Export phase).
- What if the device loses power mid-save? Each save is a discrete synchronous operation; if it fails, an Arabic error message is displayed and no partial record is persisted.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Users MUST be able to create a new relapse record via a modal dialog with the following fields: `date` (required), `count` (required, positive integer ≥ 1), `time` (optional, HH:MM), `ampm` (optional, am/pm), `urgeLevel` (optional, integer 1–10), `reason` (optional, max 500 chars), `notes` (optional, max 1000 chars).
- **FR-002**: Users MUST be able to edit any existing relapse record, with all fields pre-populated in the edit form.
- **FR-003**: Users MUST be able to delete any individual relapse record after confirming a deletion dialog displayed entirely in Arabic.
- **FR-004**: Users MUST be able to duplicate any existing record, which opens the record form pre-filled with all field values from the source record.
- **FR-005**: The history view MUST display all relapse records in a tabular data grid, sorted by date descending (most recent first) by default.
- **FR-006**: The history view MUST provide a search box permanently visible above the data grid, supporting full-text search across the `reason` and `notes` fields, filtering the visible records in real time as the user types.
- **FR-007**: The history view MUST provide date range filters permanently visible above the data grid, using at minimum the presets: Today, Last 7 Days, Last 30 Days, Last 90 Days, Last Year, and All Time.
- **FR-008**: The history view MUST support sorting by date (ascending and descending) and by count (ascending and descending).
- **FR-009**: All form validation MUST display error messages in Arabic. Validated rules include: date is required and not in the future; count is required and must be a positive integer; urge level must be an integer between 1 and 10 if provided; time must be in HH:MM format if provided; reason must not exceed 500 characters; notes must not exceed 1000 characters.
- **FR-010**: When no records exist (or no records match the active search/filter), the history view MUST display an Arabic empty-state message clearly distinguishing the two cases.
- **FR-011**: Character limits for `reason` (500) and `notes` (1000) MUST be shown as live character counters within the form.
- **FR-012**: All UI text, labels, field names, error messages, empty states, and confirmation dialogs MUST be in Arabic with full RTL layout.
- **FR-013**: The record form MUST pre-fill today's date when opened for a new record.
- **FR-014**: All record mutations (create, update, delete) MUST be reflected immediately in the history list without requiring a page reload.

### Key Entities

- **RelapseRecord**: Represents a single logged relapse event. Key attributes: `id` (unique identifier), `date` (day of occurrence), `time` (optional time of day), `ampm` (optional AM/PM indicator), `count` (number of occurrences), `urgeLevel` (optional craving intensity 1–10), `reason` (optional free-text trigger), `notes` (optional free-text details), `createdAt` (audit timestamp), `updatedAt` (audit timestamp).
- **RecordFilter**: Represents the user's active filtering and search state — includes keyword search string, date range preset or custom bounds, and sort field/direction.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can log a complete relapse record (date + count) in under 30 seconds from tapping "Add" to seeing it in the history list.
- **SC-002**: Search results update within 100ms of each keystroke with up to 10,000 records loaded.
- **SC-003**: All form validation errors appear inline next to their respective fields without any page reload or navigation.
- **SC-004**: 100% of UI text (labels, placeholders, errors, empty states, dialog buttons) is displayed in Arabic with correct RTL layout across all supported screen widths (320px–2560px).
- **SC-005**: Editing or deleting a record reflects in the visible list within 100ms of the user confirming the action.
- **SC-006**: The history list correctly handles at least 10,000 records without visible freezing or layout breakage when scrolling.
- **SC-007**: The delete confirmation dialog requires explicit user confirmation; no accidental deletions occur from a single tap.

---

## Assumptions

- The data persistence layer (Phase 2) is complete and functional; this phase adds no new storage logic — it only calls existing repository methods.
- The `RelapseRecord` model is already defined in the codebase from Phase 2; no changes to its schema are required for this phase.
- Duplicate creates a new record as a copy — it does NOT reference the original; modifying the duplicate does not affect the source.
- Pagination is considered optional; if the list renders acceptably fast with 10,000 records using virtual scrolling or native scroll, no pagination control is added.
- The date range filter presets (Last 7 Days, etc.) are calculated relative to the current device date at the moment the filter is applied.
- Arabic is the sole display language; no language toggle exists.
- The form for creating and editing records is the same component — the distinction is whether it is initialized with an existing record or an empty state.
- The `ampm` field is a display hint only and does not affect sorting or filtering logic.
