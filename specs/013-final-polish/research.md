# Research: Final Polish

**Feature**: `013-final-polish` | **Branch**: `014-final-polish`
**Date**: 2026-08-15

---

## 1. Responsive Design (FR-001, FR-002)

### Decision
Three explicit media-query tiers, consistent with the existing design system:
- **Mobile**: `max-width: 767px`
- **Tablet**: `768px – 1023px`
- **Desktop**: `≥ 1024px`

SCSS variables `$bp-mobile: 767px` and `$bp-tablet: 1023px` added to `_variables.scss` for use in component SCSS files.

### Rationale
The project already uses `_variables.scss` for tokens. Consistent breakpoint variables across all SCSS files prevent drift. No JS-driven breakpoint library is needed for purely layout-level changes.

### Alternatives Considered
- **Angular CDK `BreakpointObserver`**: adds JS overhead for what is a CSS concern. Rejected.
- **Tailwind CSS**: forbidden by constitution. Rejected.

### Resolved
- *Sidebar mobile pattern*: the existing `ShellComponent` already implements a slide-in drawer with hamburger toggle in the header. Refine the drawer's touch targets and overlay — no redesign.

---

## 2. Accessibility — WCAG 2.1 AA (FR-003 – FR-006, FR-009)

### Decision
- **Focus indicators**: global `:focus-visible` outline using `--color-accent` (2 px solid, 2 px offset).
- **Modal focus trap**: use `cdkTrapFocus` directive from `@angular/cdk/a11y` (already in dep tree via spec 012).
- **ARIA live regions**: `aria-live="polite"` for form validation; `aria-live="assertive"` for critical errors. Implemented via a `LiveAnnouncerService` wrapper or direct `role="status"` containers.
- **Chart text alternatives**: each custom chart wraps a `<details>` or visually-hidden `<p>` with `aria-label` summary.
- **Touch target enforcement**: global SCSS rule enforcing `min-height: 44px; min-width: 44px` on all interactive elements.

### Rationale
`@angular/cdk` is already installed — using `CdkTrapFocus` avoids writing a custom focus-trap. The CDK `LiveAnnouncer` service provides screen-reader announcements without DOM manipulation.

### Resolved
- *Is `@angular/cdk` already installed?* Yes — used for `CdkVirtualScrollViewport` in spec 012.

---

## 3. Dark Mode (FR-007, FR-008)

### Decision
Theme infrastructure is already complete (`ThemeService`, `_themes.scss`, `StorageService`). Two gaps to fix:

1. **OS-preference fallback**: `ThemeService.initialize()` defaults to `'dark'` unconditionally. Fix: check `window.matchMedia('(prefers-color-scheme: dark)').matches` when no stored preference exists.
2. **Live OS-preference updates**: subscribe to `MediaQueryList.addEventListener('change', ...)` so the theme updates if the OS switches while the app is open.

No new infrastructure needed. All custom charts use CSS variables and inherit theme changes automatically.

### Alternatives Considered
- **CSS `color-scheme` property on `:root`**: supplement existing approach for browser-native UI elements (scrollbars, form controls). Accepted as enhancement.

---

## 4. Animations & Transitions (FR-010, FR-011)

### Decision
- **Route transitions**: Angular `@angular/animations` with `trigger('routeAnimations')` in `AppComponent`. Baseline: 250 ms fade (opacity 0→1).
- **Entrance animations**: `fadeInUp` keyframe (translateY 12 px → 0, opacity 0→1, 300 ms) applied to page-level containers.
- **Token standardization**: replace all hardcoded `0.2s`, `0.3s` transition values with `var(--transition-normal)`, `var(--transition-slow)`.
- **New animation tokens**: add to `_variables.scss`:
  - `--animation-entrance: 300ms cubic-bezier(0.16, 1, 0.3, 1)`
  - `--animation-micro: 150ms ease-out`
- **Reduced motion**: single global rule in `styles.scss`:
  ```scss
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
  ```

### Rationale
Angular animations are the idiomatic approach for route transitions. `provideAnimations()` added to `app.config.ts` (required for `BrowserAnimationsModule` equivalent). No third-party animation library needed.

### Alternatives Considered
- **CSS-only route transitions**: Angular router doesn't expose predictable `:enter`/`:leave` CSS hooks. Angular animations API is required for reliable route transitions. Rejected.

---

## 5. Error Handling (FR-012, FR-013, FR-014)

### Decision
Angular 19 has no React-style error boundaries. The canonical Angular pattern:

1. **Global `AppErrorHandler`** (implements `ErrorHandler`) — catches all unhandled JS errors; sets a global `criticalError` signal.
2. **`AppErrorPageComponent`** — rendered in `AppComponent` via `@if (errorHandler.hasCriticalError())` instead of `ShellComponent`. Shows Arabic-language message + "إعادة تعيين البيانات" (Reset Data) button.
3. **Storage-level guard**: `StorageService` wraps `JSON.parse` in `try/catch`; on failure, calls `AppErrorHandler.handleStorageCorruption()`.
4. **Component-level inline error states**: each feature component shows its own empty/error state template (`@if (hasError())`) — preventing one component crash from blanking the whole screen.

### Rationale
A single `ErrorHandler` at root gives full coverage including errors thrown during Angular's change detection, which component-level `try/catch` cannot catch. The signal-based `hasCriticalError` integrates naturally with the existing Signals architecture.

### Resolved
- *Angular error boundary equivalent*: `ErrorHandler` + root-level `@if` is the Angular 19 canonical pattern. Confirmed by Angular documentation.

---

## 6. Code Cleanup (FR-015, FR-016)

### Decision
- **`console.log`**: zero instances found in `src/` (grep confirmed). Add ESLint `no-console` rule as regression guard.
- **TODO comments**: scan during implementation; remove or resolve each one.
- **SCSS token consistency**: replace hardcoded hex colors and raw `px` transition durations with CSS variable references.
- **Icon consistency**: all icons are emoji/inline SVG. No new npm icon library — use existing emoji icons uniformly; document the icon convention.

### Rationale
The codebase is already clean. The main cleanup work is token substitution in SCSS to ensure correct theming in both light and dark modes everywhere.

---

## Decision Summary

| Area | Key Decision | New Artifacts |
|------|-------------|---------------|
| Responsive | 3-tier SCSS breakpoints, refine existing drawer | `_variables.scss` (breakpoint vars) |
| Accessibility | `cdkTrapFocus`, `:focus-visible`, `aria-live`, chart summaries | SCSS global rules |
| Dark Mode | Fix OS-preference fallback; subscribe to live changes | `theme.service.ts` |
| Animations | Angular animations for routes; reduced-motion global rule; token standardization | `styles.scss`, `_variables.scss`, `app.config.ts` |
| Error Handling | `AppErrorHandler` + `AppErrorPageComponent` + storage guard | 2 new TS files, 1 new component |
| Code Cleanup | SCSS token substitution; ESLint `no-console` | `.eslintrc` update |
