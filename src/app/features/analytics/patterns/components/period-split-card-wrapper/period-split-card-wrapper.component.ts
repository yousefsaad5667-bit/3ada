import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatternAnalyticsService } from '../../services/pattern-analytics.service';
import { PeriodSplitCardComponent } from '../period-split-card/period-split-card.component';

@Component({
  selector: 'app-period-split-card-wrapper',
  standalone: true,
  imports: [CommonModule, PeriodSplitCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-period-split-card [periodSplit]="periodSplit()" [status]="cardState()"></app-period-split-card>`,
})
export class PeriodSplitCardWrapperComponent {
  service = inject(PatternAnalyticsService);
  cardState = computed(() => this.service.state().status);
  periodSplit = computed(() => this.service.state().periodSplit);
}
