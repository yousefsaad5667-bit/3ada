import { Component, Input , ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TriggerStatus, TriggerSummaryView } from '../../models/trigger-view.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-trigger-summary-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trigger-summary-card.component.html',
  styleUrl: './trigger-summary-card.component.scss'
})
export class TriggerSummaryCardComponent {
  @Input({ required: true }) summary: TriggerSummaryView = {
    totalKeywordCount: 0,
    totalOccurrences: 0,
    topTrigger: null,
    highestUrgeKeyword: null,
    highestAvgUrge: null,
    rareTriggersCount: 0,
    triggerlessRecordCount: 0
  };
  @Input({ required: true }) status: TriggerStatus = 'loading';
}
