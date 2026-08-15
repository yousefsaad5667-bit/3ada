import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TriggerAnalyticsService } from '../../services/trigger-analytics.service';
import { TriggerDistributionChartComponent } from '../trigger-distribution-chart/trigger-distribution-chart.component';

@Component({
  selector: 'app-trigger-distribution-card',
  standalone: true,
  imports: [CommonModule, TriggerDistributionChartComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-trigger-distribution-chart [distribution]="distribution()" [status]="cardState()"></app-trigger-distribution-chart>`,
})
export class TriggerDistributionCardComponent {
  service = inject(TriggerAnalyticsService);
  cardState = computed(() => this.service.state().status);
  distribution = computed(() => this.service.state().distribution);
}
