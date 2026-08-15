import { Component, Input , ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DistributionEntry } from '../../../../../core/analytics/models/analytics.types';
import { BarChartComponent } from '../../../../../shared/components/charts/bar-chart/bar-chart.component';
import { ChartDataSeries, ChartConfig } from '../../../../../shared/components/charts/models/chart.models';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-urge-distribution-chart',
  standalone: true,
  imports: [CommonModule, BarChartComponent],
  templateUrl: './urge-distribution-chart.component.html',
  styleUrls: ['./urge-distribution-chart.component.scss']
})
export class UrgeDistributionChartComponent {
  @Input({ required: true }) distribution: DistributionEntry[] = [];

  get chartSeries(): ChartDataSeries[] {
    if (!this.distribution?.length) return [];
    return [{
      label: 'عدد مرات الرغبة',
      data: this.distribution.map(item => ({
        label: `مستوى ${item.label}`,
        value: item.count,
      })),
    }];
  }

  get chartConfig(): ChartConfig {
    return {
      titleAr: 'توزيع شدة الرغبة',
      yAxisLabelAr: 'العدد',
      exportFilename: 'urge_distribution',
    };
  }

  getSeverityLabel(levelStr: string): string {
    const level = parseInt(levelStr, 10);
    if (level >= 1 && level <= 3) return 'خفيف';
    if (level >= 4 && level <= 6) return 'متوسط';
    if (level >= 7 && level <= 10) return 'شديد';
    return '';
  }

  getSeverityClass(levelStr: string): string {
    const level = parseInt(levelStr, 10);
    if (level >= 1 && level <= 3) return 'severity-mild';
    if (level >= 4 && level <= 6) return 'severity-moderate';
    if (level >= 7 && level <= 10) return 'severity-severe';
    return '';
  }
}
