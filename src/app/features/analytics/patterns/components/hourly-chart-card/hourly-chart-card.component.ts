import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatternAnalyticsService } from '../../services/pattern-analytics.service';
import { HourlyChartComponent } from '../hourly-chart/hourly-chart.component';

@Component({
  selector: 'app-hourly-chart-card',
  standalone: true,
  imports: [CommonModule, HourlyChartComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-hourly-chart [hours]="hours()" [status]="cardState()" [skippedCount]="skippedCount()"></app-hourly-chart>`,
})
export class HourlyChartCardComponent {
  service = inject(PatternAnalyticsService);
  cardState = computed(() => this.service.state().status);
  hours = computed(() => this.service.state().hours);
  skippedCount = computed(() => this.service.state().skippedRecordCount);
}
