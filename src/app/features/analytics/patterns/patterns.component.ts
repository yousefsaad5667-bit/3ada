import { Component, inject } from '@angular/core';
import { PatternAnalyticsService } from './services/pattern-analytics.service';
import { WeekdayChartComponent } from './components/weekday-chart/weekday-chart.component';
import { HourlyChartComponent } from './components/hourly-chart/hourly-chart.component';
import { PeriodSplitCardComponent } from './components/period-split-card/period-split-card.component';
import { HourWeekdayHeatmapComponent } from './components/hour-weekday-heatmap/hour-weekday-heatmap.component';
import { PatternSummaryCardComponent } from './components/pattern-summary-card/pattern-summary-card.component';

@Component({
  selector: 'app-patterns',
  standalone: true,
  imports: [
    WeekdayChartComponent,
    HourlyChartComponent,
    PeriodSplitCardComponent,
    HourWeekdayHeatmapComponent,
    PatternSummaryCardComponent
  ],
  templateUrl: './patterns.component.html',
  styleUrl: './patterns.component.scss',
})
export class PatternsComponent {
  public service = inject(PatternAnalyticsService);
  public state = this.service.state;
}
