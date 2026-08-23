# Feature Specification: Records CRUD Endpoints

**Feature Branch**: `017-records-crud`

**Created**: 2026-08-23

**Status**: Draft

**Input**: User description: "Phase 3 Records CRUD Endpoints — Allow authenticated users to create, read, update, and delete their relapse records via the API. Data is strictly isolated per user."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create a Relapse Record (Priority: P1)

As a logged-in user, I want to log a new relapse event by providing the date and optional details (time, count, urge level, reason, notes) so that I can track my progress over time.

**Why this priority**: Creating records is the foundational action — without it, no other CRUD operation or analytics has data to work with.

**Independent Test**: Can be fully tested by sending a POST request with valid data and verifying the record is returned with a generated ID and timestamps.

**Acceptance Scenarios**:

1. **Given** the user is authenticated, **When** they submit a record with date only, **Then** the system creates the record with default count=1 and returns it with an ID and timestamps.
2. **Given** the user is authenticated, **When** they submit a record with all optional fields (time, ampm, count, urgeLevel, reason, notes), **Then** the system stores all values and returns the complete record.
3. **Given** the user is authenticated, **When** they submit a record with an invalid date format, **Then** the system rejects the request with an Arabic error message.
4. **Given** the user is authenticated, **When** they submit a record with count < 1, **Then** the system rejects the request with an Arabic error message.
5. **Given** the user is authenticated, **When** they submit a record with urgeLevel outside 1–10, **Then** the system rejects the request with an Arabic error message.

---

### User Story 2 - View My Records (Priority: P1)

As a logged-in user, I want to see a list of all my relapse records, optionally filtered by date range, so that I can review my history.

**Why this priority**: Reading records is equally fundamental — the user needs to verify their data was saved and browse their history.

**Independent Test**: Can be fully tested by creating records, then sending a GET request and verifying the correct records are returned in descending date order.

**Acceptance Scenarios**:

1. **Given** the user has 5 records, **When** they request the list without date filters, **Then** all 5 records are returned sorted by date descending.
2. **Given** the user has records on Jan 1, Jan 15, and Feb 1, **When** they request with `from=2026-01-10&to=2026-01-20`, **Then** only the Jan 15 record is returned.
3. **Given** the user has records, **When** they request the list, **Then** only their own records are returned (no other user's data).
4. **Given** the user has no records, **When** they request the list, **Then** an empty array is returned.

---

### User Story 3 - View a Single Record (Priority: P2)

As a logged-in user, I want to view the full details of a specific relapse record by its ID so that I can inspect or verify a particular entry.

**Why this priority**: Useful for reviewing individual records before editing or deleting them.

**Independent Test**: Can be tested by creating a record, fetching it by ID, and verifying all fields match.

**Acceptance Scenarios**:

1. **Given** the user owns a record with ID "abc", **When** they request GET /api/records/abc, **Then** the full record is returned.
2. **Given** a record exists with ID "xyz" owned by another user, **When** the authenticated user requests GET /api/records/xyz, **Then** a 403 Forbidden response is returned.
3. **Given** no record exists with ID "nonexistent", **When** the user requests GET /api/records/nonexistent, **Then** a 404 Not Found response is returned.

---

### User Story 4 - Update a Record (Priority: P2)

As a logged-in user, I want to edit a previously created relapse record to correct mistakes or add missing details.

**Why this priority**: Important for data accuracy — users may need to correct entries after initial creation.

**Independent Test**: Can be tested by creating a record, updating fields, and verifying the changes persist.

**Acceptance Scenarios**:

1. **Given** the user owns a record, **When** they submit updated fields, **Then** the record is updated and the full updated record is returned.
2. **Given** a record owned by another user, **When** the authenticated user attempts to update it, **Then** a 403 Forbidden response is returned.
3. **Given** a non-existent record ID, **When** the user attempts to update it, **Then** a 404 Not Found response is returned.
4. **Given** the user updates a record, **When** they check the updated_at timestamp, **Then** it reflects the time of the update.

---

### User Story 5 - Delete a Record (Priority: P2)

As a logged-in user, I want to delete a relapse record that I no longer need, so that my data stays accurate.

**Why this priority**: Necessary for data management — users need to remove erroneous or unwanted entries.

**Independent Test**: Can be tested by creating a record, deleting it, and confirming it no longer appears in the list.

**Acceptance Scenarios**:

1. **Given** the user owns a record, **When** they delete it, **Then** a 204 No Content response is returned and the record is removed.
2. **Given** a record owned by another user, **When** the authenticated user attempts to delete it, **Then** a 403 Forbidden response is returned.
3. **Given** a non-existent record ID, **When** the user attempts to delete it, **Then** a 404 Not Found response is returned.

---

### Edge Cases

- What happens when the user submits a record with a future date? (Allowed — no restriction on date direction.)
- What happens when two users create records with the same date and time? (Allowed — records are independent per user.)
- What happens when the user's session expires mid-request? (Standard 401 Unauthorized response with token refresh guidance.)
- What happens when the user submits a record with extremely long text in reason/notes? (System enforces a reasonable character limit; Arabic error message if exceeded.)
- What happens when the user tries to access a record that was just deleted by another session? (404 Not Found.)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow authenticated users to create relapse records with a required date and optional time, ampm, count, urgeLevel, reason, and notes fields.
- **FR-002**: System MUST return all relapse records for the authenticated user, sorted by date descending, with optional date range filtering via `from` and `to` query parameters.
- **FR-003**: System MUST allow users to retrieve a single record by its unique identifier.
- **FR-004**: System MUST allow users to update all fields of their own relapse records.
- **FR-005**: System MUST allow users to delete their own relapse records, returning 204 No Content on success.
- **FR-006**: System MUST enforce strict data isolation — every query MUST filter by the authenticated user's ID; a user MUST NEVER access, modify, or delete another user's records.
- **FR-007**: System MUST validate that `date` is in valid YYYY-MM-DD format and is present.
- **FR-008**: System MUST validate that `count` is an integer >= 1 when provided.
- **FR-009**: System MUST validate that `urgeLevel` is an integer between 1 and 10 when provided.
- **FR-010**: System MUST return all error messages in Arabic.
- **FR-011**: System MUST return 404 when a requested record does not exist.
- **FR-012**: System MUST return 403 when a user attempts to access a record belonging to another user.
- **FR-013**: System MUST require a valid JWT access token for all record endpoints (no anonymous access).
- **FR-014**: System MUST automatically populate `created_at` on record creation and both `created_at` and `updated_at` on updates.

### Key Entities

- **Relapse Record**: Represents a single relapse event logged by a user. Key attributes include the date and time of the event, a count of occurrences, an urge level rating, free-text reason and notes, and system-managed timestamps. Each record belongs to exactly one user and cannot be accessed by other users.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a new relapse record in under 5 seconds from form submission to confirmation.
- **SC-002**: Users can retrieve their complete record history with no more than 2 seconds of load time for up to 1,000 records.
- **SC-003**: 100% of cross-user access attempts are blocked (no data leakage between accounts).
- **SC-004**: All validation errors are displayed to the user in Arabic within 1 second of submission.
- **SC-005**: Create, read, update, and delete operations all complete successfully for authenticated users with valid data on the first attempt (no retry needed under normal conditions).

## Assumptions

- The authentication system (Phase 2 — JWT tokens, auth middleware) is already implemented and functional.
- The database schema for relapse records is already defined (Phase 1) with the required fields.
- The CORS middleware is already configured to allow requests from the Angular frontend.
- Users will interact with these endpoints through an Angular frontend (Phase 7 migration), but the API is designed to be frontend-agnostic.
- Arabic is the primary language for all user-facing messages, including error messages.
- Record timestamps (`created_at`, `updated_at`) are stored in UTC.
- There is no soft-delete mechanism — deletion is permanent and immediate.
- The `updated_at` field is automatically set by the system on every update operation, not by the client.
