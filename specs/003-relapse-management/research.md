# Research: Relapse Management

**Feature**: 003-relapse-management
**Date**: 2026-07-04

---

## Decision 1: Form presentation — Modal Dialog

**Decision**: Implement the record form (create/edit/duplicate) as an Angular CDK Dialog or a custom modal overlay component.

**Rationale**: The spec (FR-001, FR-002, FR-004) mandates a modal dialog. The Angular CDK `Dialog` primitive is the preferred approach in Angular 19+ standalone projects because it:
- Provides proper focus trap and accessibility without custom code
- Renders into an overlay outlet, not the component tree
- Supports the `inject()` pattern for passing data/callbacks
- Does not require any additional library beyond `@angular/cdk`, which is already a standard Angular dependency

**Alternatives considered**:
- Custom `<dialog>` HTML element — valid, but requires manual focus management for RTL
- Angular Material `MatDialog` — brings in the full Material dependency, which is not in the project stack
- CDK Dialog (chosen) — minimal footprint, production-grade, RTL-compatible

---

## Decision 2: History view layout — Tabular data grid

**Decision**: Build a custom HTML `<table>` component styled with SCSS. No external data-grid library.

**Rationale**: The spec mandates a tabular data grid (User Story 2, clarified). Given:
- No backend/API: all data is in memory, no server-side paging needed
- Data volume target: 10,000 records for smooth UI
- The project stack: Angular 19+ standalone + SCSS (no Material/CDK table required)

A custom responsive table with sticky headers and RTL column ordering gives full control without adding a heavy dependency. Column widths, RTL text direction, and Arabic labels are all natively managed.

**Alternatives considered**:
- AG Grid / Handsontable — overkill for LocalStorage-backed data, large bundle
- Angular CDK Table — valid, but adds ceremony without meaningful gain for this use case
- Custom HTML table (chosen) — zero extra dependency, full RTL/SCSS control

---

## Decision 3: Filtering & search — Computed signals

**Decision**: Implement search and date filter state as Angular `signal`s on the host component; derive the filtered list as a `computed` signal from `repository.records`.

**Rationale**: This is idiomatic Angular 19+ and avoids RxJS where it is not needed. The computed signal reacts automatically when either the search query or the repository's record list changes.

```
searchQuery = signal('');
datePreset  = signal<DatePreset>('all');
sortField   = signal<SortField>('date');
sortDir     = signal<SortDir>('desc');

filteredRecords = computed(() => {
  let records = repository.records();
  // apply date filter, search, sort
  return records;
});
```

**Alternatives considered**:
- RxJS `BehaviorSubject` + `combineLatest` — valid, but the constitution says "RxJS only when necessary"
- Signals (chosen) — zero-RxJS, reactive, tree-shakable

---

## Decision 4: Deletion confirmation — Inline confirmation UI (not a second modal)

**Decision**: Render an inline delete confirmation prompt directly within the table row / action menu, rather than opening a second modal dialog.

**Rationale**: Opening a nested modal on top of a record-edit modal creates focus-trap complexity. An inline "confirm delete" toggle in the action column (e.g., "حذف" button → expands "تأكيد | إلغاء" inline) satisfies FR-003, SC-007, and avoids a two-modal stack.

**Alternatives considered**:
- A second overlay/modal — architecturally complex when the edit modal is already open
- Browser `confirm()` — not Arabic, not styled, not RTL
- Inline (chosen) — simple, focused, no nesting

---

## Decision 5: Future-date validation

**Decision**: Extend the existing `validateRelapseRecord` function to reject `date` values later than today's local date.

**Rationale**: The validator in `relapse-record.validator.ts` already runs all validation; adding a future-date check is a one-line addition (FR-009 edge case). The Arabic error message "لا يمكن تسجيل سجل في المستقبل." is appended to the `errors` array following the existing pattern.

**Alternatives considered**:
- UI-only guard (disable future dates in the date picker) — good UX but not enough; validator must also reject it server-side (or in this case storage-side) defensively
- Dual guard: both UI date picker restriction + validator rule (chosen)

---

## Decision 6: Pagination strategy

**Decision**: No pagination controls. Use CSS `max-height` + `overflow-y: auto` for the table body (native browser scrolling).

**Rationale**: The spec marks pagination as optional (Assumption: "if the list renders acceptably fast with 10,000 records using virtual scrolling or native scroll"). With synchronous in-memory filtering via `computed()`, browser-native scrolling is sufficient for the 10,000-record target. If performance regresses, virtual scrolling can be introduced in Phase 14 without changing the data layer or component API.

**Alternatives considered**:
- Pagination buttons — adds complexity; breaks continuous scroll UX
- Virtual scrolling (CDK) — deferred to Phase 14 Performance Optimization
- Native scroll (chosen) — simplest, re-evaluable later

---

## Decision 7: Duplicate record flow

**Decision**: Duplicate creates a new `draft` object pre-populated from the source record (all fields copied), strips `id`, `createdAt`, `updatedAt`, and opens the modal form in "create" mode with the draft as the initial value.

**Rationale**: This matches the spec clarification: "Duplicate copies all fields and opens the edit form pre-filled, allowing the user to adjust before saving." The form component already distinguishes create vs. edit by the presence/absence of a record `id`. Passing a pre-filled draft with no `id` triggers create mode.

---

## Technical Unknowns Resolved

| Unknown | Resolution |
|---------|-----------|
| Form presentation mechanism | Angular CDK Dialog |
| History list layout | Custom HTML table |
| State management for filters | Angular `signal` + `computed` |
| Delete confirmation UX | Inline row-level confirm/cancel |
| Future-date validation | Extend existing validator |
| Pagination | Deferred — native scroll for now |
