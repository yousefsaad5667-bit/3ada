import { getSummaryStatistics, getMovingAverage, getDistribution, getTrendSummary } from './statistics.engine';
import { RelapseRecord } from '../../models/relapse-record.model';

describe('Statistics Engine', () => {
  const mockRecords: RelapseRecord[] = [
    {
      id: '1', date: '2026-07-01', count: 2, urgeLevel: 8,
      time: null, ampm: null, reason: null, notes: null, createdAt: '', updatedAt: ''
    },
    {
      id: '2', date: '2026-07-02', count: 4, urgeLevel: 10,
      time: null, ampm: null, reason: null, notes: null, createdAt: '', updatedAt: ''
    },
    {
      id: '3', date: '2026-07-04', count: 6, urgeLevel: null,
      time: null, ampm: null, reason: null, notes: null, createdAt: '', updatedAt: ''
    }
  ];

  describe('getSummaryStatistics', () => {
    it('should compute statistics correctly for populated range', () => {
      const range = { from: '2026-07-01', to: '2026-07-04' }; // 4 days
      const result = getSummaryStatistics(mockRecords, range);
      
      expect(result.total).toBe(12); // 2 + 4 + 6
      expect(result.recordCount).toBe(3);
      expect(result.dailyAverage).toBe(3); // 12 / 4 days
      expect(result.min).toBe(2);
      expect(result.max).toBe(6);
      expect(result.median).toBe(4); // 2, 4, 6 -> median is 4
      expect(result.stdDev).toBeGreaterThan(0);
    });

    it('should handle single record correctly', () => {
      const range = { from: '2026-07-01', to: '2026-07-01' };
      const result = getSummaryStatistics([mockRecords[0]], range);
      
      expect(result.total).toBe(2);
      expect(result.min).toBe(2);
      expect(result.max).toBe(2);
      expect(result.median).toBe(2);
      expect(result.stdDev).toBe(0); // Sample stddev of 1 item is 0
    });

    it('should handle empty array correctly without throwing', () => {
      const range = { from: '2026-07-01', to: '2026-07-04' };
      const result = getSummaryStatistics([], range);
      
      expect(result.total).toBe(0);
      expect(result.dailyAverage).toBe(0);
      expect(result.min).toBe(0);
      expect(result.max).toBe(0);
    });
  });

  describe('getMovingAverage', () => {
    it('should calculate expanding window correctly', () => {
      const series = [
        { date: '1', label: '1', count: 10 },
        { date: '2', label: '2', count: 20 },
        { date: '3', label: '3', count: 30 }
      ];
      
      const result = getMovingAverage(series, 3);
      
      expect(result[0].count).toBe(10); // 10 / 1
      expect(result[1].count).toBe(15); // (10 + 20) / 2
      expect(result[2].count).toBe(20); // (10 + 20 + 30) / 3
    });
  });

  describe('getDistribution', () => {
    it('should calculate urgeLevel distribution', () => {
      const result = getDistribution(mockRecords, 'urgeLevel');
      
      expect(result.length).toBe(10);
      expect(result[7].count).toBe(1); // urgeLevel 8
      expect(result[9].count).toBe(1); // urgeLevel 10
      expect(result[0].count).toBe(0); // urgeLevel 1
      
      // 2 records have urge out of 3 total records
      expect(result[7].percentage).toBe(50);
      expect(result[9].percentage).toBe(50);
    });

    it('should calculate count distribution with buckets', () => {
      // Counts: 2, 4, 6
      const result = getDistribution(mockRecords, 'count', 3);
      expect(result.length).toBeGreaterThan(0);
      // Min is 2, max is 6, range is 4. bucket size = max(1, Math.ceil(4/3)) = 2.
      // Buckets: 2-3, 4-5, 6-7
      expect(result[0].min).toBe(2);
      expect(result[0].count).toBe(1); // value 2
      
      expect(result[1].min).toBe(4);
      expect(result[1].count).toBe(1); // value 4
    });

    it('should handle dataset where all counts are identical', () => {
      const identicalRecords = [
         { ...mockRecords[0], count: 5 },
         { ...mockRecords[0], count: 5 }
      ];
      const result = getDistribution(identicalRecords, 'count', 10);
      expect(result.length).toBe(1);
      expect(result[0].count).toBe(2);
      expect(result[0].min).toBe(5);
      expect(result[0].max).toBe(5);
    });
  });

  describe('getTrendSummary', () => {
    it('should return insufficient-data for less than 4 points', () => {
      const result = getTrendSummary([{ date: '1', label: '1', count: 10 }]);
      expect(result.direction).toBe('insufficient-data');
      expect(result.confidence).toBe('insufficient');
      expect(result.averageValue).toBe(10);
    });

    it('should detect increasing trend', () => {
      const series = [
        { date: '1', label: '1', count: 10 },
        { date: '2', label: '2', count: 10 },
        { date: '3', label: '3', count: 20 },
        { date: '4', label: '4', count: 20 }
      ];
      const result = getTrendSummary(series);
      expect(result.direction).toBe('increasing');
      expect(result.comparisonStartValue).toBe(10);
      expect(result.comparisonEndValue).toBe(20);
      expect(result.growthRatePercent).toBe(100);
      expect(result.confidence).toBe('low'); // length 4 is low confidence
    });

    it('should detect decreasing trend', () => {
      const series = [
        { date: '1', label: '1', count: 20 },
        { date: '2', label: '2', count: 20 },
        { date: '3', label: '3', count: 10 },
        { date: '4', label: '4', count: 10 }
      ];
      const result = getTrendSummary(series);
      expect(result.direction).toBe('decreasing');
      expect(result.comparisonStartValue).toBe(20);
      expect(result.comparisonEndValue).toBe(10);
      expect(result.growthRatePercent).toBe(-50);
    });

    it('should detect stable trend for small changes', () => {
      const series = [
        { date: '1', label: '1', count: 100 },
        { date: '2', label: '2', count: 100 },
        { date: '3', label: '3', count: 101 },
        { date: '4', label: '4', count: 101 }
      ];
      const result = getTrendSummary(series);
      expect(result.direction).toBe('stable');
      expect(result.growthRatePercent).toBe(1); // 1%
    });

    it('should assign medium confidence for >= 14 days', () => {
      const series = Array.from({ length: 14 }, (_, i) => ({ date: `${i}`, label: `${i}`, count: 10 }));
      const result = getTrendSummary(series);
      expect(result.confidence).toBe('medium');
    });

    it('should assign high confidence for >= 30 days', () => {
      const series = Array.from({ length: 30 }, (_, i) => ({ date: `${i}`, label: `${i}`, count: 10 }));
      const result = getTrendSummary(series);
      expect(result.confidence).toBe('high');
    });
  });
});
