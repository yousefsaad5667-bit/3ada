import { RelapseRecord } from '../../models/relapse-record.model';
import { DateRange, TimeSeriesEntry, TimeSeriesPeriodEntry } from '../models/analytics.types';
import { Granularity } from '../models/analytics-granularity.types';
import { formatISO, iterateDateRange } from '../utils/date-range.utils';

/**
 * Returns daily counts for the specified date range.
 * Zero-fills days with no activity.
 */
export function getDailyCounts(records: RelapseRecord[], dateRange: DateRange): TimeSeriesPeriodEntry[] {
  const dates = iterateDateRange(dateRange.from, dateRange.to);
  if (dates.length === 0) return [];

  const countsByDate = new Map<string, number>();
  for (const record of records) {
    if (record.date >= dateRange.from && record.date <= dateRange.to) {
      countsByDate.set(record.date, (countsByDate.get(record.date) || 0) + record.count);
    }
  }

  return dates.map(date => {
    const d = new Date(`${date}T00:00:00`);
    const day = d.getDate();
    const monthNamesAr = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    const month = monthNamesAr[d.getMonth()];
    
    return {
      date,
      label: `${day} ${month}`,
      count: countsByDate.get(date) || 0,
      startDate: date,
      endDate: date,
      isPartial: false
    };
  });
}

/**
 * Helper to get the ISO week number for a given date.
 */
function getISOWeekInfo(dateStr: string): { year: number; week: number } {
  const date = new Date(`${dateStr}T00:00:00`);
  date.setHours(0, 0, 0, 0);
  
  // Thursday in current week decides the year
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  
  const week1 = new Date(date.getFullYear(), 0, 4);
  
  // Adjust to Thursday in week 1 and count number of weeks from date to week1
  const diff = date.getTime() - week1.getTime();
  const weekNumber = 1 + Math.round(((diff / 86400000) - 3 + (week1.getDay() + 6) % 7) / 7);
  
  return { year: date.getFullYear(), week: weekNumber };
}

/**
 * Returns weekly counts for ISO weeks overlapping the date range.
 */
export function getWeeklyCounts(records: RelapseRecord[], dateRange: DateRange): TimeSeriesPeriodEntry[] {
  const dates = iterateDateRange(dateRange.from, dateRange.to);
  if (dates.length === 0) return [];

  // Identify all unique weeks in the range
  const weeks = new Map<string, TimeSeriesPeriodEntry>();
  
  for (const date of dates) {
    const { year, week } = getISOWeekInfo(date);
    const key = `${year}-W${String(week).padStart(2, '0')}`;
    
    if (!weeks.has(key)) {
      const d = new Date(`${date}T00:00:00`);
      const day = d.getDay() || 7;
      const monday = new Date(d);
      monday.setDate(d.getDate() - day + 1);
      
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      
      const startDate = formatISO(monday);
      const endDate = formatISO(sunday);
      const isPartial = startDate < dateRange.from || endDate > dateRange.to;

      weeks.set(key, {
        date, // first date in range that falls into this week
        label: `الأسبوع ${week} (${year})`,
        count: 0,
        startDate,
        endDate,
        isPartial
      });
    }
  }

  // Aggregate record counts
  for (const record of records) {
    if (record.date >= dateRange.from && record.date <= dateRange.to) {
      const { year, week } = getISOWeekInfo(record.date);
      const key = `${year}-W${String(week).padStart(2, '0')}`;
      
      const entry = weeks.get(key);
      if (entry) {
        entry.count += record.count;
      }
    }
  }

  return Array.from(weeks.values());
}

/**
 * Returns monthly counts overlapping the date range.
 */
export function getMonthlyCounts(records: RelapseRecord[], dateRange: DateRange): TimeSeriesPeriodEntry[] {
  const dates = iterateDateRange(dateRange.from, dateRange.to);
  if (dates.length === 0) return [];

  const monthNamesAr = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  const months = new Map<string, TimeSeriesPeriodEntry>();

  for (const date of dates) {
    const d = new Date(`${date}T00:00:00`);
    const year = d.getFullYear();
    const month = d.getMonth();
    const key = `${year}-${String(month + 1).padStart(2, '0')}`;

    if (!months.has(key)) {
      const startDateStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const endOfMonth = new Date(year, month + 1, 0);
      const endDateStr = formatISO(endOfMonth);
      const isPartial = startDateStr < dateRange.from || endDateStr > dateRange.to;

      months.set(key, {
        date, // first date in range that falls into this month
        label: `${monthNamesAr[month]} ${year}`,
        count: 0,
        startDate: startDateStr,
        endDate: endDateStr,
        isPartial
      });
    }
  }

  // Aggregate record counts
  for (const record of records) {
    if (record.date >= dateRange.from && record.date <= dateRange.to) {
      const d = new Date(`${record.date}T00:00:00`);
      if (isNaN(d.getTime())) continue; // invalid date

      const year = d.getFullYear();
      const month = d.getMonth();
      const key = `${year}-${String(month + 1).padStart(2, '0')}`;
      
      const entry = months.get(key);
      if (entry) {
        entry.count += record.count;
      }
    }
  }

  return Array.from(months.values());
}

/**
 * Unified entry point for time series analytics.
 */
export function getTimeSeries(
  records: RelapseRecord[],
  dateRange: DateRange,
  granularity: Granularity
): TimeSeriesPeriodEntry[] {
  switch (granularity) {
    case 'daily':
      return getDailyCounts(records, dateRange);
    case 'weekly':
      return getWeeklyCounts(records, dateRange);
    case 'monthly':
      return getMonthlyCounts(records, dateRange);
    default:
      return [];
  }
}

/**
 * Computes a cumulative count series from an ordered list of periods.
 */
export function getCumulativeSeries(series: TimeSeriesPeriodEntry[]): TimeSeriesPeriodEntry[] {
  let runningTotal = 0;
  return series.map(entry => {
    runningTotal += entry.count;
    return {
      ...entry,
      count: runningTotal
    };
  });
}
