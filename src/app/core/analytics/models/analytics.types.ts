export type DatePreset =
  | 'today'
  | 'last7'
  | 'last30'
  | 'last90'
  | 'lastYear'
  | 'all'
  | 'custom';

export interface DateRange {
  from: string; // YYYY-MM-DD, inclusive
  to: string; // YYYY-MM-DD, inclusive
}

export interface TimeSeriesEntry {
  date: string; // anchor date YYYY-MM-DD
  label: string; // human-readable Arabic label
  count: number;
}

export interface TimeSeriesPeriodEntry extends TimeSeriesEntry {
  startDate: string; // YYYY-MM-DD, inclusive period start
  endDate: string; // YYYY-MM-DD, inclusive period end
  isPartial: boolean; // whether period is clipped by the active date range
}

export interface WeekdayEntry {
  weekday: number; // 0 (Sun) – 6 (Sat)
  labelAr: string; // Arabic weekday name
  count: number;
  percentage: number; // 0–100, 1 decimal place
}

export interface HourEntry {
  hour: number; // 0–23
  label: string; // e.g. "3 ص" / "2 م"
  count: number;
}

export interface TriggerEntry {
  keyword: string;
  count: number;
  avgUrge: number | null;
}

export interface HeatmapEntry {
  date: string; // YYYY-MM-DD
  count: number;
  intensity: number; // 0–1 normalized
}

export interface DistributionEntry {
  label: string;
  min: number;
  max: number;
  count: number;
  percentage: number; // 0–100
}

export interface SummaryStatistics {
  total: number;
  recordCount: number;
  dailyAverage: number;
  median: number;
  min: number;
  max: number;
  stdDev: number;
}

export interface TrendAnalysisResult {
  direction: 'increasing' | 'decreasing' | 'stable' | 'insufficient-data';
  growthRatePercent: number | null;
  averageValue: number;
  comparisonStartValue: number;
  comparisonEndValue: number;
  confidence: 'high' | 'medium' | 'low' | 'insufficient';
}

export interface UrgeAnalysisResult {
  average: number | null;
  median: number | null;
  min: number | null;
  max: number | null;
  timeSeries: TimeSeriesEntry[];
}

export interface UrgeHourEntry {
  hour: number;
  label: string;
  avgUrge: number | null;
}

export interface UrgeWeekdayEntry {
  weekday: number;
  labelAr: string;
  avgUrge: number | null;
}

export interface UrgeTriggerEntry {
  keyword: string;
  count: number;
  avgUrge: number | null;
  isLimitedSample: boolean;
}

export interface UrgeCorrelationResult {
  direction: 'positive' | 'negative' | 'neutral' | 'insufficient-data';
  pearsonR: number | null;
  explanationAr: string;
  weeklyBucketsCount: number;
}

