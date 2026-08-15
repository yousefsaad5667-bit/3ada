import { Component, input, output, ElementRef, signal , ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * T007 — ChartCardComponent
 * Card shell providing: title, export button row, and content slot via ng-content.
 * Accepts an exportTarget element reference from the parent chart component.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-chart-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-card" dir="rtl">
      <!-- Header row: title + export buttons -->
      <div class="chart-card__header">
        @if (titleAr()) {
          <h3 class="chart-card__title">{{ titleAr() }}</h3>
        }
        <div class="chart-card__actions">
          <button
            class="chart-card__btn"
            type="button"
            (click)="exportPng.emit()"
            title="تصدير PNG"
            aria-label="تصدير بصيغة PNG">
            تصدير PNG
          </button>
          <button
            class="chart-card__btn chart-card__btn--secondary"
            type="button"
            (click)="exportSvg.emit()"
            title="تصدير SVG"
            aria-label="تصدير بصيغة SVG">
            تصدير SVG
          </button>
        </div>
      </div>

      <!-- Chart content slot -->
      <div class="chart-card__body">
        <ng-content />
      </div>
    </div>
  `,
  styles: [`
    .chart-card {
      background: var(--color-surface, #ffffff);
      border: 1px solid var(--color-border, #e5e7eb);
      border-radius: 0.75rem;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .chart-card__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .chart-card__title {
      font-size: 1rem;
      font-weight: 600;
      color: var(--color-text-primary, #111827);
      margin: 0;
    }

    .chart-card__actions {
      display: flex;
      gap: 0.5rem;
      flex-shrink: 0;
    }

    .chart-card__btn {
      padding: 0.3125rem 0.75rem;
      border-radius: 0.375rem;
      border: 1px solid var(--color-border, #e5e7eb);
      background: var(--color-surface, #ffffff);
      color: var(--color-text-secondary, #6b7280);
      font-size: 0.75rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
      white-space: nowrap;
    }

    .chart-card__btn:hover {
      background: var(--color-primary, #6366f1);
      color: #ffffff;
      border-color: var(--color-primary, #6366f1);
    }

    .chart-card__body {
      position: relative;
      width: 100%;
    }
  `]
})
export class ChartCardComponent {
  titleAr = input<string>('');

  /** Emitted when user clicks "تصدير PNG" */
  exportPng = output<void>();

  /** Emitted when user clicks "تصدير SVG" */
  exportSvg = output<void>();
}
