# Phase 1 — Backend Scaffolding & Database

## Goal

Set up the Hono Worker project inside the monorepo, connect it to Cloudflare D1, define the database schema, and get a running local dev environment.

## Specifications

### Project Structure

A `backend/` folder lives at the root of the Angular project (same repo).

```
habit-tracker/
├── src/                   ← Angular frontend (existing)
├── angular.json
├── package.json
└── backend/               ← NEW: Hono Worker project
    ├── wrangler.toml
    ├── package.json
    ├── tsconfig.json
    ├── drizzle.config.ts
    ├── drizzle/
    │   └── 0000_initial.sql
    └── src/
        ├── index.ts
        ├── types.ts
        ├── db/
        │   ├── schema.ts
        │   └── client.ts
        └── middleware/
            └── cors.ts
```

The backend has its own `package.json` and is deployed independently from the frontend.

### Framework

Hono — a Workers-native TypeScript framework.

### Database

Cloudflare D1 (SQLite at the edge).

ORM: Drizzle ORM — schema is defined in TypeScript, SQL migrations are auto-generated. No hand-written SQL.

### Tables

Users

```
id           UUID, primary key
username     text, unique, not null
password_hash  text, not null
created_at   text, not null
```

Refresh Tokens

```
id           UUID, primary key
user_id      FK → users, cascade delete
token_hash   text, not null
expires_at   text, not null
created_at   text, not null
```

Relapse Records

```
id           UUID, primary key
user_id      FK → users, cascade delete
date         text YYYY-MM-DD, not null
time         text HH:mm, nullable
ampm         text am|pm, nullable
count        integer, default 1
urge_level   integer 1-10, nullable
reason       text, nullable
notes        text, nullable
created_at   text, not null
updated_at   text, not null
```

User Settings

```
user_id           PK, FK → users, cascade delete
theme             text, default 'dark'
language          text, default 'ar'
default_urge_level  integer, nullable
updated_at        text, not null
```

### CORS Middleware

Allow requests from

- `http://localhost:4200` (Angular dev server)
- Cloudflare Pages production URL

### Health Endpoint

`GET /api/health` — returns `{ status: "ok" }`, no auth required.

### Deliverables

```
backend/ project scaffolded
D1 database created
Tables created via Drizzle migration
Local dev server running on :8787
GET /api/health works
```

---

# Phase 2 — Auth Endpoints

## Goal

Allow users to register and log in with a username and password. Issue JWT tokens.

## Specifications

### Password Security

- Algorithm: PBKDF2-SHA256, 210,000 iterations
- Uses the Web Crypto API (built into Cloudflare Workers runtime)
- Salt: 32-byte random per user
- Storage format: `iterations:hexSalt:hexHash`

### Tokens

- Access token: 24-hour expiry
- Refresh token: 30-day expiry, stored in D1 `refresh_tokens` table
- JWT secret: stored as a Cloudflare encrypted secret, never in code

### Endpoints

Register

```
POST /api/auth/register
Body: { username, password }
Response: { accessToken, refreshToken, user: { id, username } }
```

Login

```
POST /api/auth/login
Body: { username, password }
Response: { accessToken, refreshToken, user }
```

Refresh

```
POST /api/auth/refresh
Body: { refreshToken }
Response: { accessToken }
```

Logout

```
POST /api/auth/logout
Header: Authorization: Bearer <token>
Response: 200
Deletes the refresh token from D1
```

### Validation Rules

- Username: 3–30 characters, no spaces
- Password: minimum 8 characters
- All error messages in Arabic

### Auth Middleware

A reusable middleware that verifies the JWT on every protected route and extracts the `userId` into the request context.

### Deliverables

```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
JWT middleware
PBKDF2 crypto utilities
```

---

# Phase 3 — Records CRUD Endpoints

## Goal

Allow authenticated users to create, read, update, and delete their relapse records via the API. Data is strictly isolated per user.

## Specifications

### Data Isolation

Every query adds a `WHERE user_id = <token userId>` filter. A user can never access another user's records.

### Endpoints

List Records

```
GET /api/records?from=YYYY-MM-DD&to=YYYY-MM-DD
Header: Authorization: Bearer <token>
Response: RelapseRecord[]
Sorted by date descending
from/to are optional date filters
```

Get One Record

```
GET /api/records/:id
Header: Authorization: Bearer <token>
Response: RelapseRecord
Returns 404 if not found, 403 if belongs to another user
```

Create Record

```
POST /api/records
Header: Authorization: Bearer <token>
Body: { date, time?, ampm?, count?, urgeLevel?, reason?, notes? }
Response: RelapseRecord (created)
```

Update Record

```
PUT /api/records/:id
Header: Authorization: Bearer <token>
Body: full record fields
Response: RelapseRecord (updated)
```

Delete Record

```
DELETE /api/records/:id
Header: Authorization: Bearer <token>
Response: 204 No Content
```

### Validation

- `date` required, must be valid YYYY-MM-DD
- `count` must be >= 1
- `urgeLevel` must be 1–10 if provided
- Arabic error messages

### Deliverables

```
GET  /api/records
POST /api/records
GET  /api/records/:id
PUT  /api/records/:id
DELETE /api/records/:id
```

---

# Phase 4 — Analytics Endpoints

## Goal

Expose server-side computed analytics so the frontend doesn't need to load all records to draw charts.

## Specifications

All endpoints

- Require `Authorization: Bearer <token>`
- Accept `?from=YYYY-MM-DD&to=YYYY-MM-DD` query params
- Filter data by the authenticated user

### Summary Statistics

```
GET /api/analytics/summary?from=&to=
```

Returns

```
total          total relapse count
recordCount    number of records
dailyAverage   total / days in range
median
min
max
stdDev
```

### Time Series

```
GET /api/analytics/time-series?from=&to=&granularity=daily|weekly|monthly
```

Returns an array of periods, each with

```
date
label         Arabic date label
count         total relapses in period
startDate
endDate
isPartial     true if period is clipped by the date range
```

Days/weeks/months with zero relapses are included (zero-filled).

### Trend

```
GET /api/analytics/trend?from=&to=
```

Returns

```
direction         increasing | decreasing | stable | insufficient-data
growthRatePercent
averageValue
comparisonStartValue
comparisonEndValue
confidence        high | medium | low | insufficient
```

### Weekday Pattern

```
GET /api/analytics/patterns/weekday?from=&to=
```

Returns 7 entries (Sunday–Saturday), each with

```
weekday       0–6
labelAr       Arabic weekday name
count
percentage    0–100
```

### Hour Pattern

```
GET /api/analytics/patterns/hour?from=&to=
```

Returns 24 entries (0–23), each with

```
hour
label         e.g. "3 ص" / "2 م"
count
```

Plus `skipped` — count of relapses with no time recorded.

### Heatmap

```
GET /api/analytics/patterns/heatmap?from=&to=
```

Returns one entry per day in the range

```
date
count
intensity     0–1 normalized (0 = no activity, 1 = max day)
```

### Triggers

```
GET /api/analytics/triggers?from=&to=&limit=50
```

Extracts keywords from `reason` and `notes` fields. Returns array of

```
keyword
count
avgUrge       weighted average urge level, or null
```

Sorted by count descending.

### Urge Summary

```
GET /api/analytics/urge/summary?from=&to=
```

Returns

```
average
median
min
max
timeSeries    daily average urge entries
```

### Urge by Hour

```
GET /api/analytics/urge/by-hour?from=&to=
```

Returns 24 entries with `hour`, `label`, `avgUrge` (null if no data).

### Urge by Weekday

```
GET /api/analytics/urge/by-weekday?from=&to=
```

Returns 7 entries with `weekday`, `labelAr`, `avgUrge`.

### Urge Correlation

```
GET /api/analytics/urge/correlation?from=&to=
```

Returns Pearson correlation between weekly avg urge and weekly relapse count

```
direction           positive | negative | neutral | insufficient-data
pearsonR            -1 to 1, or null
explanationAr       Arabic explanation string
weeklyBucketsCount  number of weeks used in calculation
```

Requires at least 10 weeks of data with urge values.

### Distribution

```
GET /api/analytics/distribution?from=&to=&field=urgeLevel|count
```

Returns bucket array, each with

```
label
min
max
count
percentage
```

### Deliverables

```
GET /api/analytics/summary
GET /api/analytics/time-series
GET /api/analytics/trend
GET /api/analytics/patterns/weekday
GET /api/analytics/patterns/hour
GET /api/analytics/patterns/heatmap
GET /api/analytics/triggers
GET /api/analytics/urge/summary
GET /api/analytics/urge/by-hour
GET /api/analytics/urge/by-weekday
GET /api/analytics/urge/correlation
GET /api/analytics/distribution
```

---

# Phase 5 — Settings Endpoint

## Goal

Store user settings (theme, language, default urge level) in the backend so they persist across devices.

## Specifications

### Endpoints

Get Settings

```
GET /api/settings
Header: Authorization: Bearer <token>
Response: { theme, language, defaultUrgeLevel, updatedAt }
Returns defaults if no settings row exists yet
```

Update Settings

```
PUT /api/settings
Header: Authorization: Bearer <token>
Body: { theme?, language?, defaultUrgeLevel? }
Response: updated settings object
```

### Defaults

```
theme             dark
language          ar
defaultUrgeLevel  null
```

### Deliverables

```
GET /api/settings
PUT /api/settings
```

---

# Phase 6 — Angular Auth Layer

## Goal

Add login and register pages to the Angular app. Protect all existing routes with an auth guard. Automatically attach JWT to every API request.

## Specifications

### Environment Config

Add `apiBaseUrl` to Angular environments

```
development:  http://localhost:8787
production:   https://habit-tracker-api.<account>.workers.dev
```

### Auth Service

Handles register, login, logout, and token refresh.

- Exposes `currentUser` as an Angular Signal
- Stores access token and refresh token in `localStorage`
- Provides `isAuthenticated()` method

### HTTP Interceptor

Automatically attaches `Authorization: Bearer <token>` to every outgoing request.

On 401 response

- Calls refresh endpoint to get a new access token
- Retries the original request once
- If refresh also fails, logs the user out and redirects to `/login`

### Route Guard

Redirects unauthenticated users to `/login`.

Applied to all existing routes (dashboard, analytics, relapses, settings).

### Login Page

- Arabic UI, dark theme, RTL layout
- Fields: username, password
- Submit → login → redirect to dashboard
- Link to register page
- Shows Arabic error on failed login

### Register Page

- Same design as login page
- Fields: username, password, confirm password
- Submit → register → redirect to dashboard
- Link to login page
- Shows Arabic error on failed register or taken username

### Deliverables

```
AuthService
AuthInterceptor
AuthGuard
LoginComponent
RegisterComponent
/login route
/register route
All other routes protected
```

---

# Phase 7 — Angular Data Layer Migration

## Goal

Replace LocalStorage calls in the repository services with API calls. All existing analytics components and dashboard views remain unchanged.

## Specifications

### Constraint

The public API of `RelapseRecordRepository` must not change.

Components call the same methods and read the same signals as before — they have no idea the data now comes from an API.

```
records           Signal<RelapseRecord[]>       unchanged
hasError          Signal<boolean>               unchanged
getAll()          RelapseRecord[]               unchanged
getById(id)       RelapseRecord | null          unchanged
create(draft)     ValidationResult<RelapseRecord>  unchanged
update(id, patch) ValidationResult<RelapseRecord>  unchanged
delete(id)        boolean                       unchanged
```

### API Client

A typed wrapper around Angular's `HttpClient`.

- Sets base URL from environment
- Normalizes API errors into `ValidationResult` shape with Arabic messages
- Retries 2× with exponential backoff on network errors (not on 4xx/5xx)

### Records API Service

Typed HTTP service for calling the records endpoints.

```
getAll(from?, to?)    Observable<RelapseRecord[]>
getById(id)           Observable<RelapseRecord>
create(draft)         Observable<RelapseRecord>
update(id, patch)     Observable<RelapseRecord>
delete(id)            Observable<void>
```

### Analytics API Service

Typed HTTP service for calling all analytics endpoints.

```
getSummary(from, to)
getTimeSeries(from, to, granularity)
getTrend(from, to)
getWeekdayPattern(from, to)
getHourPattern(from, to)
getHeatmap(from, to)
getTriggers(from, to, limit?)
getUrgeSummary(from, to)
getUrgeByHour(from, to)
getUrgeByWeekday(from, to)
getUrgeCorrelation(from, to)
getDistribution(from, to, field)
```

### Offline Queue

When a write operation (create, update, delete) fails because the device is offline

- The operation is saved to IndexedDB
- The UI updates optimistically (record appears immediately)
- When the device comes back online, the queue is flushed to the API automatically
- Conflict resolution: last-write-wins by `updatedAt` timestamp
- Queue is also checked every 30 seconds as a fallback

### RelapseRecordRepository Migration

- Remove: LocalStorage reads and writes
- Add: loads all records from `GET /api/records` on initialization
- `create()` calls `POST /api/records`, updates signal optimistically, enqueues if offline
- `update()` calls `PUT /api/records/:id`, updates signal optimistically, enqueues if offline
- `delete()` calls `DELETE /api/records/:id`, updates signal optimistically, enqueues if offline

### SettingsRepository Migration

- Remove: LocalStorage reads and writes for settings
- Add: loads settings from `GET /api/settings` on initialization
- `update()` calls `PUT /api/settings`, falls back to local value if offline

### Deliverables

```
ApiClientService
RelapseRecordApiService
AnalyticsApiService
OfflineQueueService
RelapseRecordRepository (migrated, same public API)
SettingsRepository (migrated)
```

---

# Phase 8 — Deployment

## Goal

Deploy the backend to Cloudflare Workers and the frontend to Cloudflare Pages. Smoke test the full production flow.

## Specifications

### Backend Deployment

- Set `JWT_SECRET` as an encrypted Cloudflare secret
- Create production D1 database
- Apply database migrations to production
- Deploy Worker to Cloudflare

### Frontend Deployment

- Update `environment.prod.ts` with the production Workers URL
- Update CORS config in the Worker to allow the Pages domain
- Build Angular app
- Deploy to Cloudflare Pages

### Smoke Tests

After deployment verify

- `GET /api/health` returns 200
- Register a new user
- Login → JWT stored
- Create a record → appears in list
- Edit record → persists after page reload
- Delete record → gone after reload
- All analytics tabs render charts
- Offline: create record → comes back online → record synced to D1

### Deliverables

```
Backend live on Cloudflare Workers
Frontend live on Cloudflare Pages
All smoke tests passing
```
