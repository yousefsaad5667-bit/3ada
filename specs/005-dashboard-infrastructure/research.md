# Research: Dashboard Infrastructure

**Feature**: `005-dashboard-infrastructure`
**Date**: 2026-07-04
**Status**: Complete — all decisions resolved

---

## Decision 1: Drag-and-Drop Library

**Decision**: Use **Angular CDK `DragDropModule`** (`@angular/cdk/drag-drop`) for card reordering.

**Rationale**: First-party Angular package — guaranteed compatibility with the project's exact Angular version. Provides native touch event support out of the box (satisfying the touch-drag on mobile requirement). Clean Signal integration. Zero additional `package.json` risk since CDK ships with every Angular installation. RTL layouts are handled natively because CDK uses bounding-box calculations, not hardcoded directionality.

**Alternatives considered**:
- **`sortablejs` / `@sortablejs/ngx-sortablejs`**: Third-party; RTL support needs manual config; extra bundle dependency.
- **`ng-drag-drop`**: Unmaintained for modern Angular versions.
- **Custom pointer-events implementation**: Excessive effort; no benefit over CDK.

---

## Decision 2: Dashboard Filter State — Signal-based Service

**Decision**: A singleton **`DashboardFilterService`** (`providedIn: 'root'`) exposes a writable `Signal<DateRangeFilter>` as the single source of truth for the active date range. Default value on construction: **Last 7 Days** (confirmed by clarification Q4).

**Rationale**: Signals are the Angular-idiomatic reactive primitive per the project Constitution. Root scope eliminates prop-drilling and decouples the date range selector from individual cards. Future cards from Phase 6+ simply inject the service — zero wiring change in the shell. Avoids RxJS (which the Constitution reserves for "when necessary only").

**Alternatives considered**:
- **Component `@Input()` chain**: Violates the reusable shell principle (FR-013).
- **RxJS `BehaviorSubject`**: Unnecessary; Signals are sufficient and preferred.
- **Router query params**: Pollutes the URL; adds unnecessary complexity for a purely local app.

---

## Decision 3: Card Registration Pattern — Descriptor + NgComponentOutlet

**Decision**: Cards are registered as **`DashboardCardDescriptor` objects** — a plain interface containing `id`, `titleAr`, `component` (ComponentRef), and `defaultOrder`. The shell renders them via `@for` with `NgComponentOutlet` for dynamic rendering.

**Rationale**: Keeps `DashboardComponent` fully generic (FR-013) — it never imports concrete card components directly. Adding a Phase 6+ card means only: (1) create the card component, (2) add its descriptor to the registry — zero shell changes. The descriptor-based approach is idiomatic Angular 17+ and plays well with lazy loading in future phases.

**Alternatives considered**:
- **Hardcoded card list in template**: Violates FR-013; blocks extensibility.
- **Angular route-based card registry**: Over-engineering for a local-only single-page app.
- **`ng-content` projection**: Forces shell parent to enumerate children; same extensibility problem as hardcoded list.

---

## Decision 4: Date Range Persistence

**Decision**: The active date range filter is **session-only — not persisted** to LocalStorage. Dashboard always resets to "Last 7 Days" on load. Only card order and visibility (layout preferences) persist via the existing `DashboardPreferencesRepository`.

**Rationale**: Date filter is a session-level interaction. Persisting it risks showing stale temporal context on next open. SC-003 explicitly limits persistence to layout preferences only. Avoids expanding `DashboardPreferencesRepository` scope beyond its current design.

**Alternatives considered**:
- **Persist last-used filter**: Not required by spec; risks confusing users expecting a fresh default context on re-open.

---

## Decision 5: Placeholder Cards for Phase 5

**Decision**: Implement exactly **two placeholder/dummy cards** — `PlaceholderCardAComponent` and `PlaceholderCardBComponent` — to exercise and validate all dashboard infrastructure paths: loading, empty, error, and data states.

**Rationale**: The clarification (Q5) confirms Phase 5 uses dummy cards only; real analytics cards arrive in Phase 6+. Two cards are the minimum to meaningfully test reordering, hiding/restoring, and per-card error isolation (SC-004). They will be removed or replaced when Phase 6 cards land.

**Alternatives considered**:
- **One placeholder card**: Insufficient to test reordering or per-card isolation.
- **Bring forward a Phase 6 card**: Premature; creates scope and dependency risk.
