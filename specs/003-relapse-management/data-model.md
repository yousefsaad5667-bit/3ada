# Data Model: Relapse Management

**Feature**: 003-relapse-management
**Date**: 2026-07-04

---

## Entities

### RelapseRecord *(already exists — no schema changes)*

Defined in `src/app/core/models/relapse-record.model.ts`. Reproduced here for planning reference.

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `id` | `string` | Yes (auto) | `crypto.randomUUID()` |
| `date` | `string` | Yes | ISO format `YYYY-MM-DD`; must not be in the future |
| `time` | `string \| null` | No | `HH:MM` 24-hour format |
| `ampm` | `'am' \| 'pm' \| null` | No | Display hint; no logic impact |
| `count` | `number` | Yes | Positive integer ≥ 1 |
| `urgeLevel` | `number \| null` | No | Integer 1–10 |
| `reason` | `string \| null` | No | Max 500 characters |
| `notes` | `string \| null` | No | Max 1000 characters |
| `createdAt` | `string` | Yes (auto) | ISO 8601 timestamp |
| `updatedAt` | `string` | Yes (auto) | ISO 8601 timestamp |

**Storage key**: `STORAGE_KEYS.RELAPSE_RECORDS` (existing constant)

---

### RecordFilter *(new — UI state only, not persisted)*

Represents the active filter/search/sort state of the history view. Lives in the `RelapsesComponent` as Angular signals; never written to LocalStorage.

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `searchQuery` | `signal<string>` | `''` | Full-text match on `reason` + `notes` |
| `datePreset` | `signal<DatePreset>` | `'all'` | Enum of preset ranges |
| `customFrom` | `signal<string \| null>` | `null` | Used only when `datePreset === 'custom'` |
| `customTo` | `signal<string \| null>` | `null` | Used only when `datePreset === 'custom'` |
| `sortField` | `signal<SortField>` | `'date'` | `'date' \| 'count'` |
| `sortDir` | `signal<SortDir>` | `'desc'` | `'asc' \| 'desc'` |

---

### RecordFormDraft *(new — typed form value)*

The shape of the reactive form value inside `RecordFormComponent`. Matches `Omit<RelapseRecord, 'id' | 'createdAt' | 'updatedAt'>` but with all fields required at the form level (nullables handled by empty-string defaults).

| Field | Form Control Type | Notes |
|-------|------------------|-------|
| `date` | `FormControl<string>` | Required |
| `time` | `FormControl<string>` | Optional, validated as HH:MM |
| `ampm` | `FormControl<'am' \| 'pm' \| ''>` | Optional |
| `count` | `FormControl<number \| null>` | Required, ≥ 1 |
| `urgeLevel` | `FormControl<number \| null>` | Optional, 1–10 |
| `reason` | `FormControl<string>` | Optional, max 500 chars |
| `notes` | `FormControl<string>` | Optional, max 1000 chars |

---

## Type Definitions *(new — to add to models or feature types)*

```typescript
// src/app/features/relapses/models/record-filter.types.ts

export type DatePreset =
  | 'today'
  | 'last7'
  | 'last30'
  | 'last90'
  | 'lastYear'
  | 'all'
  | 'custom';

export type SortField = 'date' | 'count';
export type SortDir  = 'asc'  | 'desc';

export interface RecordFilter {
  searchQuery: string;
  datePreset: DatePreset;
  customFrom: string | null;
  customTo:   string | null;
  sortField:  SortField;
  sortDir:    SortDir;
}
```

---

## Validation Rules *(existing validator — one addition needed)*

All rules live in `src/app/core/validators/relapse-record.validator.ts`.

| Rule | Current Status | Change |
|------|---------------|--------|
| `date` required | ✅ exists | Add: must not exceed today's local date |
| `date` format (YYYY-MM-DD) | ✅ exists | No change |
| `count` required, positive integer | ✅ exists | No change |
| `urgeLevel` 1–10 if provided | ✅ exists | No change |
| `time` HH:MM format if provided | ✅ exists | No change |
| `reason` max 500 chars | ✅ exists | No change |
| `notes` max 1000 chars | ✅ exists | No change |
| `date` not in future | ❌ missing | **Add** |

---

## State Transitions

```
[No records]  ──add──►  [Record exists]
                            │
             ┌──────────────┼──────────────┐
             ▼              ▼              ▼
           edit           delete        duplicate
             │              │              │
             ▼              ▼              ▼
       [Updated]        [Removed]    [New record]
```

Delete requires explicit confirmation step before transition to `[Removed]`.

---

## Computed Derivations

| Derived Value | Source | Formula |
|--------------|--------|---------|
| `filteredRecords` | `repository.records()` + filter signals | Apply date range → apply search → apply sort |
| `totalVisible` | `filteredRecords()` | `filteredRecords().length` |
| `isEmpty` | `repository.records()` | `records().length === 0` (distinguish from no-match) |
| `noMatch` | `filteredRecords()` | `!isEmpty && filteredRecords().length === 0` |
