# Implementation Plan: Backend Scaffolding & Database

**Branch**: `015-backend-scaffolding-db` | **Date**: 2026-08-22 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/015-backend-scaffolding-db/spec.md`

---

## Summary

Set up a standalone Hono Worker project in `backend/` at the monorepo root, connect it to Cloudflare D1 via Drizzle ORM, define the four-table database schema (users, refresh_tokens, relapse_records, user_settings), generate and apply the initial SQL migration, and expose `GET /api/health` behind CORS and logging middleware on local port `8787`.

---

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)

**Primary Dependencies**:
- Hono v4 — HTTP framework (Workers-native)
- Drizzle ORM v0.30.x + drizzle-kit v0.21.x — schema + migrations
- Wrangler v3.x — dev server + D1 local emulation

**Storage**: Cloudflare D1 (SQLite at the edge); local emulation via Wrangler's `.wrangler/state/` directory

**Testing**: Manual curl / wrangler d1 execute for Phase 1 (no automated test framework introduced yet)

**Target Platform**: Cloudflare Workers (V8 isolate, edge runtime)

**Project Type**: Web service (Worker microservice, part of monorepo)

**Performance Goals**: `GET /api/health` < 500 ms locally (SC-003)

**Constraints**:
- No Node.js-only packages (Workers V8 runtime)
- UUIDs generated via `crypto.randomUUID()` — no DB-level UUID function
- All timestamps as ISO-8601 text (D1 has no native timestamp type)
- `backend/` must be independently runnable without root `package.json` build steps

**Scale/Scope**: Phase 1 only — scaffolding + schema + health endpoint. Auth, CRUD, analytics in subsequent phases.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

> **Note**: The constitution (v1.1.0) was written for the Angular frontend phase. Principles I ("Angular Platform") and II ("100% Local-First") prohibit backends and cloud services for the **frontend** project — these restrictions have been explicitly superseded by the user's decision to migrate to a Cloudflare backend (documented in `BACKEND_PLAN.md` and `system design and infra plan.md`). The `backend/` directory is a separate project, not a modification to the Angular frontend.

| Principle | Status | Notes |
|-----------|--------|-------|
| III. Arabic Language & RTL | ✅ N/A for Phase 1 | No UI in this phase; Arabic error messages introduced in Phase 2 |
| IV. Modern UI & UX | ✅ N/A for Phase 1 | No UI in this phase |
| V. Performance & Scalability | ✅ PASS | Health endpoint < 500 ms; schema designed for 100k+ records |
| Architecture | ✅ PASS | Feature-based folder structure, separation of concerns, strong typing |
| Code Quality | ✅ PASS | Strict TypeScript, interfaces inferred from Drizzle schema, no duplicated logic |

**Verdict**: ✅ No violations. Phase 1 scope is pure backend scaffolding with no frontend impact.

---

## Project Structure

### Documentation (this feature)

```text
specs/015-backend-scaffolding-db/
├── plan.md              # This file (/speckit-plan command output)
├── spec.md              # Feature specification
├── research.md          # Phase 0 output — technology decisions
├── data-model.md        # Phase 1 output — table schemas & relationships
├── quickstart.md        # Phase 1 output — developer onboarding guide
├── contracts/
│   └── api.md           # Phase 1 output — health endpoint contract
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
backend/                          ← NEW standalone Hono Worker project
├── package.json                  ← Independent of root package.json
├── tsconfig.json                 ← Strict TypeScript, Workers-compatible lib
├── wrangler.toml                 ← Worker name, D1 binding, env vars, ports
├── drizzle.config.ts             ← Drizzle-kit config pointing to schema.ts
├── drizzle/
│   └── 0000_initial.sql          ← Auto-generated migration (drizzle-kit generate)
└── src/
    ├── index.ts                  ← Hono app entry point, middleware chain, routes
    ├── types.ts                  ← Env bindings interface (D1Database, ALLOWED_ORIGIN)
    ├── db/
    │   ├── schema.ts             ← Drizzle table definitions (all 4 tables)
    │   └── client.ts             ← createDb(d1: D1Database) factory
    └── middleware/
        ├── cors.ts               ← CORS middleware reading ALLOWED_ORIGIN from env
        └── logger.ts             ← Request/response + error logging to console
```

**Structure Decision**: Option 2 variant — Web service with separate `backend/` subtree. The Angular frontend in `src/` is untouched. The `backend/` project is self-contained with its own `package.json`, `tsconfig.json`, and `wrangler.toml`, deployable independently (FR-010).

---

## Implementation Details

### `wrangler.toml`

```toml
name = "habit-tracker-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "habit-tracker-db"
database_id = ""           # filled in after: wrangler d1 create habit-tracker-db

[vars]
ALLOWED_ORIGIN = "http://localhost:4200"

[env.production]
[env.production.vars]
ALLOWED_ORIGIN = "https://PLACEHOLDER.pages.dev"   # updated at Phase 8 deployment
```

### `src/types.ts` — Env Bindings

```ts
export interface Env {
  DB: D1Database;
  ALLOWED_ORIGIN: string;
}
```

### `src/db/schema.ts` — Full Schema

Four tables with all columns, FK constraints, and cascade-delete relationships. See [`data-model.md`](./data-model.md) for the complete Drizzle schema code.

### `src/db/client.ts` — DB Factory

```ts
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export const createDb = (d1: D1Database) => drizzle(d1, { schema });
```

### `src/middleware/cors.ts`

```ts
import { cors } from 'hono/cors';
import type { Env } from '../types';

export const corsMiddleware = (origin: string) =>
  cors({
    origin,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  });
```

### `src/middleware/logger.ts`

```ts
export const loggerMiddleware = async (c: Context, next: Next) => {
  await next();
  console.log(JSON.stringify({
    method: c.req.method,
    path: c.req.path,
    status: c.res.status,
  }));
};
```

### `src/index.ts` — App Entry

```ts
import { Hono } from 'hono';
import type { Env } from './types';
import { corsMiddleware } from './middleware/cors';
import { loggerMiddleware } from './middleware/logger';

const app = new Hono<{ Bindings: Env }>();

app.use('*', (c, next) => corsMiddleware(c.env.ALLOWED_ORIGIN)(c, next));
app.use('*', loggerMiddleware);

app.get('/api/health', (c) => c.json({ status: 'ok' }));

app.onError((err, c) => {
  console.error(JSON.stringify({ error: err.message, path: c.req.path }));
  return c.json({ error: 'Internal server error' }, 500);
});

export default app;
```

---

## Verification Plan

### Manual Verification (Phase 1)

1. **Health endpoint**: `curl http://localhost:8787/api/health` → `{"status":"ok"}` with HTTP 200
2. **CORS headers**: Browser request from `http://localhost:4200` succeeds without CORS errors
3. **D1 tables**: `wrangler d1 execute habit-tracker-db --local --command="SELECT name FROM sqlite_master WHERE type='table';"` lists all 4 tables + `__drizzle_migrations`
4. **Idempotent migration**: Running the migration SQL twice produces no error and no duplicate tables
5. **Error logging**: Force an unhandled error, verify `console.error` entry appears in `wrangler dev` output, HTTP response body is `{"error":"Internal server error"}` (no stack trace leaked)
6. **Request logging**: Every request to `/api/health` produces a `console.log` entry with method, path, and status

### Acceptance Criteria Mapping

| Spec ID | Test | Expected |
|---------|------|----------|
| SC-001 | Follow quickstart.md cold | Server running in < 5 min |
| SC-002 | `drizzle-kit generate` + apply | 4 tables, no hand-written SQL |
| SC-003 | `curl /api/health` | 200, `{"status":"ok"}`, < 500 ms |
| SC-004 | Browser fetch from localhost:4200 | No CORS errors |
| SC-005 | Re-run migration | No errors, no duplicate tables |
| SC-006 | Inspect schema | FKs with CASCADE declared |
| SC-007 | Wrangler dev console | Log entry per request, error never in response body |
