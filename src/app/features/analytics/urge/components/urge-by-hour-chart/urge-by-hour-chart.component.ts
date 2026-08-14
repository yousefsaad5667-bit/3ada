import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UrgeHourEntry } from '../../../../../core/analytics/models/analytics.types';
import { BarChartComponent } from '../../../../../shared/components/charts/bar-chart/bar-chart.component';
import { ChartDataSeries, ChartConfig } from '../../../../../shared/components/charts/models/chart.models';

@Component({
  selector: 'app-urge-by-hour-chart',
  standalone: true,
  imports: [CommonModule, BarChartComponent],
  templateUrl: './urge-by-hour-chart.component.html',
  styleUrls: ['./urge-by-hour-chart.component.scss']
})
export class UrgeByHourChartComponent {
  @Input({ required: true }) byHour: UrgeHourEntry[] = [];

  get chartSeries(): ChartDataSeries[] {
    if (!this.byHour?.length) return [];
    return [{
      label: 'متوسط الرغبة',
      data: this.byHour.map(item => ({
        label: item.label,
        value: item.avgUrge,
      })),
    }];
  }

  get chartConfig(): ChartConfig {
    return {
      titleAr: 'متوسط الرغبة حسب الساعة',
      yAxisLabelAr: 'متوسط الرغبة',
      exportFilename: 'urge_by_hour',
    };
  }
}
