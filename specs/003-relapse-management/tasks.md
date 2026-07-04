# Tasks: Relapse Management

**Input**: Design documents from `specs/003-relapse-management/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅

**Tests**: Not requested — no test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on each other)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths are included in every task description

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the types and folder structure that all components depend on.

- [x] T001 Create feature models folder and type definitions in `src/app/features/relapses/models/record-filter.types.ts` — export `DatePreset`, `SortField`, `SortDir`, `RecordFilter` interface and the `getDateRangeBounds(preset: DatePreset)` pure helper that returns `{ from: string | null; to: string | null }` for each preset (today, last7, last30, last90, lastYear, all, custom).

**Checkpoint**: Type file exists and exports all symbols needed by every component in this feature.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core changes to existing files that ALL user stories depend on. MUST complete before any component work begins.

**⚠️ CRITICAL**: No user story component can be built until this phase is complete.

- [x] T002 Extend `src/app/core/validators/relapse-record.validator.ts` — add future-date rejection rule: after the existing date format check, compute `today` at midnight local time, parse `draft.date` as a `Date`, and push `{ field: 'date', messageAr: 'لا يمكن تسجيل سجل في المستقبل.' }` if `recordDate > today`. No other changes.

- [x] T003 Install Angular CDK if not already present — run `npm install @angular/cdk` and verify the package appears in `package.json` dependencies. Then verify `@angular/cdk/dialog` is importable.

**Checkpoint**: Validator rejects future dates with correct Arabic message. CDK Dialog is available for import in any component.

---

## Phase 3: User Story 1 — Log a New Relapse Record (Priority: P1) 🎯 MVP

**Goal**: A user can open a modal form, fill in date + count, save, and immediately see the record in the history list. The form validates all fields and shows Arabic errors inline.

**Independent Test**: Navigate to `/relapses` → tap "إضافة سجل" → fill date (today) and count (1) → save → confirm one row appears in the table → refresh the page → confirm the row persists.

### Implementation

- [x] T004 [P] [US1] Create `RecordFormComponent` skeleton in `src/app/features/relapses/components/record-form/record-form.component.ts` — standalone component, inject `DIALOG_DATA` token typed as `RecordFormDialogData` (`{ record?: RelapseRecord; draft?: Omit<RelapseRecord, 'id'|'createdAt'|'updatedAt'> }`), inject `DialogRef<RecordFormDialogResult>`, declare a `FormGroup` with seven `FormControl` fields matching `RecordFormDraft` from `data-model.md`. No template yet.

- [x] T005 [P] [US1] Create `RecordEmptyStateComponent` skeleton in `src/app/features/relapses/components/record-empty-state/record-empty-state.component.ts` — standalone, `@Input() mode: 'empty' | 'no-match'`, `@Output() addRecord = new EventEmitter<void>()`. No template yet.

- [x] T006 [US1] Implement `RecordFormComponent` template in `src/app/features/relapses/components/record-form/record-form.component.html` — RTL modal layout with: title (إضافة سجل / تعديل سجل based on mode), all 7 form fields with Arabic labels and placeholders, inline `*ngIf` validation error messages in Arabic for each field, live character counter spans for `reason` (max 500) and `notes` (max 1000), Save (حفظ) and Cancel (إلغاء) buttons. Binds to the `FormGroup` from T004.

- [x] T007 [US1] Implement `RecordFormComponent` logic in `src/app/features/relapses/components/record-form/record-form.component.ts` — complete the class started in T004: `ngOnInit` initializes form values from `DIALOG_DATA` (edit pre-fill, duplicate pre-fill, or create with today's date); `save()` method calls `validateRelapseRecord` on the form value, maps Angular form errors to field-level display, and closes the dialog with `{ action: 'saved', record }` on success or keeps dialog open on validation failure; `cancel()` closes with `{ action: 'cancelled' }`.

- [x] T008 [US1] Style `RecordFormComponent` in `src/app/features/relapses/components/record-form/record-form.component.scss` — modal container with max-width, RTL field layout, field labels above inputs, error message styling (red, small), character counter styling (right-aligned, turns red when near limit), Save/Cancel button row.

- [x] T009 [US1] Implement `RecordEmptyStateComponent` template and styles in `src/app/features/relapses/components/record-empty-state/record-empty-state.component.html` and `.scss` — when `mode === 'empty'`: show Arabic message "لا توجد سجلات حتى الآن" with a large icon and "إضافة سجل" CTA button that emits `addRecord`; when `mode === 'no-match'`: show "لا توجد نتائج تطابق البحث" with a different icon and no CTA button.

- [x] T010 [US1] Refactor `RelapsesComponent` in `src/app/features/relapses/relapses.component.ts` — inject `RelapseRecordRepository` and `Dialog` (CDK); add signals: `_searchQuery`, `_datePreset`, `_sortField`, `_sortDir`; add computed `filteredRecords`, `isEmpty`, `noMatch`; add `openAddDialog()` method that opens `RecordFormComponent` via `Dialog.open()` and on `closed` subscribe to handle `{ action: 'saved' }` by calling `repository.create()`; add `openEditDialog(id)` and `openDuplicateDialog(id)` stubs (implement fully in US3).

- [x] T011 [US1] Implement `RelapsesComponent` template in `src/app/features/relapses/relapses.component.html` — page layout: page header with title "سجلات الانتكاسة" and "إضافة سجل" button; below header render `<app-record-empty-state>` when `isEmpty()` is true; render placeholder `<div>` where the filter bar and table will go (implemented in US2/US3); wire `addRecord` output from empty state to `openAddDialog()`.

- [x] T012 [US1] Style `RelapsesComponent` page in `src/app/features/relapses/relapses.component.scss` — page wrapper, RTL header row with title on right and Add button on left (RTL), consistent spacing matching the design system.

**Checkpoint**: User can navigate to `/relapses`, see the Arabic empty state, tap "إضافة سجل", fill the modal form, save a record, and see it persisted after a page refresh. Form shows Arabic inline errors on invalid input. Future dates are rejected.

---

## Phase 4: User Story 2 — View, Search, Filter, and Sort History (Priority: P2)

**Goal**: User can see all records in a tabular grid with a persistent filter bar above it, search by keyword (reason/notes), filter by date preset, and sort by date or count — all reactively without page reload.

**Independent Test**: Add 5+ records → open `/relapses` → verify tabular grid visible → type a keyword → verify list filters in real time → apply "آخر 7 أيام" preset → verify only recent records shown → click date column header → verify sort order changes.

### Implementation

- [x] T013 [P] [US2] Create `RecordFilterBarComponent` in `src/app/features/relapses/components/record-filter-bar/record-filter-bar.component.ts` — standalone, `@Input() searchQuery: string`, `@Input() datePreset: DatePreset`, `@Output() searchChange = new EventEmitter<string>()`, `@Output() datePresetChange = new EventEmitter<DatePreset>()`, `@Output() clearFilters = new EventEmitter<void>()`. Declare Arabic preset label map: `{ today: 'اليوم', last7: 'آخر 7 أيام', last30: 'آخر 30 يومًا', last90: 'آخر 90 يومًا', lastYear: 'آخر سنة', all: 'الكل' }`.

- [x] T014 [P] [US2] Create `RecordTableComponent` in `src/app/features/relapses/components/record-table/record-table.component.ts` — standalone, `@Input() records: RelapseRecord[]`, `@Input() sortField: SortField`, `@Input() sortDir: SortDir`, `@Output() sortChange = new EventEmitter<{field: SortField, dir: SortDir}>()`, `@Output() editRecord = new EventEmitter<string>()`, `@Output() deleteRecord = new EventEmitter<string>()`, `@Output() duplicateRecord = new EventEmitter<string>()`. Add local `pendingDeleteId = signal<string | null>(null)` for inline delete confirmation state.

- [x] T015 [US2] Implement `RecordFilterBarComponent` template in `src/app/features/relapses/components/record-filter-bar/record-filter-bar.component.html` — RTL layout: search input on the right (icon + Arabic placeholder "ابحث في السبب أو الملاحظات..."), preset selector buttons/chips in a row (one per preset, active state highlighted), "مسح الفلاتر" clear button shown only when search is not empty or preset is not 'all'.

- [x] T016 [US2] Style `RecordFilterBarComponent` in `src/app/features/relapses/components/record-filter-bar/record-filter-bar.component.scss` — filter bar container, RTL flex row, search input styles, preset chip/button styles (active/inactive), clear button style, responsive wrapping for narrow screens.

- [x] T017 [US2] Implement `RecordTableComponent` template in `src/app/features/relapses/components/record-table/record-table.component.html` — RTL `<table>`: columns التاريخ | الوقت | العدد | مستوى الرغبة | السبب | الإجراءات; sortable column headers with up/down arrow indicator for active column; each row renders the record fields with Arabic formatting; إجراءات column: "تعديل" + "تكرار" buttons always visible, "حذف" button that on first click sets `pendingDeleteId` to this row's id (showing inline "تأكيد الحذف | إلغاء" buttons), second click on "تأكيد الحذف" emits `deleteRecord`, "إلغاء" resets `pendingDeleteId` to null; `@for` loop over `records`.

- [x] T018 [US2] Style `RecordTableComponent` in `src/app/features/relapses/components/record-table/record-table.component.scss` — full-width table, sticky header, `max-height` + `overflow-y: auto` for scroll, alternating row background, RTL column order, sortable header hover state, inline delete confirmation row highlight, action button styles, responsive column hiding for narrow screens.

- [x] T019 [US2] Extend `RelapsesComponent` computed logic in `src/app/features/relapses/relapses.component.ts` — implement the full `filteredRecords` computed signal: (1) start from `repository.records()`; (2) apply date preset filter using `getDateRangeBounds()` from `record-filter.types.ts`; (3) apply search: case-insensitive match on `reason + notes`; (4) apply sort by `sortField`/`sortDir`. Implement `updateSearch(q)`, `updateDatePreset(p)`, `updateSort({field, dir})`, `clearFilters()` handler methods that update the writable signals.

- [x] T020 [US2] Update `RelapsesComponent` template in `src/app/features/relapses/relapses.component.html` — replace the placeholder from T011 with: `<app-record-filter-bar>` (always visible above the table) bound to filter signals, wired to handler methods; `<app-record-table>` bound to `filteredRecords()`, `sortField()`, `sortDir()`, with `editRecord`/`deleteRecord`/`duplicateRecord` outputs wired to stub handlers; `<app-record-empty-state mode="no-match">` rendered via `@if (noMatch())`.

- [x] T021 [US2] Wire delete in `RelapsesComponent` in `src/app/features/relapses/relapses.component.ts` — implement `deleteRecord(id: string)` method: call `repository.delete(id)`, the signal auto-updates; no additional reload needed.

**Checkpoint**: All records visible in the tabular grid. Search box and date preset filters work reactively. Sorting by date/count toggles correctly. Deleting a record with inline confirmation removes it from the table immediately. Empty state shows "no results" message when search matches nothing.

---

## Phase 5: User Story 3 — Edit, Delete, and Duplicate Records (Priority: P3)

**Goal**: User can edit any record (form pre-filled with existing values), duplicate it (form pre-filled, saved as new record), and the full delete flow already works from US2. This phase completes the dialog wiring for edit and duplicate modes.

**Independent Test**: Select a record → tap "تعديل" → verify form opens pre-filled with all field values → change count → save → verify updated value in the table → select another record → tap "تكرار" → verify pre-filled form opens → change the date → save → verify a new distinct record appears.

### Implementation

- [x] T022 [US3] Implement `openEditDialog(id)` in `src/app/features/relapses/relapses.component.ts` — look up the record by id from `repository.records()`, open `RecordFormComponent` via `Dialog.open()` passing `{ record }` as `DIALOG_DATA`, subscribe to `closed` observable: on `{ action: 'saved', record }` call `repository.update(record.id, record)`.

- [x] T023 [US3] Implement `openDuplicateDialog(id)` in `src/app/features/relapses/relapses.component.ts` — look up the record by id, build a `draft` object omitting `id`, `createdAt`, `updatedAt`, open `RecordFormComponent` via `Dialog.open()` passing `{ draft }` as `DIALOG_DATA`, subscribe to `closed` observable: on `{ action: 'saved', record }` call `repository.create(record)`.

- [x] T024 [US3] Wire `editRecord` and `duplicateRecord` outputs in `src/app/features/relapses/relapses.component.html` — bind `(editRecord)="openEditDialog($event)"` and `(duplicateRecord)="openDuplicateDialog($event)"` on the `<app-record-table>` element (replacing the stub bindings from T020).

**Checkpoint**: Edit, delete, and duplicate all work end-to-end. Full User Story 3 acceptance scenarios pass.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, visual polish, dark/light mode correctness, and final UX touches across all components.

- [x] T025 [P] Add `aria-label` attributes to all interactive elements in the record form, filter bar, and table — all labels and aria text in Arabic. Ensure the CDK Dialog trap focus correctly and `role="dialog"` is set.

- [x] T026 [P] Verify dark mode rendering for all new components in `src/app/features/relapses/` — check that all SCSS uses existing CSS custom properties (e.g., `var(--surface)`, `var(--text-primary)`, `var(--accent)`) rather than hard-coded colors so that the global `ThemeService` dark/light toggle applies automatically.

- [x] T027 Add smooth CDK Dialog backdrop animation — in the global `src/styles/` or `record-form.component.scss`, add `@keyframes` or CDK Dialog animation config so the modal fades and slides in/out smoothly on open/close.

- [x] T028 Run lint and format check — execute `npx ng lint` and `npx prettier --write src/app/features/relapses/` from repo root; fix any reported issues in the new files.

- [x] T029 Manual end-to-end verification against the 14 verification scenarios in `specs/003-relapse-management/plan.md` — walk through all 14 checks (create, validation, future-date, edit, delete-cancel, delete-confirm, duplicate, search, date filter, sort, empty state, no-match state, RTL layout, dark mode, character limits) and confirm each passes.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately.
- **Phase 2 (Foundational)**: Depends on Phase 1. **BLOCKS all component work.**
- **Phase 3 (US1 — Log record)**: Depends on Phase 2. 🎯 This is the MVP.
- **Phase 4 (US2 — History/search/filter)**: Depends on Phase 3 (uses `filteredRecords` extension and the host component).
- **Phase 5 (US3 — Edit/Duplicate)**: Depends on Phase 3 (`RecordFormComponent` must be complete and wired).
- **Phase 6 (Polish)**: Depends on Phases 3–5 all complete.

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — no dependency on US2 or US3.
- **US2 (P2)**: Depends on US1 (filter bar and table extend the `RelapsesComponent` built in US1).
- **US3 (P3)**: Depends on US1 (`RecordFormComponent` is reused for edit/duplicate modes; only new wiring is added).

### Within Each Phase

- Tasks marked `[P]` within the same phase can run in parallel (different files).
- Skeleton tasks (T004, T005, T013, T014) must complete before the corresponding template/logic tasks.
- `RelapsesComponent` host tasks (T010, T019, T022, T023) must be done sequentially as each extends the same class.

### Parallel Opportunities

```
Phase 3 parallel start (after Phase 2):
  T004 [US1] RecordFormComponent skeleton
  T005 [US1] RecordEmptyStateComponent skeleton
  → then T006, T007, T008 (RecordForm template/logic/styles)
  → then T009 (EmptyState template/styles)
  → then T010, T011, T012 (host component — sequential)

Phase 4 parallel start (after Phase 3):
  T013 [US2] RecordFilterBarComponent skeleton
  T014 [US2] RecordTableComponent skeleton
  → then T015, T016 (FilterBar template/styles)
  → then T017, T018 (Table template/styles)
  → then T019, T020, T021 (host extensions — sequential)

Phase 6 parallel start (after Phase 5):
  T025 Accessibility attributes
  T026 Dark mode verification
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002, T003)
3. Complete Phase 3: User Story 1 (T004–T012)
4. **STOP and VALIDATE**: Navigate to `/relapses`, add a record, confirm persistence, confirm Arabic errors.
5. Demo the core logging flow.

### Incremental Delivery

1. Phase 1 + 2 → Foundation ready
2. Phase 3 (US1) → Basic record logging works ✅ MVP
3. Phase 4 (US2) → Full history view with search/filter/sort ✅
4. Phase 5 (US3) → Edit + duplicate complete ✅
5. Phase 6 → Production quality polish ✅

---

## Notes

- `[P]` tasks operate on different files; they can be launched as parallel sub-agents.
- `[Story]` label maps each task to its user story for traceability with `spec.md`.
- Every component must use `standalone: true` — no NgModule.
- All Arabic strings must use correct Unicode Arabic characters (not Latin transliterations).
- CSS must use RTL-aware properties (`margin-inline-start` etc.) or rely on the global `dir="rtl"` set on `<html>`.
- CDK Dialog `closed` returns an `Observable` — use `.subscribe()` once, unsubscribe via `takeUntilDestroyed()` or use `afterClosed()` if available.
- Commit after each phase checkpoint for clean rollback points.
