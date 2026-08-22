# API Contract: Health Endpoint

**Feature**: 015 — Backend Scaffolding & Database
**Phase**: 1 (only endpoint in scope for Phase 1)

---

## `GET /api/health`

Public endpoint. No authentication required.

### Request

```
GET /api/health HTTP/1.1
Host: localhost:8787
```

No headers, query params, or body required.

### Response — 200 OK

```json
{
  "status": "ok"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `status` | `"ok"` | Always the string literal `"ok"` |

### Response — 500 Internal Server Error

Returned only if the Worker throws an unhandled exception during health check processing (should not occur in normal operation).

```json
{
  "error": "Internal server error"
}
```

### CORS Headers

All responses include the following CORS headers when the request `Origin` matches `ALLOWED_ORIGIN`:

```
Access-Control-Allow-Origin: <value of ALLOWED_ORIGIN env var>
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

### Notes

- This endpoint does **not** query the database — it returns `{ status: "ok" }` regardless of D1 state.
- Latency target: < 500 ms on a local machine under normal load (SC-003).
- Used as the "is the stack alive?" signal for Phase 1 validation.

---

## Future Endpoints (Phases 2–5)

Contracts for auth, records, analytics, and settings endpoints will be defined in subsequent plan phases:

- `specs/016-auth-endpoints/contracts/` — Phase 2
- `specs/017-records-crud/contracts/` — Phase 3
- `specs/018-analytics/contracts/` — Phase 4
- `specs/019-settings/contracts/` — Phase 5
