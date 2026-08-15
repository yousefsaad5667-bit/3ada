# UI Contracts: Final Polish

**Feature**: `013-final-polish` | **Branch**: `014-final-polish`
**Date**: 2026-08-15

---

## Overview

This is a browser SPA — the "contracts" are the **public interfaces between components and services** that must remain stable across the implementation. These are UI-layer contracts (Angular component APIs, service interfaces, CSS token contracts).

---

## 1. ThemeService Contract

```typescript
// src/app/core/services/theme.service.ts
class ThemeService {
  // READ-ONLY signal — consumers observe, never set directly
  readonly currentTheme: Signal<AppTheme>;

  // Initializes from localStorage, falls back to OS preference, then 'dark'
  initialize(): void;

  // Toggles between 'dark' and 'light'
  toggleTheme(): void;

  // Sets a specific theme, persists to localStorage, updates DOM attribute
  setTheme(theme: AppTheme): void;
}
```

**Stability**: `currentTheme` signal is read-only by contract. No consumer may write to it directly.

---

## 2. AppErrorHandler Contract

```typescript
// src/app/core/services/app-error-handler.service.ts
class AppErrorHandler implements ErrorHandler {
  // TRUE when a critical unrecoverable error has occurred
  readonly hasCriticalError: Signal<boolean>;

  // The most recent critical error details
  readonly currentError: Signal<AppError | null>;

  // Angular ErrorHandler interface — called by framework on all unhandled errors
  handleError(error: unknown): void;

  // Called by StorageService on JSON parse failures
  handleStorageCorruption(detail?: string): void;
}
```

**Consumers**: `AppComponent` (`@if` render switch), `AppErrorPageComponent` (display details).

---

## 3. AppErrorPageComponent Contract

```
Selector: app-error-page
Inputs:   none (reads AppErrorHandler via injection)
Outputs:  none
Events:
  - "Reset Data" button → localStorage.clear() + location.reload()
```

**Visibility rule**: Only rendered when `AppErrorHandler.hasCriticalError()` is `true`.
**Language**: All user-visible text is in Arabic.

---

## 4. CSS Token Contract (Design System)

All components MUST use only these CSS custom properties for colors — no hardcoded hex values:

| Token | Usage |
|-------|-------|
| `--color-bg-primary` | Page background |
| `--color-bg-secondary` | Section/panel background |
| `--color-bg-card` | Card surfaces |
| `--color-text-primary` | Body text |
| `--color-text-secondary` | Muted/subtext |
| `--color-accent` | Primary interactive color |
| `--color-accent-hover` | Interactive hover state |
| `--color-border` | Borders and dividers |
| `--color-warning-bg` | Warning banners |
| `--color-warning-text` | Warning text |

All components MUST use only these tokens for transitions:

| Token | Duration | Use Case |
|-------|----------|----------|
| `--transition-fast` | 100ms | Micro-interactions, focus rings |
| `--transition-normal` | 200ms | Hover states, toggles |
| `--transition-slow` | 300ms | Page entrance, modals |
| `--animation-entrance` | 300ms | Component first render |
| `--animation-micro` | 150ms | Button press, icon flip |

---

## 5. Responsive Breakpoint Contract

All component SCSS files MUST use the shared SCSS breakpoint variables:

```scss
// Import from _variables.scss (auto-imported via styles.scss)
@media (max-width: #{$bp-mobile}) { /* 767px */ }
@media (max-width: #{$bp-tablet}) { /* 1023px */ }
```

No component may introduce its own hardcoded breakpoint pixel values.

---

## 6. Accessibility Contract

Every interactive element MUST satisfy:

| Requirement | Implementation |
|-------------|---------------|
| Min touch target 44×44px | Global SCSS rule on `button, a, [role="button"]` |
| Visible focus indicator | `:focus-visible` outline using `--color-accent` |
| Accessible label | `aria-label` or associated `<label>` |
| Focus order | Logical DOM order (no `tabindex > 0`) |

Modal dialogs additionally MUST:
- Use `cdkTrapFocus` to contain keyboard focus
- Return focus to the triggering element on close
- Use `role="dialog"` and `aria-modal="true"`

---

## 7. Route Animation Contract

```typescript
// AppComponent template binding
@Component({
  animations: [routeAnimations],
  template: `<router-outlet @routeAnimations />` // pseudocode
})
```

All route transitions MUST:
- Complete within 250 ms (fade opacity 0→1)
- Be disabled when `prefers-reduced-motion: reduce` is active
- Not flash unstyled content between routes
