# UI Contracts: Dashboard Infrastructure

**Feature**: `005-dashboard-infrastructure`
**Date**: 2026-07-04

---

## Overview

This document defines the component-level contracts for the Dashboard Infrastructure. These are the public interfaces that Phase 6+ card modules must conform to when integrating with the shell.

---

## Contract 1: `DashboardCardDescriptor` Interface

Every card module MUST export a `DashboardCardDescriptor` object and register it with the dashboard's card registry. This is the only coupling point between the shell and a card feature.

```typescript
interface DashboardCardDescriptor {
  /** Stable, unique string key. Never changes across versions. */
  id: string;

  /** Arabic display title shown in card header and in the hidden placeholder tile. */
  titleAr: string;

  /** Angular standalone component class rendered via NgComponentOutlet. */
  component: Type<unknown>;

  /** Zero-indexed default position in the card grid. Used when user has no saved preference. */
  defaultOrder: number;
}
```

---

## Contract 2: `DashboardCardHostComponent` Inputs

Every concrete card component is rendered inside a `DashboardCardShellComponent` host. The host provides each card with its filter context via Angular's `inject()` — cards MUST NOT accept `@Input()` for the date range; they inject `DashboardFilterService` directly.

```typescript
// DashboardFilterService — injectable contract every card depends on
class DashboardFilterService {
  /** Read-only signal. Cards observe this to know the active filter. */
  readonly activeFilter: Signal<DateRangeFilter>;

  /** Called by the date range selector component only. */
  setFilter(filter: DateRangeFilter): void;
}
```

**Usage in a card component**:
```typescript
@Component({ ... })
export class MyCardComponent {
  private filterService = inject(DashboardFilterService);
  protected filter = this.filterService.activeFilter; // reactive Signal
}
```

---

## Contract 3: `DashboardCardShellComponent` — Visual States

Every card is wrapped in `DashboardCardShellComponent`, which manages the four required visual states. Card components themselves are responsible only for their data content; the shell handles the frame.

| State | Trigger | Shell Behaviour |
|-------|---------|-----------------|
| **Loading** | Card is computing/fetching data | Shows spinner overlay; card content hidden |
| **Data** | Data successfully available | Shows card content; no overlay |
| **Empty** | No records in active date range | Shows Arabic empty-state message + icon |
| **Error** | Data computation failed | Shows Arabic error message + retry button |

Cards signal their state by setting a `Signal<CardState>` on themselves, which the shell reads:

```typescript
type CardState = 'loading' | 'data' | 'empty' | 'error';
```

Cards expose this via a required `cardState` signal property:
```typescript
// Each card component must expose:
cardState: Signal<CardState>;
```

---

## Contract 4: Hidden Card Placeholder Tile

When a card's `visible` property is `false`, the shell renders a **placeholder tile** instead of the card component. The tile is NOT a separate component input — it is fully managed by the shell using the `DashboardCardDescriptor.titleAr` value.

Placeholder tile content:
- Card title (Arabic)
- "إظهار" (Show) button → calls `DashboardLayoutService.showCard(id)`

---

## Contract 5: `DashboardLayoutService` — Public API

```typescript
class DashboardLayoutService {
  /** Current resolved card list (sorted, visibility applied). */
  readonly cards: Signal<DashboardCard[]>;

  /** Move a card to a new position (0-indexed). Persists to LocalStorage. */
  reorderCards(newOrder: string[]): void;

  /** Hide a card. Shows placeholder tile. Persists to LocalStorage. */
  hideCard(id: string): void;

  /** Restore a hidden card. Removes placeholder tile. Persists to LocalStorage. */
  showCard(id: string): void;

  /** Reset card order and visibility to defaults. Persists to LocalStorage. */
  resetLayout(): void;
}
```

---

## Contract 6: `DateRangeFilter` — Selector Output

The date range selector component emits filter changes by calling `DashboardFilterService.setFilter()` directly. There is no `@Output()` event emitter — the service is the boundary.

Valid `DateRangeFilter` object:
```typescript
interface DateRangeFilter {
  preset: DatePreset;       // from core/analytics
  startDate: Date;          // inclusive
  endDate: Date;            // inclusive, must be >= startDate
}
```
