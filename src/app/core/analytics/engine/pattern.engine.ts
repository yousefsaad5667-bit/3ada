import { RelapseRecord } from '../../models/relapse-record.model';
import { HourEntry, WeekdayEntry } from '../models/analytics.types';

/**
 * Returns a distribution of records by weekday.
 * 0 = Sunday, 1 = Monday, ... 6 = Saturday
 */
export function getWeekdayAnalysis(records: RelapseRecord[]): WeekdayEntry[] {
  const weekdayLabelsAr = [
    'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'
  ];

  const result: WeekdayEntry[] = Array.from({ length: 7 }, (_, i) => ({
    weekday: i,
    labelAr: weekdayLabelsAr[i],
    count: 0,
    percentage: 0
  }));

  if (records.length === 0) return result;

  let totalRecords = 0;
  for (const record of records) {
    const d = new Date(`${record.date}T00:00:00`);
    if (isNaN(d.getTime())) continue;

    const day = d.getDay();
    result[day].count += record.count;
    totalRecords += record.count;
  }

  if (totalRecords > 0) {
    for (const entry of result) {
      entry.percentage = Number(((entry.count / totalRecords) * 100).toFixed(1));
    }
  }

  return result;
}

/**
 * Returns a distribution of records by hour of day (0-23).
 * Records with time === null are excluded from hour entries and counted in `skipped`.
 */
export function getHourAnalysis(records: RelapseRecord[]): { entries: HourEntry[]; skipped: number } {
  const entries: HourEntry[] = Array.from({ length: 24 }, (_, i) => {
    let label = '';
    if (i === 0) label = '12 ص';
    else if (i < 12) label = `${i} ص`;
    else if (i === 12) label = '12 م';
    else label = `${i - 12} م`;

    return {
      hour: i,
      label,
      count: 0
    };
  });

  let skipped = 0;

  for (const record of records) {
    if (!record.time) {
      skipped += record.count;
      continue;
    }

    // time is expected to be 'HH:mm'
    const parts = record.time.split(':');
    if (parts.length >= 2) {
      const hour = parseInt(parts[0], 10);
      if (!isNaN(hour) && hour >= 0 && hour <= 23) {
        // Assume 24-hour time format from the input string natively if ampm is not used for adjustments,
        // The spec implies HH:mm from standard input but ampm may be set. 
        // We will just use the HH part directly if it's already 24h format,
        // Or adjust it based on 'ampm' field.
        let finalHour = hour;
        if (record.ampm === 'pm' && hour < 12) {
          finalHour += 12;
        } else if (record.ampm === 'am' && hour === 12) {
          finalHour = 0;
        }

        if (finalHour >= 0 && finalHour <= 23) {
          entries[finalHour].count += record.count;
        } else {
           skipped += record.count;
        }
      } else {
        skipped += record.count;
      }
    } else {
      skipped += record.count;
    }
  }

  return { entries, skipped };
}
