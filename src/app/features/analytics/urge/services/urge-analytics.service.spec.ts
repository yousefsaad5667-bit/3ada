import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { UrgeAnalyticsService } from './urge-analytics.service';
import { DashboardFilterService } from '../../../dashboard/services/dashboard-filter.service';
import { RelapseRecordRepository } from '../../../../../core/services/relapse-record.repository';
import { RelapseRecord } from '../../../../../core/models/relapse-record.model';

describe('UrgeAnalyticsService', () => {
  let service: UrgeAnalyticsService;
  let filterServiceMock: any;
  let repositoryMock: any;

  beforeEach(() => {
    filterServiceMock = {
      activeFilter: signal({
        startDate: new Date('2026-07-01T00:00:00.000Z'),
        endDate: new Date('2026-07-31T23:59:59.999Z'),
        preset: 'custom'
      })
    };

    repositoryMock = {
      records: signal<RelapseRecord[]>([])
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: DashboardFilterService, useValue: filterServiceMock },
        { provide: RelapseRecordRepository, useValue: repositoryMock }
      ]
    });
    service = TestBed.inject(UrgeAnalyticsService);
  });

  it('should return empty state when no records exist', () => {
    const state = service.state();
    expect(state.status).toBe('empty');
    expect(state.excludedRecordCount).toBe(0);
  });

  it('should return empty state and count excluded records if none have urge data', () => {
    repositoryMock.records.set([
      { id: '1', date: '2026-07-02', count: 1, urgeLevel: null },
      { id: '2', date: '2026-07-03', count: 2, urgeLevel: undefined }
    ] as any[]);

    const state = service.state();
    expect(state.status).toBe('empty');
    expect(state.excludedRecordCount).toBe(3); // 1 + 2
  });

  it('should populate all sub-views correctly with a full data set', () => {
    repositoryMock.records.set([
      { id: '1', date: '2026-07-02', count: 1, urgeLevel: 8, time: '14:30', reason: 'stress' },
      { id: '2', date: '2026-07-03', count: 2, urgeLevel: 5, time: '09:00', reason: 'tired' }
    ] as any[]);

    const state = service.state();
    expect(state.status).toBe('data');
    expect(state.summary.average).toBe(6); // (8 + 5 + 5) / 3
    expect(state.timeSeries.entries.length).toBeGreaterThan(0);
    expect(state.distribution.length).toBe(10);
    expect(state.byHour.length).toBe(24);
    expect(state.byWeekday.length).toBe(7);
    expect(state.byTrigger.length).toBeGreaterThan(0);
    expect(state.correlation.direction).toBe('insufficient-data'); // Only 2 records, < 10 weeks
    expect(state.excludedRecordCount).toBe(0);
  });
});
