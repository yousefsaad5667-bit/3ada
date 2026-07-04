import { Component, computed, inject, signal } from '@angular/core';
import { TimeSeriesAnalyticsService } from '../../services/time-series-analytics.service';
import { TimeSeriesChartComponent } from '../time-series-chart/time-series-chart.component';
import { TimeSeriesTableComponent } from '../time-series-table/time-series-table.component';

@Component({
  selector: 'app-daily-series-card',
  standalone: true,
  imports: [TimeSeriesChartComponent, TimeSeriesTableComponent],
  templateUrl: './daily-series-card.component.html',
  styleUrl: './daily-series-card.component.scss'
})
export class DailySeriesCardComponent {
  private service = inject(TimeSeriesAnalyticsService);

  // Shell Contract
  public readonly cardState = computed(() => this.service.state().status);

  // Component State
  public readonly dataset = computed(() => this.service.state().daily);
  public readonly showTable = signal(false);

  public toggleTable() {
    this.showTable.update(v => !v);
  }
}
