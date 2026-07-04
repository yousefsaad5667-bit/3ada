# Implementation Plan: Dashboard Infrastructure

**Branch**: `005-dashboard-infrastructure` | **Date**: 2026-07-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/005-dashboard-infrastructure/spec.md`

---

## Summary

Build the **reusable Angular dashboard shell** — a responsive card-based grid that hosts all current and future analytics visualizations. The shell manages date range filtering (Signal-based, session-only, defaults to Last 7 Days), card layout persistence (order + visibility in LocalStorage), drag-and-drop reordering (Angular CDK, desktop + mobile touch), and per-card state management (loading / empty / error / data). Cards are registered via a descriptor pattern so Phase 6+ modules integrate without modifying the shell. Two placeholder cards are included to validate all infrastructure paths.

---

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode, no `any`) — Angular latest stable

**Primary Dependencies**: `@angular/cdk/drag-drop` (first-party; already available in Angular projects)

**Storage**: LocalStorage via existing `DashboardPreferencesRepository` (`dashboard-prefs` key)

**Testing**: `ng test` (Karma/Jasmine, already configured)

**Target Platform**: Browser — Angular SPA, mobile-first responsive, RTL

**Project Type**: Angular feature module (UI shell + services)

**Performance Goals**: Dashboard layout renders and becomes interactive within 2 seconds for up to 10,000 records; date range switch updates all cards within 1 second (SC-001, SC-002)

**Constraints**: No backend. No APIs. No IndexedDB. CDK only for drag-and-drop. RxJS only if Signals are insufficient.

**Scale/Scope**: Designed to host up to ~15–20 cards; no hard card count limit in the architecture.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| Angular Platform (no backend, no server) | ✅ PASS | Pure Angular + CDK; no external network requests |
| 100% Local-First (LocalStorage only) | ✅ PASS | Layout preferences via existing `DashboardPreferencesRepository`; date filter is session-only |
| Arabic Language & RTL | ✅ PASS | All UI text in Arabic; CDK DragDrop uses bounding-box calculations (RTL-safe); date range labels in Arabic |
| Modern UI (loading/empty/error states) | ✅ PASS | All three states explicitly required and implemented per card via `DashboardCardShellComponent` |
| Performance ≥ 100k records | ✅ PASS | Shell has zero data processing; delegates entirely to the Analytics Engine (Phase 4) |
| Feature-based architecture | ✅ PASS | Lives in `src/app/features/dashboard/`; decoupled from analytics engine via service injection |
| Code Quality (strict typing, no duplication) | ✅ PASS | Descriptor pattern + single generic shell component; no per-card shell code |

**All gates pass. Ready to proceed.**

---

## Project Structure

### Documentation (this feature)

```text
specs/005-dashboard-infrastructure/
├── plan.md              ← This file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/
│   └── dashboard-contracts.md  ← Phase 1 output (UI contracts)
└── tasks.md             ← Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
src/app/features/dashboard/
├── dashboard.component.ts               ← [MODIFY] Shell: wire CDK, card registry, filter, layout
├── dashboard.component.html             ← [MODIFY] CDK drop list grid, date selector, card shells
├── dashboard.component.scss             ← [MODIFY] Responsive RTL grid layout
│
├── models/
│   ├── dashboard-card-descriptor.model.ts   ← [NEW] DashboardCardDescriptor interface
│   └── dashboard-card.model.ts              ← [NEW] DashboardCard view model + CardState type
│
├── services/
│   ├── dashboard-filter.service.ts          ← [NEW] Signal<DateRangeFilter>, default: Last 7 Days
│   └── dashboard-layout.service.ts          ← [NEW] Merges descriptors + prefs → Signal<DashboardCard[]>
│
└── components/
    ├── date-range-selector/
    │   ├── date-range-selector.component.ts    ← [NEW] Preset tabs + custom date inputs
    │   ├── date-range-selector.component.html  ← [NEW]
    │   └── date-range-selector.component.scss  ← [NEW]
    │
    ├── dashboard-card-shell/
    │   ├── dashboard-card-shell.component.ts   ← [NEW] State machine: loading/empty/error/data + hide
    │   ├── dashboard-card-shell.component.html ← [NEW]
    │   └── dashboard-card-shell.component.scss ← [NEW]
    │
    ├── dashboard-card-placeholder/
    │   ├── dashboard-card-placeholder.component.ts   ← [NEW] Hidden tile with "إظهار" button
    │   ├── dashboard-card-placeholder.component.html ← [NEW]
    │   └── dashboard-card-placeholder.component.scss ← [NEW]
    │
    └── placeholder-cards/
        ├── placeholder-card-a/
        │   ├── placeholder-card-a.component.ts   ← [NEW] Dummy card A (exercises all states)
        │   └── placeholder-card-a.component.html ← [NEW]
        └── placeholder-card-b/
            ├── placeholder-card-b.component.ts   ← [NEW] Dummy card B (exercises error isolation)
            └── placeholder-card-b.component.html ← [NEW]

src/app/core/models/
└── dashboard-preferences.model.ts   ← [EXISTING — no changes required]

src/app/core/services/
└── dashboard-preferences.repository.ts   ← [EXISTING — no changes required]

src/app/core/analytics/
└── index.ts   ← [EXISTING — DashboardFilterService imports DatePreset + getDateRangeBounds from here]
```

**Structure Decision**: Dashboard feature lives entirely under `src/app/features/dashboard/`. New models and services are scoped to the feature, not to `core/`, because they are UI-specific (shell state, layout computation). The only `core/` dependency is the existing `DashboardPreferencesRepository` and the analytics engine's `DatePreset` type — both accessed by injection/import without modification.

---

## Verification Plan

### Automated Tests

- `ng test` — unit tests for:
  - `DashboardFilterService`: initial state is Last 7 Days; `setFilter()` updates signal correctly; custom range validation rejects invalid date order.
  - `DashboardLayoutService`: merges descriptors + preferences correctly; stale card IDs in preferences are silently discarded; `hideCard` / `showCard` / `reorderCards` / `resetLayout` all update signal and persist to repository.
  - `DashboardPreferencesRepository` (existing) — corruption fallback (already tested).

### Manual Verification

- Verify grid renders in RTL with no visual artifacts.
- Test drag-and-drop on desktop (mouse) and touch simulation in DevTools.
- Hide card A → verify placeholder tile appears with "إظهار" button → click restore → verify card returns.
- Reset layout → verify original order restored.
- Switch date range presets → verify all cards re-render.
- Corrupt `dashboard-prefs` in localStorage → reload → verify default layout silently applied (no error shown).
- Resize viewport from 320px to 1920px → verify no horizontal scroll.
