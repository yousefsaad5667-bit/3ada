import { TestBed } from '@angular/core/testing';
import { TriggerAnalyticsService } from './trigger-analytics.service';
import { DashboardFilterService } from '../../../dashboard/services/dashboard-filter.service';
import { RelapseRecordRepository } from '../../../../core/services/relapse-record.repository';
import { signal } from '@angular/core';
import { RelapseRecord } from '../../../../core/models/relapse-record.model';

describe('TriggerAnalyticsService', () => {
  let service: TriggerAnalyticsService;
  let filterServiceSpy: jasmine.SpyObj<DashboardFilterService>;
  let repositorySpy: jasmine.SpyObj<RelapseRecordRepository>;
  
  const recordsSignal = signal<RelapseRecord[]>([]);
  const filterSignal = signal<{ preset: string; startDate: Date; endDate: Date }>({ preset: 'last7', startDate: new Date('2026-07-01T00:00:00Z'), endDate: new Date('2026-07-31T23:59:59Z') });

  const createRecord = (id: string, date: string, reason: string | null, count = 1, urgeLevel: number | null = null, notes: string | null = null): RelapseRecord => ({
    id,
    date,
    time: '12:00',
    ampm: 'pm',
    count,
    urgeLevel,
    reason,
    notes,
    createdAt: '',
    updatedAt: ''
  });

  beforeEach(() => {
    recordsSignal.set([]);
    filterSignal.set({ preset: 'last7', startDate: new Date('2026-07-01T00:00:00Z'), endDate: new Date('2026-07-31T23:59:59Z') });

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
    service = TestBed.inject(TriggerAnalyticsService);
  });

  // Scenario 1: Empty dataset
  it('1. Empty dataset -> status === empty, allTriggers.length === 0, summary.totalOccurrences === 0', () => {
    recordsSignal.set([]);
    const state = service.state();
    expect(state.status).toBe('empty');
    expect(state.allTriggers.length).toBe(0);
    expect(state.summary.totalOccurrences).toBe(0);
  });

  // Scenario 2: Records with only stop words
  it('2. Records with only stop words -> status === empty, triggerlessRecordCount > 0', () => {
    recordsSignal.set([
      createRecord('1', '2026-07-10', 'في من على')
    ]);
    const state = service.state();
    expect(state.status).toBe('empty');
    expect(state.summary.triggerlessRecordCount).toBe(1);
    expect(state.allTriggers.length).toBe(0);
  });

  // Scenario 3: Records with valid keywords
  it('3. Records with valid keywords -> status === data, correct counts, correct percentages summing to 100', () => {
    recordsSignal.set([
      createRecord('1', '2026-07-10', 'العمل'),
      createRecord('2', '2026-07-11', 'العمل'),
      createRecord('3', '2026-07-12', 'الأرق', 2)
    ]);
    const state = service.state();
    expect(state.status).toBe('data');
    expect(state.allTriggers.length).toBe(2);
    
    const sumPerc = state.allTriggers.reduce((acc, t) => acc + t.percentage, 0);
    expect(Math.round(sumPerc)).toBe(100);
  });

  // Scenario 4: Keyword weighting
  it('4. Keyword weighting -> record with count: 3 and keyword العمل contributes 3 to العمل.count', () => {
    recordsSignal.set([
      createRecord('1', '2026-07-10', 'العمل', 3)
    ]);
    const state = service.state();
    expect(state.allTriggers[0].keyword).toBe('العمل');
    expect(state.allTriggers[0].count).toBe(3);
  });

  // Scenario 5: Average urge
  it('5. Average urge -> keyword appearing in records with urge 8 and 10 (count 1 each) -> avgUrge === 9', () => {
    recordsSignal.set([
      createRecord('1', '2026-07-10', 'العمل', 1, 8),
      createRecord('2', '2026-07-11', 'العمل', 1, 10)
    ]);
    const state = service.state();
    expect(state.allTriggers[0].avgUrge).toBe(9);
  });

  // Scenario 6: Rare trigger classification
  it('6. Rare trigger classification -> keyword with < 5% share AND < 3 occurrences is isRare === true', () => {
    recordsSignal.set([
      createRecord('1', '2026-07-10', 'العمل', 98),
      createRecord('2', '2026-07-11', 'نادرجدا', 2)
    ]);
    const state = service.state();
    const rare = state.allTriggers.find(t => t.keyword === 'نادرجدا');
    expect(rare?.isRare).toBeTrue();
  });

  // Scenario 7: Top trigger
  it('7. Top trigger -> entry with highest count has isTop === true and rank === 1', () => {
    recordsSignal.set([
      createRecord('1', '2026-07-10', 'العمل', 10),
      createRecord('2', '2026-07-11', 'التعب', 5)
    ]);
    const state = service.state();
    expect(state.allTriggers[0].keyword).toBe('العمل');
    expect(state.allTriggers[0].isTop).toBeTrue();
    expect(state.allTriggers[0].rank).toBe(1);
    expect(state.summary.topTrigger?.keyword).toBe('العمل');
  });

  // Scenario 8: Date range filter
  it('8. Date range filter -> only records within active date range contribute to state', () => {
    recordsSignal.set([
      createRecord('1', '2026-07-10', 'داخل', 5),
      createRecord('2', '2025-01-01', 'خارج', 10)
    ]);
    const state = service.state();
    expect(state.allTriggers.length).toBe(1);
    expect(state.allTriggers[0].keyword).toBe('داخل');
  });

  // Scenario 9: Search filter
  it('9. Search filter -> searchQuery = عمل returns only triggers containing that substring', () => {
    recordsSignal.set([
      createRecord('1', '2026-07-10', 'العمل والجهد', 5),
      createRecord('2', '2026-07-11', 'التعب', 5)
    ]);
    service.searchQuery.set('عمل');
    const filtered = service.filteredTriggers();
    expect(filtered.length).toBe(1);
    expect(filtered[0].keyword).toBe('العمل');
  });

  // Scenario 10: Trend for keyword
  it('10. Trend for keyword -> selecting a keyword produces TriggerTrendView with correct date-binned counts', () => {
    recordsSignal.set([
      createRecord('1', '2026-07-10', 'العمل', 3)
    ]);
    service.selectedKeyword.set('العمل');
    const trend = service.triggerTrend();
    expect(trend).not.toBeNull();
    expect(trend?.keyword).toBe('العمل');
    const July10 = trend?.entries.find(e => e.date === '2026-07-10');
    expect(July10?.count).toBe(3);
  });

  // Scenario 11: Trend direction
  it('11. Trend direction -> 7+ data points with monotonically increasing counts -> direction === increasing', () => {
    const records: RelapseRecord[] = [];
    for (let i = 1; i <= 10; i++) {
      const dayStr = String(21 + i); // July 22 to July 31
      records.push(createRecord(String(i), `2026-07-${dayStr}`, 'العمل', i * 2));
    }
    recordsSignal.set(records);
    service.selectedKeyword.set('العمل');
    const trend = service.triggerTrend();
    expect(trend?.direction).toBe('increasing');
  });

  // Scenario 12: Null selected keyword
  it('12. Null selected keyword -> triggerTrend === null', () => {
    recordsSignal.set([
      createRecord('1', '2026-07-10', 'العمل', 3)
    ]);
    service.selectedKeyword.set(null);
    expect(service.triggerTrend()).toBeNull();
  });

  // Scenario 13: Distribution cap
  it('13. Distribution cap -> more than 20 keywords -> distribution.topTriggers.length === 20, otherCount > 0', () => {
    const records: RelapseRecord[] = [];
    for (let i = 1; i <= 25; i++) {
      const idxStr = String(i);
      records.push(createRecord(idxStr, '2026-07-10', `محفزرقم${idxStr}`, 1));
    }
    recordsSignal.set(records);
    const state = service.state();
    expect(state.distribution.topTriggers.length).toBe(20);
    expect(state.distribution.otherCount).toBe(5);
  });
});
