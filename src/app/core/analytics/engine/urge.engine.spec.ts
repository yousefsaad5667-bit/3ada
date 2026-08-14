import { getUrgeAnalysis } from './urge.engine';
import { RelapseRecord } from '../../models/relapse-record.model';

describe('Urge Engine', () => {
  const mockRecords: RelapseRecord[] = [
    {
      id: '1', date: '2026-07-01', count: 1, urgeLevel: 5,
      time: null, ampm: null, reason: null, notes: null, createdAt: '', updatedAt: ''
    },
    {
      id: '2', date: '2026-07-02', count: 2, urgeLevel: 8,
      time: null, ampm: null, reason: null, notes: null, createdAt: '', updatedAt: ''
    },
    {
      id: '3', date: '2026-07-03', count: 1, urgeLevel: null,
      time: null, ampm: null, reason: null, notes: null, createdAt: '', updatedAt: ''
    }
  ];

  describe('getUrgeAnalysis', () => {
    it('should aggregate urge data correctly, weighting by count', () => {
      const range = { from: '2026-07-01', to: '2026-07-03' };
      const result = getUrgeAnalysis(mockRecords, range);
      
      // Urges: 5, 8, 8 (since count is 2 for level 8)
      expect(result.min).toBe(5);
      expect(result.max).toBe(8);
      expect(result.median).toBe(8);
      
      // avg = (5 + 8 + 8) / 3 = 7
      expect(result.average).toBe(7);
      
      // Time series should skip days with no urge data
      expect(result.timeSeries.length).toBe(2);
      expect(result.timeSeries[0].date).toBe('2026-07-01');
      expect(result.timeSeries[0].count).toBe(5);
      expect(result.timeSeries[1].date).toBe('2026-07-02');
      expect(result.timeSeries[1].count).toBe(8);
    });

    it('should return nulls if no records have urge data', () => {
      const records = [mockRecords[2]]; // urge is null
      const range = { from: '2026-07-01', to: '2026-07-03' };
      const result = getUrgeAnalysis(records, range);
      
      expect(result.average).toBeNull();
      expect(result.min).toBeNull();
      expect(result.timeSeries.length).toBe(0);
    });
  });

  describe('getUrgeByHour', () => {
    it('should calculate average urge by hour', () => {
      const records: RelapseRecord[] = [
        { id: '1', date: '2026-07-01', time: '14:30', count: 1, urgeLevel: 8 } as any,
        { id: '2', date: '2026-07-01', time: '14:45', count: 2, urgeLevel: 5 } as any,
        { id: '3', date: '2026-07-01', time: '09:00', count: 1, urgeLevel: 2 } as any,
        { id: '4', date: '2026-07-01', time: '10:00', count: 1, urgeLevel: null } as any
      ];
      
      const result = getUrgeByHour(records);
      expect(result.length).toBe(24);
      
      // Hour 14: (8 * 1 + 5 * 2) / 3 = 18 / 3 = 6
      expect(result[14].avgUrge).toBe(6);
      
      // Hour 9: (2 * 1) / 1 = 2
      expect(result[9].avgUrge).toBe(2);
      
      // Hour 10 (null urge):
      expect(result[10].avgUrge).toBeNull();
      
      // Empty hour:
      expect(result[0].avgUrge).toBeNull();
    });
  });

  describe('getUrgeByWeekday', () => {
    it('should calculate average urge by weekday', () => {
      const records: RelapseRecord[] = [
        { id: '1', date: '2026-07-01', count: 1, urgeLevel: 8 } as any, // Wed (3)
        { id: '2', date: '2026-07-08', count: 2, urgeLevel: 5 } as any, // Wed (3)
        { id: '3', date: '2026-07-02', count: 1, urgeLevel: 2 } as any, // Thu (4)
        { id: '4', date: '2026-07-02', count: 1, urgeLevel: null } as any // Thu (4)
      ];
      
      const result = getUrgeByWeekday(records);
      expect(result.length).toBe(7);
      
      // Wednesday (index 3): (8 * 1 + 5 * 2) / 3 = 18 / 3 = 6
      expect(result[3].avgUrge).toBe(6);
      
      // Thursday (index 4): (2 * 1) / 1 = 2 (ignores null)
      expect(result[4].avgUrge).toBe(2);
      
      // Empty day:
      expect(result[0].avgUrge).toBeNull();
    });
  });

  describe('getUrgeCorrelation', () => {
    it('should return insufficient data if < 10 weeks of urge data', () => {
      const records: RelapseRecord[] = [
        { id: '1', date: '2026-07-01', count: 1, urgeLevel: 5 } as any
      ];
      const range = { from: '2026-01-01', to: '2026-12-31' };
      const { getUrgeCorrelation } = require('./urge.engine');
      
      const result = getUrgeCorrelation(records, range);
      expect(result.direction).toBe('insufficient-data');
      expect(result.pearsonR).toBeNull();
      expect(result.weeklyBucketsCount).toBe(1);
    });

    it('should calculate correlation with >= 10 weeks of data', () => {
      const records: RelapseRecord[] = [];
      // Generate 10 weeks of positive correlation data
      for (let i = 1; i <= 10; i++) {
        records.push({
          id: `w${i}`,
          date: `2026-0${i < 10 ? '0' + i : i}-01`, // Rough weekly spread for test purposes
          count: i, // Increasing relapse count
          urgeLevel: Math.min(i, 10) // Increasing urge
        } as any);
      }
      const range = { from: '2026-01-01', to: '2026-12-31' };
      const { getUrgeCorrelation } = require('./urge.engine');
      
      const result = getUrgeCorrelation(records, range);
      expect(result.direction).toBe('positive');
      expect(result.pearsonR).toBeGreaterThan(0.5);
      expect(result.weeklyBucketsCount).toBe(10);
    });
  });
});
