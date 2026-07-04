# UI Contracts: Project Foundation

**Date**: 2026-07-03
**Feature**: [spec.md](spec.md) | [plan.md](plan.md)

## Overview

This application is a client-side SPA with no backend. It exposes no REST/GraphQL APIs.
The "contracts" defined here are internal UI component contracts: the inputs, outputs,
and behavioral guarantees of the shared shell components that all future features depend on.

---

## ThemeService Contract

**Location**: `src/app/core/services/theme.service.ts`

### Public API

```typescript
class ThemeService {
  /** Current active theme (reactive Signal) */
  readonly currentTheme: Signal<AppTheme>;

  /** Toggle between dark and light */
  toggleTheme(): void;

  /** Set a specific theme */
  setTheme(theme: AppTheme): void;

  /** Initialize theme from LocalStorage or default */
  initialize(): void;
}
```

### Behavioral Guarantees

- `currentTheme` MUST reflect the value stored in LocalStorage
- `toggleTheme()` MUST update both the Signal and LocalStorage atomically
- `setTheme()` MUST set `data-theme` attribute on `document.documentElement`
- `initialize()` MUST be called once at application bootstrap
- If LocalStorage is unavailable, theme MUST default to `'dark'` and not throw

---

## StorageService Contract

**Location**: `src/app/core/services/storage.service.ts`

### Public API

```typescript
class StorageService {
  /** Whether LocalStorage is available (reactive Signal) */
  readonly isAvailable: Signal<boolean>;

  /** Get a value from LocalStorage */
  get<T>(key: string): T | null;

  /** Set a value in LocalStorage (no-op if unavailable) */
  set<T>(key: string, value: T): boolean;

  /** Remove a value from LocalStorage */
  remove(key: string): boolean;

  /** Check if a key exists */
  has(key: string): boolean;
}
```

### Behavioral Guarantees

- All keys MUST be prefixed with `AppEnvironment.storageKeyPrefix`
- `get()` MUST return `null` (not throw) if key doesn't exist or storage unavailable
- `set()` MUST return `false` (not throw) if storage unavailable
- `set()` MUST serialize values as JSON
- `get()` MUST deserialize JSON and return typed result
- `isAvailable` MUST be determined at construction time and never re-checked

---

## ShellComponent Contract

**Location**: `src/app/shared/components/shell/`

### Inputs/Outputs

```typescript
@Component({ selector: 'app-shell' })
class ShellComponent {
  /** Array of navigation routes to render in sidebar */
  routes: AppRoute[];

  /** Whether to show the storage warning banner */
  showStorageWarning: Signal<boolean>;
}
```

### Layout Structure

```
┌──────────────────────────────────────────────────────────┐
│ [Storage Warning Banner — conditional]                    │
├──────────────────────────────────────────────────────────┤
│ [Header — theme toggle, app name]                        │
├──────────────────────────┬───────────────────────────────┤
│                          │                               │
│     Main Content         │        Sidebar (RTL: right)   │
│     <router-outlet>      │        Navigation links       │
│                          │                               │
│                          │                               │
└──────────────────────────┴───────────────────────────────┘
```

### Behavioral Guarantees

- Sidebar MUST appear on the right side (RTL start edge)
- Sidebar MUST collapse to hamburger on viewports < 768px
- Active route MUST be visually highlighted in sidebar
- Layout MUST fill 100vh with no body scroll (content area scrolls independently)
- Content area MUST be centered with max-width on ultra-wide screens (> 1920px)

---

## HeaderComponent Contract

**Location**: `src/app/shared/components/header/`

### Inputs/Outputs

```typescript
@Component({ selector: 'app-header' })
class HeaderComponent {
  /** Event emitted when sidebar toggle is clicked (mobile) */
  @Output() sidebarToggle = new EventEmitter<void>();
}
```

### Behavioral Guarantees

- MUST display application name in Arabic (متتبع العادات)
- MUST contain a theme toggle button (dark ↔ light)
- MUST contain a hamburger/menu button on mobile viewports (< 768px)
- Theme toggle MUST provide visual feedback (icon swap + transition)

---

## StorageWarningComponent Contract

**Location**: `src/app/shared/components/storage-warning/`

### Behavioral Guarantees

- MUST display an Arabic warning message when LocalStorage is unavailable
- MUST be positioned at the top of the page above the header
- MUST be dismissible (user can close it, but it reappears on page reload)
- MUST NOT block navigation or reading of the application
- Message: "التخزين المحلي غير متوفر. لن يتم حفظ بياناتك."
  (Local storage is unavailable. Your data will not be saved.)

---

## Design Token Contract

**Location**: `src/styles/_variables.scss`, `src/styles/_themes.scss`

### Token Categories

All components MUST use these tokens — never hard-coded values:

| Token | Dark Value | Light Value |
|---|---|---|
| `--color-bg-primary` | `#0f172a` | `#ffffff` |
| `--color-bg-secondary` | `#1e293b` | `#f1f5f9` |
| `--color-bg-card` | `#1e293b` | `#ffffff` |
| `--color-text-primary` | `#f8fafc` | `#0f172a` |
| `--color-text-secondary` | `#94a3b8` | `#475569` |
| `--color-accent` | `#6366f1` | `#4f46e5` |
| `--color-accent-hover` | `#818cf8` | `#6366f1` |
| `--color-border` | `#334155` | `#e2e8f0` |
| `--color-warning-bg` | `#78350f` | `#fef3c7` |
| `--color-warning-text` | `#fbbf24` | `#92400e` |

### Spacing Scale

| Token | Value |
|---|---|
| `--spacing-xs` | `4px` |
| `--spacing-sm` | `8px` |
| `--spacing-md` | `16px` |
| `--spacing-lg` | `24px` |
| `--spacing-xl` | `32px` |
| `--spacing-2xl` | `48px` |
| `--spacing-3xl` | `64px` |

### Typography

| Token | Value |
|---|---|
| `--font-family` | `'Cairo', sans-serif` |
| `--font-size-xs` | `12px` |
| `--font-size-sm` | `14px` |
| `--font-size-md` | `16px` |
| `--font-size-lg` | `20px` |
| `--font-size-xl` | `24px` |
| `--font-size-2xl` | `32px` |
| `--line-height-tight` | `1.25` |
| `--line-height-normal` | `1.5` |
| `--line-height-relaxed` | `1.75` |
