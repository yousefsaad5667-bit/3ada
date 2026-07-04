import { Component, computed, inject, signal } from '@angular/core';
import { TimeSeriesAnalyticsService } from '../../services/time-series-analytics.service';
import { TimeSeriesChartComponent } from '../time-series-chart/time-series-chart.component';
import { TimeSeriesTableComponent } from '../time-series-table/time-series-table.component';

@Component({
  selector: 'app-period-series-card',
  standalone: true,
  imports: [TimeSeriesChartComponent, TimeSeriesTableComponent],
  templateUrl: './period-series-card.component.html',
  styleUrl: './period-series-card.component.scss'
})
export class PeriodSeriesCardComponent {
  private service = inject(TimeSeriesAnalyticsService);

  // Shell Contract
  public readonly cardState = computed(() => this.service.state().status);

  // Local State
  public selectedGrouping = signal<'weekly' | 'monthly'>('weekly');

  public readonly dataset = computed(() => {
    const state = this.service.state();
    return this.selectedGrouping() === 'weekly' ? state.weekly : state.monthly;
  });

  public readonly showTable = signal(false);

  public toggleTable() {
    this.showTable.update(v => !v);
  }

  setGrouping(grouping: 'weekly' | 'monthly'): void {
    this.selectedGrouping.set(grouping);
  }
}
