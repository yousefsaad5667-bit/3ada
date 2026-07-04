# Quickstart: Local Data Layer

**Feature**: `002-local-data-layer`
**Date**: 2026-07-04

## What This Phase Delivers

A pure data-services layer — no UI, no routes. After this phase, all future features can persist, retrieve, validate, export, and import relapse data through clean Angular injectable repositories.

## Prerequisites

- Phase 1 (Project Foundation) must be complete and `ng serve` must run without errors.
- Node.js 20+ and npm installed.

## Setup

No new npm packages are required. This phase uses only:
- Native browser `localStorage` API
- Native browser `crypto.randomUUID()` API
- Angular `@Injectable`, Signals, and `APP_INITIALIZER`

## Files Created / Modified

### New Models
```
src/app/core/models/relapse-record.model.ts
src/app/core/models/settings.model.ts
src/app/core/models/dashboard-preferences.model.ts
src/app/core/models/export-bundle.model.ts
src/app/core/models/storage-version.model.ts
src/app/core/models/validation-result.model.ts
src/app/core/models/import-strategy.model.ts
```

### New Constants
```
src/app/core/constants/storage-version.constants.ts
```

### Modified Constants
```
src/app/core/constants/storage.constants.ts  (add RELAPSE_RECORDS, SETTINGS, DASHBOARD_PREFS, SCHEMA_VERSION keys)
```

### New Services / Repositories
```
src/app/core/services/relapse-record.repository.ts
src/app/core/services/settings.repository.ts
src/app/core/services/dashboard-preferences.repository.ts
src/app/core/services/migration.service.ts
src/app/core/services/import-export.service.ts
```

### Modified Services
```
src/app/core/services/storage.service.ts  (add clearAll() method)
```

### New Validators
```
src/app/core/validators/relapse-record.validator.ts
src/app/core/validators/settings.validator.ts
src/app/core/validators/export-bundle.validator.ts
```

### Modified App Config
```
src/app/app.config.ts  (register MigrationService via APP_INITIALIZER)
```

## Verifying the Implementation

### 1. Build Check
```bash
npx ng build
```
Must complete with zero errors.

### 2. Lint Check
```bash
npx ng lint
```
Must report zero errors.

### 3. Serve & Smoke Test
```bash
npm start
```

Open the browser console and verify:
```javascript
// Should log the stored schema version (1 after first load)
JSON.parse(localStorage.getItem('habit-tracker-schema-version'))
// Expected: 1

// Verify no unexpected errors in the console
```

### 4. Manual Persistence Test
Using the browser console after `npm start`:

```javascript
// These can be called once repository integration is done
// For now, verify the storage keys are created on first load:
Object.keys(localStorage).filter(k => k.startsWith('habit-tracker-'))
// Expected: ["habit-tracker-theme", "habit-tracker-schema-version", ...]
```

### 5. Validation Test
Validators can be tested in isolation (pure functions — no Angular TestBed needed):
```typescript
import { validateRelapseRecord } from './validators/relapse-record.validator';

const result = validateRelapseRecord({ date: '', count: 1 });
// result.valid === false
// result.errors[0].messageAr === 'حقل التاريخ مطلوب.'
```

## Storage Key Reference

| Key | Contents |
|---|---|
| `habit-tracker-theme` | `"dark"` or `"light"` (from Phase 1) |
| `habit-tracker-schema-version` | `1` (integer) |
| `habit-tracker-relapse-records` | `[]` (empty array on first load) |
| `habit-tracker-settings` | `{"theme":"dark","language":"ar","defaultUrgeLevel":null}` |
| `habit-tracker-dashboard-prefs` | `{"cardOrder":[],"hiddenCards":[]}` |

## Troubleshooting

**Schema version not updated on first load**
→ Check that `MigrationService.runMigrations()` is registered in `APP_INITIALIZER` in `app.config.ts`.

**`crypto.randomUUID is not a function`**
→ This API requires HTTPS or `localhost`. Ensure you are running via `ng serve` (localhost), not opening the `index.html` file directly.

**`localStorage` quota error in console**
→ This is expected behavior when storage is full. The `StorageService.set()` returns `false` and the repository surfaces an Arabic error message — no exception should propagate to the console.
