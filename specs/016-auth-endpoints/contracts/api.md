# API Contracts: Auth Endpoints

**Feature**: 016-auth-endpoints | **Date**: 2026-08-22

All endpoints are prefixed with `/api/auth`. All request and response bodies are `application/json`. All error responses follow the shape `{ "error": "<Arabic message>" }`.

---

## POST /api/auth/register

**Purpose**: Create a new user account and return a token pair.

### Request

```
POST /api/auth/register
Content-Type: application/json
```

```json
{
  "username": "ali",
  "password": "secret123"
}
```

### Response — 201 Created

```json
{
  "accessToken": "<JWT string>",
  "refreshToken": "<32-byte hex string>",
  "user": {
    "id": "<UUID>",
    "username": "ali"
  }
}
```

### Error Responses

| Status | Body | Condition |
|--------|------|-----------|
| 422 | `{ "error": "اسم المستخدم يجب أن يكون 3 أحرف على الأقل" }` | username < 3 chars |
| 422 | `{ "error": "اسم المستخدم يجب ألا يتجاوز 30 حرفاً" }` | username > 30 chars |
| 422 | `{ "error": "اسم المستخدم لا يمكن أن يحتوي على مسافات" }` | username has spaces |
| 422 | `{ "error": "كلمة المرور يجب أن تكون 8 أحرف على الأقل" }` | password < 8 chars |
| 422 | `{ "error": "يرجى تعبئة جميع الحقول المطلوبة" }` | username or password missing |
| 409 | `{ "error": "اسم المستخدم مستخدم بالفعل" }` | username already taken |

---

## POST /api/auth/login

**Purpose**: Authenticate an existing user and return a fresh token pair.

### Request

```
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "username": "ali",
  "password": "secret123"
}
```

### Response — 200 OK

```json
{
  "accessToken": "<JWT string>",
  "refreshToken": "<32-byte hex string>",
  "user": {
    "id": "<UUID>",
    "username": "ali"
  }
}
```

### Error Responses

| Status | Body | Condition |
|--------|------|-----------|
| 422 | `{ "error": "يرجى تعبئة جميع الحقول المطلوبة" }` | body missing fields |
| 401 | `{ "error": "اسم المستخدم أو كلمة المرور غير صحيحة" }` | wrong credentials OR unknown user |

> **Security note**: The 401 message is identical for "wrong password" and "unknown username" to prevent username enumeration (FR-014).

---

## POST /api/auth/refresh

**Purpose**: Exchange a valid refresh token for a new access token.

### Request

```
POST /api/auth/refresh
Content-Type: application/json
```

```json
{
  "refreshToken": "<32-byte hex string>"
}
```

### Response — 200 OK

```json
{
  "accessToken": "<new JWT string>"
}
```

### Error Responses

| Status | Body | Condition |
|--------|------|-----------|
| 401 | `{ "error": "الرمز المميز غير صالح أو منتهي الصلاحية" }` | token not in DB, expired, or malformed |

---

## POST /api/auth/logout

**Purpose**: Revoke the current session's refresh token.

### Request

```
POST /api/auth/logout
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{
  "refreshToken": "<32-byte hex string>"
}
```

### Response — 200 OK

```json
{}
```

### Error Responses

| Status | Body | Condition |
|--------|------|-----------|
| 401 | `{ "error": "يجب تسجيل الدخول أولاً" }` | missing or invalid access token |

---

## Auth Middleware (applied to protected routes)

**Purpose**: Validate the `Authorization: Bearer <token>` header on any protected route and populate `userId` in the request context.

### Success

Request proceeds. The authenticated user's ID is available to the route handler as `c.get('userId')`.

### Failure Responses

| Status | Body | Condition |
|--------|------|-----------|
| 401 | `{ "error": "يجب تسجيل الدخول أولاً" }` | missing header, invalid signature, or expired token |

> **Usage**: In subsequent phases (Records, Analytics, Settings), wrap routes with this middleware: `app.use('/api/records/*', authMiddleware)`.
