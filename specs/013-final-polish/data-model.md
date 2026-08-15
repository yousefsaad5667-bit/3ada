# Data Model: Final Polish

**Feature**: `013-final-polish` | **Branch**: `014-final-polish`
**Date**: 2026-08-15

---

## Overview

This is a cross-cutting quality pass — it does not introduce new domain entities or modify existing data schemas. It introduces **configuration models** and **UI error-state models**.

---

## 1. Existing Models (Unchanged)

All domain models in `src/app/core/models/` remain unchanged:
- `RelapseRecord` — habit relapse log entry
- `AppTheme` (`'dark' | 'light'`) — `app-theme.model.ts`
- `StorageKeys` — `storage.constants.ts`

---

## 2. New: AppError Model

```typescript
// src/app/core/models/app-error.model.ts
export type AppErrorType = 'storage-corruption' | 'unhandled-js' | 'parse-failure';

export interface AppError {
  type: AppErrorType;
  message: string;    // Arabic user-facing message — NEVER empty
  timestamp: number;  // Date.now()
  technical?: string; // optional dev detail — NEVER rendered in UI
}
```

**State Transitions**:
```
No Error ──(unhandled exception | storage parse fail)──► Critical Error
Critical Error ──(user clicks Reset Data)──► App Reloaded (localStorage.clear + reload)
```

---

## 3. New: AnimationToken CSS Variables

Defined in `_variables.scss` as CSS custom properties:

```scss
--animation-entrance: 300ms cubic-bezier(0.16, 1, 0.3, 1);
--animation-micro:    150ms ease-out;
```

No persistence. Consumed by all component SCSS files.

---

## 4. New: Breakpoint SCSS Variables

Defined in `_variables.scss`:

```scss
$bp-mobile:  767px;
$bp-tablet:  1023px;
```

Single source of truth for responsive breakpoints. Used with `@media (max-width: #{$bp-mobile})`.

---

## 5. ThemeService — Extended (No Schema Change)

`_currentTheme: signal<AppTheme>` extended with:
- OS-preference detection via `window.matchMedia('(prefers-color-scheme: dark)')`
- Live `change` event subscription on `MediaQueryList`

No new persisted fields. `AppTheme` type unchanged.

---

## Entity Relationship

```
AppError (new)
  └── reported by AppErrorHandler (new service)
  └── displayed by AppErrorPageComponent (new component)
  └── triggered by StorageService (extended try/catch)

AppTheme (existing, logic fix only)
  └── ThemeService → localStorage → data-theme attribute on html

AnimationToken (new CSS vars)
  └── consumed by all component SCSS

BreakpointToken (new SCSS vars)
  └── consumed by all component SCSS
```
