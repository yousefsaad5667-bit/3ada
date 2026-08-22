# Quickstart: Backend Scaffolding & Database (015)

**Goal**: Get the Hono Worker running locally with D1 and Drizzle in under 5 minutes.

---

## Prerequisites

- Node.js LTS (≥ 18)
- npm
- A terminal in the `backend/` directory

---

## Step 1 — Install Dependencies

```bash
cd backend
npm install
```

---

## Step 2 — Create the Local D1 Database

```bash
npx wrangler d1 create habit-tracker-db
```

Copy the `database_id` from the output and paste it into `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "habit-tracker-db"
database_id = "<paste-your-id-here>"
```

> For **local development only**, the `database_id` field is required by Wrangler even when using `--local`. The local D1 data is stored in `.wrangler/state/` and never touches Cloudflare.

---

## Step 3 — Generate the Migration

```bash
npx drizzle-kit generate
```

This reads `src/db/schema.ts` and produces `drizzle/0000_initial.sql`.

---

## Step 4 — Apply the Migration Locally

```bash
npx wrangler d1 execute habit-tracker-db --local --file=drizzle/0000_initial.sql
```

Verify tables were created:

```bash
npx wrangler d1 execute habit-tracker-db --local --command="SELECT name FROM sqlite_master WHERE type='table';"
```

Expected output includes: `users`, `refresh_tokens`, `relapse_records`, `user_settings`, `__drizzle_migrations`.

---

## Step 5 — Start the Dev Server

```bash
npm run dev
```

The Wrangler dev server starts on `http://localhost:8787`.

---

## Step 6 — Verify the Health Endpoint

```bash
curl http://localhost:8787/api/health
```

Expected response:

```json
{ "status": "ok" }
```

HTTP status: `200 OK`

---

## Environment Variables

Set in `wrangler.toml` — no `.env` file required:

| Variable | Dev Value | Notes |
|----------|-----------|-------|
| `ALLOWED_ORIGIN` | `http://localhost:4200` | Frontend Angular dev server origin |

Production values are set under `[env.production.vars]` in `wrangler.toml`.

---

## Re-running Migrations

Safe to run multiple times — Drizzle's journal skips already-applied migrations:

```bash
npx wrangler d1 execute habit-tracker-db --local --file=drizzle/0000_initial.sql
```

---

## npm Scripts Reference

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `wrangler dev` | Start local dev server on :8787 |
| `db:generate` | `drizzle-kit generate` | Generate migration SQL from schema |
| `db:migrate:local` | `wrangler d1 execute ... --local` | Apply migration to local D1 |
| `type-check` | `tsc --noEmit` | TypeScript type check |

---

## Troubleshooting

**"No D1 binding found"** — Wrangler started before `wrangler.toml` had a `[[d1_databases]]` entry. Add the binding and restart.

**CORS blocked in browser** — Check that `ALLOWED_ORIGIN` in `wrangler.toml` exactly matches the Angular dev server URL (including port, no trailing slash).

**Migration fails on re-run** — This should not happen with Drizzle's journal. If it does, check that you are running `migrate()` (not raw SQL) and that `__drizzle_migrations` table exists.
