# Research: Local Data Layer

**Phase**: 0 — Outline & Research
**Feature**: `002-local-data-layer`
**Date**: 2026-07-04

## Research Areas

This phase resolved the following design questions before committing to the data-model and contracts.

---

## 1. LocalStorage Key Strategy

**Decision**: Namespaced flat-key design — one JSON blob per domain entity collection.

**Rationale**: The Phase 1 `StorageService` already uses a `storageKeyPrefix` (`habit-tracker-`). Extending this with predictable domain keys (e.g., `habit-tracker-relapse-records`, `habit-tracker-settings`) allows a single `get`/`set` call to read/write the entire collection. This is simpler than one key-per-record and avoids key enumeration issues.

**Alternatives Considered**:
- **One key per record** (e.g., `habit-tracker-record-{id}`): Requires key enumeration to list all records. `localStorage` has no query API, so listing requires `Object.keys(localStorage)` scanning — fragile and slow at scale.
- **Separate namespace per entity type with sub-keys**: Adds complexity without benefit given the ~ 5 MB localStorage limit and < 10k record scale.

**Storage Key Plan**:
```
habit-tracker-relapse-records   → JSON array of RelapseRecord[]
habit-tracker-settings          → JSON object of Settings
habit-tracker-dashboard-prefs   → JSON object of DashboardPreferences
habit-tracker-schema-version    → JSON number (current schema version integer)
```

---

## 2. Unique ID Generation

**Decision**: Use `crypto.randomUUID()` — a native browser Web Crypto API method.

**Rationale**: Generates RFC 4122 v4 UUIDs. Available in all target browsers (Chrome 92+, Firefox 95+, Safari 15.4+). No external library needed. Collision probability is astronomically low (2^122 unique values). IDs are immutable after creation, satisfying FR-006.

**Alternatives Considered**:
- **`Date.now()` + Math.random()**: Not guaranteed unique under high-frequency creation; not standards-compliant.
- **`nanoid` library**: Excellent library, but adds a dependency. `crypto.randomUUID()` is sufficient and zero-cost.
- **Sequential integers**: Simple but creates ordering/collision risk across import/export scenarios.

---

## 3. Validation Architecture

**Decision**: Pure-function validators returning a `ValidationResult<T>` type — no Angular dependency.

**Rationale**: Validators are pure functions (input → output, no side effects). This makes them trivially unit-testable (no Angular TestBed needed), reusable across any service, and portable to future non-Angular contexts.

```typescript
// Pattern
interface ValidationResult<T> {
  valid: boolean;
  value: T | null;         // populated only if valid === true
  errors: ValidationError[]; // populated only if valid === false
}

interface ValidationError {
  field: string;
  messageAr: string;  // Arabic error message (FR-009)
}
```

**Alternatives Considered**:
- **Angular Reactive Forms validators**: Tightly coupled to form controls; cannot be called from a service directly.
- **Class-validator library** (decorator-based): Adds a dependency; overkill for the simple field rules needed.

---

## 4. Repository Pattern

**Decision**: Lightweight Angular `@Injectable` services acting as repositories — one per domain entity.

**Rationale**: Separates storage concerns (handled by `StorageService`) from domain logic (create, read, update, delete with validation). Each repository is independently testable by mocking `StorageService`. This follows the pattern established by the Phase 1 architecture.

**Repository Contract** (generic pattern):
```
RelapseRecordRepository:
  getAll(): RelapseRecord[]
  getById(id: string): RelapseRecord | null
  create(draft: Omit<RelapseRecord, 'id'>): ValidationResult<RelapseRecord>
  update(id: string, patch: Partial<RelapseRecord>): ValidationResult<RelapseRecord>
  delete(id: string): boolean

SettingsRepository:
  get(): Settings
  update(patch: Partial<Settings>): ValidationResult<Settings>

DashboardPreferencesRepository:
  get(): DashboardPreferences
  update(patch: Partial<DashboardPreferences>): ValidationResult<DashboardPreferences>
```

**Alternatives Considered**:
- **Generic single repository with entity type parameter**: Adds complexity; domain-specific methods (e.g., `getByDateRange()` in a future phase) require casting and lose type safety.
- **Direct `StorageService` calls from feature components**: Violates separation of concerns; impossible to add domain validation without duplicating it.

---

## 5. Schema Versioning & Migration Strategy

**Decision**: Integer version stored at a dedicated key; sequential migration functions applied on app initialization.

**Rationale**: Simple, proven pattern used by embedded databases (SQLite PRAGMA user_version) and browser extension storage. Migrations are pure functions `(data: unknown) => unknown` stored in an array indexed by target version number. On load, the migration service reads the stored version, applies any pending migrations sequentially, writes back, then updates the version number.

**Migration Runner Pseudocode**:
```
MIGRATIONS = [
  null,           // index 0 — placeholder (version 0 is "no schema")
  migrateTo_v1,  // index 1 — runs when stored version is 0
  migrateTo_v2,  // index 2 — runs when stored version is 1
  ...
]

function runMigrations():
  storedVersion = storage.get('schema-version') ?? 0
  currentVersion = CURRENT_SCHEMA_VERSION
  for v = storedVersion+1 to currentVersion:
    MIGRATIONS[v]()
  storage.set('schema-version', currentVersion)
```

**Initial Migration (v0 → v1)**: Detects any existing data from pre-versioned storage and wraps it in the v1 schema. Since Phase 1 wrote no domain data, v0 → v1 migration is a no-op for new installs.

**Alternatives Considered**:
- **Timestamp-based versions**: More complex to reason about ordering; no advantage for a single-developer local app.
- **No migration support**: Acceptable now but creates technical debt — adding it later requires rebuilding the versioning infrastructure from scratch.

---

## 6. Export/Import File Format

**Decision**: Single JSON file containing a self-describing `ExportBundle` envelope.

**Rationale**: Self-describing format (includes schema version and export timestamp) allows the import validator to detect version mismatches before applying data. Human-readable for debugging. No binary format needed at this scale.

**ExportBundle Structure**:
```json
{
  "schemaVersion": 1,
  "exportedAt": "2026-07-04T12:00:00.000Z",
  "relapseRecords": [ ...RelapseRecord[] ],
  "settings": { ...Settings },
  "dashboardPreferences": { ...DashboardPreferences }
}
```

**File Naming**: `habit-tracker-backup-YYYY-MM-DD.json` (generated at export time).

**Download Mechanism**: Programmatic `<a>` element with a `Blob` URL — no third-party file-save library needed.

**Alternatives Considered**:
- **CSV export**: Loses nested/optional fields; not suitable for full restore.
- **Multiple files (one per entity)**: Complicates the import UX (user must select 3 files) with no benefit.
- **IndexedDB**: Overkill for this scale; constitution explicitly lists IndexedDB as forbidden unless explicitly requested.

---

## 7. Error Handling & Quota Management

**Decision**: Wrap all `localStorage` writes in try/catch; catch `DOMException` with name `QuotaExceededError`; surface Arabic message via a returned error status, not a thrown exception.

**Rationale**: The `StorageService` already wraps all calls. Repositories and the import/export service must also handle quota errors explicitly. Returning an error object (rather than throwing) keeps the calling code clean and allows the UI to decide how to display the error.

**Arabic Error Messages** (representative set):
```
حقل التاريخ مطلوب.
تاريخ غير صالح.
مستوى الرغبة يجب أن يكون بين 1 و10.
العدد يجب أن يكون رقماً موجباً.
فشل الحفظ: مساحة التخزين ممتلئة.
ملف الاستيراد غير صالح أو تالف.
فشل الاستيراد: إصدار المخطط غير مدعوم.
```

**Alternatives Considered**:
- **Throwing exceptions**: Forces every caller to wrap in try/catch; spreads error handling across the codebase.
- **RxJS Observables with error channels**: Overkill for synchronous localStorage operations; constitution mandates "RxJS only when necessary."

---

## 8. Angular Signals Integration

**Decision**: Repositories expose reactive collections via `Signal<T[]>` (read-only) alongside synchronous accessor methods.

**Rationale**: Angular Signals (already in use in Phase 1 `StorageService` and `ThemeService`) are the mandated reactivity primitive. Exposing a `Signal<RelapseRecord[]>` from `RelapseRecordRepository` allows components and the analytics engine to react to data changes without polling or explicit subscriptions. The Signal is updated immediately after every successful write.

```typescript
// Pattern
@Injectable({ providedIn: 'root' })
export class RelapseRecordRepository {
  private readonly _records = signal<RelapseRecord[]>([]);
  readonly records: Signal<RelapseRecord[]> = this._records.asReadonly();
  
  constructor(private storage: StorageService) {
    this._records.set(this.loadFromStorage());
  }
}
```

**Alternatives Considered**:
- **RxJS `BehaviorSubject`**: Heavier; constitution says "RxJS only when necessary"; Signals are sufficient here.
- **No reactive state**: Components would have to re-query the repository on every change detection cycle — inefficient.
