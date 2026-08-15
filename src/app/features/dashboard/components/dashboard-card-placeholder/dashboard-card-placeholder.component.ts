import { Component, Input, Output, EventEmitter , ChangeDetectionStrategy } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-dashboard-card-placeholder',
  standalone: true,
  template: `
    <div class="placeholder-tile">
      <span class="title">{{ titleAr }}</span>
      <button class="show-btn" (click)="onShow()">إظهار</button>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
    .placeholder-tile {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.25rem;
      background-color: var(--surface-color, #ffffff);
      border: 1px dashed var(--border-color, #e0e0e0);
      border-radius: var(--border-radius-lg, 12px);
      color: var(--text-secondary, #666666);
      height: 100%;
      min-height: 80px;
    }
    .title {
      font-weight: 600;
    }
    .show-btn {
      background-color: var(--primary-color, #1976d2);
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      font-family: inherit;
      transition: background-color 0.2s ease;
      
      &:hover {
        background-color: var(--primary-color-dark, #115293);
      }
    }
    [data-theme='dark'] .placeholder-tile {
      background-color: var(--surface-color-dark, #1e1e1e);
      border-color: var(--border-color-dark, #333333);
      color: var(--text-secondary-dark, #aaaaaa);
    }
  `]
})
export class DashboardCardPlaceholderComponent {
  @Input({ required: true }) titleAr!: string;
  @Output() showCard = new EventEmitter<void>();

  onShow() {
    this.showCard.emit();
  }
}
