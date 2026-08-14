import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/core';
import { UrgeTimeSeriesView } from '../../models/urge-view.model';

@Component({
  selector: 'app-urge-time-series-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './urge-time-series-chart.component.html',
  styleUrls: ['./urge-time-series-chart.component.scss']
})
export class UrgeTimeSeriesChartComponent {
  @Input({ required: true }) timeSeries!: UrgeTimeSeriesView;

  get trendLabel(): string {
    switch (this.timeSeries.trendDirection) {
      case 'increasing': return 'اتجاه صاعد ↑';
      case 'decreasing': return 'اتجاه هابط ↓';
      case 'stable': return 'مستقر →';
      default: return 'لا تتوفر بيانات';
    }
  }

  get trendClass(): string {
    switch (this.timeSeries.trendDirection) {
      case 'increasing': return 'trend-bad'; // Higher urge is bad
      case 'decreasing': return 'trend-good'; // Lower urge is good
      case 'stable': return 'trend-neutral';
      default: return 'trend-neutral';
    }
  }
}
