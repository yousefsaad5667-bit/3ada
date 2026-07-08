import { Component, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarAnalyticsService } from '../../services/calendar-analytics.service';

@Component({
  selector: 'app-day-summary-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './day-summary-card.component.html',
  styleUrl: './day-summary-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DaySummaryCardComponent {
  private service = inject(CalendarAnalyticsService);

  // Shell Contract
  public readonly cardState = computed(() => this.service.state().status);

  // Component State
  public readonly detail = computed(() => this.service.state().selectedDay);
  public readonly emptyPromptAr = 'انقر على أي يوم في التقويم أو الخريطة الحرارية لعرض ملخصه هنا.';
}
