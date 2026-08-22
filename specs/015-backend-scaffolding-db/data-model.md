# Data Model: Backend Scaffolding & Database (015)

**Phase**: 1 — Design & Contracts
**Date**: 2026-08-22

---

## Entity Overview

```
users ──────────────────┬──── refresh_tokens (many, cascade delete)
                        ├──── relapse_records (many, cascade delete)
                        └──── user_settings   (one-to-one, cascade delete)
```

---

## Tables

### `users`

Represents an authenticated account.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `text` | PRIMARY KEY | UUID v4, generated server-side via `crypto.randomUUID()` |
| `username` | `text` | NOT NULL, UNIQUE | 3–30 chars, no spaces (validated in application layer) |
| `password_hash` | `text` | NOT NULL | Format: `iterations:hexSalt:hexHash` (PBKDF2-SHA256, Phase 2) |
| `created_at` | `text` | NOT NULL | ISO-8601 UTC string, set at insert |

**Drizzle schema**:
```ts
export const users = sqliteTable('users', {
  id:           text('id').primaryKey(),
  username:     text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt:    text('created_at').notNull(),
});
```

---

### `refresh_tokens`

Represents a valid long-lived session credential.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `text` | PRIMARY KEY | UUID v4, server-generated |
| `user_id` | `text` | NOT NULL, FK → `users.id` ON DELETE CASCADE | Owning user |
| `token_hash` | `text` | NOT NULL | Hashed refresh token value (Phase 2) |
| `expires_at` | `text` | NOT NULL | ISO-8601 UTC string, 30-day expiry (Phase 2) |
| `created_at` | `text` | NOT NULL | ISO-8601 UTC string |

**Drizzle schema**:
```ts
export const refreshTokens = sqliteTable('refresh_tokens', {
  id:        text('id').primaryKey(),
  userId:    text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull(),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at').notNull(),
});
```

---

### `relapse_records`

Represents a single tracked relapse event.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `text` | PRIMARY KEY | UUID v4, server-generated |
| `user_id` | `text` | NOT NULL, FK → `users.id` ON DELETE CASCADE | Strictly isolated per user |
| `date` | `text` | NOT NULL | `YYYY-MM-DD` format |
| `time` | `text` | nullable | `HH:mm` format |
| `ampm` | `text` | nullable | `am` or `pm` |
| `count` | `integer` | NOT NULL, DEFAULT 1 | Must be ≥ 1 |
| `urge_level` | `integer` | nullable | Range 1–10, validated in application layer |
| `reason` | `text` | nullable | Free text |
| `notes` | `text` | nullable | Free text |
| `created_at` | `text` | NOT NULL | ISO-8601 UTC |
| `updated_at` | `text` | NOT NULL | ISO-8601 UTC, updated on every write |

**Drizzle schema**:
```ts
export const relapseRecords = sqliteTable('relapse_records', {
  id:         text('id').primaryKey(),
  userId:     text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  date:       text('date').notNull(),
  time:       text('time'),
  ampm:       text('ampm'),
  count:      integer('count').notNull().default(1),
  urgeLevel:  integer('urge_level'),
  reason:     text('reason'),
  notes:      text('notes'),
  createdAt:  text('created_at').notNull(),
  updatedAt:  text('updated_at').notNull(),
});
```

---

### `user_settings`

Stores per-user preferences. Exactly one row per user.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `user_id` | `text` | PRIMARY KEY, FK → `users.id` ON DELETE CASCADE | One-to-one with `users` |
| `theme` | `text` | NOT NULL, DEFAULT `'dark'` | `'dark'` or `'light'` |
| `language` | `text` | NOT NULL, DEFAULT `'ar'` | BCP-47 language code |
| `default_urge_level` | `integer` | nullable | Range 1–10, user's preferred default |
| `updated_at` | `text` | NOT NULL | ISO-8601 UTC |

**Drizzle schema**:
```ts
export const userSettings = sqliteTable('user_settings', {
  userId:           text('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  theme:            text('theme').notNull().default('dark'),
  language:         text('language').notNull().default('ar'),
  defaultUrgeLevel: integer('default_urge_level'),
  updatedAt:        text('updated_at').notNull(),
});
```

---

## Relationships

```
users (1) ──── (many) refresh_tokens   [user_id → users.id, CASCADE DELETE]
users (1) ──── (many) relapse_records  [user_id → users.id, CASCADE DELETE]
users (1) ──── (1)    user_settings    [user_id → users.id, CASCADE DELETE, PK]
```

**Cascade behavior**: `ON DELETE CASCADE` is declared as a schema safety net on all three child tables. No user-deletion endpoint is implemented in the application (FR-009 scope note).

---

## Validation Rules (Application Layer)

| Entity | Field | Rule |
|--------|-------|------|
| `users` | `username` | 3–30 characters, no spaces or special characters |
| `users` | `password` | Minimum 8 characters (raw, before hashing) |
| `relapse_records` | `date` | Must match `YYYY-MM-DD` format, must be a valid calendar date |
| `relapse_records` | `count` | Integer ≥ 1 |
| `relapse_records` | `urge_level` | Integer 1–10 if provided |
| `relapse_records` | `ampm` | Must be `'am'` or `'pm'` if provided |
| `user_settings` | `theme` | Must be `'dark'` or `'light'` |
| `user_settings` | `default_urge_level` | Integer 1–10 if provided |

---

## TypeScript Types (Inferred from Drizzle)

```ts
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';

export type User            = InferSelectModel<typeof users>;
export type NewUser         = InferInsertModel<typeof users>;
export type RefreshToken    = InferSelectModel<typeof refreshTokens>;
export type NewRefreshToken = InferInsertModel<typeof refreshTokens>;
export type RelapseRecord   = InferSelectModel<typeof relapseRecords>;
export type NewRelapseRecord = InferInsertModel<typeof relapseRecords>;
export type UserSettings    = InferSelectModel<typeof userSettings>;
export type NewUserSettings = InferInsertModel<typeof userSettings>;
```

---

## Migration Notes

- **Tool**: `drizzle-kit generate` produces `drizzle/0000_initial.sql`
- **Apply locally**: `wrangler d1 execute habit-tracker-db --local --file=drizzle/0000_initial.sql`
- **Idempotency**: Re-running `migrate()` is safe — the `__drizzle_migrations` journal skips already-applied files
- **No hand-written SQL**: All SQL is auto-generated from the TypeScript schema (FR-003)
