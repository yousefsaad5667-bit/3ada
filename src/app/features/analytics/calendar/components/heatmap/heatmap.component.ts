import { Component, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarDay } from '../../models/calendar-view.model';
import { CalendarAnalyticsService } from '../../services/calendar-analytics.service';

@Component({
  selector: 'app-heatmap',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './heatmap.component.html',
  styleUrl: './heatmap.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeatmapComponent {
  private service = inject(CalendarAnalyticsService);

  // Shell Contract
  public readonly cardState = computed(() => this.service.state().status);

  // Component State
  public readonly grid = computed(() => this.service.state().heatmapGrid);
  public readonly emptyMessageAr = 'لا توجد بيانات متاحة';

  onDayClick(day: CalendarDay): void {
    if (day.isInActiveRange) {
      this.service.setSelectedDate(day.date);
    }
  }

  onKeyDown(event: KeyboardEvent, day: CalendarDay): void {
    if ((event.key === 'Enter' || event.key === ' ') && day.isInActiveRange) {
      event.preventDefault();
      this.service.setSelectedDate(day.date);
    }
  }

  getTooltip(day: CalendarDay): string {
    return `${day.count} انتكاسات في ${day.date}`;
  }
}
