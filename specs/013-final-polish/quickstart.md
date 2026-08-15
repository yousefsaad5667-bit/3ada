# Quickstart: Final Polish Implementation Guide

**Feature**: `013-final-polish` | **Branch**: `014-final-polish`
**Date**: 2026-08-15

---

## Prerequisites

- Angular 19, `@angular/cdk` already installed (no new `npm install` needed)
- Dev server running: `npm start` (port 4200)
- Branch: `014-final-polish`

---

## Implementation Order

Work in this sequence — each step is independently testable:

### Step 1 — Design System Tokens (15 min)

**File**: `src/styles/_variables.scss`

Add animation tokens and breakpoint variables:

```scss
// Breakpoints (add after existing spacing vars)
$bp-mobile:  767px;
$bp-tablet:  1023px;

// Animation tokens (add after transition vars)
--animation-entrance: 300ms cubic-bezier(0.16, 1, 0.3, 1);
--animation-micro:    150ms ease-out;
```

**File**: `src/styles.scss`

Add global rules at end:

```scss
// Accessibility: focus indicator
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

// Accessibility: min touch targets
button, a, [role="button"], input, select, textarea {
  min-height: 44px;
  min-width: 44px;
}

// Reduced motion
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Verify**: All existing styles still apply. No visual regression.

---

### Step 2 — Dark Mode OS-Preference Fix (10 min)

**File**: `src/app/core/services/theme.service.ts`

```typescript
initialize(): void {
  const stored = this.storage.get<unknown>(STORAGE_KEYS.THEME);
  if (isAppTheme(stored)) {
    this.setTheme(stored);
  } else {
    // Respect OS preference when no stored value
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.setTheme(prefersDark ? 'dark' : 'light');
    // Subscribe to live OS changes
    window.matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', e => {
        if (!this.storage.get<unknown>(STORAGE_KEYS.THEME)) {
          this.setTheme(e.matches ? 'dark' : 'light');
        }
      });
  }
}
```

**Verify**: Open incognito (no stored theme), set OS to light mode → app opens in light mode.

---

### Step 3 — Error Handling Infrastructure (30 min)

1. **Model**: Create `src/app/core/models/app-error.model.ts`
2. **Service**: Create `src/app/core/services/app-error-handler.service.ts` implementing `ErrorHandler`
3. **Component**: Create `src/app/shared/components/error-page/error-page.component.ts`
4. **Register**: In `app.config.ts`, replace default `ErrorHandler`:
   ```typescript
   providers: [
     { provide: ErrorHandler, useClass: AppErrorHandler },
     ...
   ]
   ```
5. **Wire**: In `app.component.html`:
   ```html
   @if (errorHandler.hasCriticalError()) {
     <app-error-page />
   } @else {
     <app-shell />
   }
   ```

**Verify**: Manually call `errorHandler.handleStorageCorruption()` in browser console → error page appears.

---

### Step 4 — Route Animations (20 min)

1. **Add `provideAnimations()`** to `app.config.ts`
2. **Create animation definition** in `src/app/shared/animations/route-animations.ts`:
   ```typescript
   export const routeAnimations = trigger('routeAnimations', [
     transition('* <=> *', [
       query(':enter', [style({ opacity: 0 }), animate('250ms ease-in', style({ opacity: 1 }))], { optional: true }),
     ]),
   ]);
   ```
3. **Apply to `AppComponent`** template with `[@routeAnimations]` on router-outlet wrapper

**Verify**: Navigate between routes — smooth 250 ms fade. Enable "prefers-reduced-motion" → transitions instant.

---

### Step 5 — Responsive Design Audit (45 min)

For each feature page at 375px viewport:
- Dashboard: cards stack vertically, no horizontal overflow
- Relapses: table scrolls horizontally within container (no page overflow)
- Analytics: charts resize proportionally
- Settings: form fields fill width

Sidebar: already implements mobile drawer — verify touch targets ≥ 44px.

**File pattern**: Add `@media (max-width: #{$bp-mobile})` blocks to each feature's SCSS.

---

### Step 6 — Accessibility Pass (60 min)

- `cdkTrapFocus` on any modal/dialog components (day-detail-popup, record-form)
- Add `aria-live="polite"` containers near form validation error messages
- Add chart accessible summaries (`<p class="sr-only">` with data summary)
- Audit all icon-only buttons for `aria-label`

Add SR-only utility class to `styles.scss`:
```scss
.sr-only {
  position: absolute; width: 1px; height: 1px;
  padding: 0; margin: -1px; overflow: hidden;
  clip: rect(0,0,0,0); white-space: nowrap; border-width: 0;
}
```

---

### Step 7 — SCSS Token Cleanup (30 min)

Replace all hardcoded transition values across SCSS files:
- `0.2s` → `var(--transition-normal)`
- `0.3s` → `var(--transition-slow)`
- `0.1s` → `var(--transition-fast)`

Add ESLint `no-console` rule to prevent future `console.log` regression.

---

## Manual Verification Checklist

| Test | How |
|------|-----|
| Mobile layout 375px | Chrome DevTools → iPhone SE preset |
| Keyboard navigation | Tab through entire app, check focus ring |
| Screen reader | NVDA/VoiceOver + Chrome |
| Dark mode auto | Incognito, OS set to dark/light |
| Reduced motion | Chrome DevTools → Rendering panel → emulate reduced motion |
| Error page | `localStorage.clear()` then reload, or trigger via DevTools |
| Route transitions | Navigate between routes, measure in Performance panel |
| WCAG contrast | Lighthouse accessibility audit |
