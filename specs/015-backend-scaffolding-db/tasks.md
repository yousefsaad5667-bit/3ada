# Tasks: Backend Scaffolding & Database

**Feature**: `015-backend-scaffolding-db`
**Input**: Design documents from `specs/015-backend-scaffolding-db/`
**Prerequisites**: [plan.md](./plan.md) · [spec.md](./spec.md) · [research.md](./research.md) · [data-model.md](./data-model.md) · [contracts/api.md](./contracts/api.md) · [quickstart.md](./quickstart.md)
**Tests**: Manual verification only — `curl` + `wrangler d1 execute` (no automated test framework in Phase 1 per plan.md)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

## Path Conventions

All source paths are relative to the monorepo root. The Angular frontend (`src/`, `angular.json`) is **untouched** — all new files live under `backend/`.

---

## Phase 1: Setup (Scaffold `backend/` directory)

**Purpose**: Create the `backend/` directory with all project configuration files. No source logic yet — just the skeleton the developer needs to run `npm install`.

- [x] T001 Create `backend/` directory at the monorepo root and initialise `backend/package.json` with name `habit-tracker-api`, scripts (`dev`, `db:generate`, `db:migrate:local`, `type-check`), and dependencies (`hono`, `drizzle-orm`, `drizzle-kit`, `wrangler`, `typescript`)
- [x] T002 [P] Create `backend/tsconfig.json` with strict TypeScript 5.x settings and Workers-compatible lib target (no `dom`, target `ES2022`)
- [x] T003 [P] Create `backend/wrangler.toml` with worker name `habit-tracker-api`, `main = "src/index.ts"`, `compatibility_date`, `[[d1_databases]]` block (binding `DB`, `database_name = "habit-tracker-db"`, empty `database_id` placeholder), `[vars] ALLOWED_ORIGIN = "http://localhost:4200"`, and `[env.production.vars] ALLOWED_ORIGIN = "https://PLACEHOLDER.pages.dev"`
- [x] T004 [P] Create `backend/drizzle.config.ts` pointing `schema` to `./src/db/schema.ts`, `out` to `./drizzle`, dialect `sqlite`, driver `d1-http`

**Checkpoint**: `backend/` directory exists with all config files. Developer can run `npm install` from `backend/`.

---

## Phase 2: Foundational (Core infrastructure — MUST complete before user story phases)

**Purpose**: Wire up the TypeScript source skeleton — types, DB client, middleware, and app entry point — without any story-specific logic. All user story phases depend on these files existing.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T005 Create `backend/src/types.ts` exporting the `Env` interface with `DB: D1Database` and `ALLOWED_ORIGIN: string` bindings
- [x] T006 [P] Create `backend/src/db/schema.ts` with Drizzle `sqliteTable` definitions for all four tables: `users`, `refresh_tokens`, `relapse_records`, `user_settings` — including all columns, types, nullable/default settings, and FK `references()` with `onDelete: 'cascade'` per data-model.md
- [x] T007 [P] Create `backend/src/db/client.ts` exporting `createDb(d1: D1Database)` factory using `drizzle(d1, { schema })` from `drizzle-orm/d1`; export inferred TypeScript types (`User`, `NewUser`, `RefreshToken`, etc.) using `InferSelectModel` / `InferInsertModel`
- [x] T008 [P] Create `backend/src/middleware/cors.ts` exporting `corsMiddleware(origin: string)` using Hono's built-in `cors()` helper; allowed methods: GET, POST, PUT, DELETE, OPTIONS; allowed headers: Content-Type, Authorization
- [x] T009 [P] Create `backend/src/middleware/logger.ts` exporting `loggerMiddleware` as a Hono `MiddlewareHandler` that awaits `next()` then logs `JSON.stringify({ method, path, status })` to `console.log`; does not swallow errors (global `onError` handles them in `index.ts`)
- [x] T010 Create `backend/src/index.ts` — Hono app typed with `{ Bindings: Env }`, register `corsMiddleware` and `loggerMiddleware` globally (`app.use('*', ...)`), add `app.onError` handler that logs `{ error: err.message, path }` via `console.error` and returns `c.json({ error: 'Internal server error' }, 500)`, export `app` as default; leave route registration for Phase 3

**Checkpoint**: TypeScript compiles (`npm run type-check` passes from `backend/`). App skeleton is wired; no routes are registered yet.

---

## Phase 3: User Story 1 — Developer Bootstraps the Backend Project (Priority: P1) 🎯 MVP

**Goal**: A developer can start the local dev server and get a `200 { "status": "ok" }` response from `GET /api/health` within minutes of cloning the repo.

**Independent Test**: `curl http://localhost:8787/api/health` returns `{ "status": "ok" }` with HTTP 200. Browser fetch from `http://localhost:4200` succeeds without CORS errors.

### Implementation for User Story 1

- [x] T011 [US1] Add `GET /api/health` route to `backend/src/index.ts` returning `c.json({ status: 'ok' })` — no authentication, no DB query (per contracts/api.md)
- [x] T012 [US1] Install dependencies by running `npm install` from `backend/` and verify `node_modules/` is populated and `package-lock.json` is generated
- [x] T013 [US1] Start the local dev server with `npm run dev` from `backend/` and confirm Wrangler starts on port `8787` without errors; document the expected terminal output in a comment block at the top of `backend/wrangler.toml`
- [x] T014 [US1] Verify the health endpoint: `curl http://localhost:8787/api/health` → HTTP 200, body `{"status":"ok"}`; verify the `wrangler dev` console shows a log entry with `method: "GET"`, `path: "/api/health"`, `status: 200`
- [x] T015 [US1] Verify CORS: from the browser at `http://localhost:4200`, execute `fetch("http://localhost:8787/api/health")` and confirm no CORS errors; confirm `Access-Control-Allow-Origin: http://localhost:4200` is present in the response headers

**Checkpoint**: User Story 1 fully verified. `GET /api/health` returns 200. CORS works. Logger writes to console. **MVP deliverable — stack is alive.**

---

## Phase 4: User Story 2 — Developer Creates the Database Schema via Migration (Priority: P2)

**Goal**: Running the Drizzle migration command creates all four tables in the local D1 database with the correct columns, constraints, and FK relationships. Re-running the migration is safe.

**Independent Test**: After running the migration, `wrangler d1 execute habit-tracker-db --local --command="SELECT name FROM sqlite_master WHERE type='table';"` lists all 4 tables plus `__drizzle_migrations`.

### Implementation for User Story 2

- [x] T016 [US2] Run `npm run db:generate` from `backend/` to invoke `drizzle-kit generate` and produce `backend/drizzle/0000_initial.sql` from `src/db/schema.ts` — verify the SQL file is auto-generated and contains `CREATE TABLE` statements for all four tables
- [x] T017 [US2] Inspect `backend/drizzle/0000_initial.sql` and confirm: (a) `users` table has `id TEXT PRIMARY KEY`, `username TEXT NOT NULL UNIQUE`, `password_hash TEXT NOT NULL`, `created_at TEXT NOT NULL`; (b) `refresh_tokens` has FK `REFERENCES users(id) ON DELETE CASCADE`; (c) `relapse_records` has nullable `time`, `ampm`, `urge_level` and `count INTEGER NOT NULL DEFAULT 1`; (d) `user_settings` uses `user_id` as both PK and FK with CASCADE, defaults `theme='dark'` and `language='ar'`
- [x] T018 [US2] Apply the migration to the local D1 database: `npx wrangler d1 execute habit-tracker-db --local --file=drizzle/0000_initial.sql` from `backend/`; verify command exits with code 0
- [x] T019 [US2] Verify idempotency: re-run the migration command from T018 a second time and confirm it exits with code 0 and produces no errors (Drizzle journal skips applied migrations)
- [x] T020 [US2] Verify nullable columns: execute `npx wrangler d1 execute habit-tracker-db --local --command="INSERT INTO relapse_records (id, user_id, date, created_at, updated_at) VALUES ('r1','u1','2026-08-22','2026-08-22T00:00:00Z','2026-08-22T00:00:00Z');"` and confirm the insert succeeds (time, ampm, urge_level accept NULL)
- [x] T021 [US2] Verify FK cascade declaration: execute `PRAGMA foreign_key_list(refresh_tokens);` against the local D1 and confirm `on_delete = 'CASCADE'` is listed for the `user_id` column

**Checkpoint**: All 4 tables exist, FK constraints are declared, nullable columns verified, migration is idempotent.

---

## Phase 5: User Story 3 — Developer Deploys a D1 Database and Connects It to the Worker (Priority: P3)

**Goal**: A developer creates a Cloudflare D1 database instance, sets the `database_id` in `wrangler.toml`, and confirms the Worker connects to D1 at startup with no runtime errors.

**Independent Test**: `wrangler d1 execute habit-tracker-db --local --command="SELECT name FROM sqlite_master WHERE type='table';"` returns readable table names, confirming the binding is live.

### Implementation for User Story 3

- [x] T022 [US3] Create the local D1 database by running `npx wrangler d1 create habit-tracker-db` from `backend/`; copy the `database_id` from the CLI output into the `[[d1_databases]]` block of `backend/wrangler.toml`
- [x] T023 [US3] Restart `npm run dev` after updating `wrangler.toml` with the `database_id`; confirm Wrangler logs show the D1 binding `DB` is attached at startup with no binding errors
- [x] T024 [US3] Verify D1 connectivity: run `npx wrangler d1 execute habit-tracker-db --local --command="SELECT name FROM sqlite_master WHERE type='table';"` from `backend/` and confirm all 4 tables plus `__drizzle_migrations` appear in the output (requires migration from Phase 4 to have been applied)
- [x] T025 [US3] Verify error logging for missing binding: temporarily remove the `[[d1_databases]]` block from `wrangler.toml`, restart `npm run dev`, confirm a clear Wrangler startup error appears (not a silent failure); restore the binding block

**Checkpoint**: D1 binding is live, Worker connects on startup, D1 tables are queryable via `wrangler d1 execute`.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, documentation completeness, and type safety confirmation across all delivered stories.

- [x] T026 [P] Run `npm run type-check` from `backend/` and confirm TypeScript exits with 0 errors across all source files (`src/index.ts`, `src/types.ts`, `src/db/schema.ts`, `src/db/client.ts`, `src/middleware/cors.ts`, `src/middleware/logger.ts`)
- [x] T027 [P] Verify error logging: send a request that triggers the global `onError` handler (e.g., monkey-patch a route to throw), confirm `console.error` entry appears in `wrangler dev` output with `{ error: "...", path: "..." }` and the HTTP response body is exactly `{"error":"Internal server error"}` with no stack trace
- [x] T028 Follow the steps in `quickstart.md` cold (from a fresh terminal) and confirm a developer unfamiliar with the codebase can start the dev server and hit `/api/health` in under 5 minutes; update `quickstart.md` if any step is inaccurate

**Checkpoint**: All acceptance criteria from spec.md (SC-001 through SC-007) are verified. Phase 1 is complete.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — **BLOCKS all user stories**
- **User Story Phases (3, 4, 5)**: All depend on Phase 2 completion
  - US1 (Phase 3) → US2 (Phase 4) → US3 (Phase 5) in priority order
  - US2 depends on Phase 2 only (schema defined in T006); can start after Foundational
  - US3 depends on US2 migration output (`0000_initial.sql`) — run Phase 4 first
- **Polish (Phase 6)**: Depends on all user story phases

### User Story Dependencies

- **US1 (P1)**: After Foundational — no dependency on US2 or US3
- **US2 (P2)**: After Foundational — schema already in T006; generates + applies migration
- **US3 (P3)**: After US2 migration is applied — needs the SQL file from T016–T018

### Within Each Phase

- All tasks marked `[P]` within a phase can run in parallel
- Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6

### Parallel Opportunities

- **Phase 1**: T002, T003, T004 can all run in parallel after T001 creates the directory
- **Phase 2**: T006, T007, T008, T009 can all run in parallel after T005 creates `types.ts`
- **Phase 6**: T026 and T027 can run in parallel

---

## Parallel Example: Phase 2 (Foundational)

```bash
# After T005 (types.ts) is done, launch all of these simultaneously:
Task T006: Create backend/src/db/schema.ts
Task T007: Create backend/src/db/client.ts
Task T008: Create backend/src/middleware/cors.ts
Task T009: Create backend/src/middleware/logger.ts
# Then: T010 (index.ts) — depends on all four above
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 — health endpoint
4. **STOP and VALIDATE**: `curl /api/health` → 200, CORS headers, console log ✅
5. Stack is alive — Phase 1 MVP delivered

### Incremental Delivery

1. Setup + Foundational → skeleton compiles, no routes
2. + User Story 1 → health endpoint live, CORS working, logging verified (**MVP**)
3. + User Story 2 → schema migrated, all 4 tables exist, idempotent apply verified
4. + User Story 3 → D1 binding confirmed, Worker connects to DB on startup
5. + Polish → type-check passes, quickstart validated end-to-end

---

## Acceptance Criteria Mapping

| Task(s) | Spec ID | Criterion |
|---------|---------|-----------|
| T013–T014 | SC-001 | Dev server starts in < 5 min from quickstart |
| T016–T017 | SC-002 | 4 tables from single migration, no hand-written SQL |
| T014 | SC-003 | `/api/health` returns 200 < 500 ms |
| T015 | SC-004 | No CORS errors from `localhost:4200` |
| T019 | SC-005 | Re-run migration is safe, no duplicates |
| T021 | SC-006 | FK constraints with CASCADE declared |
| T027 | SC-007 | Log entry per request, error never in response body |

---

## Notes

- No automated test framework is introduced in Phase 1 — all verification is manual (curl, wrangler d1 execute, browser devtools)
- `[P]` tasks operate on different files and have no shared mutable state — safe to run concurrently
- `crypto.randomUUID()` is used for all UUID generation — no `uuid` npm package needed
- All timestamps stored as ISO-8601 text strings — no SQLite `TIMESTAMP` type used
- The Angular frontend in `src/` is never modified in this phase (FR-010)
