import { Component , ChangeDetectionStrategy } from '@angular/core';

/**
 * T006 — ChartLoadingSkeletonComponent
 * Reusable pulsing grey rectangle sized to container.
 * Used by all chart types while data is loading.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-chart-loading-skeleton',
  standalone: true,
  template: `<div class="chart-skeleton"></div>`,
  styles: [`
    .chart-skeleton {
      width: 100%;
      height: 100%;
      min-height: 200px;
      border-radius: 0.5rem;
      background: linear-gradient(
        90deg,
        var(--color-skeleton-base, #e5e7eb) 25%,
        var(--color-skeleton-shimmer, #f3f4f6) 50%,
        var(--color-skeleton-base, #e5e7eb) 75%
      );
      background-size: 200% 100%;
      animation: skeleton-shimmer 1.5s ease-in-out infinite;
    }

    @keyframes skeleton-shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    /* Dark mode overrides */
    :host-context([data-theme="dark"]) .chart-skeleton {
      --color-skeleton-base: #374151;
      --color-skeleton-shimmer: #4b5563;
    }
  `]
})
export class ChartLoadingSkeletonComponent {}
