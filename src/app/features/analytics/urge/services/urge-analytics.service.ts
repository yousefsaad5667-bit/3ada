import { Injectable, Signal, computed, inject } from '@angular/core';
import { DashboardFilterService } from '../../../dashboard/services/dashboard-filter.service';
import { RelapseRecordRepository } from '../../../../core/services/relapse-record.repository';
import { UrgeAnalyticsState } from '../models/urge-view.model';
import { 
  getUrgeAnalysis, 
  getUrgeByHour, 
  getUrgeByWeekday, 
  getUrgeCorrelation,
  getMovingAverage,
  getTrendSummary,
  getDistribution,
  getTriggerAnalysis
} from '../../../../core/analytics';
import { isValidDate } from '../../../../core/analytics/utils/date-range.utils';

@Injectable({
  providedIn: 'root'
})
export class UrgeAnalyticsService {
  private filterService = inject(DashboardFilterService);
  private repository = inject(RelapseRecordRepository);

  public readonly state: Signal<UrgeAnalyticsState> = computed<UrgeAnalyticsState>(() => {
    try {
      const filter = this.filterService.activeFilter();
      const records = this.repository.records();

      const startStr = filter.startDate.toISOString().split('T')[0];
      const endStr = filter.endDate.toISOString().split('T')[0];

      const validRecords = records.filter(r => r.date && isValidDate(r.date) && r.count >= 0);
      const inBoundsRecords = validRecords.filter(r => r.date >= startStr && r.date <= endStr);

      if (inBoundsRecords.length === 0) {
        return this.createEmptyState(0);
      }

      let excludedRecordCount = 0;
      const recordsWithUrge = inBoundsRecords.filter(r => {
        if (r.urgeLevel === null || r.urgeLevel === undefined) {
          excludedRecordCount += r.count; // Assuming we count the number of relapses omitted
          return false;
        }
        return true;
      });

      if (recordsWithUrge.length === 0) {
        return this.createEmptyState(excludedRecordCount);
      }

      const dateRange = { from: startStr, to: endStr };

      const urgeAnalysis = getUrgeAnalysis(inBoundsRecords, dateRange); // It filters internally, but we already have inBoundsRecords
      
      const movingAvgResult = getMovingAverage(urgeAnalysis.timeSeries, 7);
      
      const timeSeriesEntries = urgeAnalysis.timeSeries.map((entry, idx) => ({
        date: entry.date,
        rawUrge: entry.count,
        movingAverageUrge: movingAvgResult[idx].count
      }));
      
      const trendResult = getTrendSummary(urgeAnalysis.timeSeries);

      const summary = {
        average: urgeAnalysis.average,
        max: urgeAnalysis.max,
        min: urgeAnalysis.min,
        median: urgeAnalysis.median,
        trendDirection: trendResult.direction
      };

      const timeSeries = {
        entries: timeSeriesEntries,
        trendDirection: trendResult.direction
      };

      const distribution = getDistribution(inBoundsRecords, 'urgeLevel', 10);
      const byHour = getUrgeByHour(inBoundsRecords);
      const byWeekday = getUrgeByWeekday(inBoundsRecords);

      const triggers = getTriggerAnalysis(inBoundsRecords)
        .filter(t => t.avgUrge !== null)
        .sort((a, b) => b.avgUrge! - a.avgUrge!)
        .map(t => ({
          keyword: t.keyword,
          count: t.count,
          avgUrge: t.avgUrge,
          isLimitedSample: t.count < 3
        }));

      const correlation = getUrgeCorrelation(inBoundsRecords, dateRange);

      return {
        status: 'data',
        summary,
        timeSeries,
        distribution,
        byHour,
        byWeekday,
        byTrigger: triggers,
        correlation,
        excludedRecordCount,
        errorMessageAr: null
      };
    } catch {
      return {
        ...this.createEmptyState(0),
        status: 'error',
        errorMessageAr: 'حدث خطأ أثناء تحليل بيانات الرغبة الشديدة'
      };
    }
  });

  private createEmptyState(excludedRecordCount: number): UrgeAnalyticsState {
    return {
      status: 'empty',
      summary: {
        average: null,
        max: null,
        min: null,
        median: null,
        trendDirection: 'insufficient-data'
      },
      timeSeries: {
        entries: [],
        trendDirection: 'insufficient-data'
      },
      distribution: [],
      byHour: [],
      byWeekday: [],
      byTrigger: [],
      correlation: {
        direction: 'insufficient-data',
        pearsonR: null,
        explanationAr: 'لا تتوفر بيانات كافية.',
        weeklyBucketsCount: 0
      },
      excludedRecordCount,
      errorMessageAr: null
    };
  }
}
