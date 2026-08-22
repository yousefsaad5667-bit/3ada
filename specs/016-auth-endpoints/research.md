# Research: Auth Endpoints

**Feature**: 016-auth-endpoints | **Date**: 2026-08-22

---

## 1. Password Hashing — PBKDF2 in Cloudflare Workers

**Decision**: PBKDF2-SHA256, 210,000 iterations, 32-byte random salt, via `crypto.subtle` (Web Crypto API).

**Rationale**:
- Web Crypto API is natively available in all Cloudflare Workers — zero dependencies
- PBKDF2 is the only password-hashing primitive available in Web Crypto (no bcrypt, no Argon2, no scrypt — all require native bindings)
- 210,000 iterations matches OWASP 2023 recommendation for PBKDF2-SHA256
- 32-byte salt (256-bit) eliminates rainbow table attacks
- Storage format `iterations:hexSalt:hexHash` is self-describing — allows iteration count migration in the future without breaking existing hashes

**Alternatives considered**:
- bcrypt → Requires native Node.js binding, unavailable in V8 isolate runtime — REJECTED
- Argon2 → Same constraint as bcrypt — REJECTED
- SHA-256 direct → Not a password-hashing algorithm (no iteration stretching) — REJECTED

**Implementation note**: Constant-time comparison via `crypto.subtle.timingSafeEqual` (imported from `node:crypto` compat layer) or manual XOR loop to prevent timing attacks.

---

## 2. JWT — Signing and Verification

**Decision**: Use `hono/jwt` (built into Hono v4) with HS256 (HMAC-SHA256).

**Rationale**:
- `hono/jwt` uses `crypto.subtle` internally — no extra packages, Workers-compatible
- HS256 (symmetric) is appropriate for a single-service backend where the same service signs and verifies
- Access token payload: `{ sub: userId, iat, exp }` — minimal, user-centric
- 24-hour access token expiry balances security (short window) vs. UX (infrequent refresh)
- 30-day refresh token expiry matches industry standard for "remember me"-style sessions

**Alternatives considered**:
- RS256 (asymmetric) → Requires key pair management infrastructure; overkill for single-service backend — REJECTED for Phase 2; can be introduced later
- `jose` npm package → Works in Workers but adds bundle size when `hono/jwt` already covers the need — REJECTED

**Secret management**: `JWT_SECRET` injected via `wrangler secret put JWT_SECRET` → available at `c.env.JWT_SECRET` at runtime. Never stored in code or `wrangler.toml`.

---

## 3. Refresh Token Storage Strategy

**Decision**: Store SHA-256 hash of the raw refresh token in D1 `refresh_tokens` table. Send raw token to client.

**Rationale**:
- If D1 is compromised, an attacker cannot use the stored hashes directly — they need the raw token the client holds
- SHA-256 (not PBKDF2) is appropriate here: refresh tokens are already high-entropy random values (32 bytes = 256 bits), so iteration stretching is unnecessary
- Token revocation is O(1): `DELETE FROM refresh_tokens WHERE token_hash = ?`
- Multi-session support is natural: each login produces a new row

**Alternatives considered**:
- Store raw token → DB compromise exposes all active sessions — REJECTED
- Use opaque session IDs with a separate lookup table → Same as current approach, redundant — REJECTED

**Token generation**: `crypto.getRandomValues(new Uint8Array(32))` → 256-bit entropy, hex-encoded → sent to client as the "refresh token" string.

---

## 4. Hono Context Variable Typing

**Decision**: Use Hono's typed context variables (`c.set` / `c.get`) with a `Variables` type map.

**Rationale**:
- Allows `c.get('userId')` to be typed as `string` in all route handlers after the auth middleware runs
- No casting required in downstream routes
- Aligns with Hono v4 best practices

**Implementation**:
```ts
type Variables = { userId: string };
const app = new Hono<{ Bindings: Env; Variables: Variables }>();
```
The auth middleware sets `c.set('userId', payload.sub)`. Route handlers read `c.get('userId')`.

---

## 5. Error Response Shape

**Decision**: All errors return `{ error: "<Arabic message>" }` with the appropriate HTTP status.

**Rationale**:
- Consistent shape allows the Angular frontend to parse errors without inspecting status codes first
- Arabic messages directly usable in UI without translation layer
- No stack traces or internal details exposed

**Status code mapping**:
| Scenario | HTTP Status |
|----------|-------------|
| Validation failure | 422 |
| Username already taken | 409 |
| Wrong credentials | 401 |
| Invalid/expired token | 401 |
| Missing auth header | 401 |
| Server error | 500 |

---

## 6. Logout — Which Token to Revoke?

**Decision**: The logout endpoint (`POST /api/auth/logout`) is protected by the JWT auth middleware. The client does NOT send the refresh token in the logout body. Instead, the server derives which refresh token to delete based on the `userId` in the access token.

**Rationale from BACKEND_PLAN.md**: "Deletes the refresh token from D1" — since multi-session is supported, we must either (a) delete all refresh tokens for the user or (b) require the client to send the refresh token. 

**Chosen approach**: Client sends `{ refreshToken }` in the body alongside the `Authorization: Bearer <accessToken>` header. The server verifies the access token (middleware), then deletes the specific refresh token row matching `hash(refreshToken)` for that `userId`. This is the most precise revocation — logs out one session, not all.

**Alternative**: Delete all refresh tokens for `userId` (global logout) → Too broad for a single logout action. Could be a separate "logout everywhere" feature later.
