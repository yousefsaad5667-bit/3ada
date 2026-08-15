import { Component, OnInit, inject , ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardCardDescriptor } from './models/dashboard-card-descriptor.model';
import { PlaceholderCardAComponent } from './components/placeholder-cards/placeholder-card-a/placeholder-card-a.component';
import { PlaceholderCardBComponent } from './components/placeholder-cards/placeholder-card-b/placeholder-card-b.component';
import { DashboardCardShellComponent } from './components/dashboard-card-shell/dashboard-card-shell.component';
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
import { WeekdayChartCardComponent } from '../analytics/patterns/components/weekday-chart-card/weekday-chart-card.component';
import { HourlyChartCardComponent } from '../analytics/patterns/components/hourly-chart-card/hourly-chart-card.component';
import { PeriodSplitCardWrapperComponent } from '../analytics/patterns/components/period-split-card-wrapper/period-split-card-wrapper.component';
import { HourWeekdayHeatmapCardComponent } from '../analytics/patterns/components/hour-weekday-heatmap-card/hour-weekday-heatmap-card.component';
import { PatternSummaryCardWrapperComponent } from '../analytics/patterns/components/pattern-summary-card-wrapper/pattern-summary-card-wrapper.component';
import { TriggerRankingCardComponent } from '../analytics/triggers/components/trigger-ranking-list-card/trigger-ranking-card.component';
import { TriggerDistributionCardComponent } from '../analytics/triggers/components/trigger-distribution-card/trigger-distribution-card.component';
import { TriggerTimelineCardComponent } from '../analytics/triggers/components/trigger-timeline-card/trigger-timeline-card.component';
import { TriggerSummaryCardWrapperComponent } from '../analytics/triggers/components/trigger-summary-card-wrapper/trigger-summary-card-wrapper.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DashboardCardShellComponent, DashboardCardPlaceholderComponent],
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
      component: WeekdayChartCardComponent,
      defaultOrder: 8
    },
    {
      id: 'patterns-hourly-chart',
      titleAr: 'توزيع ساعات اليوم',
      component: HourlyChartCardComponent,
      defaultOrder: 9
    },
    {
      id: 'patterns-period-split',
      titleAr: 'مقارنة الصباح والمساء',
      component: PeriodSplitCardWrapperComponent,
      defaultOrder: 10
    },
    {
      id: 'patterns-heatmap',
      titleAr: 'خريطة الوقت والأسبوع',
      component: HourWeekdayHeatmapCardComponent,
      defaultOrder: 11
    },
    {
      id: 'patterns-summary',
      titleAr: 'أبرز أوقات النشاط',
      component: PatternSummaryCardWrapperComponent,
      defaultOrder: 12
    },
    {
      id: 'triggers-ranking',
      titleAr: 'أكثر الأسباب تكراراً',
      component: TriggerRankingCardComponent,
      defaultOrder: 13
    },
    {
      id: 'triggers-distribution',
      titleAr: 'توزيع المحفزات',
      component: TriggerDistributionCardComponent,
      defaultOrder: 14
    },
    {
      id: 'triggers-timeline',
      titleAr: 'مسار المحفز المحدد',
      component: TriggerTimelineCardComponent,
      defaultOrder: 15
    },
    {
      id: 'triggers-summary',
      titleAr: 'ملخص المحفزات',
      component: TriggerSummaryCardWrapperComponent,
      defaultOrder: 16
    }
  ];

  cards = this.layoutService.cards;

  ngOnInit() {
    this.layoutService.registerCards(this.CARD_REGISTRY);
  }

  onHideCard(id: string) {
    this.layoutService.hideCard(id);
  }

  onShowCard(id: string) {
    this.layoutService.showCard(id);
  }
}
