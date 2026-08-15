import { Component , ChangeDetectionStrategy } from '@angular/core';

/**
 * T005 — ChartEmptyStateComponent
 * Reusable empty-state shown when chart data is empty.
 * Displays Arabic message in both light and dark themes.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-chart-empty-state',
  standalone: true,
  template: `
    <div class="chart-empty-state" dir="rtl">
      <span class="chart-empty-state__icon" aria-hidden="true">📊</span>
      <p class="chart-empty-state__message">لا توجد بيانات للفترة المحددة</p>
    </div>
  `,
  styles: [`
    .chart-empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 3rem 1rem;
      color: var(--color-text-muted, #9ca3af);
      text-align: center;
    }
    .chart-empty-state__icon {
      font-size: 2.5rem;
      opacity: 0.4;
    }
    .chart-empty-state__message {
      font-size: 0.9375rem;
      font-weight: 500;
      margin: 0;
    }
  `]
})
export class ChartEmptyStateComponent {}
