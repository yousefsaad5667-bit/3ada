import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { DashboardCardDescriptor } from './models/dashboard-card-descriptor.model';
import { PlaceholderCardAComponent } from './components/placeholder-cards/placeholder-card-a/placeholder-card-a.component';
import { PlaceholderCardBComponent } from './components/placeholder-cards/placeholder-card-b/placeholder-card-b.component';
import { DashboardCardShellComponent } from './components/dashboard-card-shell/dashboard-card-shell.component';
import { DateRangeSelectorComponent } from './components/date-range-selector/date-range-selector.component';
import { DashboardLayoutService } from './services/dashboard-layout.service';
import { DashboardCardPlaceholderComponent } from './components/dashboard-card-placeholder/dashboard-card-placeholder.component';
import { DailySeriesCardComponent } from '../analytics/time-series/components/daily-series-card/daily-series-card.component';
import { PeriodSeriesCardComponent } from '../analytics/time-series/components/period-series-card/period-series-card.component';
import { MovingAverageCardComponent } from '../analytics/time-series/components/moving-average-card/moving-average-card.component';
import { CumulativeCountCardComponent } from '../analytics/time-series/components/cumulative-count-card/cumulative-count-card.component';
import { TrendSummaryCardComponent } from '../analytics/time-series/components/trend-summary-card/trend-summary-card.component';
import { HeatmapComponent } from '../analytics/calendar/components/heatmap/heatmap.component';
import { MonthlyCalendarComponent } from '../analytics/calendar/components/monthly-calendar/monthly-calendar.component';
import { DaySummaryCardComponent } from '../analytics/calendar/components/day-summary-card/day-summary-card.component';
import { WeekdayChartComponent } from '../analytics/patterns/components/weekday-chart/weekday-chart.component';
import { HourlyChartComponent } from '../analytics/patterns/components/hourly-chart/hourly-chart.component';
import { PeriodSplitCardComponent } from '../analytics/patterns/components/period-split-card/period-split-card.component';
import { HourWeekdayHeatmapComponent } from '../analytics/patterns/components/hour-weekday-heatmap/hour-weekday-heatmap.component';
import { PatternSummaryCardComponent } from '../analytics/patterns/components/pattern-summary-card/pattern-summary-card.component';
import { TriggerRankingListComponent } from '../analytics/triggers/components/trigger-ranking-list/trigger-ranking-list.component';
import { TriggerDistributionChartComponent } from '../analytics/triggers/components/trigger-distribution-chart/trigger-distribution-chart.component';
import { TriggerTimelineComponent } from '../analytics/triggers/components/trigger-timeline/trigger-timeline.component';
import { TriggerSummaryCardComponent } from '../analytics/triggers/components/trigger-summary-card/trigger-summary-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DragDropModule, DashboardCardShellComponent, DateRangeSelectorComponent, DashboardCardPlaceholderComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  layoutService = inject(DashboardLayoutService);
  // Hardcoded registry for Phase 3 (US1 MVP)
  CARD_REGISTRY: DashboardCardDescriptor[] = [
    {
      id: 'time-series-daily',
      titleAr: 'الانتكاسات اليومية',
      component: DailySeriesCardComponent,
      defaultOrder: 0
    },
    {
      id: 'time-series-periods',
      titleAr: 'الانتكاسات الأسبوعية/الشهرية',
      component: PeriodSeriesCardComponent,
      defaultOrder: 1
    },
    {
      id: 'time-series-summary',
      titleAr: 'ملخص الاتجاه',
      component: TrendSummaryCardComponent,
      defaultOrder: 2
    },
    {
      id: 'time-series-cumulative',
      titleAr: 'الانتكاسات التراكمية',
      component: CumulativeCountCardComponent,
      defaultOrder: 3
    },
    {
      id: 'time-series-moving-average',
      titleAr: 'المتوسط المتحرك',
      component: MovingAverageCardComponent,
      defaultOrder: 4
    },
    {
      id: 'calendar-heatmap',
      titleAr: 'خريطة النشاط السنوي',
      component: HeatmapComponent,
      defaultOrder: 5
    },
    {
      id: 'calendar-monthly',
      titleAr: 'التقويم الشهري',
      component: MonthlyCalendarComponent,
      defaultOrder: 6
    },
    {
      id: 'calendar-day-summary',
      titleAr: 'ملخص اليوم',
      component: DaySummaryCardComponent,
      defaultOrder: 7
    },
    {
      id: 'patterns-weekday-chart',
      titleAr: 'توزيع أيام الأسبوع',
      component: WeekdayChartComponent,
      defaultOrder: 8
    },
    {
      id: 'patterns-hourly-chart',
      titleAr: 'توزيع ساعات اليوم',
      component: HourlyChartComponent,
      defaultOrder: 9
    },
    {
      id: 'patterns-period-split',
      titleAr: 'مقارنة الصباح والمساء',
      component: PeriodSplitCardComponent,
      defaultOrder: 10
    },
    {
      id: 'patterns-heatmap',
      titleAr: 'خريطة الوقت والأسبوع',
      component: HourWeekdayHeatmapComponent,
      defaultOrder: 11
    },
    {
      id: 'patterns-summary',
      titleAr: 'أبرز أوقات النشاط',
      component: PatternSummaryCardComponent,
      defaultOrder: 12
    },
    {
      id: 'triggers-ranking',
      titleAr: 'أكثر الأسباب تكراراً',
      component: TriggerRankingListComponent,
      defaultOrder: 13
    },
    {
      id: 'triggers-distribution',
      titleAr: 'توزيع المحفزات',
      component: TriggerDistributionChartComponent,
      defaultOrder: 14
    },
    {
      id: 'triggers-timeline',
      titleAr: 'مسار المحفز المحدد',
      component: TriggerTimelineComponent,
      defaultOrder: 15
    },
    {
      id: 'triggers-summary',
      titleAr: 'ملخص المحفزات',
      component: TriggerSummaryCardComponent,
      defaultOrder: 16
    }
  ];

  cards = this.layoutService.cards;

  ngOnInit() {
    this.layoutService.registerCards(this.CARD_REGISTRY);
  }

  onDrop(event: CdkDragDrop<any[]>) {
    const currentCards = [...this.cards()];
    moveItemInArray(currentCards, event.previousIndex, event.currentIndex);
    this.layoutService.reorderCards(currentCards.map(c => c.id));
  }

  onHideCard(id: string) {
    this.layoutService.hideCard(id);
  }

  onShowCard(id: string) {
    this.layoutService.showCard(id);
  }
}
