import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatternAnalyticsService } from '../../services/pattern-analytics.service';
import { WeekdayChartComponent } from '../weekday-chart/weekday-chart.component';

@Component({
  selector: 'app-weekday-chart-card',
  standalone: true,
  imports: [CommonModule, WeekdayChartComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-weekday-chart [weekdays]="weekdays()" [status]="cardState()"></app-weekday-chart>`,
})
export class WeekdayChartCardComponent {
  service = inject(PatternAnalyticsService);
  cardState = computed(() => this.service.state().status);
  weekdays = computed(() => this.service.state().weekdays);
}
