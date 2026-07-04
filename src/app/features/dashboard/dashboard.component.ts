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
