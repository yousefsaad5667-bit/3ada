import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatternAnalyticsService } from '../../services/pattern-analytics.service';
import { HourWeekdayHeatmapComponent } from '../hour-weekday-heatmap/hour-weekday-heatmap.component';

@Component({
  selector: 'app-hour-weekday-heatmap-card',
  standalone: true,
  imports: [CommonModule, HourWeekdayHeatmapComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-hour-weekday-heatmap [heatmap]="heatmap()" [status]="cardState()"></app-hour-weekday-heatmap>`,
})
export class HourWeekdayHeatmapCardComponent {
  service = inject(PatternAnalyticsService);
  cardState = computed(() => this.service.state().status);
  heatmap = computed(() => this.service.state().heatmap);
}
