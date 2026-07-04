export type TimeSeriesStatus = 'loading' | 'empty' | 'data' | 'error';
export type TrendDirection = 'increasing' | 'decreasing' | 'stable' | 'insufficient-data';
export type TrendConfidence = 'high' | 'medium' | 'low' | 'insufficient';

export interface TimeSeriesPoint {
  date: string;
  labelAr: string;
  value: number;
}

export interface TimeSeriesPeriodView {
  grouping: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
  anchorDate: string;
  labelAr: string;
  count: number;
  isPartial: boolean;
}

export interface TimeSeriesDatasetView {
  grouping: 'daily' | 'weekly' | 'monthly';
  rangeStart: string;
  rangeEnd: string;
  periods: TimeSeriesPeriodView[];
  totalCount: number;
  hasActivity: boolean;
  zeroFilled: boolean;
}

export interface MovingAverageSeriesView {
  windowSize: number;
  points: TimeSeriesPoint[];
  hasEnoughData: boolean;
}

export interface CumulativeSeriesView {
  points: TimeSeriesPoint[];
  finalCount: number;
}

export interface TrendSummaryView {
  direction: TrendDirection;
  growthRatePercent: number | null;
  averageDailyCount: number;
  comparisonStartCount: number;
  comparisonEndCount: number;
  confidence: TrendConfidence;
  messageAr: string;
}

export interface CountDistributionBucketView {
  label: string;
  min: number;
  max: number;
  count: number;
  percentage: number;
}

export interface CountDistributionView {
  buckets: CountDistributionBucketView[];
  sourceGrouping: 'daily' | 'weekly' | 'monthly';
}

export interface TimeSeriesTableRow {
  id: string;
  dateLabel: string;
  count: number;
  changeFromPrevious: number | null;
  isPartial: boolean;
}

export interface TimeSeriesTableView {
  rows: TimeSeriesTableRow[];
  totalRows: number;
}

export interface TimeSeriesAnalyticsState {
  status: TimeSeriesStatus;
  rangeStart: string;
  rangeEnd: string;
  daily: TimeSeriesDatasetView;
  weekly: TimeSeriesDatasetView;
  monthly: TimeSeriesDatasetView;
  movingAverage: MovingAverageSeriesView;
  cumulative: CumulativeSeriesView;
  trend: TrendSummaryView;
  distribution: CountDistributionView;
  invalidRecordCount: number;
  errorMessageAr: string | null;
}
