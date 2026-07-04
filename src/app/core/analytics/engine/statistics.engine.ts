import { RelapseRecord } from '../../models/relapse-record.model';
import { DateRange, DistributionEntry, SummaryStatistics, TimeSeriesEntry } from '../models/analytics.types';
import { numberOfDays } from '../utils/date-range.utils';

/**
 * Computes summary statistics (total, average, median, min, max, stdDev)
 * for a given record set filtered to a date range.
 */
export function getSummaryStatistics(records: RelapseRecord[], dateRange: DateRange): SummaryStatistics {
  const filteredRecords = records.filter(r => r.date >= dateRange.from && r.date <= dateRange.to);
  const daysInRange = numberOfDays(dateRange.from, dateRange.to);

  if (filteredRecords.length === 0) {
    return {
      total: 0,
      recordCount: 0,
      dailyAverage: 0,
      median: 0,
      min: 0,
      max: 0,
      stdDev: 0
    };
  }

  const counts = filteredRecords.map(r => r.count).sort((a, b) => a - b);
  const total = counts.reduce((sum, val) => sum + val, 0);
  const recordCount = counts.length;
  const min = counts[0];
  const max = counts[counts.length - 1];

  let median = 0;
  if (recordCount % 2 === 0) {
    median = (counts[recordCount / 2 - 1] + counts[recordCount / 2]) / 2;
  } else {
    median = counts[Math.floor(recordCount / 2)];
  }

  const dailyAverage = daysInRange > 0 ? total / daysInRange : 0;
  const averagePerRecord = total / recordCount;

  const sumOfSquaredDifferences = counts.reduce((sum, val) => sum + Math.pow(val - averagePerRecord, 2), 0);
  // Using sample standard deviation (N - 1) when N > 1, else 0
  const stdDev = recordCount > 1 ? Math.sqrt(sumOfSquaredDifferences / (recordCount - 1)) : 0;

  return {
    total,
    recordCount,
    dailyAverage: Number(dailyAverage.toFixed(2)),
    median,
    min,
    max,
    stdDev: Number(stdDev.toFixed(2))
  };
}

/**
 * Computes a simple moving average over a time series.
 * @param series The daily or weekly time series
 * @param windowSize The smoothing window size (default 7)
 */
export function getMovingAverage(series: TimeSeriesEntry[], windowSize = 7): TimeSeriesEntry[] {
  if (series.length === 0) return [];
  if (windowSize < 1) windowSize = 1;

  return series.map((entry, index) => {
    // For early entries where we don't have a full window, we use whatever we have (expanding window)
    const startIndex = Math.max(0, index - windowSize + 1);
    const windowSlice = series.slice(startIndex, index + 1);
    const sum = windowSlice.reduce((acc, val) => acc + val.count, 0);
    const average = sum / windowSlice.length;

    return {
      ...entry,
      count: Number(average.toFixed(2))
    };
  });
}

import { TrendAnalysisResult } from '../models/analytics.types';

/**
 * Computes the trend of a time series by comparing the first half to the second half.
 * @param series The time series (usually daily counts)
 */
export function getTrendSummary(series: TimeSeriesEntry[]): TrendAnalysisResult {
  const n = series.length;
  
  if (n < 4) {
    return {
      direction: 'insufficient-data',
      growthRatePercent: null,
      averageValue: n > 0 ? series.reduce((sum, val) => sum + val.count, 0) / n : 0,
      comparisonStartValue: 0,
      comparisonEndValue: 0,
      confidence: 'insufficient'
    };
  }

  const averageValue = series.reduce((sum, val) => sum + val.count, 0) / n;
  
  const mid = Math.floor(n / 2);
  const firstHalf = series.slice(0, mid);
  const secondHalf = series.slice(n - mid); // ensure equal size if odd
  
  const startSum = firstHalf.reduce((sum, val) => sum + val.count, 0);
  const endSum = secondHalf.reduce((sum, val) => sum + val.count, 0);
  
  const comparisonStartValue = startSum / mid;
  const comparisonEndValue = endSum / mid;
  
  let growthRatePercent: number | null = null;
  if (comparisonStartValue === 0) {
    if (comparisonEndValue > 0) {
      growthRatePercent = 100; // arbitrary positive representation when starting from 0
    } else {
      growthRatePercent = 0;
    }
  } else {
    growthRatePercent = ((comparisonEndValue - comparisonStartValue) / comparisonStartValue) * 100;
  }
  
  let direction: 'increasing' | 'decreasing' | 'stable' = 'stable';
  if (growthRatePercent > 5) {
    direction = 'increasing';
  } else if (growthRatePercent < -5) {
    direction = 'decreasing';
  }

  let confidence: 'high' | 'medium' | 'low' | 'insufficient' = 'low';
  if (n >= 30) {
    confidence = 'high';
  } else if (n >= 14) {
    confidence = 'medium';
  }

  return {
    direction,
    growthRatePercent: growthRatePercent !== null ? Number(growthRatePercent.toFixed(1)) : null,
    averageValue: Number(averageValue.toFixed(2)),
    comparisonStartValue: Number(comparisonStartValue.toFixed(2)),
    comparisonEndValue: Number(comparisonEndValue.toFixed(2)),
    confidence
  };
}

/**
 * Computes the distribution of a numeric field.
 * For `urgeLevel`: 10 buckets (1-10).
 * For `count`: `bucketCount` equal-width buckets from min to max.
 */
export function getDistribution(
  records: RelapseRecord[],
  field: 'urgeLevel' | 'count',
  bucketCount = 10
): DistributionEntry[] {
  if (records.length === 0) return [];

  const values: number[] = [];
  for (const r of records) {
    if (field === 'urgeLevel') {
      if (r.urgeLevel !== null && r.urgeLevel !== undefined) {
        values.push(r.urgeLevel);
      }
    } else {
      values.push(r.count);
    }
  }

  if (values.length === 0) return [];

  const total = values.length;

  if (field === 'urgeLevel') {
    // Fixed 1-10 buckets
    const result: DistributionEntry[] = Array.from({ length: 10 }, (_, i) => ({
      label: String(i + 1),
      min: i + 1,
      max: i + 1,
      count: 0,
      percentage: 0
    }));

    for (const val of values) {
      if (val >= 1 && val <= 10) {
        result[val - 1].count++;
      }
    }

    return result.map(bucket => ({
      ...bucket,
      percentage: Number(((bucket.count / total) * 100).toFixed(1))
    }));
  } else {
    // Equal-width buckets for count
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);

    if (minVal === maxVal) {
      return [{
        label: `${minVal}`,
        min: minVal,
        max: maxVal,
        count: total,
        percentage: 100
      }];
    }

    const range = maxVal - minVal;
    // ensure bucket size is at least 1 since count is an integer
    const bucketSize = Math.max(1, Math.ceil(range / bucketCount));
    
    // adjust bucketCount if bucketSize is 1 to avoid many empty trailing buckets
    if (bucketSize === 1) {
      bucketCount = range + 1;
    }

    const buckets: DistributionEntry[] = Array.from({ length: bucketCount }, (_, i) => {
      const bMin = minVal + (i * bucketSize);
      let bMax = bMin + bucketSize - 1;
      
      // The last bucket might need to just catch the max value exactly
      if (i === bucketCount - 1) {
         bMax = Math.max(bMax, maxVal);
      }

      return {
        label: bMin === bMax ? `${bMin}` : `${bMin}-${bMax}`,
        min: bMin,
        max: bMax,
        count: 0,
        percentage: 0
      };
    });

    for (const val of values) {
      // Find which bucket this value belongs to
      for (let i = 0; i < buckets.length; i++) {
        if (val >= buckets[i].min && val <= buckets[i].max) {
          buckets[i].count++;
          break;
        }
      }
    }

    return buckets.map(bucket => ({
      ...bucket,
      percentage: Number(((bucket.count / total) * 100).toFixed(1))
    }));
  }
}
