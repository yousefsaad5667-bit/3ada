# Tasks: Local Data Layer

**Input**: Design documents from `specs/002-local-data-layer/`

**Prerequisites**: [plan.md](plan.md) | [spec.md](spec.md) | [research.md](research.md) | [data-model.md](data-model.md) | [contracts/service-contracts.md](contracts/service-contracts.md)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to ([US1], [US2], [US3])
- Exact file paths included in every description

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Extend constants and update the existing `StorageService` — the foundation all repositories depend on.

- [x] T001 Extend `src/app/core/constants/storage.constants.ts` — add four new keys to the existing `STORAGE_KEYS` object: `RELAPSE_RECORDS: 'relapse-records'`, `SETTINGS: 'settings'`, `DASHBOARD_PREFS: 'dashboard-prefs'`, `SCHEMA_VERSION: 'schema-version'`
- [x] T002 Create `src/app/core/constants/storage-version.constants.ts` — export `const CURRENT_SCHEMA_VERSION = 1`
- [x] T003 Extend `src/app/core/services/storage.service.ts` — add `clearAll(): void` method that removes every `localStorage` key starting with `environment.storageKeyPrefix` by iterating `Object.keys(localStorage)` inside a try/catch; update the `isAvailable` signal detection to remain accurate after `clearAll()`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Define all TypeScript models and pure validator functions that repositories depend on. No Angular injection in this phase — pure types and functions only.

**⚠️ CRITICAL**: No repository or service work can begin until this phase is complete.

- [x] T004 [P] Create `src/app/core/models/relapse-record.model.ts` — export `interface RelapseRecord` with fields: `id: string`, `date: string`, `time: string | null`, `ampm: 'am' | 'pm' | null`, `count: number`, `urgeLevel: number | null`, `reason: string | null`, `notes: string | null`, `createdAt: string`, `updatedAt: string`
- [x] T005 [P] Create `src/app/core/models/settings.model.ts` — export `interface Settings` with fields: `theme: 'dark' | 'light'`, `language: 'ar'`, `defaultUrgeLevel: number | null`; also export `const DEFAULT_SETTINGS: Settings = { theme: 'dark', language: 'ar', defaultUrgeLevel: null }`
- [x] T006 [P] Create `src/app/core/models/dashboard-preferences.model.ts` — export `interface DashboardPreferences` with fields: `cardOrder: string[]`, `hiddenCards: string[]`; also export `const DEFAULT_DASHBOARD_PREFERENCES: DashboardPreferences = { cardOrder: [], hiddenCards: [] }`
- [x] T007 [P] Create `src/app/core/models/validation-result.model.ts` — export `interface ValidationError { field: string; messageAr: string; }` and `interface ValidationResult<T> { valid: boolean; value: T | null; errors: ValidationError[]; }`
- [x] T008 [P] Create `src/app/core/models/import-strategy.model.ts` — export `type ImportStrategy = 'replace' | 'merge'`
- [x] T009 [P] Create `src/app/core/models/export-bundle.model.ts` — export `interface ExportBundle { schemaVersion: number; exportedAt: string; relapseRecords: RelapseRecord[]; settings: Settings; dashboardPreferences: DashboardPreferences; }` (import from the models above)
- [x] T010 [P] Create `src/app/core/models/storage-version.model.ts` — export `interface StorageVersion { version: number; }`
- [x] T011 [P] Create `src/app/core/models/import-summary.model.ts` — export `interface ImportSummary { recordsImported: number; recordsSkipped: number; strategy: ImportStrategy; }`
- [x] T012 [P] Create `src/app/core/validators/relapse-record.validator.ts` — export pure function `validateRelapseRecord(draft: Omit<RelapseRecord, 'id' | 'createdAt' | 'updatedAt'>): ValidationResult<Omit<RelapseRecord, 'id' | 'createdAt' | 'updatedAt'>>` implementing all 9 validation rules from `data-model.md` with exact Arabic `messageAr` strings: missing/empty `date` → `'حقل التاريخ مطلوب.'`; invalid date → `'التاريخ غير صالح.'`; missing `count` → `'حقل العدد مطلوب.'`; non-positive-integer `count` → `'العدد يجب أن يكون رقماً صحيحاً موجباً.'`; `urgeLevel` out of [1,10] → `'مستوى الرغبة يجب أن يكون بين 1 و10.'`; non-integer `urgeLevel` → `'مستوى الرغبة يجب أن يكون رقماً صحيحاً.'`; invalid `time` format → `'صيغة الوقت غير صالحة.'`; `reason` > 500 chars → `'السبب يجب ألا يتجاوز 500 حرف.'`; `notes` > 1000 chars → `'الملاحظات يجب ألا تتجاوز 1000 حرف.'`
- [x] T013 [P] Create `src/app/core/validators/settings.validator.ts` — export pure function `validateSettings(draft: Partial<Settings>): ValidationResult<Settings>` implementing 3 rules: invalid `theme` → `'قيمة السمة غير صالحة.'`; invalid `language` → `'قيمة اللغة غير صالحة.'`; `defaultUrgeLevel` out of [1,10] → `'مستوى الرغبة الافتراضي يجب أن يكون بين 1 و10.'`; when valid, merges the partial draft with `DEFAULT_SETTINGS` and returns the complete Settings
- [x] T014 [P] Create `src/app/core/validators/export-bundle.validator.ts` — export pure function `validateExportBundle(parsed: unknown): ValidationResult<ExportBundle>` implementing 6 rules from `data-model.md` validation table with exact Arabic messages; ensure it type-narrows correctly from `unknown` using field presence checks (no `any`)

**Checkpoint**: All models and validators are defined — repositories and services can now begin in parallel.

---

## Phase 3: User Story 1 — Record Persistence (Priority: P1) 🎯 MVP

**Goal**: Full CRUD for `RelapseRecord`, `Settings`, and `DashboardPreferences` stored durably in `localStorage`. Changes survive a browser refresh.

**Independent Test**: Open the app in the browser → open DevTools console → call repository methods directly → refresh → confirm data is still present in `localStorage`.

### Implementation for User Story 1

- [x] T015 [P] [US1] Create `src/app/core/services/relapse-record.repository.ts` — `@Injectable({ providedIn: 'root' })` class; inject `StorageService`; on construction load records with `this.storage.get<RelapseRecord[]>(STORAGE_KEYS.RELAPSE_RECORDS) ?? []` and populate a private `_records = signal<RelapseRecord[]>(...)` ; expose `readonly records: Signal<RelapseRecord[]>` (read-only); implement: `getAll(): RelapseRecord[]` (sorted by `date` desc, then `time` desc), `getById(id: string): RelapseRecord | null`, `create(draft)` (calls `validateRelapseRecord`, generates id via `crypto.randomUUID()`, sets `createdAt`/`updatedAt` to `new Date().toISOString()`, persists, updates signal, returns `ValidationResult<RelapseRecord>`), `update(id, patch)` (merges, re-validates full record, sets `updatedAt`, persists, returns `ValidationResult<RelapseRecord>`), `delete(id: string): boolean` (removes record, persists, updates signal)
- [x] T016 [P] [US1] Create `src/app/core/services/settings.repository.ts` — `@Injectable({ providedIn: 'root' })` class; inject `StorageService`; on construction load with `this.storage.get<Settings>(STORAGE_KEYS.SETTINGS) ?? DEFAULT_SETTINGS` and populate `_settings = signal<Settings>(...)`; expose `readonly settings: Signal<Settings>`; implement `get(): Settings` and `update(patch: Partial<Settings>): ValidationResult<Settings>` (calls `validateSettings`, merges with current settings, persists, updates signal)
- [x] T017 [P] [US1] Create `src/app/core/services/dashboard-preferences.repository.ts` — `@Injectable({ providedIn: 'root' })` class; inject `StorageService`; on construction load with `this.storage.get<DashboardPreferences>(STORAGE_KEYS.DASHBOARD_PREFS) ?? DEFAULT_DASHBOARD_PREFERENCES` and populate `_preferences = signal<DashboardPreferences>(...)`; expose `readonly preferences: Signal<DashboardPreferences>`; implement `get(): DashboardPreferences` and `update(patch: Partial<DashboardPreferences>): ValidationResult<DashboardPreferences>` (validates, merges, persists, updates signal)
- [x] T018 [US1] Create `src/app/core/services/migration.service.ts` — `@Injectable({ providedIn: 'root' })` class; inject `StorageService`; define `private readonly MIGRATIONS: Array<(() => void) | null> = [null, this.migrateToV1.bind(this)]` where index = target version; implement `runMigrations(): void` — reads stored version via `this.storage.get<number>(STORAGE_KEYS.SCHEMA_VERSION) ?? 0`, loops from `storedVersion + 1` to `CURRENT_SCHEMA_VERSION` (inclusive) calling each migration function, then calls `this.storage.set(STORAGE_KEYS.SCHEMA_VERSION, CURRENT_SCHEMA_VERSION)`; implement `getStoredVersion(): number`; implement `private migrateToV1(): void` — a no-op for new installs (existing installs have no schema-0 data, so nothing to transform); wrap entire `runMigrations()` body in try/catch and log any error without rethrowing (FR-010)
- [x] T019 [US1] Update `src/app/app.config.ts` — import `APP_INITIALIZER` from `@angular/core` and `MigrationService`; add a provider: `{ provide: APP_INITIALIZER, useFactory: (m: MigrationService) => () => m.runMigrations(), deps: [MigrationService], multi: true }` so migrations run before any component initializes
- [x] T020 [US1] Verify persistence end-to-end — run `npm start`, open browser DevTools console, manually invoke: `localStorage.setItem('habit-tracker-schema-version', '1')`, confirm the migration service does not overwrite existing version; then clear `localStorage` and confirm the app loads cleanly with schema version `1` written on first load, and that `habit-tracker-relapse-records` defaults to `[]`, `habit-tracker-settings` to the default object, `habit-tracker-dashboard-prefs` to the default object

**Checkpoint**: Full CRUD for all three domain entities works and persists across browser restarts. Schema version is written on first load.

---

## Phase 4: User Story 2 — Data Validation & Integrity (Priority: P2)

**Goal**: All invalid input is rejected before reaching storage; corrupted storage data triggers graceful recovery; schema migrations run automatically on load.

**Independent Test**: In the browser console, attempt to create a `RelapseRecord` with a missing `date` field → confirm it returns `valid: false` and `errors[0].messageAr` is the Arabic string. Then manually corrupt `habit-tracker-relapse-records` in localStorage to `"not-valid-json"` and reload the app — confirm zero console errors and the records list defaults to `[]`.

### Implementation for User Story 2

- [x] T021 [US2] Harden `src/app/core/services/relapse-record.repository.ts` — wrap the initial `storage.get()` call in a try/catch that catches JSON parse errors and any other exceptions; on catch: log the error and set `_records` to `[]` (graceful recovery, FR-010); add the same guard to `storage.set()` calls, checking the `boolean` return value and exposing any write failure as an error on the returned `ValidationResult` using the Arabic message `'فشل الحفظ: مساحة التخزين ممتلئة.'` when `isAvailable()` returns `false` or the `set()` returns `false` (quota guard, FR-016)
- [x] T022 [US2] Harden `src/app/core/services/settings.repository.ts` — same corrupted-data recovery pattern as T021: wrap initial `storage.get()` in try/catch, fall back to `DEFAULT_SETTINGS`; add quota-error propagation to `update()` (FR-016)
- [x] T023 [US2] Harden `src/app/core/services/dashboard-preferences.repository.ts` — same corrupted-data recovery pattern: wrap initial `storage.get()` in try/catch, fall back to `DEFAULT_DASHBOARD_PREFERENCES`; add quota-error propagation to `update()` (FR-016)
- [x] T024 [US2] Verify validation rejection — open browser console and call `relapseRecordRepository.create({ date: '', count: 1 })` → confirm `result.valid === false` and `result.errors[0].messageAr === 'حقل التاريخ مطلوب.'`; call with `urgeLevel: 11` → confirm Arabic urge error; verify no invalid record appears in `localStorage` after failed attempts
- [x] T025 [US2] Verify corrupted-data recovery — in DevTools set `localStorage['habit-tracker-relapse-records'] = 'BROKEN'` then reload; confirm the console logs a recovery message and the app shows 0 records with no thrown errors; confirm `habit-tracker-schema-version` still equals `1`

**Checkpoint**: US1 and US2 independently functional. All invalid data is rejected before storage. Corrupt data triggers silent recovery.

---

## Phase 5: User Story 3 — Import & Export (Priority: P3)

**Goal**: Users can export all data to a JSON file and restore from it using either replace or merge strategy; full data clear is available.

**Independent Test**: Export data to file → call `clearAll()` → import the file with `'replace'` strategy → confirm all records and settings are restored identically by reading from the repositories.

### Implementation for User Story 3

- [x] T026 [US3] Create `src/app/core/services/import-export.service.ts` — `@Injectable({ providedIn: 'root' })` class; inject `StorageService`, `RelapseRecordRepository`, `SettingsRepository`, `DashboardPreferencesRepository`; implement three methods:

  **`exportAll(): boolean`**
  - Collect `relapseRecordRepository.getAll()`, `settingsRepository.get()`, `dashboardPreferencesRepository.get()`
  - Build `ExportBundle` with `schemaVersion: CURRENT_SCHEMA_VERSION`, `exportedAt: new Date().toISOString()`
  - Serialize to JSON with `JSON.stringify(bundle, null, 2)`
  - Create `Blob` with `type: 'application/json'`
  - Trigger download via programmatic `<a>` element with `URL.createObjectURL(blob)` and `download` attribute set to `habit-tracker-backup-YYYY-MM-DD.json` (date from `new Date().toISOString().slice(0, 10)`)
  - Revoke object URL after click
  - Wrap in try/catch; return `true` on success, `false` on error

  **`importFromJson(jsonContent: string, strategy: ImportStrategy): ValidationResult<ImportSummary>`**
  - Parse `jsonContent` with `JSON.parse()` inside try/catch; return `{ valid: false, value: null, errors: [{ field: 'file', messageAr: 'ملف الاستيراد غير صالح أو تالف.' }] }` on parse failure
  - Call `validateExportBundle(parsed)` and return its errors if invalid
  - If `strategy === 'replace'`: call `clearAll()`, then write all records via `storage.set(STORAGE_KEYS.RELAPSE_RECORDS, bundle.relapseRecords)`, settings via `storage.set(STORAGE_KEYS.SETTINGS, bundle.settings)`, prefs via `storage.set(STORAGE_KEYS.DASHBOARD_PREFS, bundle.dashboardPreferences)`; refresh all repository signals by calling a package-private `_reload()` method on each repository
  - If `strategy === 'merge'`: for each record in `bundle.relapseRecords`, skip if `id` already exists in current records (existing wins); write the merged array; skip settings/prefs merge (replace-only for singleton entities); refresh signals
  - Return `{ valid: true, value: { recordsImported, recordsSkipped, strategy }, errors: [] }`

  **`clearAll(): boolean`**
  - Call `storage.clearAll()` which removes all `habit-tracker-*` keys
  - Reset repository signals: call `_reload()` on each repository (which reloads from storage, getting defaults)
  - Return `true`

- [x] T027 [US3] Add `_reload()` package-private method to `src/app/core/services/relapse-record.repository.ts` — reloads `_records` signal from `StorageService` (same logic as constructor initialization); this method is called by `ImportExportService` after replace/merge/clear operations to sync the reactive signal with the new storage state
- [x] T028 [US3] Add `_reload()` package-private method to `src/app/core/services/settings.repository.ts` — reloads `_settings` signal from `StorageService` with `DEFAULT_SETTINGS` fallback
- [x] T029 [US3] Add `_reload()` package-private method to `src/app/core/services/dashboard-preferences.repository.ts` — reloads `_preferences` signal from `StorageService` with `DEFAULT_DASHBOARD_PREFERENCES` fallback
- [x] T030 [US3] Verify export/import round-trip — in the browser console: (1) create 2–3 test records via `relapseRecordRepository.create(...)`, (2) call `importExportService.exportAll()` and confirm a JSON file downloads, (3) call `importExportService.clearAll()` and confirm `relapseRecordRepository.records()` returns `[]`, (4) read the downloaded file content as a string and call `importExportService.importFromJson(content, 'replace')`, (5) confirm `relapseRecordRepository.records()` returns the original records and the result value has `recordsImported > 0`
- [x] T031 [US3] Verify merge strategy — with existing records in storage, call `importFromJson` with a bundle that contains 1 overlapping ID and 1 new record; confirm `recordsSkipped === 1` and `recordsImported === 1` and the existing record was not overwritten
- [x] T032 [US3] Verify invalid import rejection — call `importFromJson('{ "broken": true }', 'replace')` and confirm `result.valid === false` with Arabic error message; confirm no data was changed in localStorage

**Checkpoint**: All three user stories complete. Export downloads a valid file. Import replaces or merges correctly. Clear resets to defaults.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Code quality, linting, formatting, and integration with the Angular app entry point.

- [x] T033 [P] Run `npx ng lint` — fix all ESLint violations in the new files; confirm zero errors reported
- [x] T034 [P] Run `npx prettier --write "src/**/*.ts"` — fix all formatting; confirm `--check` passes with zero violations
- [x] T035 [P] Run `npx ng build` — confirm zero TypeScript compilation errors and zero Angular build errors
- [x] T036 Verify `npm start` runs cleanly — open browser, confirm no console errors on load; confirm `localStorage` contains `habit-tracker-schema-version = 1` after the first load
- [x] T037 [P] Update `specs/002-local-data-layer/quickstart.md` if any file paths or setup steps changed during implementation
- [x] T038 Final smoke test — complete the full round-trip from quickstart.md: `npm start` → confirm schema version written → create record via console → refresh → confirm record persists → export → clear → import → confirm restore → trigger corrupted data → confirm graceful recovery

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately (T001–T003)
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all repositories (T004–T014)
- **User Story 1 (Phase 3)**: Depends on Phase 2 completion (T015–T020)
- **User Story 2 (Phase 4)**: Depends on Phase 3 completion — hardens repositories created in US1 (T021–T025)
- **User Story 3 (Phase 5)**: Depends on Phase 3 completion (repositories must exist); can overlap with US2 (T026–T032)
- **Polish (Phase 6)**: Depends on all user story phases (T033–T038)

### Within-Phase Parallel Opportunities

**Phase 2 (Foundational)** — all 11 tasks are fully parallel (different files):
- T004–T011: All model files — completely independent
- T012–T014: All validator files — independent of each other (but depend on T004–T011 models)

**Phase 3 (US1)** — three repository files are parallel:
- T015, T016, T017: Three different repository files — can run simultaneously
- T018 (MigrationService): Depends on StorageService only — can run with T015–T017
- T019 (app.config.ts): Must follow T018

**Phase 5 (US3)** — T027, T028, T029 are parallel (one method added per file):

```
Stream A (Models):    T004 → T005 → T006 → T007 → T008 → T009 → T010 → T011 (all parallel)
Stream B (Validators): T012 → T013 → T014 (parallel within stream, after T004–T011)
Stream C (Repos):     T015 → T016 → T017 (parallel after Phase 2)
Stream D (Migration): T018 → T019 (sequential, after Phase 2)
```

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational — no dependency on US2 or US3
- **US2 (P2)**: Can start after US1 — hardens US1 repositories (same files, sequential)
- **US3 (P3)**: Can start after US1 — new service file, parallel with US2

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T003)
2. Complete Phase 2: Foundational (T004–T014) — critical blocker
3. Complete Phase 3: User Story 1 (T015–T020)
4. **STOP and VALIDATE**: Confirm all three entities persist through browser refresh
5. Proceed to Phase 4 (US2) or Phase 5 (US3) as needed

### Incremental Delivery

1. Setup + Foundational → Types and validators ready
2. US1 → Core persistence working (MVP for all future phases)
3. US2 → Validation hardening + graceful error recovery
4. US3 → Backup and restore capability

---

## Notes

- `[P]` = task touches a different file from all other parallel tasks; no shared file conflicts
- Validators (T012–T014) are pure functions — no Angular TestBed needed to verify them
- `_reload()` methods (T027–T029) use a leading underscore by convention to signal package-internal usage; they are not part of the public API defined in `contracts/service-contracts.md`
- `crypto.randomUUID()` requires the app to run on `localhost` or `https://` — `ng serve` satisfies this
- Storage key values use the short form (e.g., `'relapse-records'`); the `StorageService` prepends `habit-tracker-` via `storageKeyPrefix`
