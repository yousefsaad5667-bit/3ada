import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatternAnalyticsService } from '../../services/pattern-analytics.service';
import { PatternSummaryCardComponent } from '../pattern-summary-card/pattern-summary-card.component';

@Component({
  selector: 'app-pattern-summary-card-wrapper',
  standalone: true,
  imports: [CommonModule, PatternSummaryCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-pattern-summary-card [summary]="summary()" [status]="cardState()"></app-pattern-summary-card>`,
})
export class PatternSummaryCardWrapperComponent {
  service = inject(PatternAnalyticsService);
  cardState = computed(() => this.service.state().status);
  summary = computed(() => this.service.state().summary);
}
