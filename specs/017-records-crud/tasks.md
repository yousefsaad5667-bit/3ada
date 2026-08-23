# Tasks: Records CRUD Endpoints

**Input**: Design documents from `/specs/017-records-crud/`

**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Tests**: Not explicitly requested - excluded from tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/` (Cloudflare Workers + Hono)
- **Database**: `backend/src/db/` (D1 schema and migrations)
- **Frontend**: `frontend/src/` (Angular)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create backend project structure per implementation plan in `backend/`
- [X] T002 Initialize Cloudflare Workers project with Hono, @hono/zod-openapi, Zod dependencies
- [X] T003 [P] Configure wrangler.toml for D1 database binding
- [X] T004 [P] Create D1 schema and migration files in `backend/src/db/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 Implement JWT authentication middleware in `backend/src/middleware/auth.ts`
- [X] T006 [P] Create Record type definitions in `backend/src/models/record.ts`
- [X] T007 [P] Setup API routing structure in `backend/src/routes/`
- [X] T008 Create error handling utilities with Arabic messages in `backend/src/utils/`
- [X] T009 Configure environment variables for JWT secret and D1 binding

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create a Relapse Record (Priority: P1) 🎯 MVP

**Goal**: Allow authenticated users to create relapse records with date and optional fields

**Independent Test**: Send POST request with valid data, verify record returned with ID and timestamps

### Implementation for User Story 1

- [X] T010 [P] [US1] Create RecordService in `backend/src/services/record.ts` with create method
- [X] T011 [US1] Implement POST /api/records endpoint in `backend/src/routes/records.ts`
- [X] T012 [US1] Add Zod validation schema for create record request
- [X] T013 [US1] Implement date format validation (YYYY-MM-DD)
- [X] T014 [US1] Implement count validation (integer >= 1)
- [X] T015 [US1] Implement urgeLevel validation (integer 1-10)
- [X] T016 [US1] Add Arabic error messages for all validation failures
- [X] T017 [US1] Add created_at timestamp auto-population

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - View My Records (Priority: P1)

**Goal**: Allow users to list all their records with optional date filtering

**Independent Test**: Create multiple records, send GET request, verify correct records returned sorted by date

### Implementation for User Story 2

- [X] T018 [P] [US2] Add getAll method to RecordService in `backend/src/services/record.ts`
- [X] T019 [US2] Implement GET /api/records endpoint in `backend/src/routes/records.ts`
- [X] T020 [US2] Add date range filtering with from/to query parameters
- [X] T021 [US2] Implement user ID filtering for data isolation
- [X] T022 [US2] Add date descending sort order
- [X] T023 [US2] Return empty array for users with no records

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - View a Single Record (Priority: P2)

**Goal**: Allow users to retrieve a specific record by ID

**Independent Test**: Create record, fetch by ID, verify all fields match; test 403 for other user's record; test 404 for nonexistent

### Implementation for User Story 3

- [X] T024 [P] [US3] Add getById method to RecordService in `backend/src/services/record.ts`
- [X] T025 [US3] Implement GET /api/records/:id endpoint in `backend/src/routes/records.ts`
- [X] T026 [US3] Add user ownership check for data isolation
- [X] T027 [US3] Return 403 Forbidden for other user's records
- [X] T028 [US3] Return 404 Not Found for nonexistent records

**Checkpoint**: User Story 3 complete - single record retrieval with proper access control

---

## Phase 6: User Story 4 - Update a Record (Priority: P2)

**Goal**: Allow users to update their existing records

**Independent Test**: Create record, update fields, verify changes persist and updated_at reflects update time

### Implementation for User Story 4

- [X] T029 [P] [US4] Add update method to RecordService in `backend/src/services/record.ts`
- [X] T030 [US4] Implement PUT /api/records/:id endpoint in `backend/src/routes/records.ts`
- [X] T031 [US4] Add Zod validation schema for update record request
- [X] T032 [US4] Add user ownership check before update
- [X] T033 [US4] Return 403 Forbidden for other user's records
- [X] T034 [US4] Return 404 Not Found for nonexistent records
- [X] T035 [US4] Auto-populate updated_at timestamp on update

**Checkpoint**: User Story 4 complete - full update capability with validation

---

## Phase 7: User Story 5 - Delete a Record (Priority: P2)

**Goal**: Allow users to delete their existing records

**Independent Test**: Create record, delete it, confirm 204 returned and record no longer appears in list

### Implementation for User Story 5

- [X] T036 [P] [US5] Add delete method to RecordService in `backend/src/services/record.ts`
- [X] T037 [US5] Implement DELETE /api/records/:id endpoint in `backend/src/routes/records.ts`
- [X] T038 [US5] Add user ownership check before delete
- [X] T039 [US5] Return 403 Forbidden for other user's records
- [X] T040 [US5] Return 404 Not Found for nonexistent records
- [X] T041 [US5] Return 204 No Content on successful deletion

**Checkpoint**: All user stories should now be independently functional

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T042 [P] Add comprehensive error handling for all endpoints
- [X] T043 [P] Add request logging for debugging
- [X] T044 Run quickstart.md validation scenarios
- [X] T045 Code cleanup and refactoring
- [X] T046 Performance optimization for large datasets

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1/US2/US3 but should be independently testable
- **User Story 5 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1/US2/US3/US4 but should be independently testable

### Within Each User Story

- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all models for User Story 1 together:
Task: "Create RecordService in backend/src/services/record.ts with create method"

# After service is ready, launch validation tasks together:
Task: "Add Zod validation schema for create record request"
Task: "Implement date format validation (YYYY-MM-DD)"
Task: "Implement count validation (integer >= 1)"
Task: "Implement urgeLevel validation (integer 1-10)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Add User Story 5 → Test independently → Deploy/Demo
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 + 2 (Create + List)
   - Developer B: User Story 3 + 4 + 5 (Read + Update + Delete)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
