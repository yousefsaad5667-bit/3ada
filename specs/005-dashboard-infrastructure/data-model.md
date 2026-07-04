# Data Model: Dashboard Infrastructure

**Feature**: `005-dashboard-infrastructure`
**Date**: 2026-07-04

---

## Entities

### 1. `DatePreset` *(enum — already exists in `core/analytics`)*

The canonical date preset type lives in `src/app/core/analytics/models/analytics.types.ts`.
No new type is needed; `DashboardFilterService` imports and reuses it.

```
LAST_7_DAYS   → default on load
LAST_30_DAYS
LAST_90_DAYS
LAST_YEAR
CUSTOM
```

---

### 2. `DateRangeFilter`

The active date range applied to all dashboard cards.

| Field       | Type        | Required | Notes                                              |
|-------------|-------------|----------|----------------------------------------------------|
| `preset`    | `DatePreset`| ✅       | Determines which predefined range to apply          |
| `startDate` | `Date`      | ✅       | Inclusive lower bound (derived from preset or user) |
| `endDate`   | `Date`      | ✅       | Inclusive upper bound (derived from preset or user) |

**Validation rules**:
- `startDate` MUST be ≤ `endDate`
- When preset is not `CUSTOM`, `startDate`/`endDate` are computed by `getDateRangeBounds(preset)` and are read-only from the user's perspective
- When preset is `CUSTOM`, both fields are required and user-provided

**State transitions**:
```
Initial → LAST_7_DAYS (on service construction)
LAST_7_DAYS / LAST_30_DAYS / LAST_90_DAYS / LAST_YEAR → CUSTOM (user selects custom)
CUSTOM → any preset (user selects a preset)
```

---

### 3. `DashboardCardDescriptor`

A descriptor object that registers a card with the dashboard shell. Defined by each card feature module.

| Field          | Type                    | Required | Notes                                              |
|----------------|-------------------------|----------|----------------------------------------------------|
| `id`           | `string`                | ✅       | Stable unique identifier (e.g., `'time-series'`)   |
| `titleAr`      | `string`                | ✅       | Arabic display title shown in card header and placeholder tile |
| `component`    | `Type<unknown>`         | ✅       | Angular component class to render via `NgComponentOutlet` |
| `defaultOrder` | `number`                | ✅       | 0-indexed position in the default layout            |

**Lifecycle**:
- Descriptors are static; defined at app initialization time
- The shell reads `DashboardPreferences.cardOrder` to override `defaultOrder`
- If a stored `cardOrder` entry references an `id` that no longer exists in the registry, it is silently discarded (stale reference cleanup)

---

### 4. `DashboardCard` *(runtime view model)*

The computed state of a card as seen by the shell during rendering. Derived from `DashboardCardDescriptor` + `DashboardPreferences`.

| Field      | Type                              | Notes                                         |
|------------|-----------------------------------|-----------------------------------------------|
| `id`       | `string`                          | From descriptor                               |
| `titleAr`  | `string`                          | From descriptor                               |
| `component`| `Type<unknown>`                   | From descriptor                               |
| `order`    | `number`                          | Resolved from user preferences or defaultOrder|
| `visible`  | `boolean`                         | `true` unless id is in `hiddenCards`          |

---

### 5. `DashboardPreferences` *(already exists in `core/models`)*

Existing model — no changes required. Reproduced here for completeness:

| Field        | Type       | Notes                                   |
|--------------|------------|-----------------------------------------|
| `cardOrder`  | `string[]` | Ordered array of card `id` values       |
| `hiddenCards`| `string[]` | Array of card `id` values that are hidden |

**Corruption recovery**: If `DashboardPreferencesRepository._reload()` throws, it silently falls back to `DEFAULT_DASHBOARD_PREFERENCES` (already implemented — Q3 confirmed this behavior).

---

## Relationships

```
DashboardCardDescriptor[] (registry)
        ↓ merged with
DashboardPreferences (LocalStorage)
        ↓ produces
DashboardCard[] (sorted, visible/hidden resolved)
        ↓ rendered by
DashboardComponent → [DashboardCardShellComponent × N]
                              ↓ reads
                     DashboardFilterService.activeFilter (Signal)
```

---

## Derived Computations

- **Resolved order**: For each descriptor, check if its `id` appears in `cardOrder`. If yes, use the array index as order; if not, append after all ordered cards using `defaultOrder` as tiebreaker.
- **Visibility**: A card is visible iff its `id` is NOT in `hiddenCards`.
- **Stale reference cleanup**: Any `id` in `cardOrder` or `hiddenCards` that does not match a registered descriptor is silently removed before applying preferences.

---

## New Files Required

| File | Purpose |
|------|---------|
| `src/app/features/dashboard/models/dashboard-card-descriptor.model.ts` | `DashboardCardDescriptor` interface |
| `src/app/features/dashboard/models/dashboard-card.model.ts` | `DashboardCard` runtime view model |
| `src/app/features/dashboard/services/dashboard-filter.service.ts` | Signal-based active date range state |
| `src/app/features/dashboard/services/dashboard-layout.service.ts` | Merges descriptors + preferences into `DashboardCard[]` |
