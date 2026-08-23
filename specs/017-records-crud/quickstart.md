# Quickstart: Records CRUD Endpoints

**Feature**: Records CRUD Endpoints
**Date**: 2026-08-23

## Overview

This quickstart provides validation scenarios for the Records CRUD API endpoints. These scenarios can be used to verify the implementation works correctly.

## Prerequisites

1. Running Cloudflare Workers development server (`npm run dev`)
2. Valid JWT authentication token
3. D1 database with schema migrated

## Validation Scenarios

### Scenario 1: Create a Relapse Record (US1)

**Endpoint**: `POST /api/records`

**Request**:
```bash
curl -X POST http://localhost:8787/api/records \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-08-23",
    "time": "14:30",
    "ampm": "PM",
    "count": 1,
    "urgeLevel": 5,
    "reason": "Stressful day",
    "notes": "Need to improve coping mechanisms"
  }'
```

**Expected Response** (201 Created):
```json
{
  "id": "uuid-v4",
  "userId": "user-uuid",
  "date": "2026-08-23",
  "time": "14:30",
  "ampm": "PM",
  "count": 1,
  "urgeLevel": 5,
  "reason": "Stressful day",
  "notes": "Need to improve coping mechanisms",
  "createdAt": "2026-08-23T14:30:00.000Z",
  "updatedAt": "2026-08-23T14:30:00.000Z"
}
```

**Validation Tests**:
- ✅ Record created with correct fields
- ✅ ID is generated automatically
- ✅ userId matches authenticated user
- ✅ timestamps are auto-populated

### Scenario 2: List User Records (US2)

**Endpoint**: `GET /api/records`

**Request**:
```bash
curl -X GET http://localhost:8787/api/records \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

**With Date Filtering**:
```bash
curl -X GET "http://localhost:8787/api/records?from=2026-08-01&to=2026-08-31" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

**Expected Response** (200 OK):
```json
[
  {
    "id": "uuid-v4",
    "userId": "user-uuid",
    "date": "2026-08-23",
    "time": "14:30",
    "ampm": "PM",
    "count": 1,
    "urgeLevel": 5,
    "reason": "Stressful day",
    "notes": "Need to improve coping mechanisms",
    "createdAt": "2026-08-23T14:30:00.000Z",
    "updatedAt": "2026-08-23T14:30:00.000Z"
  }
]
```

**Validation Tests**:
- ✅ Returns array of records
- ✅ Only returns records for authenticated user
- ✅ Records sorted by date descending
- ✅ Date filtering works correctly
- ✅ Returns empty array for users with no records

### Scenario 3: Get Single Record (US3)

**Endpoint**: `GET /api/records/:id`

**Request**:
```bash
curl -X GET http://localhost:8787/api/records/<record-id> \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

**Expected Response** (200 OK):
```json
{
  "id": "uuid-v4",
  "userId": "user-uuid",
  "date": "2026-08-23",
  "time": "14:30",
  "ampm": "PM",
  "count": 1,
  "urgeLevel": 5,
  "reason": "Stressful day",
  "notes": "Need to improve coping mechanisms",
  "createdAt": "2026-08-23T14:30:00.000Z",
  "updatedAt": "2026-08-23T14:30:00.000Z"
}
```

**Validation Tests**:
- ✅ Returns correct record
- ✅ Returns 404 for nonexistent record
- ✅ Returns 403 for other user's record

### Scenario 4: Update a Record (US4)

**Endpoint**: `PUT /api/records/:id`

**Request**:
```bash
curl -X PUT http://localhost:8787/api/records/<record-id> \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "count": 2,
    "notes": "Updated notes after reflection"
  }'
```

**Expected Response** (200 OK):
```json
{
  "id": "uuid-v4",
  "userId": "user-uuid",
  "date": "2026-08-23",
  "time": "14:30",
  "ampm": "PM",
  "count": 2,
  "urgeLevel": 5,
  "reason": "Stressful day",
  "notes": "Updated notes after reflection",
  "createdAt": "2026-08-23T14:30:00.000Z",
  "updatedAt": "2026-08-23T15:00:00.000Z"
}
```

**Validation Tests**:
- ✅ Record updated with new values
- ✅ updated_at timestamp is refreshed
- ✅ Returns 404 for nonexistent record
- ✅ Returns 403 for other user's record
- ✅ Validation errors return 422

### Scenario 5: Delete a Record (US5)

**Endpoint**: `DELETE /api/records/:id`

**Request**:
```bash
curl -X DELETE http://localhost:8787/api/records/<record-id> \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

**Expected Response**: `204 No Content`

**Validation Tests**:
- ✅ Record deleted successfully
- ✅ Returns 204 No Content
- ✅ Returns 404 for nonexistent record
- ✅ Returns 403 for other user's record
- ✅ Record no longer appears in list

### Scenario 6: Authentication & Authorization

**Test Cases**:
- ✅ Requests without JWT token return 401
- ✅ Requests with invalid JWT token return 401
- ✅ Requests with expired JWT token return 401
- ✅ User can only access their own records (data isolation)

### Scenario 7: Validation Errors

**Test Cases**:
- ✅ Invalid date format (not YYYY-MM-DD) returns 422
- ✅ Count < 1 returns 422
- ✅ urgeLevel < 1 or > 10 returns 422
- ✅ Missing required fields return 422
- ✅ All error messages are in Arabic

## Performance Validation

**Target Metrics** (from plan.md):
- SC-001: Create record < 5s
- SC-002: List records (1k records) < 2s
- SC-004: Validation errors < 1s

**How to Test**:
1. Create 1000 records for a user
2. Measure response time for GET /api/records
3. Verify it meets the < 2s target

## Integration Testing

1. **End-to-end flow**:
   - Register/Login user
   - Create multiple records
   - List records with filtering
   - Get specific record
   - Update record
   - Delete record
   - Verify record no longer appears

2. **Cross-user isolation**:
   - Create records as User A
   - Attempt to access User A's records as User B
   - Verify 403 Forbidden response

## Notes

- All endpoints require JWT authentication
- Arabic error messages are provided for validation failures
- User data is strictly isolated per user
- Timestamps are auto-managed (createdAt, updatedAt)