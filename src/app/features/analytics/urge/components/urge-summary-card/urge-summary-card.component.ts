import { Component, Input , ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UrgeSummaryView } from '../../models/urge-view.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-urge-summary-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './urge-summary-card.component.html',
  styleUrls: ['./urge-summary-card.component.scss']
})
export class UrgeSummaryCardComponent {
  @Input({ required: true }) summary!: UrgeSummaryView;
  @Input() excludedCount: number = 0;

  get trendLabel(): string {
    switch (this.summary.trendDirection) {
      case 'increasing': return 'متزايد ↑';
      case 'decreasing': return 'متناقص ↓';
      case 'stable': return 'مستقر →';
      default: return 'لا تتوفر بيانات';
    }
  }

  get trendClass(): string {
    switch (this.summary.trendDirection) {
      case 'increasing': return 'trend-bad'; // Red for urges increasing
      case 'decreasing': return 'trend-good'; // Green for urges decreasing
      case 'stable': return 'trend-neutral';
      default: return 'trend-neutral';
    }
  }
}
