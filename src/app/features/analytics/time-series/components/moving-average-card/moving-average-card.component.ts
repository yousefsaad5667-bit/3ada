import { Component, computed, inject , ChangeDetectionStrategy } from '@angular/core';
import { TimeSeriesAnalyticsService } from '../../services/time-series-analytics.service';
import { TimeSeriesChartComponent } from '../time-series-chart/time-series-chart.component';
import { TimeSeriesDatasetView } from '../../models/time-series-view.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-moving-average-card',
  standalone: true,
  imports: [TimeSeriesChartComponent],
  templateUrl: './moving-average-card.component.html',
  styleUrl: './moving-average-card.component.scss'
})
export class MovingAverageCardComponent {
  private service = inject(TimeSeriesAnalyticsService);

  // Shell Contract
  public readonly cardState = computed(() => {
    const state = this.service.state();
    if (state.status === 'data' && !state.movingAverage.hasEnoughData) {
       // Could return empty or data based on how we want to handle it.
       // The dashboard shell will show empty if we return 'empty'.
       // We can return 'data' and handle the "not enough data" state inside our component.
       return 'data';
    }
    return state.status;
  });

  public readonly hasEnoughData = computed(() => this.service.state().movingAverage.hasEnoughData);

  // Map to TimeSeriesDatasetView for the chart component
  public readonly dataset = computed<TimeSeriesDatasetView>(() => {
    const state = this.service.state();
    const ma = state.movingAverage;
    
    return {
      grouping: 'daily',
      rangeStart: state.rangeStart,
      rangeEnd: state.rangeEnd,
      totalCount: 0,
      hasActivity: ma.points.length > 0,
      zeroFilled: true,
      periods: ma.points.map(p => ({
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
