# Feature Specification: Auth Endpoints

**Feature Branch**: `016-auth-endpoints`

**Created**: 2026-08-22

**Status**: Draft

**Input**: User description: "second phase of BACKEND_PLAN.md — Auth Endpoints: register, login, refresh, logout with JWT and PBKDF2"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - New User Registration (Priority: P1)

A new visitor provides a username and password to create an account. The system validates the input, securely stores the credentials, and returns access and refresh tokens so the user is immediately authenticated without a separate login step.

**Why this priority**: Registration is the entry point to the entire application. Without it, no other feature is usable. Delivering this alone provides a working sign-up flow.

**Independent Test**: Can be fully tested by sending a register request with a valid username/password and verifying tokens are returned and the user can subsequently call a protected endpoint.

**Acceptance Scenarios**:

1. **Given** the username does not exist, **When** a user submits a valid username (3–30 chars, no spaces) and password (≥ 8 chars), **Then** the system returns `accessToken`, `refreshToken`, and `user: { id, username }` with HTTP 201.
2. **Given** the username is already taken, **When** a user attempts to register with the same username, **Then** the system returns HTTP 409 with an Arabic error message.
3. **Given** the username is fewer than 3 characters, **When** a register request is submitted, **Then** the system returns HTTP 422 with an Arabic validation error.
4. **Given** the password is fewer than 8 characters, **When** a register request is submitted, **Then** the system returns HTTP 422 with an Arabic validation error.
5. **Given** the username contains spaces, **When** a register request is submitted, **Then** the system returns HTTP 422 with an Arabic validation error.

---

### User Story 2 - Existing User Login (Priority: P1)

A registered user provides their username and password to authenticate. The system verifies credentials and returns fresh access and refresh tokens.

**Why this priority**: Login is equally critical to registration — returning users must be able to re-authenticate. Both P1 stories together deliver a complete auth cycle.

**Independent Test**: Can be fully tested by first registering a user, then logging in with the same credentials and verifying a valid access token is returned.

**Acceptance Scenarios**:

1. **Given** a registered user, **When** they submit correct username and password, **Then** the system returns `accessToken`, `refreshToken`, and `user` with HTTP 200.
2. **Given** a registered user, **When** they submit an incorrect password, **Then** the system returns HTTP 401 with an Arabic error message.
3. **Given** a username that does not exist, **When** a login request is submitted, **Then** the system returns HTTP 401 with the same Arabic error message as wrong password (no username enumeration).

---

### User Story 3 - Access Token Refresh (Priority: P2)

When a user's access token expires, the client exchanges the stored refresh token for a new access token without requiring the user to log in again.

**Why this priority**: Silent token renewal ensures a seamless experience. Without it, users are logged out every 24 hours.

**Independent Test**: Can be tested by calling the refresh endpoint with a valid refresh token and verifying a new access token is returned.

**Acceptance Scenarios**:

1. **Given** a valid, non-expired refresh token, **When** the client sends it to the refresh endpoint, **Then** the system returns a new `accessToken` with HTTP 200.
2. **Given** an expired refresh token, **When** the client sends it, **Then** the system returns HTTP 401 with an Arabic error message.
3. **Given** a refresh token that has been revoked (logged out), **When** the client sends it, **Then** the system returns HTTP 401.
4. **Given** a malformed or tampered token, **When** the client sends it, **Then** the system returns HTTP 401.

---

### User Story 4 - Secure Logout (Priority: P2)

An authenticated user explicitly logs out. The system invalidates the refresh token so it can no longer be used to obtain new access tokens.

**Why this priority**: Logout is essential for security — it prevents token reuse after a session ends or a device is lost.

**Independent Test**: Can be tested by logging in, calling logout, then attempting to refresh with the old token and confirming it is rejected.

**Acceptance Scenarios**:

1. **Given** a valid access token, **When** the user calls the logout endpoint, **Then** the system deletes the associated refresh token from storage and returns HTTP 200.
2. **Given** an expired or invalid access token, **When** logout is called, **Then** the system returns HTTP 401.
3. **Given** the token was already logged out, **When** the client attempts to refresh, **Then** the system returns HTTP 401.

---

### User Story 5 - Protected Route Access via Auth Middleware (Priority: P2)

Any API endpoint requiring authentication rejects requests without a valid access token, and grants access to requests with a valid one, populating the user identity for route handlers.

**Why this priority**: The auth middleware is the security backbone for all subsequent phases (records, analytics, settings).

**Independent Test**: Can be tested by calling any protected endpoint without a token (expect 401), with an invalid token (expect 401), and with a valid token (expect 200 with user context).

**Acceptance Scenarios**:

1. **Given** a request with no `Authorization` header, **When** it reaches a protected endpoint, **Then** the system returns HTTP 401.
2. **Given** a request with a tampered JWT signature, **When** it reaches a protected endpoint, **Then** the system returns HTTP 401.
3. **Given** a request with a valid, non-expired access token, **When** it reaches a protected endpoint, **Then** the system proceeds and the authenticated user's ID is available to the handler.
4. **Given** a request with an expired access token, **When** it reaches a protected endpoint, **Then** the system returns HTTP 401.

---

### Edge Cases

- What happens when the request body is missing required fields? → HTTP 422 with Arabic field-level errors.
- What happens when two simultaneous registrations use the same username? → One succeeds (201), the other receives HTTP 409.
- What happens when the `Authorization` header has a malformed `Bearer` prefix? → HTTP 401.
- What happens when a refresh token is used after the 30-day window? → HTTP 401; the stale DB row is cleaned up.
- What happens when the JWT secret is rotated? → All existing tokens become invalid; users must log in again.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow new users to create an account by providing a unique username and password.
- **FR-002**: System MUST reject usernames shorter than 3 characters, longer than 30 characters, or containing spaces.
- **FR-003**: System MUST reject passwords shorter than 8 characters.
- **FR-004**: System MUST store passwords using PBKDF2-SHA256 with 210,000 iterations and a unique 32-byte random salt per user; the plaintext password MUST never be stored.
- **FR-005**: System MUST store the password in the format `iterations:hexSalt:hexHash`.
- **FR-006**: System MUST return an access token (24-hour expiry) and a refresh token (30-day expiry) upon successful registration or login.
- **FR-007**: System MUST store refresh tokens in the database linked to the user to enable revocation.
- **FR-008**: System MUST allow a client holding a valid refresh token to obtain a new access token without re-entering credentials.
- **FR-009**: System MUST allow an authenticated user to invalidate their session by deleting their refresh token from the database.
- **FR-010**: System MUST provide a reusable auth middleware that verifies access tokens on protected routes and makes the authenticated user's ID available to route handlers.
- **FR-011**: System MUST return all validation and authentication error messages in Arabic.
- **FR-012**: System MUST load the JWT signing secret from a secure runtime secret store; it MUST NOT appear in source code or version control.
- **FR-013**: System MUST return HTTP 401 for all unauthenticated or token-invalid scenarios on protected endpoints.
- **FR-014**: System MUST return the same error message for both "wrong password" and "unknown username" to prevent username enumeration.

### Key Entities

- **User**: A registered account identified by a unique username, holding a securely-hashed password and a creation timestamp.
- **Refresh Token**: A revocable, time-limited credential linked to a user — stored as a hash in the database with an expiry timestamp. Deleted on logout or expiry.
- **Access Token**: A short-lived, stateless credential carrying the user's ID — verified on each request but not stored server-side.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new user can complete registration and receive usable tokens within 3 seconds under normal conditions.
- **SC-002**: All four auth endpoints return correct HTTP status codes and response shapes for both success and failure cases.
- **SC-003**: An access token obtained via login successfully authenticates requests to all protected endpoints for the full 24-hour validity window.
- **SC-004**: A refresh token is rejected 100% of the time after the user logs out.
- **SC-005**: No plaintext password is ever observable in the database, logs, or API responses.
- **SC-006**: The auth middleware correctly rejects 100% of requests with invalid, expired, or missing tokens.
- **SC-007**: All Arabic error messages accurately describe the error condition without exposing internal implementation details.

## Assumptions

- Phase 1 (backend scaffolding and D1 database with `users` and `refresh_tokens` tables) is complete and operational.
- The frontend client stores tokens (e.g., in `localStorage`) and includes them in requests — token storage is out of scope for this phase.
- Multiple simultaneous sessions per user (e.g., multiple devices) are allowed; each session has its own refresh token row.
- The JWT signing secret uses symmetric HMAC; asymmetric signing is out of scope.
- Rate limiting and brute-force protection on auth endpoints are out of scope for this phase.
- Email verification and password reset flows are out of scope for this phase.
- All error responses follow a consistent shape: `{ error: "<Arabic message>" }`.
