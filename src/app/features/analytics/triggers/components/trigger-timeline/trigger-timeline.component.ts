import { Component, Input , ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TriggerStatus, TriggerTrendView } from '../../models/trigger-view.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-trigger-timeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trigger-timeline.component.html',
  styleUrl: './trigger-timeline.component.scss'
})
export class TriggerTimelineComponent {
  @Input({ required: true }) trend: TriggerTrendView | null = null;
  @Input({ required: true }) status: TriggerStatus = 'loading';

  public getMaxCount(): number {
    if (!this.trend?.entries.length) return 0;
    return Math.max(...this.trend.entries.map(e => e.count), 1);
  }

  public getPeakLabel(): string {
    if (!this.trend?.peakDate) return '';
    const entry = this.trend.entries.find(e => e.date === this.trend?.peakDate);
    return entry ? `${entry.labelAr} (${String(entry.count)} مرة)` : this.trend.peakDate;
  }
}
