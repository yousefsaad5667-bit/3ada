import { Component, Input , ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeekdayBucketView, PatternStatus } from '../../models/pattern-view.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-weekday-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './weekday-chart.component.html',
  styleUrl: './weekday-chart.component.scss'
})
export class WeekdayChartComponent {
  @Input({ required: true }) weekdays: WeekdayBucketView[] = [];
  @Input({ required: true }) status: PatternStatus = 'loading';
}
