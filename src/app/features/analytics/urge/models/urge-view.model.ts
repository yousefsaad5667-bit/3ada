import {
  DistributionEntry,
  UrgeCorrelationResult,
  UrgeHourEntry,
  UrgeTriggerEntry,
  UrgeWeekdayEntry,
} from '../../../../../core/analytics/models/analytics.types';

export type UrgeStatus = 'loading' | 'empty' | 'data' | 'error';

export interface UrgeSummaryView {
  average: number | null;
  max: number | null;
  min: number | null;
  median: number | null;
  trendDirection: 'increasing' | 'decreasing' | 'stable' | 'insufficient-data';
}

export interface UrgeTrendEntry {
  date: string;
  rawUrge: number | null;
  movingAverageUrge: number | null;
}

export interface UrgeTimeSeriesView {
  entries: UrgeTrendEntry[];
  trendDirection: 'increasing' | 'decreasing' | 'stable' | 'insufficient-data';
}

export interface UrgeAnalyticsState {
  status: UrgeStatus;
  summary: UrgeSummaryView;
  timeSeries: UrgeTimeSeriesView;
  distribution: DistributionEntry[];
  byHour: UrgeHourEntry[];
  byWeekday: UrgeWeekdayEntry[];
  byTrigger: UrgeTriggerEntry[];
  correlation: UrgeCorrelationResult;
  excludedRecordCount: number;
  errorMessageAr: string | null;
}
