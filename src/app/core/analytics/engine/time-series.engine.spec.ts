import { getDailyCounts, getWeeklyCounts, getMonthlyCounts, getTimeSeries, getCumulativeSeries } from './time-series.engine';
import { RelapseRecord } from '../../models/relapse-record.model';

describe('TimeSeries Engine', () => {
  const mockRecords: RelapseRecord[] = [
    {
      id: '1',
      date: '2026-07-01',
      time: null,
      ampm: null,
      count: 2,
      urgeLevel: null,
      reason: null,
      notes: null,
      createdAt: '',
      updatedAt: ''
    },
    {
      id: '2',
      date: '2026-07-02',
      time: null,
      ampm: null,
      count: 1,
      urgeLevel: null,
      reason: null,
      notes: null,
      createdAt: '',
      updatedAt: ''
    },
    {
      id: '3',
      date: '2026-07-04',
      time: null,
      ampm: null,
      count: 3,
      urgeLevel: null,
      reason: null,
      notes: null,
      createdAt: '',
      updatedAt: ''
    }
  ];

  describe('getDailyCounts', () => {
    it('should return daily counts zero-filled', () => {
      const range = { from: '2026-07-01', to: '2026-07-04' };
      const result = getDailyCounts(mockRecords, range);
      
      expect(result.length).toBe(4);
      
      expect(result[0].date).toBe('2026-07-01');
      expect(result[0].count).toBe(2);
      
      expect(result[1].date).toBe('2026-07-02');
      expect(result[1].count).toBe(1);
      
      expect(result[2].date).toBe('2026-07-03');
      expect(result[2].count).toBe(0); // Zero-filled
      
      expect(result[3].date).toBe('2026-07-04');
      expect(result[3].count).toBe(3);
    });

    it('should handle empty records array', () => {
      const range = { from: '2026-07-01', to: '2026-07-02' };
      const result = getDailyCounts([], range);
      
      expect(result.length).toBe(2);
      expect(result[0].count).toBe(0);
      expect(result[1].count).toBe(0);
    });
  });

  describe('getWeeklyCounts', () => {
    it('should aggregate counts by ISO week', () => {
      const records: RelapseRecord[] = [
        { ...mockRecords[0], date: '2026-01-01', count: 1 }, // Thu (Week 1)
        { ...mockRecords[0], date: '2026-01-04', count: 2 }, // Sun (Week 1)
        { ...mockRecords[0], date: '2026-01-05', count: 3 }  // Mon (Week 2)
      ];
      
      const range = { from: '2026-01-01', to: '2026-01-07' };
      const result = getWeeklyCounts(records, range);
      
      // Should have 2 weeks
      expect(result.length).toBe(2);
      expect(result[0].label).toContain('الأسبوع 1');
      expect(result[0].count).toBe(3); // 1 + 2
      
      expect(result[1].label).toContain('الأسبوع 2');
      expect(result[1].count).toBe(3);
    });

    it('should set startDate, endDate, and isPartial for overlapping periods', () => {
      // 2026-01-01 is a Thursday in Week 1
      const range = { from: '2026-01-02', to: '2026-01-06' }; 
      const result = getWeeklyCounts([], range);
      
      expect(result.length).toBe(2); // Week 1 (ending Jan 4), Week 2 (starting Jan 5)
      
      expect(result[0].startDate).toBe('2025-12-29'); // Monday
      expect(result[0].endDate).toBe('2026-01-04'); // Sunday
      expect(result[0].isPartial).toBe(true); // Range starts Jan 2
      
      expect(result[1].startDate).toBe('2026-01-05'); // Monday
      expect(result[1].endDate).toBe('2026-01-11'); // Sunday
      expect(result[1].isPartial).toBe(true); // Range ends Jan 6
    });
  });

  describe('getMonthlyCounts', () => {
    it('should aggregate counts by month', () => {
      const records: RelapseRecord[] = [
        { ...mockRecords[0], date: '2026-01-15', count: 2 },
        { ...mockRecords[0], date: '2026-01-31', count: 1 },
        { ...mockRecords[0], date: '2026-02-01', count: 4 }
      ];
      
      const range = { from: '2026-01-01', to: '2026-02-28' };
      const result = getMonthlyCounts(records, range);
      
      expect(result.length).toBe(2); // Jan, Feb
      
      expect(result[0].count).toBe(3);
      expect(result[0].label).toContain('يناير');
      
      expect(result[1].count).toBe(4);
      expect(result[1].label).toContain('فبراير');
    });

    it('should set startDate, endDate, and isPartial for overlapping periods', () => {
      const range = { from: '2026-01-15', to: '2026-02-15' };
      const result = getMonthlyCounts([], range);
      
      expect(result.length).toBe(2);
      
      expect(result[0].startDate).toBe('2026-01-01');
      expect(result[0].endDate).toBe('2026-01-31');
      expect(result[0].isPartial).toBe(true); // Range starts Jan 15
      
      expect(result[1].startDate).toBe('2026-02-01');
      expect(result[1].endDate).toBe('2026-02-28');
      expect(result[1].isPartial).toBe(true); // Range ends Feb 15
    });
  });

  describe('getTimeSeries', () => {
    it('should delegate to daily', () => {
      const range = { from: '2026-07-01', to: '2026-07-02' };
      const result = getTimeSeries(mockRecords, range, 'daily');
      expect(result.length).toBe(2);
    });

    it('should delegate to weekly', () => {
      const range = { from: '2026-07-01', to: '2026-07-14' };
      const result = getTimeSeries([], range, 'weekly');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should delegate to monthly', () => {
      const range = { from: '2026-01-01', to: '2026-02-28' };
      const result = getTimeSeries([], range, 'monthly');
      expect(result.length).toBe(2);
    });
  });

  describe('getCumulativeSeries', () => {
    it('should accumulate counts correctly over time', () => {
      // Mock series with counts: 2, 0, 3
      const series = [
        { count: 2, date: '2026-01-01', label: '1', startDate: '2026-01-01', endDate: '2026-01-01', isPartial: false },
        { count: 0, date: '2026-01-02', label: '2', startDate: '2026-01-02', endDate: '2026-01-02', isPartial: false },
        { count: 3, date: '2026-01-03', label: '3', startDate: '2026-01-03', endDate: '2026-01-03', isPartial: false }
      ];
      
      const result = getCumulativeSeries(series);
      
      expect(result.length).toBe(3);
      expect(result[0].count).toBe(2);
      expect(result[1].count).toBe(2); // 2 + 0
      expect(result[2].count).toBe(5); // 2 + 0 + 3
    });
  });
});
