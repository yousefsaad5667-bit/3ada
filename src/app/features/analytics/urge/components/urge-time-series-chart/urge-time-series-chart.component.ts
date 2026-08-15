import { Component, Input , ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UrgeTimeSeriesView } from '../../models/urge-view.model';
import { LineChartComponent } from '../../../../../shared/components/charts/line-chart/line-chart.component';
import { ChartDataSeries, ChartConfig } from '../../../../../shared/components/charts/models/chart.models';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-urge-time-series-chart',
  standalone: true,
  imports: [CommonModule, LineChartComponent],
  templateUrl: './urge-time-series-chart.component.html',
  styleUrls: ['./urge-time-series-chart.component.scss']
})
export class UrgeTimeSeriesChartComponent {
  @Input({ required: true }) timeSeries!: UrgeTimeSeriesView;

  get trendLabel(): string {
    switch (this.timeSeries.trendDirection) {
      case 'increasing': return 'اتجاه صاعد ↑';
      case 'decreasing': return 'اتجاه هابط ↓';
      case 'stable':     return 'مستقر →';
      default:           return 'لا تتوفر بيانات';
    }
  }

  get trendClass(): string {
    switch (this.timeSeries.trendDirection) {
      case 'increasing': return 'trend-bad';
      case 'decreasing': return 'trend-good';
      case 'stable':     return 'trend-neutral';
      default:           return 'trend-neutral';
    }
  }

  /** Maps UrgeTimeSeriesView → ChartDataSeries[] for the line chart. */
  get chartSeries(): ChartDataSeries[] {
    if (!this.timeSeries?.entries?.length) return [];
    return [
      {
        label: 'متوسط الرغبة اليومي',
        data: this.timeSeries.entries.map(e => ({
          label: e.date,
          value: e.rawUrge,
        })),
      },
      {
        label: 'المتوسط المتحرك (٧ أيام)',
        data: this.timeSeries.entries.map(e => ({
          label: e.date,
          value: e.movingAverageUrge,
        })),
      },
    ];
  }

  get chartConfig(): ChartConfig {
    return {
      titleAr: 'مسار الرغبة بمرور الوقت',
      yAxisLabelAr: 'مستوى الرغبة',
      smooth: true,
      exportFilename: 'urge_time_series',
    };
  }
}
