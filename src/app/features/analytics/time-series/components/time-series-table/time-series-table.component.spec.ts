import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimeSeriesTableComponent } from './time-series-table.component';
import { TimeSeriesAnalyticsService } from '../../services/time-series-analytics.service';
import { TimeSeriesDatasetView, TimeSeriesTableRow } from '../../models/time-series-view.model';
import { Component, Input } from '@angular/core';

describe('TimeSeriesTableComponent', () => {
  let component: TimeSeriesTableComponent;
  let fixture: ComponentFixture<TimeSeriesTableComponent>;

  const mockService = {
    mapToTableRows: jasmine.createSpy('mapToTableRows').and.returnValue([
      { id: '1', dateLabel: 'الأول من يناير', count: 5, changeFromPrevious: 2, isPartial: false }
    ])
  };

  const mockDataset: TimeSeriesDatasetView = {
    grouping: 'daily',
    rangeStart: '2026-01-01',
    rangeEnd: '2026-01-07',
    periods: [],
    totalCount: 5,
    hasActivity: true,
    zeroFilled: true
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeSeriesTableComponent],
      providers: [
        { provide: TimeSeriesAnalyticsService, useValue: mockService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimeSeriesTableComponent);
    component = fixture.componentInstance;
    
    fixture.componentRef.setInput('dataset', mockDataset);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render empty state when no rows returned', () => {
    mockService.mapToTableRows.and.returnValue([]);
    
    // trigger change detection
    fixture.componentRef.setInput('dataset', { ...mockDataset });
    fixture.detectChanges();
    
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.empty-state')).toBeTruthy();
    expect(el.textContent).toContain('لا توجد بيانات');
  });

  it('should render rows with change indicators', () => {
    mockService.mapToTableRows.and.returnValue([
      { id: '1', dateLabel: 'الأول من يناير', count: 5, changeFromPrevious: 2, isPartial: false }
    ]);
    
    fixture.componentRef.setInput('dataset', { ...mockDataset });
    fixture.detectChanges();
    
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('الأول من يناير');
    expect(el.textContent).toContain('5');
    expect(el.textContent).toContain('+2');
  });
});
