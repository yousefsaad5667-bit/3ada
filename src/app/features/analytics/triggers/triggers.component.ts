import { Component, inject } from '@angular/core';
import { TriggerAnalyticsService } from './services/trigger-analytics.service';
import { TriggerRankingListComponent } from './components/trigger-ranking-list/trigger-ranking-list.component';
import { TriggerDistributionChartComponent } from './components/trigger-distribution-chart/trigger-distribution-chart.component';
import { TriggerTimelineComponent } from './components/trigger-timeline/trigger-timeline.component';
import { TriggerSearchComponent } from './components/trigger-search/trigger-search.component';
import { TriggerSummaryCardComponent } from './components/trigger-summary-card/trigger-summary-card.component';

@Component({
  selector: 'app-triggers',
  standalone: true,
  imports: [TriggerRankingListComponent, TriggerDistributionChartComponent, TriggerTimelineComponent, TriggerSearchComponent, TriggerSummaryCardComponent],
  templateUrl: './triggers.component.html',
  styleUrl: './triggers.component.scss',
})
export class TriggersComponent {
  public service = inject(TriggerAnalyticsService);
  public state = this.service.state;
}
