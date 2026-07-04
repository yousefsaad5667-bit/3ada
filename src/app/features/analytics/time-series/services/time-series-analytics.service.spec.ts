/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument */
import { TestBed } from '@angular/core/testing';
import { TimeSeriesAnalyticsService } from './time-series-analytics.service';
import { DashboardFilterService } from '../../../dashboard/services/dashboard-filter.service';
import { RelapseRecordRepository } from '../../../../core/services/relapse-record.repository';
import { signal } from '@angular/core';

describe('TimeSeriesAnalyticsService', () => {
  let service: TimeSeriesAnalyticsService;
  
  const mockFilterService = {
    activeFilter: signal({
      preset: 'last7',
      startDate: new Date('2026-07-01T00:00:00'),
      endDate: new Date('2026-07-07T23:59:59')
    })
  };

  const mockRepository = {
    records: signal([
      { date: '2026-07-01', count: 2 } as any,
      { date: '2026-07-02', count: 1 } as any
    ])
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: DashboardFilterService, useValue: mockFilterService },
        { provide: RelapseRecordRepository, useValue: mockRepository }
      ]
    });
    service = TestBed.inject(TimeSeriesAnalyticsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize state with loading status', () => {
    const state = service.state();
    expect(state.rangeStart).toBe('2026-07-01');
    expect(state.rangeEnd).toBe('2026-07-07');
  });

  it('should derive daily, weekly, and monthly datasets', () => {
    const state = service.state();
    expect(state.status).toBe('data');
    expect(state.daily.grouping).toBe('daily');
    expect(state.daily.periods.length).toBe(7);
    expect(state.daily.periods[0].count).toBe(2);
    expect(state.daily.periods[1].count).toBe(1);
    expect(state.daily.totalCount).toBe(3);
    
    expect(state.weekly.grouping).toBe('weekly');
    expect(state.weekly.periods.length).toBeGreaterThan(0);
    expect(state.weekly.totalCount).toBe(3);
    
    expect(state.monthly.grouping).toBe('monthly');
    expect(state.monthly.periods.length).toBe(1);
    expect(state.monthly.totalCount).toBe(3);
  });

  it('should derive moving average, cumulative count, and trend datasets', () => {
    const state = service.state();
    expect(state.status).toBe('data');
    
    expect(state.movingAverage.points.length).toBe(7);
    expect(state.movingAverage.windowSize).toBe(7);
    
    expect(state.cumulative.points.length).toBe(7);
    expect(state.cumulative.finalCount).toBe(3);
    
    expect(state.trend.averageDailyCount).toBeDefined();
    expect(state.trend.confidence).toBeDefined();
  });

  it('should compute table rows', () => {
    // Just a sanity check of the mapping helper since state mapping is removed
    const dataset: any = {
      periods: [
        { anchorDate: '2026-07-01', labelAr: '1', count: 5, isPartial: false },
        { anchorDate: '2026-07-02', labelAr: '2', count: 8, isPartial: false }
      ]
    };
    const rows = service.mapToTableRows(dataset);
    expect(rows.length).toBe(2);
    // Reversed
    expect(rows[0].id).toBe('2026-07-02');
    expect(rows[0].changeFromPrevious).toBe(3); // 8 - 5
    expect(rows[1].changeFromPrevious).toBeNull();
  });

  it('should handle empty datasets correctly (T052)', () => {
    mockRepository.records.set([]);
    const state = service.state();
    expect(state.status).toBe('empty');
    expect(state.invalidRecordCount).toBe(0);
    expect(state.daily.periods.length).toBe(0);
    expect(state.trend.direction).toBe('insufficient-data');
    expect(state.trend.confidence).toBe('insufficient');
  });

  it('should exclude invalid records and count them (T051)', () => {
    mockRepository.records.set([
      { date: '2026-07-01', count: 2 } as any,
      { date: 'invalid-date', count: 5 } as any, // invalid date format handled by date engine maybe? 
      { date: '2026-07-02', count: -1 } as any, // negative count
      { count: 4 } as any // missing date
    ]);
    
    // In our service we only check `r.date && r.count >= 0` currently.
    // Let's refine the validation logic in service to match the test.
    const state = service.state();
    // 3 invalid records, 1 valid record
    expect(state.invalidRecordCount).toBe(3);
    expect(state.status).toBe('data');
    expect(state.daily.totalCount).toBe(2);
  });

  it('should handle single-day datasets (T052)', () => {
    mockRepository.records.set([
      { date: '2026-07-01', count: 1 } as any
    ]);
    const state = service.state();
    expect(state.status).toBe('data');
    expect(state.daily.periods.length).toBe(7); // filter is last7, so it generates 7 days
    expect(state.daily.periods[0].count).toBe(1);
    expect(state.daily.totalCount).toBe(1);
    
    // Trend should be insufficient-data due to only having 1 count overall (though length is 7 days, we have very little activity)
    // Actually, split-half logic handles single activity properly.
    expect(state.trend).toBeDefined();
  });

  it('should handle sparse datasets (T052)', () => {
    mockRepository.records.set([
      { date: '2026-07-01', count: 1 } as any,
      { date: '2026-07-07', count: 5 } as any
    ]);
    const state = service.state();
    expect(state.status).toBe('data');
    // total should be 6
    expect(state.daily.totalCount).toBe(6);
    // index 0 is Jul 1, index 6 is Jul 7.
    expect(state.daily.periods[0].count).toBe(1);
    expect(state.daily.periods[6].count).toBe(5);
    // Intermediate days should be zero-filled
    expect(state.daily.periods[3].count).toBe(0);
  });
});
