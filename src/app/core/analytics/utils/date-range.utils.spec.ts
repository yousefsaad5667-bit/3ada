import { getDateRangeBounds, formatISO, numberOfDays, iterateDateRange } from './date-range.utils';

describe('DateRange Utils', () => {
  describe('getDateRangeBounds', () => {
    beforeEach(() => {
      // Mock the current date to be a fixed date: 2026-07-04T12:00:00Z
      jasmine.clock().install();
      jasmine.clock().mockDate(new Date('2026-07-04T12:00:00Z'));
    });

    afterEach(() => {
      jasmine.clock().uninstall();
    });

    it('should handle "all" preset', () => {
      expect(getDateRangeBounds('all')).toBeNull();
    });

    it('should handle "custom" preset', () => {
      const customRange = { from: '2026-01-01', to: '2026-01-31' };
      expect(getDateRangeBounds('custom', customRange)).toEqual(customRange);
    });

    it('should handle "custom" preset when custom range is undefined', () => {
      expect(getDateRangeBounds('custom')).toBeNull();
    });

    it('should handle "today" preset', () => {
      const bounds = getDateRangeBounds('today');
      expect(bounds).toEqual({ from: '2026-07-04', to: '2026-07-04' });
    });

    it('should handle "last7" preset', () => {
      const bounds = getDateRangeBounds('last7');
      // 2026-07-04 - 6 days = 2026-06-28
      expect(bounds).toEqual({ from: '2026-06-28', to: '2026-07-04' });
    });

    it('should handle "last30" preset', () => {
      const bounds = getDateRangeBounds('last30');
      // 2026-07-04 - 29 days = 2026-06-05
      expect(bounds).toEqual({ from: '2026-06-05', to: '2026-07-04' });
    });

    it('should handle "last90" preset', () => {
      const bounds = getDateRangeBounds('last90');
      // 2026-07-04 - 89 days = 2026-04-06
      expect(bounds).toEqual({ from: '2026-04-06', to: '2026-07-04' });
    });

    it('should handle "lastYear" preset', () => {
      const bounds = getDateRangeBounds('lastYear');
      // 2026-07-04 - 1 year + 1 day = 2025-07-05
      expect(bounds).toEqual({ from: '2025-07-05', to: '2026-07-04' });
    });
  });

  describe('formatISO', () => {
    it('should format dates correctly', () => {
      expect(formatISO(new Date('2026-07-04T12:00:00Z'))).toBe('2026-07-04');
      expect(formatISO(new Date('2026-01-01T00:00:00Z'))).toBe('2026-01-01');
    });
  });

  describe('numberOfDays', () => {
    it('should calculate correct number of days for same day', () => {
      expect(numberOfDays('2026-07-04', '2026-07-04')).toBe(1);
    });

    it('should calculate correct number of days for different days', () => {
      expect(numberOfDays('2026-07-01', '2026-07-04')).toBe(4);
    });

    it('should return 0 if from is after to', () => {
      expect(numberOfDays('2026-07-04', '2026-07-01')).toBe(0);
    });
    
    it('should handle cross-month calculations', () => {
      expect(numberOfDays('2026-06-28', '2026-07-04')).toBe(7);
    });
    
    it('should handle leap years correctly', () => {
      expect(numberOfDays('2024-02-28', '2024-03-01')).toBe(3); // 2024 is a leap year (28, 29, 1)
      expect(numberOfDays('2023-02-28', '2023-03-01')).toBe(2); // 2023 is not a leap year (28, 1)
    });
  });

  describe('iterateDateRange', () => {
    it('should return array of dates between from and to', () => {
      const dates = iterateDateRange('2026-07-01', '2026-07-04');
      expect(dates).toEqual([
        '2026-07-01',
        '2026-07-02',
        '2026-07-03',
        '2026-07-04',
      ]);
    });

    it('should return empty array if from is after to', () => {
      const dates = iterateDateRange('2026-07-04', '2026-07-01');
      expect(dates).toEqual([]);
    });

    it('should handle cross-month iterations', () => {
      const dates = iterateDateRange('2026-06-29', '2026-07-02');
      expect(dates).toEqual([
        '2026-06-29',
        '2026-06-30',
        '2026-07-01',
        '2026-07-02',
      ]);
    });
  });
});
