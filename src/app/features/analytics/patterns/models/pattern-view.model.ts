import { IntensityLevel } from '../../calendar/models/calendar-view.model';

export type PatternStatus = 'loading' | 'empty' | 'data' | 'error';

export interface WeekdayBucketView {
  weekday: number;
  labelAr: string;
  count: number;
  percentage: number;
  isPeak: boolean;
  isLeast: boolean;
}

export interface HourBucketView {
  hour: number;
  labelAr: string;
  count: number;
  percentage: number;
  period: 'am' | 'pm';
  isPeak: boolean;
}

export interface HourWeekdayCellView {
  weekday: number;
  hour: number;
  count: number;
  intensity: IntensityLevel;
}

export interface HourWeekdayHeatmapView {
  cells: HourWeekdayCellView[][]; // cells[weekday][hour]
  maxCellCount: number;
  weekdayLabelsAr: string[];
  hourLabelsAr: string[];
}

export interface PeriodSplitView {
  amCount: number;
  pmCount: number;
  total: number;
  amPercentage: number;
  pmPercentage: number;
  dominantPeriod: 'am' | 'pm' | 'equal' | 'insufficient';
}

export interface PatternSummaryView {
  peakWeekdays: WeekdayBucketView[];
  peakHours: HourBucketView[];
  leastActiveWeekday: WeekdayBucketView | null;
  dominantPeriod: 'am' | 'pm' | 'equal' | 'insufficient';
  hasWeekdayInsights: boolean;
  hasTimeInsights: boolean;
}

export interface PatternAnalyticsState {
  status: PatternStatus;
  rangeStart: string;
  rangeEnd: string;
  weekdays: WeekdayBucketView[];
  hours: HourBucketView[];
  heatmap: HourWeekdayHeatmapView;
  periodSplit: PeriodSplitView;
  summary: PatternSummaryView;
  skippedRecordCount: number;
  invalidRecordCount: number;
  errorMessageAr: string | null;
}
