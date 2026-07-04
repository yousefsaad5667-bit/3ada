# Implementation Plan: Relapse Management

**Branch**: `003-relapse-management` | **Date**: 2026-07-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/003-relapse-management/spec.md`

---

## Summary

Build the complete Relapse Management UI for the Habit Tracker app. Users can create, view, search, filter, sort, edit, delete, and duplicate relapse records through a tabular history view with a permanently visible filter bar and a modal dialog form. All data persists via the existing `RelapseRecordRepository` (Phase 2). The validator is extended to reject future dates. No new storage logic is introduced — this phase is purely UI and light domain logic.

---

## Technical Context

**Language/Version**: TypeScript 5.x / Angular 19 (latest stable)

**Primary Dependencies**:
- `@angular/core` — signals, computed, inject, standalone components
- `@angular/forms` — ReactiveFormsModule (FormGroup / FormControl)
- `@angular/cdk/dialog` — CDK Dialog for modal overlay (no Material required)
- `@angular/router` — existing route `/relapses`

**Storage**: LocalStorage via existing `StorageService` + `RelapseRecordRepository`

**Testing**: None in this phase (constitution does not mandate unit tests per phase; deferred to Phase 14)

**Target Platform**: Browser (SPA, Chrome/Firefox/Safari)

**Performance Goals**:
- Filter/search rendered in `<100ms` for 10,000 records (using `computed` signals)
- List scroll smooth at 60 fps with native browser scrolling

**Constraints**:
- No backend, no APIs, no IndexedDB
- Arabic-only UI with full RTL layout
- Reactive Forms (not template-driven)
- RxJS only where unavoidable (CDK Dialog `closed` observable is acceptable)

**Scale/Scope**: Single feature module, ~6 components + 1 service extension + 1 validator change

---

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| Angular-only, no backend | ✅ PASS | Pure Angular SPA, LocalStorage only |
| 100% Local-First | ✅ PASS | Uses existing `RelapseRecordRepository` |
| Arabic + RTL | ✅ PASS | All labels, errors, and states in Arabic; RTL enforced globally |
| Modern UI/UX | ✅ PASS | Dark/Light mode via existing theme; empty states; loading states; animations |
| Performance | ✅ PASS | `computed` signals; native scroll; virtual scroll deferred to Phase 14 |
| Feature-based architecture | ✅ PASS | All new files under `src/app/features/relapses/` |
| Strong typing | ✅ PASS | All new types/interfaces explicitly defined in `data-model.md` |
| Standalone components | ✅ PASS | All new components are `standalone: true` |

**No gate violations detected. Proceeding to design.**

---

## Project Structure

### Documentation (this feature)

```text
specs/003-relapse-management/
├── plan.md                        # This file
├── spec.md                        # Feature specification
├── research.md                    # Phase 0 decisions
├── data-model.md                  # Phase 1 data model
├── contracts/
│   └── component-contracts.md    # Component @Input/@Output + Dialog contracts
└── tasks.md                       # Phase 2 output (created by /speckit-tasks)
```

### Source Code Changes

```text
src/app/
├── core/
│   └── validators/
│       └── relapse-record.validator.ts         [MODIFY] Add future-date rule
│
└── features/
    └── relapses/
        ├── relapses.component.ts               [MODIFY] Full implementation
        ├── relapses.component.html             [MODIFY] Full implementation
        ├── relapses.component.scss             [MODIFY] Page layout styles
        │
        ├── models/                             [NEW FOLDER]
        │   └── record-filter.types.ts          [NEW] DatePreset, SortField, SortDir, RecordFilter
        │
        └── components/                         [NEW FOLDER]
            ├── record-filter-bar/              [NEW]
            │   ├── record-filter-bar.component.ts
            │   ├── record-filter-bar.component.html
            │   └── record-filter-bar.component.scss
            │
            ├── record-table/                   [NEW]
            │   ├── record-table.component.ts
            │   ├── record-table.component.html
            │   └── record-table.component.scss
            │
            ├── record-form/                    [NEW]
            │   ├── record-form.component.ts
            │   ├── record-form.component.html
            │   └── record-form.component.scss
            │
            └── record-empty-state/             [NEW]
                ├── record-empty-state.component.ts
                ├── record-empty-state.component.html
                └── record-empty-state.component.scss
```

**Structure Decision**: All new files live under `src/app/features/relapses/` following the established feature-based architecture. No changes to `core/` except the validator extension.

---

## Implementation Phases

### Phase A — Foundation (Validator + Types)

1. **Extend `relapse-record.validator.ts`**: Add future-date rejection rule.
2. **Create `record-filter.types.ts`**: Define `DatePreset`, `SortField`, `SortDir`, `RecordFilter` types + date preset helper utility.

### Phase B — Components (Bottom-Up)

Build leaf components first, then assemble into the page.

**B1 — `RecordEmptyStateComponent`**
- Inputs: `mode: 'empty' | 'no-match'`
- Output: `addRecord` event
- Two Arabic message variants

**B2 — `RecordFilterBarComponent`**
- Inputs: `searchQuery`, `datePreset`
- Outputs: `searchChange`, `datePresetChange`, `clearFilters`
- RTL search box + preset chips/buttons

**B3 — `RecordTableComponent`**
- Inputs: `records[]`, `sortField`, `sortDir`
- Outputs: `sortChange`, `editRecord`, `deleteRecord`, `duplicateRecord`
- Columns: التاريخ | الوقت | العدد | مستوى الرغبة | السبب | الإجراءات
- Inline delete confirmation per row

**B4 — `RecordFormComponent`** (CDK Dialog content)
- Receives `RecordFormDialogData` via `DIALOG_DATA`
- ReactiveForm with all 7 fields
- Live character counters for reason/notes
- Inline Arabic validation errors
- Create / Edit / Duplicate modes

### Phase C — Host Page (`RelapsesComponent`)

- Own all filter signals
- Computed `filteredRecords`, `isEmpty`, `noMatch`
- Open/close CDK Dialog for Add/Edit/Duplicate
- Handle dialog `closed` observable → delegate to repository
- Orchestrate `RecordFilterBarComponent` + `RecordTableComponent` + `RecordEmptyStateComponent`
- Wire delete → repository.delete()

### Phase D — Styling & Polish

- RTL-first SCSS for table, form, filter bar
- Dark/Light mode variables via existing CSS custom properties
- Smooth modal open/close animation (CDK Dialog backdrop)
- Empty state illustration/icon

---

## Key Design Decisions (from research.md)

| Area | Decision |
|------|----------|
| Form presentation | Angular CDK Dialog (`@angular/cdk/dialog`) |
| List layout | Custom HTML `<table>` + SCSS |
| Filter/search state | Angular `signal` + `computed` (no RxJS) |
| Delete confirmation | Inline per-row confirmation (no second modal) |
| Future-date validation | Extend existing `validateRelapseRecord` |
| Pagination | Deferred — native scroll for now |
| Duplicate flow | Pre-filled draft → create mode |

---

## Verification Plan

### Manual Verification

1. **Create**: Add record with all fields → verify it appears at top of table → refresh page → verify persistence.
2. **Validation**: Try saving with no date → verify Arabic inline error appears, form does not submit.
3. **Future date**: Enter tomorrow's date → verify Arabic error "لا يمكن تسجيل سجل في المستقبل."
4. **Edit**: Edit an existing record's count → save → verify updated value shows in table.
5. **Delete**: Delete a record → cancel confirmation → verify it still exists → delete again → confirm → verify it disappears.
6. **Duplicate**: Duplicate a record → modify one field → save → verify two records exist.
7. **Search**: Type a keyword in the search box → verify only matching records shown in real time.
8. **Date filter**: Apply "Last 7 Days" → verify only recent records shown.
9. **Sort**: Click "العدد" column header → verify sort direction toggles and list reorders.
10. **Empty state**: Delete all records → verify Arabic empty-state message shown.
11. **No match**: Add records → search for a nonexistent keyword → verify distinct "no results" Arabic message.
12. **RTL**: Inspect layout — all text right-aligned, table columns in Arabic RTL order, modal opens from correct direction.
13. **Dark mode**: Toggle dark mode → verify form, table, filter bar all render correctly.
14. **Character limits**: Type 501 chars in reason field → verify counter turns red and save is blocked.

---

## Complexity Tracking

*No constitution violations. No justification required.*
