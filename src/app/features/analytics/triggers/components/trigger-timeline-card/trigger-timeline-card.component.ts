import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TriggerAnalyticsService } from '../../services/trigger-analytics.service';
import { TriggerTimelineComponent } from '../trigger-timeline/trigger-timeline.component';

@Component({
  selector: 'app-trigger-timeline-card',
  standalone: true,
  imports: [CommonModule, TriggerTimelineComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-trigger-timeline [trend]="trend()" [status]="cardState()"></app-trigger-timeline>`,
})
export class TriggerTimelineCardComponent {
  service = inject(TriggerAnalyticsService);
  cardState = computed(() => this.service.state().status);
  trend = this.service.triggerTrend;
}
