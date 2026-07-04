# Service Contracts: Local Data Layer

**Phase**: 1 — Design & Contracts
**Feature**: `002-local-data-layer`
**Date**: 2026-07-04

This document defines the public-facing service contracts (TypeScript interfaces) that this phase delivers. All downstream features (Phase 3 — Relapse Management UI, Phase 5 — Dashboard, Phase 4 — Analytics Engine) program against these contracts.

---

## StorageService (Extended)

*Extends the existing `StorageService` from Phase 1.*

```typescript
// src/app/core/services/storage.service.ts (extended)

interface StorageService {
  // Existing from Phase 1:
  isAvailable: Signal<boolean>;
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): boolean;
  remove(key: string): boolean;
  has(key: string): boolean;

  // New in Phase 2:
  /** Removes ALL keys that start with the storageKeyPrefix. Used by ImportExportService.clearAll(). */
  clearAll(): void;
}
```

---

## RelapseRecordRepository

```typescript
// src/app/core/services/relapse-record.repository.ts

interface RelapseRecordRepository {
  /** Reactive collection — updates whenever data changes. */
  readonly records: Signal<RelapseRecord[]>;

  /** Returns all records sorted by date descending, then time descending. */
  getAll(): RelapseRecord[];

  /** Returns a single record by ID, or null if not found. */
  getById(id: string): RelapseRecord | null;

  /**
   * Validates the draft and, if valid, creates a new record with a generated ID,
   * createdAt, and updatedAt timestamps.
   * Returns a ValidationResult containing the created record on success,
   * or an array of Arabic-language ValidationError objects on failure.
   */
  create(draft: Omit<RelapseRecord, 'id' | 'createdAt' | 'updatedAt'>): ValidationResult<RelapseRecord>;

  /**
   * Applies the partial patch to the existing record identified by id.
   * Re-validates the full merged record before persisting.
   * Returns the updated record on success, or validation errors on failure.
   * Returns null in the result value if the id is not found.
   */
  update(id: string, patch: Partial<Omit<RelapseRecord, 'id' | 'createdAt'>>): ValidationResult<RelapseRecord>;

  /**
   * Permanently removes the record with the given id.
   * Returns true if the record existed and was removed; false if not found.
   */
  delete(id: string): boolean;
}
```

---

## SettingsRepository

```typescript
// src/app/core/services/settings.repository.ts

interface SettingsRepository {
  /** Reactive settings object — updates whenever settings change. */
  readonly settings: Signal<Settings>;

  /**
   * Returns current settings. If no settings exist in storage, returns the default Settings object.
   * Never returns null.
   */
  get(): Settings;

  /**
   * Validates and applies the partial patch to the current settings.
   * Returns the updated Settings on success, or validation errors on failure.
   */
  update(patch: Partial<Settings>): ValidationResult<Settings>;
}
```

---

## DashboardPreferencesRepository

```typescript
// src/app/core/services/dashboard-preferences.repository.ts

interface DashboardPreferencesRepository {
  /** Reactive preferences object. */
  readonly preferences: Signal<DashboardPreferences>;

  /**
   * Returns current preferences. Returns defaults if none exist.
   * Never returns null.
   */
  get(): DashboardPreferences;

  /**
   * Validates and applies the partial patch to the current preferences.
   * Returns the updated DashboardPreferences on success, or validation errors on failure.
   */
  update(patch: Partial<DashboardPreferences>): ValidationResult<DashboardPreferences>;
}
```

---

## MigrationService

```typescript
// src/app/core/services/migration.service.ts

interface MigrationService {
  /**
   * Reads the stored schema version, runs any pending sequential migrations,
   * and writes the updated version.
   * Must be called ONCE on app initialization (before any repository is used).
   * Completes synchronously.
   * Throws no exceptions — all errors are logged and handled gracefully (FR-010).
   */
  runMigrations(): void;

  /** Returns the currently stored schema version integer (0 if not set). */
  getStoredVersion(): number;
}
```

---

## ImportExportService

```typescript
// src/app/core/services/import-export.service.ts

interface ImportExportService {
  /**
   * Collects all data from all repositories, wraps in an ExportBundle envelope,
   * serializes to JSON, and triggers a browser file download.
   * File name format: habit-tracker-backup-YYYY-MM-DD.json
   * Returns true on success; false if an error occurred (e.g., browser blocked download).
   */
  exportAll(): boolean;

  /**
   * Reads and validates the provided JSON content string as an ExportBundle.
   * Applies the bundle according to the given strategy:
   *   - 'replace': clears all domain data, then writes the imported data
   *   - 'merge': adds records not already present (by ID); skips conflicts
   * Returns a ValidationResult:
   *   - valid: true → import applied; value contains the count of records imported
   *   - valid: false → validation failed; data unchanged; errors contain Arabic messages
   */
  importFromJson(jsonContent: string, strategy: ImportStrategy): ValidationResult<ImportSummary>;

  /**
   * Permanently removes ALL locally stored data (all domain keys).
   * Resets reactive Signals in all repositories to their default values.
   * Returns true on success.
   */
  clearAll(): boolean;
}

/** Summary returned after a successful import. */
interface ImportSummary {
  recordsImported: number;   // total relapse records written
  recordsSkipped: number;    // records skipped due to ID conflicts (merge only)
  strategy: ImportStrategy;
}
```

---

## Validator Function Signatures

Validators are standalone pure functions, not Angular services.

```typescript
// src/app/core/validators/relapse-record.validator.ts
function validateRelapseRecord(
  draft: Omit<RelapseRecord, 'id' | 'createdAt' | 'updatedAt'>
): ValidationResult<Omit<RelapseRecord, 'id' | 'createdAt' | 'updatedAt'>>;

// src/app/core/validators/settings.validator.ts
function validateSettings(draft: Partial<Settings>): ValidationResult<Settings>;

// src/app/core/validators/export-bundle.validator.ts
function validateExportBundle(parsed: unknown): ValidationResult<ExportBundle>;
```

---

## App Initialization Contract

`MigrationService.runMigrations()` MUST be called before any repository is used. The recommended integration point is Angular's `APP_INITIALIZER` token in `app.config.ts`.

```typescript
// Pseudocode for app.config.ts
{
  provide: APP_INITIALIZER,
  useFactory: (migration: MigrationService) => () => migration.runMigrations(),
  deps: [MigrationService],
  multi: true
}
```

This guarantees the storage schema is up-to-date before any component or service reads data.
