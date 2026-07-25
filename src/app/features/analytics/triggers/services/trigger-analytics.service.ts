import { Injectable, Signal, WritableSignal, computed, inject, signal } from '@angular/core';
import { DashboardFilterService } from '../../../dashboard/services/dashboard-filter.service';
import { RelapseRecordRepository } from '../../../../core/services/relapse-record.repository';
import { 
  TriggerAnalyticsState, 
  TriggerBucketView, 
  TriggerDistributionView, 
  TriggerSummaryView, 
  TriggerTrendEntry, 
  TriggerTrendView 
} from '../models/trigger-view.model';
import { getTriggerAnalysis, getTrendSummary, getWeeklyCounts, extractKeywords, iterateDateRange, isValidDate } from '../../../../core/analytics';
import { formatArabicDate } from '../../../../shared/utils/date.utils';

@Injectable({
  providedIn: 'root'
})
export class TriggerAnalyticsService {
  private filterService = inject(DashboardFilterService);
  private repository = inject(RelapseRecordRepository);

  /** User search query — updated by TriggersComponent search input */
  public readonly searchQuery: WritableSignal<string> = signal('');

  /** Currently selected keyword for drill-down trend view */
  public readonly selectedKeyword: WritableSignal<string | null> = signal(null);

  /** Reactive state signal — recomputes on records or filter change */
  public readonly state: Signal<TriggerAnalyticsState> = computed<TriggerAnalyticsState>(() => {
    try {
      const filter = this.filterService.activeFilter();
      const records = this.repository.records();

      const startStr = filter.startDate.toISOString().split('T')[0];
      const endStr = filter.endDate.toISOString().split('T')[0];

      const validRecords = records.filter(r => r.date && isValidDate(r.date) && r.count >= 0);
      const inBoundsRecords = validRecords.filter(r => r.date >= startStr && r.date <= endStr);

      if (inBoundsRecords.length === 0) {
        return this.createEmptyState(startStr, endStr, 0);
      }

      let triggerlessRecordCount = 0;
      for (const record of inBoundsRecords) {
        const combinedText = [record.reason ?? '', record.notes ?? ''].join(' ').trim();
        const kws = extractKeywords(combinedText);
        if (kws.length === 0) {
          triggerlessRecordCount++;
        }
      }

      const rawAnalysis = getTriggerAnalysis(inBoundsRecords);
      if (rawAnalysis.length === 0) {
        return this.createEmptyState(startStr, endStr, triggerlessRecordCount);
      }

      const totalOccurrences = rawAnalysis.reduce((sum, item) => sum + item.count, 0);

      let prevCount = -1;
      let prevRank = 0;
      const allTriggers: TriggerBucketView[] = rawAnalysis.map((item, index) => {
        let rank: number;
        if (item.count === prevCount) {
          rank = prevRank;
        } else {
          rank = index + 1;
          prevRank = rank;
          prevCount = item.count;
        }

        const percentage = totalOccurrences > 0 
          ? Number(((item.count / totalOccurrences) * 100).toFixed(1)) 
          : 0;

        const isTop = index < 5;
        const isRare = (totalOccurrences > 0 ? item.count / totalOccurrences < 0.05 : false) && item.count < 3;

        return {
          keyword: item.keyword,
          count: item.count,
          avgUrge: item.avgUrge,
          percentage,
          isTop,
          isRare,
          rank
        };
      });

      const topTriggers = allTriggers.slice(0, 5);
      const rareTriggers = allTriggers.filter(t => t.isRare);

      // Distribution view (cap at 20)
      const distTopTriggers = allTriggers.slice(0, 20);
      const otherCount = allTriggers.slice(20).reduce((sum, item) => sum + item.count, 0);
      const otherPercentage = totalOccurrences > 0 
        ? Number(((otherCount / totalOccurrences) * 100).toFixed(1)) 
        : 0;

      const distribution: TriggerDistributionView = {
        topTriggers: distTopTriggers,
        otherCount,
        otherPercentage
      };

      // Summary view
      let highestUrgeKeyword: string | null = null;
      let highestAvgUrge: number | null = null;
      for (const item of allTriggers) {
        if (item.avgUrge !== null && (highestAvgUrge === null || item.avgUrge > highestAvgUrge)) {
          highestAvgUrge = item.avgUrge;
          highestUrgeKeyword = item.keyword;
        }
      }

      const summary: TriggerSummaryView = {
        totalKeywordCount: allTriggers.length,
        totalOccurrences,
        topTrigger: allTriggers.length > 0 ? allTriggers[0] : null,
        highestUrgeKeyword,
        highestAvgUrge,
        rareTriggersCount: rareTriggers.length,
        triggerlessRecordCount
      };

      return {
        status: 'data',
        rangeStart: startStr,
        rangeEnd: endStr,
        allTriggers,
        topTriggers,
        rareTriggers,
        distribution,
        summary,
        triggerlessRecordCount,
        errorMessageAr: null
      };
    } catch {
      const filter = this.filterService.activeFilter();
      const startStr = filter.startDate.toISOString().split('T')[0];
      const endStr = filter.endDate.toISOString().split('T')[0];
      return {
        ...this.createEmptyState(startStr, endStr, 0),
        status: 'error',
        errorMessageAr: 'حدث خطأ أثناء تحليل المحفزات'
      };
    }
  });

  /** Computed: allTriggers filtered by searchQuery (case-insensitive) */
  public readonly filteredTriggers: Signal<TriggerBucketView[]> = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const all = this.state().allTriggers;
    if (!query) return all;
    return all.filter(t => t.keyword.toLowerCase().includes(query));
  });

  /** Computed: per-trigger trend for selectedKeyword; null if none selected */
  public readonly triggerTrend: Signal<TriggerTrendView | null> = computed(() => {
    const keyword = this.selectedKeyword();
    if (!keyword) return null;

    const st = this.state();
    if (st.status !== 'data') return null;

    const records = this.repository.records();
    const validRecords = records.filter(r => r.date && isValidDate(r.date) && r.count >= 0);
    const inBoundsRecords = validRecords.filter(r => r.date >= st.rangeStart && r.date <= st.rangeEnd);

    // Filter records containing the selected keyword
    const matchingRecords = inBoundsRecords.filter(record => {
      const combinedText = [record.reason ?? '', record.notes ?? ''].join(' ').trim();
      const kws = extractKeywords(combinedText);
      return kws.includes(keyword);
    });

    const dates = iterateDateRange(st.rangeStart, st.rangeEnd);
    const countsByDate = new Map<string, number>();
    for (const record of matchingRecords) {
      countsByDate.set(record.date, (countsByDate.get(record.date) ?? 0) + record.count);
    }

    let maxCount = 0;
    let peakDate: string | null = null;
    let nonZeroCount = 0;

    const entries: TriggerTrendEntry[] = dates.map(date => {
      const count = countsByDate.get(date) ?? 0;
      if (count > 0) {
        nonZeroCount++;
        if (count > maxCount) {
          maxCount = count;
          peakDate = date;
        }
      }
      const d = new Date(`${date}T00:00:00`);
      return {
        date,
        labelAr: formatArabicDate(d),
        count
      };
    });

    let direction: 'increasing' | 'decreasing' | 'stable' | 'insufficient-data' = 'insufficient-data';
    if (nonZeroCount >= 7) {
      const trendResult = getTrendSummary(entries.map(e => ({ date: e.date, count: e.count, label: e.labelAr })));
      direction = trendResult.direction;
    }

    // Calculate most active period (weekly bucket max)
    const weeklyBuckets = getWeeklyCounts(matchingRecords, { from: st.rangeStart, to: st.rangeEnd });
    let maxWeekCount = 0;
    let mostActivePeriodLabelAr: string | null = null;
    for (const w of weeklyBuckets) {
      if (w.count > maxWeekCount) {
        maxWeekCount = w.count;
        mostActivePeriodLabelAr = w.label;
      }
    }

    return {
      keyword,
      entries,
      peakDate: maxCount > 0 ? peakDate : null,
      direction,
      mostActivePeriodLabelAr
    };
  });

  private createEmptyState(start: string, end: string, triggerlessRecordCount: number): TriggerAnalyticsState {
    return {
      status: 'empty',
      rangeStart: start,
      rangeEnd: end,
      allTriggers: [],
      topTriggers: [],
      rareTriggers: [],
      distribution: {
        topTriggers: [],
        otherCount: 0,
        otherPercentage: 0
      },
      summary: {
        totalKeywordCount: 0,
        totalOccurrences: 0,
        topTrigger: null,
        highestUrgeKeyword: null,
        highestAvgUrge: null,
        rareTriggersCount: 0,
        triggerlessRecordCount
      },
      triggerlessRecordCount,
      errorMessageAr: null
    };
  }
}
