import { Component, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarDay } from '../../models/calendar-view.model';
import { CalendarAnalyticsService } from '../../services/calendar-analytics.service';

@Component({
  selector: 'app-monthly-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './monthly-calendar.component.html',
  styleUrl: './monthly-calendar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MonthlyCalendarComponent {
  private service = inject(CalendarAnalyticsService);

  // Shell Contract
  public readonly cardState = computed(() => this.service.state().status);

  // Component State
  public readonly monthGrid = computed(() => this.service.state().currentMonthGrid);
  public readonly selectedDate = computed(() => this.service.state().selectedDate);
  public readonly emptyMessageAr = 'لا توجد نشاطات في هذا الشهر';

  public readonly leadingBlanksArray = computed(() => {
    const grid = this.monthGrid();
    return grid ? new Array(grid.leadingBlanks) : [];
  });

  public readonly trailingBlanksArray = computed(() => {
    const grid = this.monthGrid();
    return grid ? new Array(grid.trailingBlanks) : [];
  });

  onDayClick(day: CalendarDay): void {
    this.service.setSelectedDate(day.date);
  }

  onKeyDown(event: KeyboardEvent, day: CalendarDay): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.service.setSelectedDate(day.date);
    }
  }

  onPreviousMonth(): void {
    this.service.navigateMonth(-1);
  }

  onNextMonth(): void {
    this.service.navigateMonth(1);
  }
}
