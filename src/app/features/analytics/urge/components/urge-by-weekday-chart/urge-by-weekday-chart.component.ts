import { Component, Input , ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UrgeWeekdayEntry } from '../../../../../core/analytics/models/analytics.types';
import { BarChartComponent } from '../../../../../shared/components/charts/bar-chart/bar-chart.component';
import { ChartDataSeries, ChartConfig } from '../../../../../shared/components/charts/models/chart.models';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-urge-by-weekday-chart',
  standalone: true,
  imports: [CommonModule, BarChartComponent],
  templateUrl: './urge-by-weekday-chart.component.html',
  styleUrls: ['./urge-by-weekday-chart.component.scss']
})
export class UrgeByWeekdayChartComponent {
  @Input({ required: true }) byWeekday: UrgeWeekdayEntry[] = [];

  get chartSeries(): ChartDataSeries[] {
    if (!this.byWeekday?.length) return [];
    return [{
      label: 'متوسط الرغبة',
      data: this.byWeekday.map(item => ({
        label: item.labelAr,
        value: item.avgUrge,
      })),
    }];
  }

  get chartConfig(): ChartConfig {
    return {
      titleAr: 'متوسط الرغبة حسب اليوم',
      yAxisLabelAr: 'متوسط الرغبة',
      exportFilename: 'urge_by_weekday',
    };
  }
}
