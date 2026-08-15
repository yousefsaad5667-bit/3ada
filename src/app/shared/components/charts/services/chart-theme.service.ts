// ─────────────────────────────────────────────────────────────────────────────
// chart-theme.service.ts
// Singleton Angular service exposing a reactive `theme` signal.
// Reads the document's data-theme attribute and listens for changes
// via MutationObserver so all chart components can react to dark/light switches.
// ─────────────────────────────────────────────────────────────────────────────
import { Injectable, signal, OnDestroy } from '@angular/core';
import { ChartTheme } from '../models/chart.models';

@Injectable({ providedIn: 'root' })
export class ChartThemeService implements OnDestroy {
  private _theme = signal<ChartTheme>(this.detectTheme());

  /** Reactive signal — `'light'` or `'dark'`. */
  readonly theme = this._theme.asReadonly();

  private observer: MutationObserver | null = null;

  constructor() {
    this.observer = new MutationObserver(() => {
      this._theme.set(this.detectTheme());
    });

    this.observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class'],
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private detectTheme(): ChartTheme {
    const attr = document.documentElement.getAttribute('data-theme');
    if (attr === 'dark') return 'dark';
    // Also check classList for themes applied via CSS class
    if (document.documentElement.classList.contains('dark')) return 'dark';
    return 'light';
  }
}
