import { Injectable, Signal, computed, inject } from '@angular/core';
import { DashboardFilterService } from '../../../dashboard/services/dashboard-filter.service';
import { RelapseRecordRepository } from '../../../../core/services/relapse-record.repository';
import { 
  PatternAnalyticsState, 
  PatternStatus, 
  WeekdayBucketView, 
  HourBucketView, 
  PeriodSplitView, 
  HourWeekdayHeatmapView, 
  PatternSummaryView, 
  HourWeekdayCellView 
} from '../models/pattern-view.model';
import { getWeekdayAnalysis, getHourAnalysis } from '../../../../core/analytics/engine/pattern.engine';
import { isValidDate } from '../../../../core/analytics/utils/date-range.utils';

@Injectable({
  providedIn: 'root'
})
export class PatternAnalyticsService {
  private filterService = inject(DashboardFilterService);
  private repository = inject(RelapseRecordRepository);

  public readonly state = computed<PatternAnalyticsState>(() => {
    const filter = this.filterService.activeFilter();
    const records = this.repository.records();
    
    // Bounds check
    const startStr = filter.startDate.toISOString().split('T')[0];
    const endStr = filter.endDate.toISOString().split('T')[0];

    const validRecords = records.filter(r => r.date && isValidDate(r.date) && r.count >= 0);
    const invalidRecordCount = records.length - validRecords.length;

    const inBoundsRecords = validRecords.filter(r => r.date >= startStr && r.date <= endStr);

    if (inBoundsRecords.length === 0) {
      return this.createEmptyState(startStr, endStr, invalidRecordCount);
    }

    // Process valid and in-bounds records
    const weekdayAnalysis = getWeekdayAnalysis(inBoundsRecords);
    const { entries: hourAnalysis, skipped: skippedRecordCount } = getHourAnalysis(inBoundsRecords);

    const weekdays = this.mapWeekdays(weekdayAnalysis);
    const hours = this.mapHours(hourAnalysis);
    
    const heatmap = this.buildHeatmap(inBoundsRecords);
    const periodSplit = this.buildPeriodSplit(hours);
    const summary = this.buildSummary(weekdays, hours, periodSplit);

    return {
      status: 'data',
      rangeStart: startStr,
      rangeEnd: endStr,
      weekdays,
      hours,
      heatmap,
      periodSplit,
      summary,
      skippedRecordCount,
      invalidRecordCount,
      errorMessageAr: null
    };
  });

  private createEmptyState(start: string, end: string, invalidCount: number): PatternAnalyticsState {
    const emptyWeekdays: WeekdayBucketView[] = Array.from({ length: 7 }, (_, i) => ({
      weekday: i,
      labelAr: this.getWeekdayLabel(i),
      count: 0,
      percentage: 0,
      isPeak: false,
      isLeast: false
    }));

    const emptyHours: HourBucketView[] = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      labelAr: this.getHourLabel(i),
      count: 0,
      percentage: 0,
      period: i < 12 ? 'am' : 'pm',
      isPeak: false
    }));

    const emptyHeatmap: HourWeekdayHeatmapView = {
      cells: Array.from({ length: 7 }, (_, w) => 
        Array.from({ length: 24 }, (_, h) => ({
          weekday: w,
          hour: h,
          count: 0,
          intensity: 'none'
        }))
      ),
      maxCellCount: 0,
      weekdayLabelsAr: emptyWeekdays.map(w => w.labelAr),
      hourLabelsAr: emptyHours.filter(h => h.hour % 2 === 0).map(h => h.labelAr) // Every 2 hours for labels usually
    };

    return {
      status: 'empty',
      rangeStart: start,
      rangeEnd: end,
      weekdays: emptyWeekdays,
      hours: emptyHours,
      heatmap: emptyHeatmap,
      periodSplit: { amCount: 0, pmCount: 0, total: 0, amPercentage: 0, pmPercentage: 0, dominantPeriod: 'insufficient' },
      summary: { peakWeekdays: [], peakHours: [], leastActiveWeekday: null, dominantPeriod: 'insufficient', hasWeekdayInsights: false, hasTimeInsights: false },
      skippedRecordCount: 0,
      invalidRecordCount: invalidCount,
      errorMessageAr: null
    };
  }

  private mapWeekdays(entries: any[]): WeekdayBucketView[] {
    let maxCount = -1;
    let minCount = Infinity;
    
    entries.forEach(e => {
      if (e.count > maxCount) maxCount = e.count;
      if (e.count < minCount) minCount = e.count;
    });

    return entries.map(e => ({
      weekday: e.weekday,
      labelAr: e.labelAr,
      count: e.count,
      percentage: e.percentage,
      isPeak: maxCount > 0 && e.count === maxCount,
      isLeast: minCount !== Infinity && e.count === minCount
    }));
  }

  private mapHours(entries: any[]): HourBucketView[] {
    let maxCount = -1;
    let totalCount = 0;
    entries.forEach(e => {
      if (e.count > maxCount) maxCount = e.count;
      totalCount += e.count;
    });

    return entries.map(e => ({
      hour: e.hour,
      labelAr: e.labelAr,
      count: e.count,
      percentage: totalCount > 0 ? Number(((e.count / totalCount) * 100).toFixed(1)) : 0,
      period: e.hour < 12 ? 'am' : 'pm',
      isPeak: maxCount > 0 && e.count === maxCount
    }));
  }

  private buildHeatmap(records: any[]): HourWeekdayHeatmapView {
    const cells: HourWeekdayCellView[][] = Array.from({ length: 7 }, (_, w) => 
      Array.from({ length: 24 }, (_, h) => ({
        weekday: w,
        hour: h,
        count: 0,
        intensity: 'none'
      }))
    );

    // Cross-product aggregation
    for (const record of records) {
      if (!record.date || !record.time) continue;
      
      const d = new Date(`${record.date}T00:00:00`);
      if (isNaN(d.getTime())) continue;
      const weekday = d.getDay();

      const parts = record.time.split(':');
      if (parts.length >= 2) {
        let hour = parseInt(parts[0], 10);
        if (!isNaN(hour) && hour >= 0 && hour <= 23) {
          if (record.ampm === 'pm' && hour < 12) hour += 12;
          else if (record.ampm === 'am' && hour === 12) hour = 0;

          if (hour >= 0 && hour <= 23) {
            cells[weekday][hour].count += record.count;
          }
        }
      }
    }

    let maxCellCount = 0;
    for (let w = 0; w < 7; w++) {
      for (let h = 0; h < 24; h++) {
        if (cells[w][h].count > maxCellCount) {
          maxCellCount = cells[w][h].count;
        }
      }
    }

    for (let w = 0; w < 7; w++) {
      for (let h = 0; h < 24; h++) {
        const cell = cells[w][h];
        if (cell.count === 0) {
          cell.intensity = 'none';
        } else if (cell.count <= maxCellCount * 0.25) {
          cell.intensity = 'low';
        } else if (cell.count <= maxCellCount * 0.5) {
          cell.intensity = 'medium';
        } else if (cell.count <= maxCellCount * 0.75) {
          cell.intensity = 'high';
        } else {
          cell.intensity = 'very-high';
        }
      }
    }

    return {
      cells,
      maxCellCount,
      weekdayLabelsAr: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
      hourLabelsAr: Array.from({ length: 12 }, (_, i) => {
        const h = i * 2;
        if (h === 0) return '12 ص';
        if (h < 12) return `${h} ص`;
        if (h === 12) return '12 م';
        return `${h - 12} م`;
      })
    };
  }

  private buildPeriodSplit(hours: HourBucketView[]): PeriodSplitView {
    let amCount = 0;
    let pmCount = 0;

    hours.forEach(h => {
      if (h.period === 'am') amCount += h.count;
      else pmCount += h.count;
    });

    const total = amCount + pmCount;
    let dominantPeriod: 'am' | 'pm' | 'equal' | 'insufficient' = 'insufficient';
    
    if (total > 0) {
      if (amCount > pmCount) dominantPeriod = 'am';
      else if (pmCount > amCount) dominantPeriod = 'pm';
      else dominantPeriod = 'equal';
    }

    return {
      amCount,
      pmCount,
      total,
      amPercentage: total > 0 ? Number(((amCount / total) * 100).toFixed(1)) : 0,
      pmPercentage: total > 0 ? Number(((pmCount / total) * 100).toFixed(1)) : 0,
      dominantPeriod
    };
  }

  private buildSummary(weekdays: WeekdayBucketView[], hours: HourBucketView[], periodSplit: PeriodSplitView): PatternSummaryView {
    const peakWeekdays = weekdays.filter(w => w.isPeak);
    const leastActiveWeekday = weekdays.find(w => w.isLeast) || null;
    const peakHours = hours.filter(h => h.isPeak);

    const hasWeekdayInsights = peakWeekdays.length > 0 && peakWeekdays[0].count > 0;
    const hasTimeInsights = peakHours.length > 0 && peakHours[0].count > 0;

    return {
      peakWeekdays,
      peakHours,
      leastActiveWeekday,
      dominantPeriod: periodSplit.dominantPeriod,
      hasWeekdayInsights,
      hasTimeInsights
    };
  }

  private getWeekdayLabel(day: number): string {
    const labels = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return labels[day];
  }

  private getHourLabel(hour: number): string {
    if (hour === 0) return '12 ص';
    if (hour < 12) return `${hour} ص`;
    if (hour === 12) return '12 م';
    return `${hour - 12} م`;
  }
}
