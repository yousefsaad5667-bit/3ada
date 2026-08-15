import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TriggerAnalyticsService } from '../../services/trigger-analytics.service';
import { TriggerRankingListComponent } from '../trigger-ranking-list/trigger-ranking-list.component';

@Component({
  selector: 'app-trigger-ranking-card',
  standalone: true,
  imports: [CommonModule, TriggerRankingListComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-trigger-ranking-list 
    [triggers]="triggers()" 
    [status]="cardState()" 
    [selectedKeyword]="selectedKeyword()"
    (keywordSelected)="service.selectedKeyword.set($event)"
  ></app-trigger-ranking-list>`,
})
export class TriggerRankingCardComponent {
  service = inject(TriggerAnalyticsService);
  cardState = computed(() => this.service.state().status);
  triggers = computed(() => this.service.state().allTriggers);
  selectedKeyword = this.service.selectedKeyword;
}
