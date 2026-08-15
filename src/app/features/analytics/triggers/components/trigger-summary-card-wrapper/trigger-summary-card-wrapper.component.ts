import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TriggerAnalyticsService } from '../../services/trigger-analytics.service';
import { TriggerSummaryCardComponent } from '../trigger-summary-card/trigger-summary-card.component';

@Component({
  selector: 'app-trigger-summary-card-wrapper',
  standalone: true,
  imports: [CommonModule, TriggerSummaryCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-trigger-summary-card [summary]="summary()" [status]="cardState()"></app-trigger-summary-card>`,
})
export class TriggerSummaryCardWrapperComponent {
  service = inject(TriggerAnalyticsService);
  cardState = computed(() => this.service.state().status);
  summary = computed(() => this.service.state().summary);
}
