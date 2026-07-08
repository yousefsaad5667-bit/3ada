import { RelapseRecord } from '../../../../core/models/relapse-record.model';

export type CalendarStatus = 'loading' | 'empty' | 'data' | 'error';
export type IntensityLevel = 'none' | 'low' | 'medium' | 'high' | 'very-high';

export interface CalendarDay {
  date: string;                  // YYYY-MM-DD
  count: number;
  averageUrge: number | null;
  reasons: string[];
  notes: string[];
  intensity: IntensityLevel;
  intensityValue: number;        // 0–1 normalized
  isInActiveRange: boolean;
  isToday: boolean;
}

export interface HeatmapWeek {
  weekIndex: number;
  days: CalendarDay[];           // always 7 entries
}

export interface MonthLabel {
  monthIndex: number;            // 1–12
  weekIndex: number;             // column index in heatmap grid
  labelAr: string;               // Arabic abbreviated month name
}

export interface HeatmapGrid {
  weeks: HeatmapWeek[];
  rangeStart: string;
  rangeEnd: string;
  activeRangeStart: string;
  activeRangeEnd: string;
  maxDayCount: number;
  monthLabels: MonthLabel[];
}

export interface CalendarMonthGrid {
  year: number;
  month: number;
  labelAr: string;
  days: CalendarDay[];
  leadingBlanks: number;
  trailingBlanks: number;
  hasActivity: boolean;
}

export interface DayDetail {
  date: string;
  labelAr: string;
  totalCount: number;
  averageUrge: number | null;
  uniqueReasons: string[];
  notes: string[];
  records: RelapseRecord[];
  isEmpty: boolean;
}

export interface CalendarAnalyticsState {
  status: CalendarStatus;
  heatmapGrid: HeatmapGrid;
  currentMonthGrid: CalendarMonthGrid;
  selectedDay: DayDetail | null;
  selectedDate: string | null;
  currentMonth: { year: number; month: number };
  rangeStart: string;
  rangeEnd: string;
  invalidRecordCount: number;
  errorMessageAr: string | null;
}
