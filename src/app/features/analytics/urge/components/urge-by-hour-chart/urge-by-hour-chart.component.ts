import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UrgeHourEntry } from '../../../../../core/analytics/models/analytics.types';

@Component({
  selector: 'app-urge-by-hour-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './urge-by-hour-chart.component.html',
  styleUrls: ['./urge-by-hour-chart.component.scss']
})
export class UrgeByHourChartComponent implements OnChanges {
  @Input({ required: true }) byHour: UrgeHourEntry[] = [];
  
  sortedByHour: UrgeHourEntry[] = [];
  highestAvg: number | null = null;

  ngOnChanges(): void {
    this.sortedByHour = [...this.byHour].sort((a, b) => {
      if (a.avgUrge === null && b.avgUrge === null) return 0;
      if (a.avgUrge === null) return 1;
      if (b.avgUrge === null) return -1;
      return b.avgUrge - a.avgUrge;
    });

    this.highestAvg = this.sortedByHour.length > 0 ? this.sortedByHour[0].avgUrge : null;
  }
}
