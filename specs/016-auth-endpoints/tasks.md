# Tasks: Auth Endpoints

**Feature**: `016-auth-endpoints`
**Input**: Design documents from `specs/016-auth-endpoints/`
**Prerequisites**: [plan.md](./plan.md) · [spec.md](./spec.md) · [research.md](./research.md) · [data-model.md](./data-model.md) · [contracts/api.md](./contracts/api.md)
**Tests**: Manual verification only — `curl` + `wrangler d1 execute` (no automated test framework in this phase per plan.md)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: Which user story this task belongs to (US1–US5)

## Path Conventions

All source paths are relative to the monorepo root. The Angular frontend (`src/`) is **untouched**. All new files live under `functions/auth/`.

---

## Phase 1: Setup (Auth subtree skeleton)

**Purpose**: Create the `functions/auth/` directory and all shared type/constant files that every subsequent phase depends on. No business logic yet.

- [x] T001 Create `functions/auth/` directory and add `functions/auth/types.ts` exporting `JwtPayload { sub: string; iat: number; exp: number }`, `TokenPair { accessToken: string; refreshToken: string }`, and `AuthUser { id: string; username: string }`
- [x] T002 [P] Create `functions/auth/validation.ts` exporting the `ERRORS` const object with all 9 Arabic error message strings as defined in data-model.md (`USERNAME_TOO_SHORT`, `USERNAME_TOO_LONG`, `USERNAME_HAS_SPACES`, `PASSWORD_TOO_SHORT`, `USERNAME_TAKEN`, `INVALID_CREDENTIALS`, `INVALID_TOKEN`, `UNAUTHORIZED`, `MISSING_FIELDS`) and a `validateCredentials(username: string, password: string): string | null` function that returns an Arabic error string or null
- [x] T003 [P] Update `functions/types.ts` — add `JWT_SECRET: string` to the existing `Env` interface and add `Variables` type map `{ userId: string }` so Hono route handlers can access `c.get('userId')` with strict typing

**Checkpoint**: `npm run type-check` from `` passes. No business logic yet — only types and constants.

---

## Phase 2: Foundational (Crypto + Middleware — MUST complete before all user story phases)

**Purpose**: Implement the two shared primitives that every auth endpoint depends on: the PBKDF2 crypto utilities and the JWT auth middleware.

**⚠️ CRITICAL**: No user story implementation can begin until this phase is complete.

- [x] T004 Create `functions/auth/crypto.ts` — implement and export:
  - `hashPassword(password: string): Promise<string>` — uses `crypto.subtle.importKey` + `crypto.subtle.deriveBits` (PBKDF2-SHA256, 210,000 iterations, 32-byte random salt from `crypto.getRandomValues`); returns `"210000:hexSalt:hexHash"`
  - `verifyPassword(password: string, stored: string): Promise<boolean>` — parses `stored` format, re-derives the hash with the same salt/iterations, compares byte-by-byte (constant-time via `crypto.subtle` ArrayBuffer comparison)
  - `generateAccessToken(userId: string, secret: string): Promise<string>` — HS256 JWT via `hono/jwt` `sign()`, payload `{ sub: userId }`, expiry `now + 86400s` (24h)
  - `generateRefreshToken(): string` — `crypto.getRandomValues(new Uint8Array(32))` → hex string (64 chars)
  - `hashToken(token: string): Promise<string>` — SHA-256 of the UTF-8 encoded token via `crypto.subtle.digest`, returns hex string (stored in `refresh_tokens.token_hash`)
- [x] T005 Create `functions/auth/middleware.ts` — export `authMiddleware` as a Hono `MiddlewareHandler<{ Bindings: Env; Variables: Variables }>` that: (1) reads the `Authorization` header, (2) extracts the Bearer token, (3) calls `hono/jwt` `verify(token, c.env.JWT_SECRET)` and casts to `JwtPayload`, (4) on success calls `c.set('userId', payload.sub)` and `next()`, (5) on any failure (missing header, bad format, invalid signature, expired) returns `c.json({ error: ERRORS.UNAUTHORIZED }, 401)`

**Checkpoint**: `npm run type-check` passes. Manually confirm `hashPassword` output follows `"210000:hex:hex"` format by adding a temporary `console.log` in a test route (remove after verification).

---

## Phase 3: User Story 1 — New User Registration (Priority: P1) 🎯 MVP

**Goal**: `POST /api/auth/register` accepts a valid username/password, creates a user, stores the hashed password and refresh token in D1, and returns `{ accessToken, refreshToken, user }`.

**Independent Test**: `curl -X POST localhost:8787/api/auth/register -H 'Content-Type: application/json' -d '{"username":"ali","password":"secret123"}'` returns HTTP 201 with `accessToken`, `refreshToken`, and `user.id`.

### Implementation for User Story 1

- [x] T006 [US1] Create `functions/auth/router.ts` — initialise a `new Hono<{ Bindings: Env; Variables: Variables }>()` instance named `authRouter`; export it; do not register any routes yet (subsequent tasks add routes to this router)
- [x] T007 [US1] Add `POST /register` to `functions/auth/router.ts`: parse body `{ username, password }`, call `validateCredentials()` → if error return `c.json({ error }, 422)`; query `users` table for existing username → if found return `c.json({ error: ERRORS.USERNAME_TAKEN }, 409)`; call `hashPassword(password)` → generate `crypto.randomUUID()` for user id → insert into `users` table via Drizzle; call `generateRefreshToken()` → `hashToken()` → insert into `refresh_tokens` (id: `crypto.randomUUID()`, user_id, token_hash, expires_at: `now + 30 days`, created_at: now) → call `generateAccessToken(userId, c.env.JWT_SECRET)` → return `c.json({ accessToken, refreshToken, user: { id, username } }, 201)`
- [x] T008 [US1] Mount `authRouter` in `functions/api/[[route]].ts`: `import { authRouter } from './auth/router'` and `app.route('/api/auth', authRouter)`
- [ ] T009 [US1] Verify registration happy path: `curl -X POST localhost:8787/api/auth/register -H 'Content-Type: application/json' -d '{"username":"testuser","password":"password123"}'` → HTTP 201, response contains `accessToken` (JWT format), `refreshToken` (64-char hex), `user.id` (UUID), `user.username: "testuser"`
- [ ] T010 [US1] Verify duplicate username: repeat the same register request → HTTP 409, body `{ "error": "اسم المستخدم مستخدم بالفعل" }`
- [ ] T011 [US1] Verify validation errors: (a) username `"ab"` → 422 Arabic short-name error; (b) password `"123"` → 422 Arabic short-password error; (c) username `"has space"` → 422 Arabic spaces error; (d) missing body fields → 422 Arabic missing-fields error
- [ ] T012 [US1] Verify D1 storage: `wrangler d1 execute habit-tracker-db --local --command="SELECT username, password_hash FROM users;"` from `` — confirm username is stored, `password_hash` begins with `"210000:"` (never plaintext)

**Checkpoint**: US1 fully functional. Registration creates user + refresh token in D1. Tokens returned. Validation rejects bad input. No plaintext passwords in DB.

---

## Phase 4: User Story 2 — Existing User Login (Priority: P1)

**Goal**: `POST /api/auth/login` verifies credentials and returns a fresh token pair.

**Independent Test**: After registering a user, `curl -X POST localhost:8787/api/auth/login -d '{"username":"testuser","password":"password123"}'` returns HTTP 200 with a new `accessToken` and `refreshToken`.

### Implementation for User Story 2

- [x] T013 [US2] Add `POST /login` to `functions/auth/router.ts`: parse body `{ username, password }` → validate fields present (else 422); query `users` table by username → if not found call `hashPassword` with a dummy string to avoid timing leak then return `c.json({ error: ERRORS.INVALID_CREDENTIALS }, 401)`; if found call `verifyPassword(password, user.password_hash)` → if false return same 401 with same Arabic message; generate token pair → insert new refresh_token row → return `c.json({ accessToken, refreshToken, user: { id, username } }, 200)`
- [ ] T014 [US2] Verify login happy path: register then login with same credentials → HTTP 200, fresh token pair returned
- [ ] T015 [US2] Verify wrong password: login with correct username + wrong password → HTTP 401, `{ "error": "اسم المستخدم أو كلمة المرور غير صحيحة" }`
- [ ] T016 [US2] Verify unknown username: login with username that was never registered → HTTP 401, **same** Arabic error message as wrong password (no enumeration leak)
- [ ] T017 [US2] Verify new refresh token row: after login, `wrangler d1 execute habit-tracker-db --local --command="SELECT COUNT(*) FROM refresh_tokens;"` shows 2 rows (one from register, one from login) — both are hashed

**Checkpoint**: US2 complete. Login returns valid tokens. Wrong credentials return 401 with identical Arabic message for both cases.

---

## Phase 5: User Story 3 — Access Token Refresh (Priority: P2)

**Goal**: `POST /api/auth/refresh` exchanges a valid refresh token for a new access token.

**Independent Test**: Obtain a refresh token via login, then `curl -X POST localhost:8787/api/auth/refresh -d '{"refreshToken":"<hex>"}'` returns HTTP 200 with a new `accessToken`.

### Implementation for User Story 3

- [x] T018 [US3] Add `POST /refresh` to `functions/auth/router.ts`: parse body `{ refreshToken }` → if missing return 401; call `hashToken(refreshToken)` → query `refresh_tokens` by `token_hash` → if not found return `c.json({ error: ERRORS.INVALID_TOKEN }, 401)`; check `expires_at > now` → if expired delete the stale row and return 401; query the associated user by `user_id` → call `generateAccessToken(userId, c.env.JWT_SECRET)` → return `c.json({ accessToken }, 200)`
- [ ] T019 [US3] Verify happy path: login → use returned `refreshToken` in a refresh call → HTTP 200, new `accessToken` (different value from login's access token)
- [ ] T020 [US3] Verify invalid token: send a 64-char hex string that was never inserted → HTTP 401, `{ "error": "الرمز المميز غير صالح أو منتهي الصلاحية" }`
- [ ] T021 [US3] Verify malformed token: send `{ "refreshToken": "not-a-token" }` → HTTP 401 (hash lookup finds no match)

**Checkpoint**: US3 complete. Valid refresh tokens return new access tokens. Invalid or missing tokens return 401.

---

## Phase 6: User Story 4 — Secure Logout (Priority: P2)

**Goal**: `POST /api/auth/logout` (protected) deletes the specific refresh token so it can never be used again.

**Independent Test**: Login → logout with valid access token + refresh token → attempt refresh with the same refresh token → HTTP 401.

### Implementation for User Story 4

- [x] T022 [US4] Add `POST /logout` to `functions/auth/router.ts` with `authMiddleware` applied to this route only: `authRouter.post('/logout', authMiddleware, handler)` — handler: parse body `{ refreshToken }` → call `hashToken(refreshToken)` → `DELETE FROM refresh_tokens WHERE token_hash = ? AND user_id = ?` (using `c.get('userId')` from middleware context) → return `c.json({}, 200)` regardless of whether a row was deleted (idempotent)
- [ ] T023 [US4] Verify happy path: login → call logout with valid access token + refresh token in body → HTTP 200
- [ ] T024 [US4] Verify token revoked after logout: after T023, attempt `POST /api/auth/refresh` with the same refresh token → HTTP 401
- [ ] T025 [US4] Verify auth enforcement on logout: call logout without `Authorization` header → HTTP 401, `{ "error": "يجب تسجيل الدخول أولاً" }`

**Checkpoint**: US4 complete. Logout deletes the specific refresh token. Subsequent refresh attempts with the revoked token return 401.

---

## Phase 7: User Story 5 — Auth Middleware on Protected Routes (Priority: P2)

**Goal**: `authMiddleware` is exported and ready to protect all future routes (records, analytics, settings). Verify it correctly gates access.

**Independent Test**: Any route protected with `authMiddleware` returns 401 for no token, 401 for tampered token, and 200 with `userId` available for valid token.

### Implementation for User Story 5

- [x] T026 [US5] Add a temporary test route to `functions/api/[[route]].ts`: `app.get('/api/me', authMiddleware, (c) => c.json({ userId: c.get('userId') }))` — used only for middleware verification (will be replaced by a real user profile route in a later phase)
- [ ] T027 [US5] Verify no token: `curl localhost:8787/api/me` (no Authorization header) → HTTP 401, `{ "error": "يجب تسجيل الدخول أولاً" }`
- [ ] T028 [US5] Verify tampered token: modify one character in a valid JWT string → `curl localhost:8787/api/me -H 'Authorization: Bearer <tampered>'` → HTTP 401
- [ ] T029 [US5] Verify valid token: `curl localhost:8787/api/me -H 'Authorization: Bearer <accessToken>'` → HTTP 200, `{ "userId": "<UUID>" }` matching the registered user's id
- [ ] T030 [US5] Verify expired token: set a short expiry (modify `generateAccessToken` temporarily to `exp: now + 1`), wait 2 seconds, call `/api/me` → HTTP 401; revert the expiry to 24h

**Checkpoint**: US5 complete. `authMiddleware` correctly enforces auth on any route. Ready for use in Phase 3 (Records), Phase 4 (Analytics), Phase 5 (Settings).

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Type safety confirmation, final cleanup, and end-to-end acceptance criteria verification across all delivered stories.

- [x] T031 [P] Run `npm run type-check` from `` and confirm TypeScript exits with 0 errors across all new files: `src/auth/types.ts`, `src/auth/validation.ts`, `src/auth/crypto.ts`, `src/auth/middleware.ts`, `src/auth/router.ts`, and the updated `src/types.ts` and `src/index.ts`
- [x] T032 [P] Inspect the `refresh_tokens` D1 table: `wrangler d1 execute habit-tracker-db --local --command="SELECT token_hash FROM refresh_tokens LIMIT 5;"` — confirm all values are 64-char hex strings (SHA-256 output), never raw token values
- [x] T033 [P] Inspect the `users` D1 table: `wrangler d1 execute habit-tracker-db --local --command="SELECT password_hash FROM users LIMIT 5;"` — confirm all values start with `"210000:"` and contain two colons
- [x] T034 Run the full end-to-end flow: (1) register → (2) login → (3) call `/api/me` with access token → (4) refresh → (5) call `/api/me` with new access token → (6) logout → (7) attempt refresh (expect 401) — document results as a comment in `specs/016-auth-endpoints/plan.md`
- [x] T035 Remove or gate the temporary `GET /api/me` test route added in T026 (leave a TODO comment pointing to Phase 6 Angular Auth Layer for the real `/api/me` implementation)

**Checkpoint**: All acceptance criteria from spec.md (SC-001 through SC-007) verified. Phase 2 (Auth Endpoints) is complete.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — **BLOCKS all user story phases**
- **US1 Register (Phase 3)**: Depends on Phase 2 — first endpoint; creates the router
- **US2 Login (Phase 4)**: Depends on Phase 3 (router exists, `authRouter` exported)
- **US3 Refresh (Phase 5)**: Depends on Phase 2 only (uses `hashToken` + D1 query) — can run in parallel with US2 if staffed
- **US4 Logout (Phase 6)**: Depends on Phase 2 + `authMiddleware` from T005; can overlap with US3
- **US5 Middleware (Phase 7)**: Depends on T005 (middleware) — can run immediately after Phase 2
- **Polish (Phase 8)**: Depends on all user story phases

### User Story Dependencies

- **US1 (P1)**: After Foundational — builds the `authRouter`, required by all subsequent stories
- **US2 (P1)**: After US1 (router must exist from T006)
- **US3 (P2)**: After Foundational — `POST /refresh` only needs crypto + D1
- **US4 (P2)**: After Foundational + US1 (router) — logout applies `authMiddleware` inline
- **US5 (P2)**: After Foundational — middleware (T005) is already built; only needs a test route

### Within Each Phase

- Tasks marked `[P]` within a phase operate on different files and can run concurrently
- Phase 1 → Phase 2 → Phase 3 → Phase 4 (and 5, 6, 7 can overlap) → Phase 8

### Parallel Opportunities

- **Phase 1**: T002 and T003 can run in parallel after T001
- **Phase 2**: T004 and T005 can run in parallel (different files)
- **Phase 3–7**: US3, US4, US5 can run in parallel after Foundational if team allows
- **Phase 8**: T031, T032, T033 can all run in parallel

---

## Parallel Example: Phase 2 (Foundational)

```bash
# After Phase 1 is complete, run both simultaneously:
Task T004: Create functions/auth/crypto.ts
Task T005: Create functions/auth/middleware.ts
# Then proceed to Phase 3 (authRouter depends on both)
```

---

## Implementation Strategy

### MVP First (US1 — Register only)

1. Complete Phase 1: Setup (types, validation constants, Env update)
2. Complete Phase 2: Foundational (crypto + middleware)
3. Complete Phase 3: US1 — `POST /api/auth/register`
4. **STOP and VALIDATE**: Register works, tokens returned, D1 has hashed password ✅
5. Auth foundation proven — proceed to login

### Incremental Delivery

1. Setup + Foundational → crypto and middleware ready
2. + US1 Register → first working endpoint, token generation proven (**MVP**)
3. + US2 Login → full registration + login cycle complete
4. + US3 Refresh → sessions survive access token expiry
5. + US4 Logout → sessions revocable
6. + US5 Middleware → all future routes can be protected with one import
7. + Polish → type-check passes, D1 storage verified, end-to-end flow documented

---

## Acceptance Criteria Mapping

| Task(s) | Spec ID | Criterion |
|---------|---------|-----------|
| T009, T034 | SC-001 | Registration completes in < 3s |
| T009–T011, T014–T016, T019–T020, T023–T025 | SC-002 | All 4 endpoints return correct HTTP codes + shapes |
| T029, T034 | SC-003 | Access token authenticates protected routes for 24h window |
| T024 | SC-004 | Refresh rejected 100% after logout |
| T012, T032, T033 | SC-005 | No plaintext password in DB, logs, or responses |
| T027–T028, T030 | SC-006 | Middleware rejects 100% of invalid/expired/missing tokens |
| T011, T015–T016, T020, T025, T027 | SC-007 | All Arabic error messages correct and internal-detail-free |

---

## Notes

- No automated test framework introduced in this phase — all verification is manual `curl` + D1 inspection
- `[P]` tasks operate on different files — safe to run concurrently
- `crypto.subtle` only — no Node.js `crypto` module (Workers V8 runtime constraint)
- The Angular frontend in `src/` is never modified in this phase
- The temporary `GET /api/me` route (T026) must be removed/commented in T035 before Phase 3 (Records) begins
- After this phase, any new protected route needs only: `import { authMiddleware } from './auth/middleware'` + `app.use('/api/records/*', authMiddleware)`
