import { getHeatmap } from './heatmap.engine';
import { RelapseRecord } from '../../models/relapse-record.model';

describe('Heatmap Engine', () => {
  const mockRecords: RelapseRecord[] = [
    {
      id: '1', date: '2026-07-01', count: 2,
      time: null, ampm: null, urgeLevel: null, reason: null, notes: null, createdAt: '', updatedAt: ''
    },
    {
      id: '2', date: '2026-07-02', count: 8,
      time: null, ampm: null, urgeLevel: null, reason: null, notes: null, createdAt: '', updatedAt: ''
    },
    {
      id: '3', date: '2026-07-04', count: 4,
      time: null, ampm: null, urgeLevel: null, reason: null, notes: null, createdAt: '', updatedAt: ''
    }
  ];

  describe('getHeatmap', () => {
    it('should generate heatmap entries with normalized intensity', () => {
      const range = { from: '2026-07-01', to: '2026-07-04' };
      const result = getHeatmap(mockRecords, range);
      
      expect(result.length).toBe(4);
      
      // max count is 8
      expect(result[0].date).toBe('2026-07-01');
      expect(result[0].count).toBe(2);
      expect(result[0].intensity).toBe(0.25); // 2/8
      
      expect(result[1].date).toBe('2026-07-02');
      expect(result[1].count).toBe(8);
      expect(result[1].intensity).toBe(1); // 8/8
      
      expect(result[2].date).toBe('2026-07-03');
      expect(result[2].count).toBe(0);
      expect(result[2].intensity).toBe(0); // 0/8
      
      expect(result[3].date).toBe('2026-07-04');
      expect(result[3].count).toBe(4);
      expect(result[3].intensity).toBe(0.5); // 4/8
    });

    it('should handle zero max count gracefully', () => {
      const range = { from: '2026-07-01', to: '2026-07-02' };
      const result = getHeatmap([], range);
      
      expect(result.length).toBe(2);
      expect(result[0].count).toBe(0);
      expect(result[0].intensity).toBe(0);
      expect(result[1].count).toBe(0);
      expect(result[1].intensity).toBe(0);
    });
  });
});
