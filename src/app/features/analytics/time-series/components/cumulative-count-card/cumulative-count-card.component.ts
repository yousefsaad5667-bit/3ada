import { Component, computed, inject } from '@angular/core';
import { TimeSeriesAnalyticsService } from '../../services/time-series-analytics.service';
import { TimeSeriesChartComponent } from '../time-series-chart/time-series-chart.component';
import { TimeSeriesDatasetView } from '../../models/time-series-view.model';

@Component({
  selector: 'app-cumulative-count-card',
  standalone: true,
  imports: [TimeSeriesChartComponent],
  templateUrl: './cumulative-count-card.component.html',
  styleUrl: './cumulative-count-card.component.scss'
})
export class CumulativeCountCardComponent {
  private service = inject(TimeSeriesAnalyticsService);

  // Shell Contract
  public readonly cardState = computed(() => this.service.state().status);

  public readonly finalCount = computed(() => this.service.state().cumulative.finalCount);

  // Map to TimeSeriesDatasetView for the chart component
  public readonly dataset = computed<TimeSeriesDatasetView>(() => {
    const state = this.service.state();
    const cum = state.cumulative;
    
    return {
      grouping: 'daily',
      rangeStart: state.rangeStart,
      rangeEnd: state.rangeEnd,
      totalCount: cum.finalCount,
      hasActivity: cum.points.length > 0,
      zeroFilled: true,
      periods: cum.points.map(p => ({
        grouping: 'daily',
        startDate: p.date,
        endDate: p.date,
        anchorDate: p.date,
        labelAr: p.labelAr,
        count: p.value,
        isPartial: false
      }))
    };
  });
}
