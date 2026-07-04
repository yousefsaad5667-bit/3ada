# Data Model: Project Foundation

**Date**: 2026-07-03
**Feature**: [spec.md](spec.md) | [plan.md](plan.md)

## Overview

The Project Foundation phase defines three configuration-level entities. These are not
persisted data models but rather application-level types that govern theming, routing,
and environment configuration. No user data entities are introduced in this phase.

---

## Entities

### AppTheme

Represents the active color scheme of the application.

**Type**: String union (not a full interface)

```typescript
type AppTheme = 'dark' | 'light';
```

**Storage**: Persisted in LocalStorage under key `habit-tracker-theme`.
**Default**: `'dark'` (on first load when no stored preference exists).

**State transitions**:
```
[First Load] ──> dark (default)
                  │
    toggle ──────>│<────── toggle
                  │
                light
```

**Validation rules**:
- Value MUST be exactly `'dark'` or `'light'`; any other stored value falls back to `'dark'`

---

### AppRoute

Represents a single navigation entry in the sidebar/header.

```typescript
interface AppRoute {
  /** URL path segment (e.g., '/analytics/time-series') */
  path: string;

  /** Arabic display label (e.g., 'تحليل السلاسل الزمنية') */
  label: string;

  /** Icon identifier — reference to icon name or SVG asset */
  icon: string;

  /** Whether this route is currently active (derived from Router state) */
  isActive: boolean;

  /** Optional: lazy-loaded component import function */
  loadComponent?: () => Promise<any>;

  /** Child routes (for grouped routes like /analytics/*) */
  children?: AppRoute[];
}
```

**Uniqueness**: `path` is unique across all registered routes.

**Registered routes** (10 total):

| Path | Arabic Label | Parent Group |
|---|---|---|
| `/` | لوحة التحكم | — |
| `/relapses` | إدارة الانتكاسات | — |
| `/analytics/time-series` | تحليل السلاسل الزمنية | analytics |
| `/analytics/calendar` | تحليل التقويم | analytics |
| `/analytics/patterns` | أنماط الوقت | analytics |
| `/analytics/triggers` | تحليل المحفزات | analytics |
| `/analytics/urge` | تحليل الرغبة | analytics |
| `/charts` | مكتبة الرسوم البيانية | — |
| `/settings` | الإعدادات | — |
| `**` | صفحة غير موجودة | — (404) |

**Validation rules**:
- `path` MUST start with `/` or be `**`
- `label` MUST be non-empty Arabic text
- `icon` MUST be a valid icon reference string

---

### AppEnvironment

Configuration object for environment-specific values.

```typescript
interface AppEnvironment {
  /** Whether this is a production build */
  production: boolean;

  /** Application version string (semver) */
  version: string;

  /** Prefix for all LocalStorage keys to avoid collisions */
  storageKeyPrefix: string;

  /** Application display name (Arabic) */
  appName: string;
}
```

**Instances**:

| Environment | production | version | storageKeyPrefix | appName |
|---|---|---|---|---|
| Development | `false` | `'0.1.0'` | `'habit-tracker-'` | `'متتبع العادات'` |
| Production | `true` | `'0.1.0'` | `'habit-tracker-'` | `'متتبع العادات'` |

**Validation rules**:
- `version` MUST follow semver format (MAJOR.MINOR.PATCH)
- `storageKeyPrefix` MUST end with `-` for key readability
- `appName` MUST be non-empty Arabic string

---

### StorageStatus (internal)

Represents LocalStorage availability state (not persisted).

```typescript
interface StorageStatus {
  /** Whether LocalStorage is available and writable */
  available: boolean;

  /** Human-readable Arabic message if unavailable */
  warningMessage: string | null;
}
```

**State transitions**:
```
[Bootstrap] ──> check LocalStorage
                  │
        ┌─────────┴──────────┐
    available            unavailable
        │                     │
   status.available=true   status.available=false
   warningMessage=null     warningMessage='التخزين المحلي...'
```

---

## Relationships

```
AppEnvironment ──[provides storageKeyPrefix]──> StorageService
StorageService ──[persists]──> AppTheme (LocalStorage)
StorageService ──[checks availability]──> StorageStatus
AppRoute[] ──[consumed by]──> Router + Sidebar component
AppTheme ──[drives]──> HTML data-theme attribute
```

---

## Notes

- No user-facing data models (RelapseRecord, etc.) are introduced in this phase.
  Those belong to Phase 2 (Local Data Layer) and Phase 3 (Relapse Management).
- All entities here are application configuration; they do not grow with user data volume.
