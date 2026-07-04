# Quickstart: Dashboard Infrastructure

**Feature**: `005-dashboard-infrastructure`
**Date**: 2026-07-04

---

## What This Phase Delivers

A complete, reusable dashboard shell that:
- Renders cards in a responsive drag-and-drop grid (Arabic/RTL)
- Controls analytics time window via a date range selector
- Persists card order and visibility to LocalStorage
- Handles loading, empty, error, and data states per card

After this phase: Phase 6+ analytics features simply create a card component + descriptor and register it — the shell requires zero changes.

---

## Source Tree

```
src/app/features/dashboard/
├── dashboard.component.ts          ← Shell: renders card grid, hosts date selector
├── dashboard.component.html
├── dashboard.component.scss
│
├── models/
│   ├── dashboard-card-descriptor.model.ts   ← DashboardCardDescriptor interface
│   └── dashboard-card.model.ts              ← DashboardCard runtime view model + CardState
│
├── services/
│   ├── dashboard-filter.service.ts          ← Signal<DateRangeFilter>, default: Last 7 Days
│   └── dashboard-layout.service.ts          ← Merges descriptors + prefs → Signal<DashboardCard[]>
│
└── components/
    ├── date-range-selector/
    │   ├── date-range-selector.component.ts
    │   ├── date-range-selector.component.html
    │   └── date-range-selector.component.scss
    │
    ├── dashboard-card-shell/
    │   ├── dashboard-card-shell.component.ts   ← Wraps card: loading/empty/error/data states + hide button
    │   ├── dashboard-card-shell.component.html
    │   └── dashboard-card-shell.component.scss
    │
    ├── dashboard-card-placeholder/
    │   ├── dashboard-card-placeholder.component.ts  ← Hidden card tile + "إظهار" button
    │   ├── dashboard-card-placeholder.component.html
    │   └── dashboard-card-placeholder.component.scss
    │
    └── placeholder-cards/
        ├── placeholder-card-a/
        │   ├── placeholder-card-a.component.ts  ← Dummy card A (validates infrastructure)
        │   └── placeholder-card-a.component.html
        └── placeholder-card-b/
            ├── placeholder-card-b.component.ts  ← Dummy card B (validates infrastructure)
            └── placeholder-card-b.component.html
```

---

## Key Service Interactions

```
User selects date range
    → DateRangeSelectorComponent.onPresetSelect(preset)
        → DashboardFilterService.setFilter(filter)
            → activeFilter signal updates
                → all card components react (computed signals)

User drags card to new slot
    → DashboardComponent CDK drop event
        → DashboardLayoutService.reorderCards(newIdOrder)
            → DashboardPreferencesRepository.update({ cardOrder })
                → Signal<DashboardCard[]> recomputes
                    → @for re-renders grid

User clicks hide on card header
    → DashboardCardShellComponent emits hideCard event
        → DashboardComponent → DashboardLayoutService.hideCard(id)
            → card becomes hidden; placeholder tile renders

User clicks "إظهار" on placeholder tile
    → DashboardCardPlaceholderComponent emits showCard event
        → DashboardComponent → DashboardLayoutService.showCard(id)
            → placeholder removed; card renders
```

---

## Registering a New Card (Phase 6+ Guide)

1. Create your card component in `src/app/features/dashboard/components/` or in your feature module.
2. Expose `cardState: Signal<CardState>` on the component class.
3. Inject `DashboardFilterService` to read the active date range.
4. Create a `DashboardCardDescriptor` object:

```typescript
export const MY_CARD_DESCRIPTOR: DashboardCardDescriptor = {
  id: 'my-card',
  titleAr: 'بطاقتي',
  component: MyCardComponent,
  defaultOrder: 2,
};
```

5. Add the descriptor to the registry array in `DashboardComponent.CARD_REGISTRY`.

That is the complete integration path — no shell code changes required.

---

## Constitution Compliance Notes

| Principle | Compliance |
|---|---|
| Angular-only (no backend) | ✅ Pure Angular + CDK; no external requests |
| 100% LocalStorage | ✅ Preferences via `DashboardPreferencesRepository` |
| Arabic / RTL | ✅ All UI text in Arabic; CDK DragDrop is RTL-safe |
| Modern UI (loading/empty/error states) | ✅ Explicitly built into `DashboardCardShellComponent` |
| Performance (100k records) | ✅ Shell has no data processing; cards delegate to analytics engine |
| Feature-based architecture | ✅ Lives in `features/dashboard/`; shell → engine decoupled |
| Reusable components | ✅ `DashboardCardShellComponent` is the single generic wrapper |
