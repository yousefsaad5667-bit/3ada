# Feature Specification: Local Data Layer

**Feature Branch**: `002-local-data-layer`

**Created**: 2026-07-03

**Status**: Draft

**Input**: User description: "Implement a fully local-first persistence layer with storage abstraction, CRUD for Relapse Records/Settings/Dashboard Preferences, validation, import/export, and data clear/reset capabilities."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Record Persistence (Priority: P1)

A user creates, edits, and deletes relapse records, and those changes survive a browser refresh or app restart. The app stores all records entirely in the user's own browser — no server is ever contacted. Every action (create, update, delete) is immediately reflected in storage, so there is zero risk of data loss from navigating away.

**Why this priority**: The entire application is useless without durable persistence. Every other phase (analytics, dashboard, relapse management UI) depends on a working data layer. This is the foundational contract all features rely on.

**Independent Test**: Can be fully tested by creating a relapse record, refreshing the browser, and confirming the record is still present — delivering immediate, tangible data durability value with no other phase required.

**Acceptance Scenarios**:

1. **Given** no existing data, **When** the user creates a relapse record with all fields filled, **Then** the record is stored locally and can be retrieved immediately on the next load.
2. **Given** an existing relapse record, **When** the user edits and saves it, **Then** the updated values persist across browser sessions.
3. **Given** an existing relapse record, **When** the user deletes it, **Then** it is permanently removed from storage and is not present on next load.
4. **Given** multiple relapse records, **When** the user reads all records, **Then** the result is the complete, correctly ordered list with all fields intact.
5. **Given** valid settings data, **When** the user saves a setting, **Then** it persists across browser restarts and is returned on the next read.
6. **Given** valid dashboard preferences, **When** the user saves preferences, **Then** they are restored correctly on the next app launch.

---

### User Story 2 - Data Validation & Integrity (Priority: P2)

A user submits a relapse record with missing required fields or invalid data. The system rejects the invalid data with a clear message and does not corrupt the existing dataset. Even if locally stored data is somehow malformed or outdated (e.g., from a previous app version), the system recovers gracefully.

**Why this priority**: Bad data silently corrupting the analytics engine or crashing the app is a critical risk. Validation at the persistence boundary prevents cascading failures in all downstream features.

**Independent Test**: Can be tested by attempting to save records with missing date, invalid urge levels (out of range), or empty required fields and verifying the system rejects them with user-facing messages while the existing data remains unchanged.

**Acceptance Scenarios**:

1. **Given** a relapse record missing the required date field, **When** the user attempts to save it, **Then** the system rejects the save and surfaces a specific Arabic-language error message.
2. **Given** a relapse record with an urge level outside the valid 1–10 range, **When** the user attempts to save it, **Then** the save is rejected with a validation error.
3. **Given** corrupted or unparseable JSON in storage, **When** the app loads, **Then** it gracefully recovers (returning an empty collection or a safe default), logs the anomaly, and does not crash.
4. **Given** data written by a previous schema version, **When** the app loads a newer version, **Then** the migration system transforms the old data into the current schema without data loss.

---

### User Story 3 - Import & Export (Priority: P3)

A user wants to back up all their data to a JSON file or transfer it to another device. They can export a complete snapshot of all records and settings to a downloadable file. They can later restore from that file using either a merge strategy (keeping existing data and adding new) or a replace strategy (overwriting all local data with the imported file).

**Why this priority**: Backup and restore is critical for a local-only application — there is no cloud recovery. However, it is lower priority than core persistence since the app delivers value without it.

**Independent Test**: Can be tested by: (1) exporting data to a JSON file, (2) clearing all local data, (3) importing the file with the replace strategy, and (4) confirming all records and settings are restored identically.

**Acceptance Scenarios**:

1. **Given** any amount of stored data, **When** the user triggers an export, **Then** a valid JSON file is downloaded to their device containing all relapse records, settings, and preferences.
2. **Given** a valid exported JSON file, **When** the user imports it using the replace strategy, **Then** all existing local data is overwritten with the file contents, and the app reflects the imported state.
3. **Given** a valid exported JSON file, **When** the user imports it using the merge strategy, **Then** records in the file are added to existing records without creating duplicates (matched by ID).
4. **Given** a malformed or invalid JSON file, **When** the user attempts to import it, **Then** the import is rejected with a clear error message and the existing data is left untouched.
5. **Given** any stored data, **When** the user triggers a full clear/reset, **Then** all local data is permanently removed and the app returns to its initial empty state.

---

### Edge Cases

- What happens when the browser's localStorage quota is exceeded during a write? The system must surface an Arabic-language warning without crashing, and the pre-write state must remain intact.
- What happens when two records happen to be created with the same generated ID? The system must guarantee uniqueness of IDs at generation time.
- What happens when an import file contains records with IDs that already exist in local storage during a merge? The system must not duplicate records — existing records take precedence.
- What happens when the user clears browser data externally (outside the app)? On next load, the app must detect the empty state and start fresh without throwing errors.
- What happens when local storage is available during app launch but becomes unavailable mid-session? Subsequent writes must fail gracefully with user notification.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST store all data exclusively in the browser's local storage — no network calls are ever made for data persistence.
- **FR-002**: The system MUST provide a generic, type-safe storage abstraction that serializes and deserializes data as JSON.
- **FR-003**: The system MUST support Create, Read, Update, and Delete operations for Relapse Records.
- **FR-004**: The system MUST support Create, Read, and Update operations for Settings.
- **FR-005**: The system MUST support Create, Read, and Update operations for Dashboard Preferences.
- **FR-006**: The system MUST assign a globally unique, stable identifier to each relapse record at creation time.
- **FR-007**: The system MUST validate relapse records before persisting them, checking: date is present and a valid calendar date, urge level is an integer between 1 and 10 (inclusive), count is a positive integer.
- **FR-008**: The system MUST validate settings and dashboard preferences for required fields and correct data types before persisting them.
- **FR-009**: The system MUST surface validation errors as Arabic-language messages that clearly identify which fields failed and why.
- **FR-010**: The system MUST detect and handle corrupted or unparseable data in storage on load, recovering to a safe empty/default state without throwing unhandled errors.
- **FR-011**: The system MUST support a versioned storage schema so that breaking changes to the data model can be migrated automatically on load.
- **FR-012**: The system MUST provide an export function that packages all relapse records, settings, and preferences into a single downloadable JSON file.
- **FR-013**: The system MUST provide an import function that reads a JSON file and restores data using one of two strategies: replace (overwrite all local data) or merge (add records not already present, matched by ID).
- **FR-014**: The system MUST validate any imported JSON file against the expected schema before applying it, rejecting invalid files with an error message.
- **FR-015**: The system MUST provide a clear/reset function that permanently removes all locally stored data and returns the app to its initial empty state.
- **FR-016**: The system MUST notify the user with an Arabic-language warning when a write operation fails due to storage quota exhaustion, leaving the existing data intact.

### Key Entities

- **RelapseRecord**: Represents a single relapse event. Key fields: unique ID, date (calendar day), time (hour/minute), AM/PM indicator, count (number of occurrences in this record), urge level (1–10 integer), reason (free text), notes (free text). All fields except ID, date, and count are optional.
- **Settings**: Application-wide preferences. Key fields: preferred language (always Arabic in v1), theme preference (dark/light), any future user-configurable toggles.
- **DashboardPreferences**: User's saved layout choices. Key fields: card ordering (ordered list of card identifiers), hidden card identifiers (set of card IDs the user has dismissed/hidden).
- **StorageVersion**: Metadata record tracking the current schema version stored in local storage, used to trigger and coordinate migrations.
- **ExportBundle**: The structure of the exported JSON file. Contains: schema version, export timestamp, all relapse records, current settings, current dashboard preferences.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A relapse record created by the user is retrievable on the next app load in under 50 milliseconds (from storage read to data available in memory).
- **SC-002**: The system handles at least 10,000 relapse records stored in local storage without exceeding 5 MB of storage consumption and without UI lag during read operations.
- **SC-003**: 100% of invalid records (missing required fields, out-of-range values) are rejected before being written to storage — zero corrupt records ever reach the data store.
- **SC-004**: An export of 10,000 records completes and triggers a file download in under 3 seconds.
- **SC-005**: An import of a 10,000-record JSON file (replace strategy) completes in under 5 seconds with all records correctly restored.
- **SC-006**: Schema migrations complete automatically in under 200 milliseconds on app load for any supported previous version.
- **SC-007**: Zero unhandled JavaScript errors are thrown when encountering corrupted, missing, or quota-exceeded storage conditions.

## Assumptions

- All user-facing text, including error messages, labels, and confirmations, is in Arabic only — no i18n/l10n mechanism is needed for this phase.
- The application targets modern evergreen browsers (Chrome, Firefox, Edge, Safari) that support the localStorage Web API; no polyfills for storage are required.
- The relapse record schema is considered stable for this phase; future phases may introduce new fields, which is why versioning and migration support is included.
- The maximum expected practical dataset is approximately 10,000 records; performance targets are calibrated to this scale.
- Dashboard Preferences card identifiers are defined by the Dashboard Infrastructure phase and are treated as opaque strings by the data layer.
- The merge import strategy resolves ID conflicts conservatively: the local (existing) record is kept and the imported record with the same ID is skipped.
- Storage versioning uses a single integer version number stored at a well-known key; the migration system applies migrations sequentially from the stored version to the current version.
