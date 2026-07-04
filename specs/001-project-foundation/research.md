# Research: Project Foundation

**Date**: 2026-07-03
**Feature**: [spec.md](spec.md) | [plan.md](plan.md)

## Overview

All technical decisions for the Project Foundation phase were resolved during the
specification and clarification stages. No NEEDS CLARIFICATION markers remain. This
research document consolidates the key technology and design decisions with rationale.

---

## Decision 1: Angular Version

**Decision**: Angular 19.x (latest stable at time of implementation)

**Rationale**: Constitution mandates "latest stable version." Angular 19 supports standalone
components natively, has mature Signals API, and improved build performance with esbuild.

**Alternatives considered**:
- Angular 18: Still supported but lacks latest Signals improvements
- Angular 17: Missing standalone component defaults and Signal-based inputs

---

## Decision 2: Arabic Font — Cairo

**Decision**: Cairo font family, self-hosted in WOFF2 format

**Rationale**: Cairo is the most popular open-source Arabic web font. It has excellent
readability on screens, supports Arabic and Latin characters (for mixed content like route
URLs), and has a full weight range (Regular 400, SemiBold 600, Bold 700). WOFF2 provides
the best compression for web fonts.

**Alternatives considered**:
- Tajawal: Good Arabic support but narrower weight range
- Noto Naskh Arabic: More traditional Naskh style, less suitable for modern dashboard UI
- IBM Plex Arabic: Good quality but larger file size and less widespread
- Amiri: Naskh-style, better for print/long text than dashboard UI

**File sizes (estimated)**:
- cairo-regular.woff2: ~30 KB (Arabic subset)
- cairo-semibold.woff2: ~30 KB (Arabic subset)
- cairo-bold.woff2: ~30 KB (Arabic subset)
- Total: ~90 KB (well within performance budget)

---

## Decision 3: Design Token System

**Decision**: SCSS variables compiled to CSS custom properties, organized in partial files

**Rationale**: CSS custom properties enable runtime theme switching without recompilation.
SCSS partials provide developer ergonomics (nesting, mixins for responsive breakpoints).
This hybrid approach gives both compile-time safety and runtime flexibility.

**Token categories**:
- Colors: `--color-bg-primary`, `--color-text-primary`, `--color-accent`, etc.
- Spacing: `--spacing-xs` through `--spacing-3xl` (4px, 8px, 12px, 16px, 24px, 32px, 48px)
- Typography: `--font-family`, `--font-size-sm/md/lg/xl`, `--line-height-tight/normal/relaxed`
- Borders: `--border-radius-sm/md/lg`, `--border-color`
- Shadows: `--shadow-sm/md/lg`
- Transitions: `--transition-fast/normal/slow`

**Theme switching mechanism**: Toggle a `data-theme="dark|light"` attribute on `<html>`.
CSS custom properties are scoped under `[data-theme="dark"]` and `[data-theme="light"]`
selectors. `ThemeService` reads/writes the preference to LocalStorage and toggles the
attribute.

**Alternatives considered**:
- Tailwind CSS: User constitution specifies SCSS; Tailwind not requested
- CSS-in-JS: Not idiomatic in Angular
- Static SCSS theme files with recompilation: Cannot switch at runtime

---

## Decision 4: ESLint Configuration

**Decision**: `@angular-eslint` with strict TypeScript rules

**Rationale**: `@angular-eslint` is the official ESLint integration for Angular, replacing
the deprecated TSLint. It provides Angular-specific rules (component selector naming,
template accessibility) alongside TypeScript strict rules.

**Key rules**:
- `@typescript-eslint/strict-type-checked`: Maximum type safety
- `@angular-eslint/component-selector`: Enforce `app-` prefix with kebab-case
- `@angular-eslint/prefer-standalone`: Enforce standalone components
- `@angular-eslint/prefer-signals`: Recommend Signals over Subject/BehaviorSubject where applicable
- `no-any`: Disallow `any` type

**Alternatives considered**:
- TSLint: Deprecated, no longer maintained
- Biome: Promising but lacks Angular-specific rules

---

## Decision 5: Prettier Configuration

**Decision**: Prettier with Angular-compatible settings, enforced on save

**Rationale**: Prettier ensures consistent formatting across all contributors without
style debates. Angular projects benefit from HTML template formatting support.

**Configuration**:
```json
{
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2,
  "semi": true,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "overrides": [
    {
      "files": "*.html",
      "options": { "parser": "angular" }
    }
  ]
}
```

---

## Decision 6: Routing Strategy

**Decision**: Lazy-loaded routes per feature, with `loadComponent` for standalone components

**Rationale**: Lazy loading ensures the initial bundle contains only the shell and active
route. Each feature loads its own component tree on navigation, keeping the initial payload
small. `loadComponent` is the Angular 19 idiomatic approach for standalone component routing.

**Route configuration approach**:
- `app.routes.ts` defines top-level routes with `loadComponent`
- Analytics sub-routes grouped under `/analytics` parent with child route config
- Wildcard `**` catches undefined routes and renders the 404 component

---

## Decision 7: LocalStorage Availability Detection

**Decision**: Check at application bootstrap via a `StorageService`

**Rationale**: A simple try/catch write+read+delete test in the `StorageService` constructor
determines availability. Result is cached as a Signal (`storageAvailable: Signal<boolean>`).
The `StorageWarningComponent` conditionally renders based on this signal.

**Detection approach**:
```
try:
  localStorage.setItem('__storage_test__', '1')
  localStorage.removeItem('__storage_test__')
  return true
catch:
  return false
```

---

## Decision 8: Responsive Shell Layout

**Decision**: CSS Grid-based layout with collapsible sidebar

**Rationale**: CSS Grid provides the most flexible two-dimensional layout for a
header + sidebar + content arrangement. The sidebar collapses to a hamburger menu on
mobile (< 768px). Grid areas make it straightforward to rearrange layout at breakpoints.

**Breakpoints**:
- Mobile: 320px – 767px (sidebar collapsed, hamburger menu)
- Tablet: 768px – 1023px (sidebar narrow, icons only)
- Desktop: 1024px – 2560px (sidebar expanded with labels)

**RTL considerations**: `grid-template-columns` naturally reverses in RTL when using
logical properties. Sidebar appears on the right side (start edge in RTL).

---

## All NEEDS CLARIFICATION Resolved

No outstanding unknowns. Ready for Phase 1: Design & Contracts.
