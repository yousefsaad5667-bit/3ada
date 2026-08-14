import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UrgeAnalyticsService } from './services/urge-analytics.service';
import { UrgeSummaryCardComponent } from './components/urge-summary-card/urge-summary-card.component';
import { UrgeTimeSeriesChartComponent } from './components/urge-time-series-chart/urge-time-series-chart.component';
import { UrgeDistributionChartComponent } from './components/urge-distribution-chart/urge-distribution-chart.component';
import { UrgeByHourChartComponent } from './components/urge-by-hour-chart/urge-by-hour-chart.component';
import { UrgeByWeekdayChartComponent } from './components/urge-by-weekday-chart/urge-by-weekday-chart.component';
import { UrgeByTriggerChartComponent } from './components/urge-by-trigger-chart/urge-by-trigger-chart.component';
import { UrgeCorrelationCardComponent } from './components/urge-correlation-card/urge-correlation-card.component';

@Component({
  selector: 'app-urge',
  standalone: true,
  imports: [
    CommonModule, 
    UrgeSummaryCardComponent, 
    UrgeTimeSeriesChartComponent, 
    UrgeDistributionChartComponent,
    UrgeByHourChartComponent,
    UrgeByWeekdayChartComponent,
    UrgeByTriggerChartComponent,
    UrgeCorrelationCardComponent
  ],
  templateUrl: './urge.component.html',
  styleUrls: ['./urge.component.scss']
})
export class UrgeComponent {





  private analyticsService = inject(UrgeAnalyticsService);
  
  public readonly state = this.analyticsService.state;
}
