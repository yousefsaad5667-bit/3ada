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
});
