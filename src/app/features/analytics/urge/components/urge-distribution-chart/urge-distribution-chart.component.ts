import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/core';
import { DistributionEntry } from '../../../../core/analytics/models/analytics.types';

@Component({
  selector: 'app-urge-distribution-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './urge-distribution-chart.component.html',
  styleUrls: ['./urge-distribution-chart.component.scss']
})
export class UrgeDistributionChartComponent {
  @Input({ required: true }) distribution: DistributionEntry[] = [];

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
