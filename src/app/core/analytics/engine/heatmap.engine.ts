import { RelapseRecord } from '../../models/relapse-record.model';
import { DateRange, HeatmapEntry } from '../models/analytics.types';
import { iterateDateRange } from '../utils/date-range.utils';

/**
 * Returns a heatmap distribution of relapse counts.
 * Includes a normalized intensity value from 0 to 1.
 */
export function getHeatmap(records: RelapseRecord[], dateRange: DateRange): HeatmapEntry[] {
  const dates = iterateDateRange(dateRange.from, dateRange.to);
  if (dates.length === 0) return [];

  const countsByDate = new Map<string, number>();
  let maxCount = 0;

  for (const record of records) {
    if (record.date >= dateRange.from && record.date <= dateRange.to) {
      const newCount = (countsByDate.get(record.date) || 0) + record.count;
      countsByDate.set(record.date, newCount);
      if (newCount > maxCount) {
        maxCount = newCount;
      }
    }
  }

  return dates.map(date => {
    const count = countsByDate.get(date) || 0;
    return {
      date,
      count,
      intensity: maxCount > 0 ? Number((count / maxCount).toFixed(2)) : 0
    };
  });
}
