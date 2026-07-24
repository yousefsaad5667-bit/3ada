import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HourBucketView, PatternStatus } from '../../models/pattern-view.model';

@Component({
  selector: 'app-hourly-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hourly-chart.component.html',
  styleUrl: './hourly-chart.component.scss'
})
export class HourlyChartComponent {
  @Input({ required: true }) hours: HourBucketView[] = [];
  @Input({ required: true }) status: PatternStatus = 'loading';
  @Input({ required: true }) skippedCount: number = 0;
}
