import { TestBed } from '@angular/core/testing';
import { CalendarAnalyticsService } from './calendar-analytics.service';
import { RelapseRecordRepository } from '../../../../core/services/relapse-record.repository';
import { DashboardFilterService } from '../../../dashboard/services/dashboard-filter.service';
import { signal } from '@angular/core';
import { RelapseRecord } from '../../../../core/models/relapse-record.model';

describe('CalendarAnalyticsService', () => {
  let service: CalendarAnalyticsService;
  let mockRepository: any;
  let mockFilterService: any;

  beforeEach(() => {
    mockRepository = {
      records: signal<RelapseRecord[]>([])
    };

    mockFilterService = {
      activeFilter: signal({ startDate: new Date('2026-06-01'), endDate: new Date('2026-06-30') })
    };

    TestBed.configureTestingModule({
      providers: [
        CalendarAnalyticsService,
        { provide: RelapseRecordRepository, useValue: mockRepository },
        { provide: DashboardFilterService, useValue: mockFilterService }
      ]
    });
    service = TestBed.inject(CalendarAnalyticsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return empty state when no records exist', () => {
    const state = service.state();
    expect(state.status).toBe('empty');
  });

  it('should build data state when records exist', () => {
    mockRepository.records.set([
      { id: '1', date: '2026-06-15', time: '10:00', ampm: 'ص', count: 1, urgeLevel: null, reason: '', notes: '', createdAt: '', updatedAt: '' }
    ]);
    const state = service.state();
    expect(state.status).toBe('data');
    expect(state.heatmapGrid.maxDayCount).toBe(1);
    expect(state.currentMonthGrid.hasActivity).toBeTrue();
  });
});
