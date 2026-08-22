# Backend Migration: Cloudflare Workers + D1 + JWT Auth

Migrate the Habit Tracker from LocalStorage to a **Cloudflare-hosted backend** with JWT authentication, per-user data isolation, and offline sync. The Angular component layer is untouched — only the data layer changes.

---

## Decisions Confirmed

| # | Decision | Choice |
|---|----------|--------|
| 1 | Auth | JWT with username/password (no email) — self-hosted in D1 |
| 2 | Offline | Offline queue (IndexedDB) → sync on reconnect |
| 3 | Data migration | Manual later (user will export → SQL insert) |
| 4 | Settings | Stored in backend, per-user |

---

## Infrastructure Overview

```
┌───────────────────────────────────────────────────────────────┐
│  Cloudflare Global Edge Network                               │
│                                                               │
│  ┌──────────────────────┐    ┌──────────────────────────┐    │
│  │  Cloudflare Pages    │    │  Cloudflare Workers      │    │
│  │  (Angular SPA)       │◄──►│  (Hono REST API)         │    │
│  │  Free — unlimited BW │    │  100K req/day free       │    │
│  └──────────────────────┘    └──────────┬───────────────┘    │
│                                          │ D1 Binding         │
│                              ┌───────────▼───────────────┐    │
│                              │  Cloudflare D1 (SQLite)   │    │
│                              │  5M reads/day free        │    │
│                              │  100K writes/day free     │    │
│                              └───────────────────────────┘    │
└───────────────────────────────────────────────────────────────┘
```

**Key facts**:
- Workers run at the nearest edge PoP (~300 cities). Arabic users hit Cairo/Dubai PoPs.
- D1 primary write region: `EEUR` (nearest to MENA with D1 support) — configurable.
- Worker → D1 latency: ~1–5 ms typical.
- **Not a single server** — fully serverless, no maintenance.

---

## Monorepo Layout

```
habit-tracker/              ← Angular frontend (existing)
├── src/
├── angular.json
├── package.json
└── backend/                ← NEW: Hono Worker (own wrangler project)
    ├── wrangler.toml
    ├── package.json
    ├── tsconfig.json
    ├── drizzle.config.ts      ← Drizzle Kit config (points to D1)
    ├── drizzle/               ← auto-generated SQL migration files
    │   └── 0000_initial.sql
    └── src/
        ├── index.ts
        ├── db/
        │   ├── schema.ts      ← Drizzle table definitions (source of truth)
        │   └── client.ts      ← drizzle(env.DB) factory
        ├── routes/
        │   ├── auth.ts        (register, login, refresh)
        │   ├── records.ts     (CRUD, scoped to userId)
        │   └── settings.ts    (user settings)
        └── middleware/
            ├── cors.ts
            └── auth.ts        (JWT verify guard)
```

**Deployments are independent**:
- `cd backend && npx wrangler deploy` → Cloudflare Workers
- `ng build && npx wrangler pages deploy dist/habit-tracker` → Cloudflare Pages

---

## Framework Choice: Hono

| Criterion | Hono | Elysia | Express |
|---|---|---|---|
| Workers-native | ✅ | ❌ needs compat | ❌ |
| Bundle size | ~12 KB | ~30 KB | ~500 KB |
| TypeScript | First-class | First-class | Addon |
| D1 binding support | ✅ native | Partial | ❌ |
| Web Crypto API | ✅ | ✅ | ❌ |
| JWT middleware | Built-in | Plugin | External |

Hono is the de-facto standard for Cloudflare Workers APIs.

---

## Database Schema (Drizzle ORM — Code First)

Schema is defined in **TypeScript** (`backend/src/db/schema.ts`). Drizzle Kit generates the SQL migration files — you never write SQL by hand.

```ts
// backend/src/db/schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id:           text('id').primaryKey(),           // UUID v4
  username:     text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),   // PBKDF2-SHA256, 210K iters
  createdAt:    text('created_at').notNull(),
});

export const relapseRecords = sqliteTable('relapse_records', {
  id:         text('id').primaryKey(),
  userId:     text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  date:       text('date').notNull(),              // "YYYY-MM-DD"
  time:       text('time'),
  ampm:       text('ampm'),                        // 'am' | 'pm' | null
  count:      integer('count').notNull().default(1),
  urgeLevel:  integer('urge_level'),
  reason:     text('reason'),
  notes:      text('notes'),
  createdAt:  text('created_at').notNull(),
  updatedAt:  text('updated_at').notNull(),
});

export const userSettings = sqliteTable('user_settings', {
  userId:           text('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  theme:            text('theme').notNull().default('dark'),
  language:         text('language').notNull().default('ar'),
  defaultUrgeLevel: integer('default_urge_level'),
  updatedAt:        text('updated_at').notNull(),
});
```

### Drizzle Migrations Workflow

```bash
# 1. After changing schema.ts — generate SQL migration
npx drizzle-kit generate
# → creates drizzle/0001_some_change.sql automatically

# 2. Apply to local D1 (dev)
npx wrangler d1 execute habit-tracker --local --file=drizzle/0001_some_change.sql

# 3. Apply to production D1
npx wrangler d1 execute habit-tracker --remote --file=drizzle/0001_some_change.sql

# Inspect current DB state
npx drizzle-kit studio   # GUI browser for D1 data
```

Drizzle tracks applied migrations in a `__drizzle_migrations` table (same as EF Core's `__EFMigrationsHistory`).

### Drizzle Client Setup

```ts
// backend/src/db/client.ts
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export function createDb(d1: D1Database) {
  return drizzle(d1, { schema });
}
// Usage in route: const db = createDb(c.env.DB);
// Query: await db.select().from(relapseRecords).where(eq(relapseRecords.userId, userId))
```

---

## Auth Design

### Password Security
- Algorithm: **PBKDF2-SHA256** via `crypto.subtle` (Web Crypto API — available in Workers)
- Iterations: **210,000** (OWASP 2024 recommendation for PBKDF2-SHA256)
- Salt: 32-byte random per user (`crypto.getRandomValues`)
- Storage format: `iterations:hex(salt):hex(hash)` in `password_hash` column

### JWT Tokens
- Library: `hono/jwt` (built-in, uses Web Crypto — no npm dependency)
- Payload: `{ sub: userId, username, iat, exp }`
- Access token: **24h expiry**
- Refresh token: **30d expiry**, stored in D1 `refresh_tokens` table
- Secret: stored as Wrangler encrypted secret (`JWT_SECRET`) — never in code

### Auth Endpoints
```
POST /api/auth/register   { username, password }  → { accessToken, refreshToken, user }
POST /api/auth/login      { username, password }  → { accessToken, refreshToken, user }
POST /api/auth/refresh    { refreshToken }         → { accessToken }
POST /api/auth/logout     (bearer)                → 200
```

### Data Endpoints (all require `Authorization: Bearer <token>`)
```
GET    /api/records              list (supports ?from=&to= date filter)
POST   /api/records              create
GET    /api/records/:id          get one
PUT    /api/records/:id          full replace
DELETE /api/records/:id          delete

GET    /api/settings             get user settings
PUT    /api/settings             update settings

GET    /api/health               no auth required
```

---

## Proposed Changes

### Phase 1 — Backend (`backend/`)

#### [NEW] `backend/wrangler.toml`
```toml
name = "habit-tracker-api"
main = "src/index.ts"
compatibility_date = "2024-09-23"

[[d1_databases]]
binding = "DB"
database_name = "habit-tracker"
database_id = "<filled after: wrangler d1 create habit-tracker>"
```

#### [NEW] `backend/drizzle.config.ts`
```ts
import { defineConfig } from 'drizzle-kit';
export default defineConfig({
  dialect: 'sqlite',
  schema: './src/db/schema.ts',
  out: './drizzle',
  driver: 'd1-http',            // uses Cloudflare D1 HTTP API for studio
});
```

#### [NEW] `backend/src/db/schema.ts`
Drizzle table definitions — **single source of truth** for the DB shape.

#### [NEW] `backend/src/db/client.ts`
`createDb(env.DB)` factory used by every route handler.

#### [NEW] `backend/src/index.ts`
Hono app: mounts CORS → auth middleware → routes, global error handler.

#### [NEW] `backend/src/middleware/auth.ts`
JWT verify middleware using `hono/jwt`. Extracts `userId` into context.

#### [NEW] `backend/src/middleware/cors.ts`
CORS locked to Cloudflare Pages domain (and `localhost:4200` for dev).

#### [NEW] `backend/src/routes/auth.ts`
Register, login, refresh, logout handlers with PBKDF2 password ops via `crypto.subtle`.

#### [NEW] `backend/src/routes/records.ts`
CRUD — all Drizzle queries filter by `userId` from JWT context.

#### [NEW] `backend/src/routes/settings.ts`
GET/PUT user settings row via Drizzle upsert.

#### [NEW] `backend/drizzle/0000_initial.sql`
Auto-generated by `drizzle-kit generate` — committed to Git, applied to D1.

---

### Phase 2 — Angular Data Layer (`src/`)

#### [MODIFY] `src/environments/environment.ts` + `environment.prod.ts`
```ts
export const environment = {
  apiBaseUrl: 'http://localhost:8787',   // dev
  // prod: 'https://habit-tracker-api.<account>.workers.dev'
};
```

#### [NEW] `src/app/core/auth/auth.service.ts`
Handles register/login/logout, stores JWT in `localStorage` (access + refresh), exposes `currentUser` signal.

#### [NEW] `src/app/core/auth/auth.interceptor.ts`
HTTP interceptor — injects `Authorization: Bearer` on every API call, handles 401 → auto-refresh → retry.

#### [NEW] `src/app/core/auth/auth.guard.ts`
Route guard: redirects to `/login` if no valid token.

#### [NEW] `src/app/features/auth/` (login + register pages)
Two simple Angular pages: username/password form. Arabic UI, dark mode, RTL.

#### [NEW] `src/app/core/services/api-client.service.ts`
Typed HTTP client wrapping `HttpClient`:
- Base URL from environment
- JSON error normalization into `ValidationResult` shape
- Retry 2× with backoff on network errors

#### [NEW] `src/app/core/services/relapse-record-api.service.ts`
Remote CRUD service. Returns `Observable<T>`.

#### [MODIFY] `src/app/core/services/relapse-record.repository.ts`
Becomes a **facade** that:
1. Calls `RelapseRecordApiService` for remote ops
2. Updates local signal cache optimistically
3. If offline → enqueues in `OfflineQueueService`, resolves optimistically
- **Public API (signals + methods) stays identical** — zero component changes

#### [NEW] `src/app/core/services/offline-queue.service.ts`
IndexedDB queue for pending writes. On `navigator.onLine` event or interval → flushes to API. Conflict resolution: last-write-wins by `updatedAt`.

#### [MODIFY] `src/app/core/services/settings.repository.ts`
Delegates to `GET /api/settings` + `PUT /api/settings`. Falls back to defaults if offline.

#### [MODIFY] `src/app/app.config.ts`
Add `provideHttpClient(withFetch(), withInterceptors([authInterceptor]))`.

#### [MODIFY] `src/app/app.routes.ts`
Add `/login` and `/register` routes. Apply `authGuard` to all other routes.

---

## Free Tier Capacity Analysis

| Resource | Free Limit | Estimated Usage (1 user, heavy) |
|---|---|---|
| Worker requests | 100K/day | ~200/day |
| D1 reads | 5M/day | ~1K/day |
| D1 writes | 100K/day | ~50/day |
| D1 storage | 500 MB | ~10 MB/100K records |
| Pages bandwidth | Unlimited | — |

**Conclusion**: Free tier is sufficient for personal or small-group use indefinitely.

---

## Verification Plan

### Backend Unit Tests (Vitest)
```bash
cd backend
npm test
```
- Auth: register, login, duplicate username, wrong password
- Records: CRUD, userId isolation (user A cannot access user B's records)
- JWT: expired token rejected, refresh works

### Drizzle Schema Verification
```bash
cd backend
npx drizzle-kit generate   # must produce clean output (no unexpected changes)
npx drizzle-kit studio     # visual check of tables & data
```

### Local Integration Test
```bash
cd backend && npx wrangler dev   # Worker on :8787
ng serve                         # Angular on :4200
```
- Register → Login → Create record → Edit → Delete → Logout

### Offline Test
- Disable network in DevTools → create record → re-enable → verify sync

### Production Deploy Smoke Test
```bash
cd backend && npx wrangler deploy
ng build && npx wrangler pages deploy dist/habit-tracker
```
- Health check: `GET /api/health`
- Full auth + CRUD flow on prod URL
