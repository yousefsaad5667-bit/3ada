import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UrgeWeekdayEntry } from '../../../../../core/analytics/models/analytics.types';

@Component({
  selector: 'app-urge-by-weekday-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './urge-by-weekday-chart.component.html',
  styleUrls: ['./urge-by-weekday-chart.component.scss']
})
export class UrgeByWeekdayChartComponent implements OnChanges {
  @Input({ required: true }) byWeekday: UrgeWeekdayEntry[] = [];
  
  highestAvg: number | null = null;
  hasData: boolean = false;

  ngOnChanges(): void {
    let max = 0;
    this.hasData = false;
    for (const item of this.byWeekday) {
      if (item.avgUrge !== null) {
        this.hasData = true;
        if (item.avgUrge > max) {
          max = item.avgUrge;
        }
      }
    }
    this.highestAvg = this.hasData && max > 0 ? max : null;
  }
}
