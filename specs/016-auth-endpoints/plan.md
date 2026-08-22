# Implementation Plan: Auth Endpoints

**Branch**: `016-auth-endpoints` | **Date**: 2026-08-22 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/016-auth-endpoints/spec.md`

---

## Summary

Implement the full authentication layer for the Hono Worker backend: user registration and login with PBKDF2-SHA256 password hashing (210,000 iterations, Web Crypto API), JWT-based access tokens (24-hour) and refresh tokens (30-day, stored in D1), plus four endpoints (`POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`) and a reusable JWT auth middleware. All error messages are in Arabic.

---

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode) — same as Phase 1

**Primary Dependencies**:
- Hono v4 — routing and middleware (already installed)
- `hono/jwt` — JWT sign/verify (built into Hono, no extra package)
- Web Crypto API (`crypto.subtle`) — PBKDF2-SHA256 hashing (built into Workers runtime, no extra package)
- Drizzle ORM v0.30.x — DB queries against `users` and `refresh_tokens` tables (already installed)
- Wrangler v3.x — `wrangler secret put JWT_SECRET` for secret management

**Storage**: Cloudflare D1 — `users` table (credentials) + `refresh_tokens` table (revocable sessions)

**Testing**: Manual `curl` + `wrangler d1 execute` verification (no automated test framework in this phase)

**Target Platform**: Cloudflare Workers (V8 isolate — Web Crypto API available natively)

**Project Type**: Web service microservice — auth sub-layer of the Hono Worker

**Performance Goals**: `POST /api/auth/login` < 2 seconds locally (PBKDF2 at 210,000 iterations takes ~200–500ms in Workers; acceptable)

**Constraints**:
- `crypto.subtle` only — no Node.js `crypto` module (Workers runtime)
- `crypto.randomUUID()` for all UUIDs — no DB-level generation
- All timestamps stored as ISO-8601 strings (D1 has no native timestamp type)
- JWT secret loaded from `c.env.JWT_SECRET` — never hardcoded
- No bcrypt, no argon2 — both require native bindings unavailable in Workers

**Scale/Scope**: Phase 2 only — auth layer. Records, analytics, settings in subsequent phases.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

> **Note**: Same rationale as Phase 1 — constitution v1.1.0 principles I ("Angular Platform") and II ("Local-First") govern the frontend project, not the `backend/` subtree. The user has explicitly approved this backend migration. This check focuses on principles applicable to the backend.

| Principle | Status | Notes |
|-----------|--------|-------|
| III. Arabic Language & RTL | ✅ PASS | All 14 error messages in Arabic (FR-011) |
| IV. Modern UI & UX | ✅ N/A | No UI in this phase |
| V. Performance & Scalability | ✅ PASS | PBKDF2 < 2s; stateless JWT scales horizontally |
| Architecture | ✅ PASS | Feature-based: `src/auth/` subtree; separation of crypto, validation, route handlers |
| Code Quality | ✅ PASS | Strict TypeScript, typed Hono context variables, no duplicated logic |

**Verdict**: ✅ No violations.

---

## Project Structure

### Documentation (this feature)

```text
specs/016-auth-endpoints/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 — crypto & JWT decisions
├── data-model.md        # Phase 1 — entity fields & relationships
├── contracts/
│   └── api.md           # Phase 1 — all 4 endpoint contracts
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
backend/
└── src/
    ├── index.ts                    ← MODIFY: mount /api/auth/* routes
    ├── types.ts                    ← MODIFY: add JWT_SECRET to Env interface
    ├── db/
    │   └── schema.ts               ← READ ONLY: users + refresh_tokens already defined
    └── auth/                       ← NEW subtree
        ├── crypto.ts               ← PBKDF2 hash/verify + token generation helpers
        ├── middleware.ts           ← JWT auth middleware (reusable by all future routes)
        ├── validation.ts           ← Username/password validation rules + Arabic messages
        ├── router.ts               ← Hono router: register, login, refresh, logout
        └── types.ts                ← Auth-specific types: AuthUser, TokenPair, JwtPayload
```

**Structure Checkpoint**: Auth layer is functionally complete.

<!-- 
E2E Test Results (Task T034):
1. Register works -> HTTP 201, DB has hashed password ("210000:...") and hashed refresh token.
2. Login works -> HTTP 200 with valid JWT and new refresh token.
3. Access token authenticates protected route (`GET /api/me`).
4. Refresh works -> exchanges old refresh token for new access token.
5. Logout works -> revokes specific refresh token in DB.
6. Post-logout refresh -> HTTP 401 as expected.
-->

**Structure Decision**: Auth logic is isolated in `src/auth/` — a dedicated feature subtree. This keeps `src/index.ts` clean (just mounts the router) and allows each concern (crypto, validation, middleware, routes) to evolve independently.

---

## Implementation Details

See `research.md` for all crypto/JWT decisions and `data-model.md` for entity definitions.

### `src/types.ts` — Env Update

Add `JWT_SECRET: string` to the existing `Env` interface.

### `src/auth/types.ts`

```ts
export interface JwtPayload {
  sub: string;       // userId (UUID)
  iat: number;
  exp: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  username: string;
}
```

### `src/auth/crypto.ts` — Key Functions

- `hashPassword(password: string): Promise<string>` — PBKDF2-SHA256, 210,000 iterations, 32-byte random salt, returns `"210000:hexSalt:hexHash"`
- `verifyPassword(password: string, stored: string): Promise<boolean>` — parses stored format, re-derives hash, constant-time compare via `crypto.subtle.verify` trick
- `generateAccessToken(userId: string, secret: string): Promise<string>` — HS256 JWT, 24h exp
- `generateRefreshToken(): string` — 32-byte random hex (stored as hash in DB)
- `hashToken(token: string): Promise<string>` — SHA-256 hex of the raw refresh token (what is stored in DB)

### `src/auth/validation.ts` — Arabic Error Messages

```ts
export const ERRORS = {
  USERNAME_TOO_SHORT:  'اسم المستخدم يجب أن يكون 3 أحرف على الأقل',
  USERNAME_TOO_LONG:   'اسم المستخدم يجب ألا يتجاوز 30 حرفاً',
  USERNAME_HAS_SPACES: 'اسم المستخدم لا يمكن أن يحتوي على مسافات',
  PASSWORD_TOO_SHORT:  'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
  USERNAME_TAKEN:      'اسم المستخدم مستخدم بالفعل',
  INVALID_CREDENTIALS: 'اسم المستخدم أو كلمة المرور غير صحيحة',
  INVALID_TOKEN:       'الرمز المميز غير صالح أو منتهي الصلاحية',
  UNAUTHORIZED:        'يجب تسجيل الدخول أولاً',
  MISSING_FIELDS:      'يرجى تعبئة جميع الحقول المطلوبة',
} as const;
```

### `src/auth/middleware.ts`

Hono middleware that:
1. Reads `Authorization: Bearer <token>` header
2. Verifies JWT signature + expiry using `hono/jwt`
3. On success: sets `c.set('userId', payload.sub)`
4. On failure: returns `c.json({ error: ERRORS.UNAUTHORIZED }, 401)`

### `src/auth/router.ts` — Route Logic Summary

| Endpoint | Logic |
|----------|-------|
| `POST /api/auth/register` | Validate → check username unique → hashPassword → insert user → generate tokens → store refresh token hash in D1 → return 201 |
| `POST /api/auth/login` | Validate → find user → verifyPassword → generate tokens → store refresh token hash → return 200 |
| `POST /api/auth/refresh` | Hash incoming token → find in D1 (not expired) → generate new accessToken → return 200 |
| `POST /api/auth/logout` | Verify access token via middleware → delete refresh token row from D1 → return 200 |

### `src/index.ts` — Route Mount

```ts
import { authRouter } from './auth/router';
app.route('/api/auth', authRouter);
```

---

## Verification Plan

### Manual Verification

1. **Register** — `curl -X POST localhost:8787/api/auth/register -d '{"username":"ali","password":"secret123"}'` → 201, tokens returned
2. **Duplicate register** → 409, Arabic message
3. **Bad username** (< 3 chars) → 422, Arabic message
4. **Login** with correct credentials → 200, new token pair
5. **Login** with wrong password → 401, same Arabic message as unknown user
6. **Refresh** with valid refresh token → 200, new access token
7. **Refresh** with expired/invalid token → 401
8. **Logout** → 200; subsequent refresh with old token → 401
9. **Protected endpoint** (future: any route with `authMiddleware`) — no token → 401, tampered token → 401, valid token → 200
10. **DB inspection** — `refresh_tokens` row has hashed token, never plaintext

### Acceptance Criteria Mapping

| Spec ID | Test | Expected |
|---------|------|----------|
| SC-001 | Register timing | < 3s end-to-end |
| SC-002 | All 4 endpoints | Correct HTTP codes + response shape |
| SC-003 | Access token on protected route | 200 within 24h window |
| SC-004 | Refresh after logout | 401 |
| SC-005 | D1 inspection of users table | No plaintext password |
| SC-006 | Auth middleware with invalid token | 401 |
| SC-007 | All error responses | Arabic, no stack trace |
