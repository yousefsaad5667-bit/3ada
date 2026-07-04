import { RelapseRecord } from '../../models/relapse-record.model';
import { DateRange, UrgeAnalysisResult, TimeSeriesEntry } from '../models/analytics.types';
import { iterateDateRange } from '../utils/date-range.utils';

/**
 * Returns summary statistics and a time series of urge levels.
 * Excludes records with no urge data.
 */
export function getUrgeAnalysis(records: RelapseRecord[], dateRange: DateRange): UrgeAnalysisResult {
  const filteredRecords = records.filter(
    r => r.date >= dateRange.from && r.date <= dateRange.to && r.urgeLevel !== null && r.urgeLevel !== undefined
  );

  if (filteredRecords.length === 0) {
    return {
      average: null,
      median: null,
      min: null,
      max: null,
      timeSeries: []
    };
  }

  // Calculate statistics over records where urge is present
  // Weight by count? The spec says "UrgeAnalysisResult: average, median, min, max".
  // If one record has count=2 and urgeLevel=8, it means two relapses happened with urge 8.
  // We should unroll or weight them.
  const urgeValues: number[] = [];
  for (const r of filteredRecords) {
    for (let i = 0; i < r.count; i++) {
      urgeValues.push(r.urgeLevel!);
    }
  }

  urgeValues.sort((a, b) => a - b);
  const sum = urgeValues.reduce((acc, val) => acc + val, 0);
  const count = urgeValues.length;

  const average = Number((sum / count).toFixed(1));
  const min = urgeValues[0];
  const max = urgeValues[count - 1];

  let median = 0;
  if (count % 2 === 0) {
    median = (urgeValues[count / 2 - 1] + urgeValues[count / 2]) / 2;
  } else {
    median = urgeValues[Math.floor(count / 2)];
  }

  // Calculate time series of daily average urge
  const dates = iterateDateRange(dateRange.from, dateRange.to);
  const timeSeries: TimeSeriesEntry[] = [];
  
  const recordsByDate = new Map<string, RelapseRecord[]>();
  for (const r of filteredRecords) {
    if (!recordsByDate.has(r.date)) {
      recordsByDate.set(r.date, []);
    }
    recordsByDate.get(r.date)!.push(r);
  }

  const monthNamesAr = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  for (const date of dates) {
    const dayRecords = recordsByDate.get(date) || [];
    if (dayRecords.length > 0) {
      let daySum = 0;
      let dayCount = 0;
      for (const dr of dayRecords) {
         daySum += (dr.urgeLevel!) * dr.count;
         dayCount += dr.count;
      }
      
      const d = new Date(`${date}T00:00:00`);
      timeSeries.push({
        date,
        label: `${d.getDate()} ${monthNamesAr[d.getMonth()]}`,
        count: Number((daySum / dayCount).toFixed(1))
      });
    }
  }

  return {
    average,
    median,
    min,
    max,
    timeSeries
  };
}
