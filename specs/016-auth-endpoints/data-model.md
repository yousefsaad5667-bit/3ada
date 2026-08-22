# Data Model: Auth Endpoints

**Feature**: 016-auth-endpoints | **Date**: 2026-08-22

---

## Entities

### User

Represents a registered account. Already defined in `backend/src/db/schema.ts` (Phase 1). Listed here for reference.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | text (UUID) | PRIMARY KEY | `crypto.randomUUID()` |
| `username` | text | UNIQUE, NOT NULL | 3–30 chars, no spaces |
| `password_hash` | text | NOT NULL | Format: `210000:hexSalt:hexHash` |
| `created_at` | text | NOT NULL | ISO-8601 string |

**Validation rules** (enforced in `src/auth/validation.ts`):
- `username`: length 3–30, no whitespace characters
- `password`: minimum length 8 (raw; hash stored, never the raw value)

---

### Refresh Token

Represents a single revocable session credential. Already defined in Phase 1 schema.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | text (UUID) | PRIMARY KEY | `crypto.randomUUID()` |
| `user_id` | text | FK → users(id) CASCADE DELETE, NOT NULL | Deletes all tokens when user deleted |
| `token_hash` | text | NOT NULL | SHA-256 hex of the raw refresh token |
| `expires_at` | text | NOT NULL | ISO-8601, now + 30 days |
| `created_at` | text | NOT NULL | ISO-8601 |

**Lifecycle**:
- Created on: successful `register` or `login`
- Deleted on: `logout` (specific session) or user account deletion (cascade)
- Auto-rejected when: `expires_at` < now (checked in `POST /api/auth/refresh` handler)

---

### Access Token (stateless — not stored)

| Field | Type | Notes |
|-------|------|-------|
| `sub` | string (UUID) | userId |
| `iat` | number | Issued-at (Unix epoch seconds) |
| `exp` | number | Expiry = iat + 86400 (24h) |

The access token is a signed JWT. It is **never stored server-side**. Verification is purely cryptographic (signature + expiry check).

---

## State Transitions

### Refresh Token Lifecycle

```
[LOGIN / REGISTER]
      │
      ▼
  ACTIVE ──── (30 days pass) ──────► REJECTED (on next refresh attempt)
      │
      ├── logout called ───────────► DELETED (from D1)
      │
      └── user deleted ────────────► CASCADE DELETED
```

---

## Relationships

```
users (1) ──────────────────── (0..N) refresh_tokens
                                        token_hash: SHA-256(rawToken)
                                        expires_at: +30d from creation
```

---

## Arabic Error Message Catalogue

| Constant | Arabic Text | Trigger |
|----------|-------------|---------|
| `USERNAME_TOO_SHORT` | اسم المستخدم يجب أن يكون 3 أحرف على الأقل | username.length < 3 |
| `USERNAME_TOO_LONG` | اسم المستخدم يجب ألا يتجاوز 30 حرفاً | username.length > 30 |
| `USERNAME_HAS_SPACES` | اسم المستخدم لا يمكن أن يحتوي على مسافات | /\s/.test(username) |
| `PASSWORD_TOO_SHORT` | كلمة المرور يجب أن تكون 8 أحرف على الأقل | password.length < 8 |
| `USERNAME_TAKEN` | اسم المستخدم مستخدم بالفعل | UNIQUE constraint violation on register |
| `INVALID_CREDENTIALS` | اسم المستخدم أو كلمة المرور غير صحيحة | wrong password or unknown user |
| `INVALID_TOKEN` | الرمز المميز غير صالح أو منتهي الصلاحية | expired/invalid refresh or access token |
| `UNAUTHORIZED` | يجب تسجيل الدخول أولاً | missing Authorization header |
| `MISSING_FIELDS` | يرجى تعبئة جميع الحقول المطلوبة | body missing username or password |
