# Feature Specification: Backend Scaffolding & Database

**Feature Branch**: `015-backend-scaffolding-db`

**Created**: 2026-08-22

**Status**: Draft

**Input**: User description: "Phase 1 — Backend Scaffolding & Database: Set up the Hono Worker project inside the monorepo, connect it to Cloudflare D1, define the database schema, and get a running local dev environment."

## Clarifications

### Session 2026-08-22

- Q: What level of observability (error logging/request tracing) should the Worker provide out of the box in Phase 1? → A: Structured request + error logging to `console` (method, path, status, error message), leveraging Cloudflare's native log capture so no external log storage is needed.
- Q: How should the production frontend origin be provided to the Worker's CORS middleware? → A: Via an `ALLOWED_ORIGIN` Wrangler environment variable defined per environment in `wrangler.toml` (e.g., `[env.production]`), read at runtime — no rebuild required to change origins between environments.
- Q: When is the `user_settings` row first created for a new user? → A: Created automatically during registration in the same transaction as the `users` row — always exists by the time the user logs in, no upsert logic needed in the settings endpoint.
- Q: Should deleting a user cascade-delete their `relapse_records`? → A: No user deletion feature exists in the application; the `relapse_records.user_id` FK will still declare `ON DELETE CASCADE` as a schema safety net, but no delete-user code path will be implemented.
- Q: How should the migration system handle re-runs? → A: Drizzle migration journal — the `migrate()` function tracks applied migrations in a `__drizzle_migrations` table and skips already-applied ones; no `IF NOT EXISTS` guards in SQL files are required.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Developer Bootstraps the Backend Project (Priority: P1)

A developer clones the repository and wants to get the backend running locally for the first time. They run a single setup command from the `backend/` directory and within minutes have a local dev server accepting requests.

**Why this priority**: This is the foundational step — nothing else in any subsequent phase is possible without a running, connectable backend. All other user stories in all other phases depend on this.

**Independent Test**: Can be fully tested by running the local dev server and hitting `GET /api/health` — it should return `{ "status": "ok" }` with no authentication required, delivering the minimum viable signal that the stack is alive.

**Acceptance Scenarios**:

1. **Given** the monorepo is cloned and Node.js is installed, **When** the developer runs the backend install and dev commands, **Then** a local server starts on port `8787` without errors.
2. **Given** the server is running, **When** the developer sends `GET http://localhost:8787/api/health`, **Then** the response is `{ "status": "ok" }` with HTTP 200.
3. **Given** the server is running, **When** the developer sends a request from the Angular dev server at `http://localhost:4200`, **Then** the response includes the correct CORS headers and is not blocked by the browser.

---

### User Story 2 - Developer Creates the Database Schema via Migration (Priority: P2)

A developer runs the Drizzle migration command and all four tables are created in the local D1 database with the correct columns, constraints, and foreign key relationships.

**Why this priority**: The database schema is the contract that all subsequent phases (auth, records, analytics, settings) write against. A correct schema now prevents data-layer rework later.

**Independent Test**: Can be fully tested by running the migration and then querying the SQLite file to confirm all four tables exist with the expected structure.

**Acceptance Scenarios**:

1. **Given** the local dev environment is set up, **When** the Drizzle migration command is executed, **Then** the `users`, `refresh_tokens`, `relapse_records`, and `user_settings` tables are created in the local D1 database.
2. **Given** the migration has run, **When** the developer inspects the `refresh_tokens` table, **Then** it has a foreign key to `users` with cascade-delete behavior.
3. **Given** the migration has run, **When** a record is inserted into `relapse_records` with no `time` or `urge_level`, **Then** the insert succeeds (nullable columns accept null).
4. **Given** the migration has run, **When** the developer re-runs the migration, **Then** it does not fail or duplicate tables (idempotent apply).

---

### User Story 3 - Developer Deploys a D1 Database and Connects It to the Worker (Priority: P3)

A developer creates a Cloudflare D1 database instance (local or remote), configures `wrangler.toml` to bind it, and confirms the Worker can read from and write to it during local development.

**Why this priority**: Without a functioning D1 binding the Worker cannot persist any data. This story validates the integration between the Hono app and the database layer before any business logic is added.

**Independent Test**: Can be fully tested by verifying that a migration applied locally produces readable tables via `wrangler d1 execute --local`.

**Acceptance Scenarios**:

1. **Given** a D1 database is created, **When** the `wrangler.toml` is updated with the correct binding name and database ID, **Then** running `wrangler dev` connects the Worker to the D1 instance without errors.
2. **Given** the Worker is running with the D1 binding, **When** a Drizzle query is executed against the bound database, **Then** it returns results without runtime errors.

---

### Edge Cases

- What happens when a developer runs `wrangler dev` without a D1 database created yet? The server should fail fast with a clear error rather than silently returning empty results.
- What happens when the Angular dev server origin is not in the CORS allowlist? The browser blocks the request; no server-side data leak occurs.
- What happens when two rows in `users` have the same `username`? The unique constraint causes the insert to fail with a database-level constraint error.
- What happens when a `refresh_tokens` row references a deleted user? The cascade-delete FK is defined as a schema safety net, but the application provides no user-deletion endpoint; this path is never triggered in normal operation.
- What happens when the D1 database is empty and the health endpoint is called? The health endpoint returns `{ "status": "ok" }` regardless of database state (it does not query the database).
- What happens when the Worker throws an unhandled exception? The logger middleware catches it, logs the error (method, path, error message) to `console.error`, and returns a generic 500 response — the raw error is never exposed to the client.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a `backend/` directory at the root of the existing monorepo containing a fully independent Hono Worker project with its own `package.json`, `tsconfig.json`, and `wrangler.toml`.
- **FR-002**: The system MUST define the database schema in TypeScript using Drizzle ORM covering four tables: `users`, `refresh_tokens`, `relapse_records`, and `user_settings` with all columns, types, constraints, and foreign-key relationships as specified in the plan.
- **FR-003**: The system MUST generate an initial SQL migration file from the Drizzle schema (no hand-written SQL) and apply it using Drizzle's `migrate()` function, which maintains a `__drizzle_migrations` journal table in D1 to track applied migrations and skip re-runs safely.
- **FR-004**: The system MUST expose a `GET /api/health` endpoint that returns `{ "status": "ok" }` with HTTP 200, requiring no authentication.
- **FR-005**: The system MUST include a CORS middleware that reads the allowed origin from an `ALLOWED_ORIGIN` Wrangler environment variable; locally this is set to `http://localhost:4200`, and in production it is set to the Cloudflare Pages URL — no code change is required to switch environments.
- **FR-006**: The system MUST start a local development server on port `8787` using the Wrangler CLI dev command, connecting to the local D1 database.
- **FR-007**: The `relapse_records` table MUST store `date` as a text field in `YYYY-MM-DD` format, `time` as nullable `HH:mm`, `ampm` as nullable `am|pm`, `urge_level` as a nullable integer in the range 1–10, and `count` defaulting to 1.
- **FR-008**: The `user_settings` table MUST use `user_id` as both the primary key and a foreign key to `users` with cascade-delete, and MUST default `theme` to `dark` and `language` to `ar`.
- **FR-009**: All UUID primary keys MUST be generated server-side (not by the database engine) to ensure compatibility with Cloudflare D1's SQLite dialect.
- **FR-010**: The backend project MUST be deployable and testable independently from the Angular frontend without any build steps from the root `package.json`.
- **FR-011**: The Worker MUST include a logging middleware that records the HTTP method, path, response status code, and any error message to `console` for every request; unhandled errors MUST be caught and logged via `console.error` before returning a generic 500 response, never leaking internal error details to the client.
- **FR-012**: The `user_settings` row MUST be inserted in the same database transaction as the `users` row during registration, using default values (theme=dark, language=ar, defaultUrgeLevel=null); if the transaction fails, both rows are rolled back together.

### Key Entities *(include if feature involves data)*

- **User**: Represents an authenticated account. Key attributes: unique username, hashed password (format: `iterations:hexSalt:hexHash`), creation timestamp. Has one-to-many relationship with refresh tokens, relapse records, and exactly one user settings row.
- **Refresh Token**: Represents a valid long-lived session credential. Key attributes: hashed token value, expiry timestamp, owning user. Automatically removed when the owning user is deleted.
- **Relapse Record**: Represents a single tracked relapse event. Key attributes: date (required), optional time and am/pm marker, relapse count (default 1), optional urge level (1–10), optional reason and notes text. Strictly isolated per user. The FK to `users` declares `ON DELETE CASCADE` as a schema-level safeguard; no user-deletion feature exists in the application.
- **User Settings**: Stores per-user preferences. Key attributes: theme preference, language preference, optional default urge level. One row per user; created atomically during registration (same transaction as the `users` row) with defaults theme=dark and language=ar — guaranteed to exist for every authenticated user.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A developer unfamiliar with the codebase can start the backend local dev server in under 5 minutes by following README instructions with no manual configuration beyond installing Node.js.
- **SC-002**: All four database tables are created by a single migration command with zero hand-written SQL files maintained by the developer.
- **SC-003**: `GET /api/health` returns HTTP 200 with body `{ "status": "ok" }` in under 500 ms on a local machine under normal load.
- **SC-004**: Cross-origin requests from the Angular dev server (`http://localhost:4200`) succeed in the browser without CORS errors for all API endpoints.
- **SC-005**: Running the Drizzle `migrate()` command multiple times on the same local database produces no errors and no duplicate tables; the migration journal (`__drizzle_migrations`) ensures already-applied migrations are skipped.
- **SC-006**: All foreign key relationships are declared with appropriate constraints in the schema; no user-deletion endpoint is implemented or in scope for any phase.
- **SC-007**: Every request to the Worker produces a log entry visible in the Cloudflare Workers tail or local `wrangler dev` console output; unhandled errors produce a `console.error` entry and never expose raw stack traces in the HTTP response.

## Assumptions

- The monorepo root already contains a working Angular project (`src/`, `angular.json`, root `package.json`); this phase only adds a `backend/` subtree.
- Cloudflare Workers and D1 are available to the developer (a Cloudflare account exists); local development uses the Wrangler local emulation mode which does not require a live Cloudflare account for running locally.
- The developer has Node.js (LTS) and npm installed; no other global tooling is assumed pre-installed.
- The production Cloudflare Pages URL for the frontend is not yet known; the `ALLOWED_ORIGIN` Wrangler environment variable will be set to a placeholder value locally and updated in `wrangler.toml` under `[env.production]` at deployment time (Phase 8) — no source code changes are required.
- UUID generation is handled in application code rather than relying on a database-level function, for compatibility with D1's SQLite dialect.
- All timestamps are stored as ISO-8601 text strings, consistent with D1's recommended practice for edge-compatible date handling.
- Mobile support and multi-region replication are out of scope for this phase.
- Cloudflare natively captures all `console.*` output from Workers; no external log aggregation service or custom log storage is required in Phase 1.
