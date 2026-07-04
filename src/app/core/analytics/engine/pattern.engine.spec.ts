import { getWeekdayAnalysis, getHourAnalysis } from './pattern.engine';
import { RelapseRecord } from '../../models/relapse-record.model';

describe('Pattern Engine', () => {
  const mockRecords: RelapseRecord[] = [
    {
      id: '1', date: '2026-07-05', count: 2, // 2026-07-05 is Sunday
      time: '14:30', ampm: 'pm',
      urgeLevel: null, reason: null, notes: null, createdAt: '', updatedAt: ''
    },
    {
      id: '2', date: '2026-07-06', count: 3, // Monday
      time: '02:15', ampm: 'am',
      urgeLevel: null, reason: null, notes: null, createdAt: '', updatedAt: ''
    },
    {
      id: '3', date: '2026-07-07', count: 5, // Tuesday
      time: '12:00', ampm: 'pm',
      urgeLevel: null, reason: null, notes: null, createdAt: '', updatedAt: ''
    },
    {
      id: '4', date: '2026-07-08', count: 1, // Wednesday
      time: null, ampm: null, // missing time
      urgeLevel: null, reason: null, notes: null, createdAt: '', updatedAt: ''
    }
  ];

  describe('getWeekdayAnalysis', () => {
    it('should aggregate counts by weekday correctly', () => {
      const result = getWeekdayAnalysis(mockRecords);
      
      expect(result.length).toBe(7);
      
      // Sunday (index 0)
      expect(result[0].count).toBe(2);
      expect(result[0].labelAr).toBe('الأحد');
      
      // Monday (index 1)
      expect(result[1].count).toBe(3);
      expect(result[1].labelAr).toBe('الاثنين');

      // Tuesday (index 2)
      expect(result[2].count).toBe(5);
      
      // Wednesday (index 3)
      expect(result[3].count).toBe(1);
      
      // Thursday (index 4)
      expect(result[4].count).toBe(0);

      // Total count = 11
      // Tuesday percentage = 5 / 11 = 45.45... -> 45.5%
      expect(result[2].percentage).toBe(45.5);
    });

    it('should return empty distribution if records empty', () => {
      const result = getWeekdayAnalysis([]);
      expect(result.length).toBe(7);
      expect(result[0].count).toBe(0);
      expect(result[0].percentage).toBe(0);
    });
  });

  describe('getHourAnalysis', () => {
    it('should aggregate counts by hour correctly', () => {
      const { entries, skipped } = getHourAnalysis(mockRecords);
      
      expect(entries.length).toBe(24);
      
      // '14:30' pm (since 14 is already >= 12, ampm might not modify or handled correctly. Our implementation just adds 12 if pm and < 12)
      // Since it's 14, it stays 14. Wait, our mock says time: '14:30', ampm: 'pm'.
      // 14 is hour 14.
      expect(entries[14].count).toBe(2);
      
      // '02:15' am -> hour 2
      expect(entries[2].count).toBe(3);
      
      // '12:00' pm -> hour 12
      expect(entries[12].count).toBe(5);
      
      // Missing time
      expect(skipped).toBe(1); 
    });
    
    it('should handle am/pm adjustments', () => {
        const records: RelapseRecord[] = [
            { ...mockRecords[0], time: '02:00', ampm: 'pm', count: 1 }, // 14:00
            { ...mockRecords[0], time: '12:30', ampm: 'am', count: 2 }  // 00:30
        ];
        
        const { entries, skipped } = getHourAnalysis(records);
        expect(entries[14].count).toBe(1);
        expect(entries[0].count).toBe(2);
        expect(skipped).toBe(0);
    });
  });
});
