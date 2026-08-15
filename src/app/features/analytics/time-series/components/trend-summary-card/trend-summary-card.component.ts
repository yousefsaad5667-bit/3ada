import { Component, computed, inject , ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimeSeriesAnalyticsService } from '../../services/time-series-analytics.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-trend-summary-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trend-summary-card.component.html',
  styleUrl: './trend-summary-card.component.scss'
})
export class TrendSummaryCardComponent {
  private service = inject(TimeSeriesAnalyticsService);

  // Shell Contract
  public readonly cardState = computed(() => {
    const state = this.service.state();
    if (state.status === 'data' && state.trend.direction === 'insufficient-data') {
      return 'data'; // We handle the insufficient data display in our template
    }
    return state.status;
  });

  public readonly trend = computed(() => this.service.state().trend);
  public readonly invalidRecordCount = computed(() => this.service.state().invalidRecordCount);

  public readonly trendIcon = computed(() => {
    const dir = this.trend().direction;
    if (dir === 'increasing') return '📈';
    if (dir === 'decreasing') return '📉';
    if (dir === 'stable') return '➡️';
    return '⚠️';
  });
}
