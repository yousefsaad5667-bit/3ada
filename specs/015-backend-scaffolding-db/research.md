# Research: Backend Scaffolding & Database (015)

**Phase**: 0 — Research
**Date**: 2026-08-22
**Status**: Complete — all unknowns resolved

---

## Technology Decisions

### Runtime: Cloudflare Workers

- **Decision**: Cloudflare Workers (V8 isolates, edge-deployed)
- **Rationale**: Zero cold starts, globally distributed, native D1 binding, Web Crypto API built-in — no Node.js compatibility layer needed for any Phase 1 dependency.
- **Alternatives considered**: Cloudflare Workers with Node.js compat flag (unnecessary overhead for Phase 1), Deno Deploy (no D1 support).

---

### Framework: Hono

- **Decision**: Hono v4
- **Rationale**: Workers-native TypeScript framework, first-class `c.env` bindings for D1 access, built-in middleware ecosystem (CORS, logger), minimal bundle size.
- **Alternatives considered**: Express (requires Node.js compat, not edge-native), Fastify (same), itty-router (less ergonomic, no typed context).
- **Key patterns**:
  - `app.use('*', cors(...))` for global CORS middleware
  - `c.env.DB` to access the D1 binding
  - `c.get('userId')` for context propagation from auth middleware (Phase 2+)

---

### ORM: Drizzle ORM

- **Decision**: Drizzle ORM with `drizzle-orm/d1` dialect
- **Rationale**: TypeScript-first schema definition, auto-generates SQL migrations via `drizzle-kit generate`, D1 dialect is officially supported, migration journal (`__drizzle_migrations`) handles idempotent applies automatically.
- **Alternatives considered**: Prisma (no D1 driver as of 2026), Kyselyl (migration story less mature for D1), raw SQL (no type safety).
- **Key patterns**:
  ```ts
  // db/client.ts
  import { drizzle } from 'drizzle-orm/d1';
  export const createDb = (d1: D1Database) => drizzle(d1);

  // drizzle.config.ts
  export default defineConfig({
    schema: './src/db/schema.ts',
    out: './drizzle',
    dialect: 'sqlite',
    driver: 'd1-http', // for drizzle-kit studio; local uses wrangler
  });
  ```
- **Migration apply pattern** (called once on Worker startup or via a one-off script):
  ```ts
  import { migrate } from 'drizzle-orm/d1/migrator';
  await migrate(db, { migrationsFolder: 'drizzle' });
  ```

---

### UUID Generation

- **Decision**: `crypto.randomUUID()` (Web Crypto API, built into Workers runtime)
- **Rationale**: D1/SQLite has no `gen_random_uuid()` function; `crypto.randomUUID()` is available globally in the Workers V8 environment without any import.
- **Alternatives considered**: `uuid` npm package (works but adds a dependency when the built-in suffices), nanoid (not UUID v4 format).

---

### Timestamp Storage

- **Decision**: ISO-8601 text strings (e.g., `"2026-08-22T17:00:00.000Z"`)
- **Rationale**: D1/SQLite has no native `TIMESTAMP` type. ISO strings are sortable, human-readable, and compatible with `new Date(str)` on both client and Worker.
- **Alternatives considered**: Unix epoch integers (efficient but less readable, harder to debug queries).

---

### CORS Strategy

- **Decision**: `ALLOWED_ORIGIN` Wrangler environment variable read at runtime
- **Rationale**: Allows per-environment CORS origin without code changes or rebuilds. Set to `http://localhost:4200` in `[vars]` (default/dev) and to the production Pages URL in `[env.production.vars]`.
- **Alternatives considered**: Hard-coded origins array (requires code change + redeploy to update), wildcard `*` (insecure for credentialed requests).
- **Implementation**:
  ```toml
  # wrangler.toml
  [vars]
  ALLOWED_ORIGIN = "http://localhost:4200"

  [env.production.vars]
  ALLOWED_ORIGIN = "https://habit-tracker.pages.dev"  # placeholder, updated at deploy time
  ```

---

### Migration Strategy

- **Decision**: Drizzle migration journal (`__drizzle_migrations` table in D1)
- **Rationale**: The `migrate()` function reads the journal and skips already-applied migrations. No `IF NOT EXISTS` guards are needed in SQL files.
- **How to apply locally**:
  ```bash
  # Generate migration SQL from Drizzle schema
  npx drizzle-kit generate

  # Apply migration to local D1 via wrangler
  npx wrangler d1 execute habit-tracker-db --local --file=drizzle/0000_initial.sql
  ```
- **Alternatives considered**: Manual `IF NOT EXISTS` SQL guards (error-prone, deviates from spec FR-003).

---

### Logging Strategy

- **Decision**: Structured `console` logging (method, path, status, error message)
- **Rationale**: Cloudflare natively captures all `console.*` output from Workers in the dashboard tail and `wrangler dev` console. No external log service needed for Phase 1.
- **Pattern**:
  ```ts
  // middleware/logger.ts — request/response logging
  app.use('*', async (c, next) => {
    await next();
    console.log(JSON.stringify({
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
    }));
  });

  // Global error handler
  app.onError((err, c) => {
    console.error(JSON.stringify({ error: err.message, path: c.req.path }));
    return c.json({ error: 'Internal server error' }, 500);
  });
  ```

---

## Package Versions (Phase 1 only)

| Package | Version | Purpose |
|---------|---------|---------|
| `hono` | `^4.x` | HTTP framework |
| `drizzle-orm` | `^0.30.x` | ORM + D1 dialect |
| `drizzle-kit` | `^0.21.x` | CLI for schema generation |
| `wrangler` | `^3.x` | Worker dev server + D1 local emulation |
| `typescript` | `^5.x` | Type checking |

> No `uuid` package needed — `crypto.randomUUID()` is used directly.

---

## Resolved Clarifications (from spec)

| Question | Answer |
|----------|--------|
| Observability in Phase 1 | Structured `console` logging (method, path, status, error). No external log storage. |
| Production CORS origin | Read from `ALLOWED_ORIGIN` Wrangler env var per environment in `wrangler.toml`. |
| When is `user_settings` created | Same transaction as `users` row during registration — always exists post-login. |
| `relapse_records` FK on user delete | `ON DELETE CASCADE` declared as schema safety net; no delete-user endpoint implemented. |
| Migration re-run behavior | Drizzle journal skips applied migrations — no `IF NOT EXISTS` guards needed. |
