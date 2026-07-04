import { Injectable, computed, inject } from '@angular/core';
import { RelapseRecordRepository } from '../../../../core/services/relapse-record.repository';
import { DashboardFilterService, DateRangeFilter } from '../../../dashboard/services/dashboard-filter.service';
import { 
  TimeSeriesAnalyticsState, 
  TimeSeriesDatasetView,
  TimeSeriesPeriodView,
  CumulativeSeriesView,
  TimeSeriesTableRow
} from '../models/time-series-view.model';
import { formatISO, isValidDate } from '../../../../core/analytics/utils/date-range.utils';
import { getTimeSeries, getCumulativeSeries, getMovingAverage, getTrendSummary } from '../../../../core/analytics';
import { TimeSeriesPeriodEntry } from '../../../../core/analytics/models/analytics.types';

@Injectable({
  providedIn: 'root'
})
export class TimeSeriesAnalyticsService {
  private repository = inject(RelapseRecordRepository);
  private filterService = inject(DashboardFilterService);

  public readonly state = computed<TimeSeriesAnalyticsState>(() => {
    const filter = this.filterService.activeFilter();
    const records = this.repository.records();
    const bounds = this.getFilterBounds(filter);
    
    // Invalid record counting (T054)
    const validRecords = records.filter(r => r.date && r.count >= 0 && isValidDate(r.date));
    const invalidRecordCount = records.length - validRecords.length;

    if (validRecords.length === 0) {
      return this.createEmptyState(bounds, invalidRecordCount);
    }

    const range = { from: bounds.start, to: bounds.end };

    // T017: Derive datasets
    const dailyRaw = getTimeSeries(validRecords, range, 'daily');
    const weeklyRaw = getTimeSeries(validRecords, range, 'weekly');
    const monthlyRaw = getTimeSeries(validRecords, range, 'monthly');

    const daily = this.mapToDatasetView('daily', bounds, dailyRaw);
    const weekly = this.mapToDatasetView('weekly', bounds, weeklyRaw);
    const monthly = this.mapToDatasetView('monthly', bounds, monthlyRaw);

    const hasActivity = daily.totalCount > 0;
    
    // T035: Derive US2 datasets from dailyRaw
    const windowSize = 7;
    const movingAverageRaw = getMovingAverage(dailyRaw, windowSize);
    const movingAverage = {
      windowSize,
      points: movingAverageRaw.map(r => ({ date: r.date, labelAr: r.label, value: r.count })),
      hasEnoughData: dailyRaw.length >= windowSize
    };

    const cumulativeRaw = getCumulativeSeries(dailyRaw);
    const cumulative = {
      points: cumulativeRaw.map(r => ({ date: r.date, labelAr: r.label, value: r.count })),
      finalCount: cumulativeRaw.length > 0 ? cumulativeRaw[cumulativeRaw.length - 1].count : 0
    };

    const trendRaw = getTrendSummary(dailyRaw);
    const trendMessageMap = {
      'increasing': 'اتجاه تصاعدي',
      'decreasing': 'اتجاه تنازلي',
      'stable': 'معدل مستقر',
      'insufficient-data': 'بيانات غير كافية'
    };


    const trend = {
      direction: trendRaw.direction,
      growthRatePercent: trendRaw.growthRatePercent,
      averageDailyCount: trendRaw.averageValue,
      comparisonStartCount: trendRaw.comparisonStartValue,
      comparisonEndCount: trendRaw.comparisonEndValue,
      confidence: trendRaw.confidence,
      messageAr: trendMessageMap[trendRaw.direction]
    };

    return {
      status: hasActivity ? 'data' : 'empty',
      rangeStart: bounds.start,
      rangeEnd: bounds.end,
      daily,
      weekly,
      monthly,
      movingAverage,
      cumulative,
      trend,
      distribution: { buckets: [], sourceGrouping: 'daily' },
      invalidRecordCount,
      errorMessageAr: null
    };
  });

  private createEmptyState(bounds: { start: string, end: string }, invalidRecordCount: number): TimeSeriesAnalyticsState {
    const emptyDataset = (grouping: 'daily'|'weekly'|'monthly'): TimeSeriesDatasetView => ({
      grouping, rangeStart: bounds.start, rangeEnd: bounds.end, periods: [], totalCount: 0, hasActivity: false, zeroFilled: false
    });
    return {
      status: 'empty',
      rangeStart: bounds.start,
      rangeEnd: bounds.end,
      daily: emptyDataset('daily'),
      weekly: emptyDataset('weekly'),
      monthly: emptyDataset('monthly'),
      movingAverage: { windowSize: 7, points: [], hasEnoughData: false },
      cumulative: { points: [], finalCount: 0 },
      trend: { direction: 'insufficient-data', growthRatePercent: null, averageDailyCount: 0, comparisonStartCount: 0, comparisonEndCount: 0, confidence: 'insufficient', messageAr: '' },
      distribution: { buckets: [], sourceGrouping: 'daily' },
      invalidRecordCount,
      errorMessageAr: null
    };
  }

  private mapToDatasetView(
    grouping: 'daily' | 'weekly' | 'monthly',
    bounds: { start: string, end: string },
    raw: TimeSeriesPeriodEntry[]
  ): TimeSeriesDatasetView {
    let totalCount = 0;
    const periods: TimeSeriesPeriodView[] = raw.map(r => {
      totalCount += r.count;
      return {
        grouping,
        startDate: r.startDate,
        endDate: r.endDate,
        anchorDate: r.date,
        labelAr: r.label,
        count: r.count,
        isPartial: r.isPartial
      };
    });

    return {
      grouping,
      rangeStart: bounds.start,
      rangeEnd: bounds.end,
      periods,
      totalCount,
      hasActivity: totalCount > 0,
      zeroFilled: grouping === 'daily'
    };
  }

  protected getFilterBounds(filter: DateRangeFilter): { start: string, end: string } {
    return {
      start: formatISO(filter.startDate),
      end: formatISO(filter.endDate)
    };
  }

  public mapToTableRows(dataset: TimeSeriesDatasetView): TimeSeriesTableRow[] {
    const rows: TimeSeriesTableRow[] = dataset.periods.map((p, i, arr) => {
      const prev = i > 0 ? arr[i - 1] : null;
      const change = prev ? p.count - prev.count : null;
      return {
        id: p.anchorDate,
        dateLabel: p.labelAr,
        count: p.count,
        changeFromPrevious: change,
        isPartial: p.isPartial
      };
    });
    rows.reverse();
    return rows;
  }
}

