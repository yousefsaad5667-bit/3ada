import { getTriggerAnalysis } from './trigger.engine';
import { RelapseRecord } from '../../models/relapse-record.model';

describe('Trigger Engine', () => {
  const mockRecords: RelapseRecord[] = [
    {
      id: '1', date: '2026-07-01', count: 1, urgeLevel: 8,
      reason: 'كنت متعب جدا في العمل', notes: null, // "متعب", "العمل"
      time: null, ampm: null, createdAt: '', updatedAt: ''
    },
    {
      id: '2', date: '2026-07-02', count: 1, urgeLevel: 10,
      reason: null, notes: 'ضغوط العمل كانت قوية', // "ضغوط", "العمل", "قوية"
      time: null, ampm: null, createdAt: '', updatedAt: ''
    },
    {
      id: '3', date: '2026-07-03', count: 2, urgeLevel: null,
      reason: 'متعب', notes: 'بدون تفكير', // "متعب", "بدون", "تفكير"
      time: null, ampm: null, createdAt: '', updatedAt: ''
    }
  ];

  describe('getTriggerAnalysis', () => {
    it('should extract and aggregate keywords correctly', () => {
      const result = getTriggerAnalysis(mockRecords);
      
      // Expected keywords (stopwords "كنت", "جدا", "في", "كانت" might not all be filtered unless added,
      // but let's just check the ones we care about)
      
      // 'العمل' appears in r1 (count 1, urge 8) and r2 (count 1, urge 10).
      // total count = 2. avgUrge = 9
      const workTrigger = result.find(r => r.keyword === 'العمل');
      expect(workTrigger).toBeDefined();
      expect(workTrigger!.count).toBe(2);
      expect(workTrigger!.avgUrge).toBe(9);
      
      // 'متعب' appears in r1 (count 1, urge 8) and r3 (count 2, urge null).
      // total count = 3. avgUrge = 8 (only r1 has urge data)
      const tiredTrigger = result.find(r => r.keyword === 'متعب');
      expect(tiredTrigger).toBeDefined();
      expect(tiredTrigger!.count).toBe(3);
      expect(tiredTrigger!.avgUrge).toBe(8);
      
      // Keywords should be sorted by count descending
      expect(result[0].count).toBeGreaterThanOrEqual(result[1].count);
    });

    it('should filter out stop words and short tokens', () => {
      const records: RelapseRecord[] = [
        {
          id: '1', date: '2026-07-01', count: 1, urgeLevel: null,
          reason: 'في إلى على من و ف ب', notes: 'أ', // all stopwords or length < 2
          time: null, ampm: null, createdAt: '', updatedAt: ''
        }
      ];
      
      const result = getTriggerAnalysis(records);
      expect(result.length).toBe(0);
    });

    it('should handle empty strings and nulls gracefully', () => {
      const records: RelapseRecord[] = [
        {
          id: '1', date: '2026-07-01', count: 1, urgeLevel: null,
          reason: null, notes: '   ',
          time: null, ampm: null, createdAt: '', updatedAt: ''
        }
      ];
      
      const result = getTriggerAnalysis(records);
      expect(result.length).toBe(0);
    });
  });
});
