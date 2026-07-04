# Component Contracts: Relapse Management

**Feature**: 003-relapse-management
**Date**: 2026-07-04

These contracts define the public `@Input`/`@Output` surface of each component as well as the Angular CDK Dialog data/result shapes. They are the binding agreement between components and their consumers.

---

## RelapsesComponent (Host / Page)

**Path**: `src/app/features/relapses/relapses.component.ts`
**Route**: `/relapses`

No `@Input`/`@Output` — this is a routed page component. It orchestrates all child components and owns the filter/sort signal state.

**Signals owned**:
```typescript
searchQuery : WritableSignal<string>      // default ''
datePreset  : WritableSignal<DatePreset>  // default 'all'
customFrom  : WritableSignal<string|null> // default null
customTo    : WritableSignal<string|null> // default null
sortField   : WritableSignal<SortField>   // default 'date'
sortDir     : WritableSignal<SortDir>     // default 'desc'

// Derived
filteredRecords : Signal<RelapseRecord[]>
isEmpty         : Signal<boolean>
noMatch         : Signal<boolean>
```

---

## RecordFilterBarComponent

**Path**: `src/app/features/relapses/components/record-filter-bar/record-filter-bar.component.ts`

Renders: search box + date preset selector, always visible above the table.

| Binding | Type | Direction | Description |
|---------|------|-----------|-------------|
| `searchQuery` | `string` | `@Input()` | Current search query |
| `datePreset` | `DatePreset` | `@Input()` | Active date preset |
| `searchChange` | `EventEmitter<string>` | `@Output()` | Emits on each keystroke |
| `datePresetChange` | `EventEmitter<DatePreset>` | `@Output()` | Emits on preset selection |
| `clearFilters` | `EventEmitter<void>` | `@Output()` | Emits when user taps "مسح الفلاتر" |

---

## RecordTableComponent

**Path**: `src/app/features/relapses/components/record-table/record-table.component.ts`

Renders: the HTML `<table>` of records.

| Binding | Type | Direction | Description |
|---------|------|-----------|-------------|
| `records` | `RelapseRecord[]` | `@Input()` | The filtered, sorted list to display |
| `sortField` | `SortField` | `@Input()` | Active sort column |
| `sortDir` | `SortDir` | `@Input()` | Active sort direction |
| `sortChange` | `EventEmitter<{field: SortField, dir: SortDir}>` | `@Output()` | Emits when user clicks a column header |
| `editRecord` | `EventEmitter<string>` | `@Output()` | Emits the record `id` when edit action triggered |
| `deleteRecord` | `EventEmitter<string>` | `@Output()` | Emits the record `id` after inline delete confirmed |
| `duplicateRecord` | `EventEmitter<string>` | `@Output()` | Emits the record `id` when duplicate action triggered |

---

## RecordFormComponent (Modal Content)

**Path**: `src/app/features/relapses/components/record-form/record-form.component.ts`

Rendered inside the Angular CDK Dialog overlay. Receives data via `DIALOG_DATA` injection token.

### Dialog Input Data

```typescript
export interface RecordFormDialogData {
  /** If present: edit mode. If absent: create mode. */
  record?: RelapseRecord;
  /** If present: duplicate mode — pre-fill form but save as new. */
  draft?: Omit<RelapseRecord, 'id' | 'createdAt' | 'updatedAt'>;
}
```

### Dialog Result

```typescript
export type RecordFormDialogResult =
  | { action: 'saved'; record: RelapseRecord }
  | { action: 'cancelled' };
```

The `RelapsesComponent` subscribes to the dialog's `closed` observable to handle the result.

---

## RecordEmptyStateComponent

**Path**: `src/app/features/relapses/components/record-empty-state/record-empty-state.component.ts`

| Binding | Type | Direction | Description |
|---------|------|-----------|-------------|
| `mode` | `'empty' \| 'no-match'` | `@Input()` | Controls which Arabic message is shown |
| `addRecord` | `EventEmitter<void>` | `@Output()` | Emits when user taps the "أضف سجلاً" CTA button (only in `empty` mode) |

---

## Validator Extension Contract

**File**: `src/app/core/validators/relapse-record.validator.ts`
**Change**: Add one validation rule — future-date rejection.

```typescript
// New rule added after existing date format check:
const today = new Date();
today.setHours(0, 0, 0, 0);
const recordDate = new Date(draft.date);
if (recordDate > today) {
  errors.push({ field: 'date', messageAr: 'لا يمكن تسجيل سجل في المستقبل.' });
}
```

This is a pure function extension with no interface changes.
