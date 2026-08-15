import { TestBed } from '@angular/core/testing';
import { PatternAnalyticsService } from './pattern-analytics.service';
import { DashboardFilterService } from '../../../dashboard/services/dashboard-filter.service';
import { RelapseRecordRepository } from '../../../../core/services/relapse-record.repository';
import { signal } from '@angular/core';
import { RelapseRecord } from '../../../../core/models/relapse-record.model';

describe('PatternAnalyticsService', () => {
  let service: PatternAnalyticsService;
  let filterServiceSpy: jasmine.SpyObj<DashboardFilterService>;
  let repositorySpy: jasmine.SpyObj<RelapseRecordRepository>;
  
  const recordsSignal = signal<RelapseRecord[]>([]);
  const filterSignal = signal<any>({ preset: 'last7', startDate: new Date('2020-01-01'), endDate: new Date('2026-12-31') });

  beforeEach(() => {
    recordsSignal.set([]);
    filterSignal.set({ preset: 'last7', startDate: new Date('2020-01-01'), endDate: new Date('2026-12-31') });

    filterServiceSpy = jasmine.createSpyObj('DashboardFilterService', [], {
      activeFilter: filterSignal
    });
    repositorySpy = jasmine.createSpyObj('RelapseRecordRepository', [], {
      records: recordsSignal
    });

    TestBed.configureTestingModule({
      providers: [
        { provide: DashboardFilterService, useValue: filterServiceSpy },
        { provide: RelapseRecordRepository, useValue: repositorySpy }
      ]
    });
    service = TestBed.inject(PatternAnalyticsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return empty state when no records exist', () => {
    const state = service.state();
    expect(state.status).toBe('empty');
    expect(state.weekdays.length).toBe(7);
    expect(state.weekdays[0].count).toBe(0);
    expect(state.hours.length).toBe(24);
    expect(state.heatmap.maxCellCount).toBe(0);
  });

  it('should compute valid state for records with time', () => {
    recordsSignal.set([
      { id: '1', date: '2026-07-20', time: '09:00', ampm: 'am', count: 1, urgeLevel: null, reason: null, notes: null, createdAt: '', updatedAt: '' }, // Monday 9am
      { id: '2', date: '2026-07-21', time: '14:30', ampm: 'pm', count: 2, urgeLevel: null, reason: null, notes: null, createdAt: '', updatedAt: '' }  // Tuesday 2pm
    ]);

    const state = service.state();
    
    expect(state.status).toBe('data');
    expect(state.skippedRecordCount).toBe(0);
    
    // Weekday check (0=Sunday, 1=Monday, 2=Tuesday)
    expect(state.weekdays[1].count).toBe(1);
    expect(state.weekdays[2].count).toBe(2);
    expect(state.weekdays[2].isPeak).toBeTrue();

    // Hourly check (9am and 14pm)
    expect(state.hours[9].count).toBe(1);
    expect(state.hours[14].count).toBe(2);
    expect(state.hours[14].isPeak).toBeTrue();
    
    // Heatmap check
    expect(state.heatmap.cells[1][9].count).toBe(1); // Monday, 9am
    expect(state.heatmap.cells[2][14].count).toBe(2); // Tuesday, 2pm
    expect(state.heatmap.maxCellCount).toBe(2);

    // Period split check
    expect(state.periodSplit.amCount).toBe(1);
    expect(state.periodSplit.pmCount).toBe(2);
    expect(state.periodSplit.dominantPeriod).toBe('pm');

    // Summary check
    expect(state.summary.peakWeekdays[0].weekday).toBe(2); // Tuesday
    expect(state.summary.peakHours[0].hour).toBe(14); // 2pm
  });

  it('should gracefully handle records without time', () => {
    recordsSignal.set([
      { id: '1', date: '2026-07-20', time: null, ampm: null, count: 5, urgeLevel: null, reason: null, notes: null, createdAt: '', updatedAt: '' },
    ]);

    const state = service.state();
    
    expect(state.status).toBe('data');
    expect(state.skippedRecordCount).toBe(5); // 5 records skipped for time analysis
    expect(state.weekdays[1].count).toBe(5); // Still counted in weekday
    expect(state.periodSplit.total).toBe(0); // Not in AM/PM
  });

  it('should update when filter changes to outside bounds', () => {
    recordsSignal.set([
      { id: '1', date: '2020-01-01', time: '10:00', ampm: 'am', count: 1, urgeLevel: null, reason: null, notes: null, createdAt: '', updatedAt: '' },
    ]);

    // Current date is 2026, set filter start to 2026
    filterSignal.set({ preset: 'last7', startDate: new Date('2026-07-15'), endDate: new Date('2026-07-22') });
    
    const state = service.state();
    expect(state.status).toBe('empty');
    expect(state.invalidRecordCount).toBe(0); // Not invalid, just out of bounds
  });
});

