import { Component , ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DailySeriesCardComponent } from './components/daily-series-card/daily-series-card.component';
import { PeriodSeriesCardComponent } from './components/period-series-card/period-series-card.component';
import { MovingAverageCardComponent } from './components/moving-average-card/moving-average-card.component';
import { CumulativeCountCardComponent } from './components/cumulative-count-card/cumulative-count-card.component';
import { TrendSummaryCardComponent } from './components/trend-summary-card/trend-summary-card.component';
import { DateRangeSelectorComponent } from '../../dashboard/components/date-range-selector/date-range-selector.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-time-series',
  standalone: true,
  imports: [
    CommonModule, 
    DailySeriesCardComponent, 
    PeriodSeriesCardComponent, 
    MovingAverageCardComponent, 
    CumulativeCountCardComponent, 
    TrendSummaryCardComponent,
    DateRangeSelectorComponent
  ],
  templateUrl: './time-series.component.html',
  styleUrl: './time-series.component.scss',
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class TimeSeriesComponent {}
