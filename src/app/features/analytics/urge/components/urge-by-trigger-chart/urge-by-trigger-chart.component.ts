import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UrgeTriggerEntry } from '../../../../../core/analytics/models/analytics.types';

@Component({
  selector: 'app-urge-by-trigger-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './urge-by-trigger-chart.component.html',
  styleUrls: ['./urge-by-trigger-chart.component.scss']
})
export class UrgeByTriggerChartComponent {
  @Input({ required: true }) byTrigger: UrgeTriggerEntry[] = [];
}
