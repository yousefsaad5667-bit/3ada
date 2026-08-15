import { Component, inject , ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeatmapComponent } from './components/heatmap/heatmap.component';
import { MonthlyCalendarComponent } from './components/monthly-calendar/monthly-calendar.component';
import { DaySummaryCardComponent } from './components/day-summary-card/day-summary-card.component';
import { DayDetailPopupComponent } from './components/day-detail-popup/day-detail-popup.component';
import { CalendarAnalyticsService } from './services/calendar-analytics.service';
import { DateRangeSelectorComponent } from '../../dashboard/components/date-range-selector/date-range-selector.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    HeatmapComponent,
    MonthlyCalendarComponent,
    DaySummaryCardComponent,
    DayDetailPopupComponent,
    DateRangeSelectorComponent
  ],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
})
export class CalendarComponent {
  public analyticsService = inject(CalendarAnalyticsService);
}
