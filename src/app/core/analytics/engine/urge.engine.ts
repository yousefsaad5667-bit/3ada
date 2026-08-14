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

export function getUrgeByHour(records: RelapseRecord[]): import('../models/analytics.types').UrgeHourEntry[] {
  const filtered = records.filter(r => r.urgeLevel !== null && r.urgeLevel !== undefined);
  
  const hourSums = new Array(24).fill(0);
  const hourCounts = new Array(24).fill(0);

  for (const r of filtered) {
    if (!r.time) continue;
    const [h] = r.time.split(':');
    const hour = parseInt(h, 10);
    if (!isNaN(hour) && hour >= 0 && hour <= 23) {
      hourSums[hour] += r.urgeLevel! * r.count;
      hourCounts[hour] += r.count;
    }
  }

  const results: import('../models/analytics.types').UrgeHourEntry[] = [];
  for (let i = 0; i < 24; i++) {
    const isAm = i < 12;
    const displayHour = i === 0 ? 12 : (i > 12 ? i - 12 : i);
    const label = `${displayHour} ${isAm ? 'ص' : 'م'}`;
    
    results.push({
      hour: i,
      label,
      avgUrge: hourCounts[i] > 0 ? Number((hourSums[i] / hourCounts[i]).toFixed(1)) : null
    });
  }

  return results;
}

export function getUrgeByWeekday(records: RelapseRecord[]): import('../models/analytics.types').UrgeWeekdayEntry[] {
  const filtered = records.filter(r => r.urgeLevel !== null && r.urgeLevel !== undefined);
  
  const weekdaySums = new Array(7).fill(0);
  const weekdayCounts = new Array(7).fill(0);

  for (const r of filtered) {
    const d = new Date(`${r.date}T00:00:00`);
    const day = d.getDay();
    if (!isNaN(day) && day >= 0 && day <= 6) {
      weekdaySums[day] += r.urgeLevel! * r.count;
      weekdayCounts[day] += r.count;
    }
  }

  const arabicWeekdays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  
  const results: import('../models/analytics.types').UrgeWeekdayEntry[] = [];
  for (let i = 0; i < 7; i++) {
    results.push({
      weekday: i,
      labelAr: arabicWeekdays[i],
      avgUrge: weekdayCounts[i] > 0 ? Number((weekdaySums[i] / weekdayCounts[i]).toFixed(1)) : null
    });
  }

  return results;
}

function getStartOfWeek(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // ISO week (Monday is 1)
  const start = new Date(d.setDate(diff));
  return formatISO(start);
}

function formatISO(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getUrgeCorrelation(records: RelapseRecord[], dateRange: DateRange): import('../models/analytics.types').UrgeCorrelationResult {
  const filteredRecords = records.filter(
    r => r.date >= dateRange.from && r.date <= dateRange.to
  );

  const weeklyData = new Map<string, { urgeSum: number; urgeCount: number; relapseCount: number }>();
  
  for (const r of filteredRecords) {
    const weekStart = getStartOfWeek(r.date);
    if (!weeklyData.has(weekStart)) {
      weeklyData.set(weekStart, { urgeSum: 0, urgeCount: 0, relapseCount: 0 });
    }
    const data = weeklyData.get(weekStart)!;
    data.relapseCount += r.count;
    if (r.urgeLevel !== null && r.urgeLevel !== undefined) {
      data.urgeSum += r.urgeLevel * r.count;
      data.urgeCount += r.count;
    }
  }

  // Filter to weeks that have at least some urge data
  const validWeeks = Array.from(weeklyData.values()).filter(w => w.urgeCount > 0);
  
  if (validWeeks.length < 10) {
    return {
      direction: 'insufficient-data',
      pearsonR: null,
      explanationAr: 'لا تتوفر بيانات كافية لاستنتاج الارتباط. مطلوب بيانات ١٠ أسابيع على الأقل.',
      weeklyBucketsCount: validWeeks.length
    };
  }

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
  const n = validWeeks.length;

  for (const w of validWeeks) {
    const x = w.urgeSum / w.urgeCount; // avg urge for week
    const y = w.relapseCount; // relapses for week
    
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
    sumY2 += y * y;
  }

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  
  const r = denominator === 0 ? 0 : numerator / denominator;
  const pearsonR = Number(r.toFixed(2));
  
  let direction: 'positive' | 'negative' | 'neutral' = 'neutral';
  let explanationAr = 'لا يوجد ارتباط واضح بين شدة الرغبة ومعدل الانتكاس.';
  
  if (r > 0.3) {
    direction = 'positive';
    explanationAr = 'هناك ارتباط إيجابي؛ الأسابيع التي تشهد رغبات شديدة تميل إلى تسجيل حالات انتكاس أكثر.';
  } else if (r < -0.3) {
    direction = 'negative';
    explanationAr = 'هناك ارتباط سلبي؛ الأسابيع التي تشهد رغبات شديدة تميل إلى تسجيل حالات انتكاس أقل.';
  }

  return {
    direction,
    pearsonR,
    explanationAr,
    weeklyBucketsCount: n
  };
}
