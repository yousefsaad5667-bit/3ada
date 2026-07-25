import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TriggerDistributionView, TriggerStatus } from '../../models/trigger-view.model';

@Component({
  selector: 'app-trigger-distribution-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trigger-distribution-chart.component.html',
  styleUrl: './trigger-distribution-chart.component.scss'
})
export class TriggerDistributionChartComponent {
  @Input({ required: true }) distribution: TriggerDistributionView = {
    topTriggers: [],
    otherCount: 0,
    otherPercentage: 0
  };
  @Input({ required: true }) status: TriggerStatus = 'loading';
}
