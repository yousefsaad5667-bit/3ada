import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimeSeriesChartComponent } from './time-series-chart.component';
import { TimeSeriesDatasetView } from '../../models/time-series-view.model';

describe('TimeSeriesChartComponent', () => {
  let component: TimeSeriesChartComponent;
  let fixture: ComponentFixture<TimeSeriesChartComponent>;

  const mockDataset: TimeSeriesDatasetView = {
    grouping: 'daily',
    rangeStart: '2026-07-01',
    rangeEnd: '2026-07-04',
    totalCount: 5,
    hasActivity: true,
    zeroFilled: true,
    periods: [
      { grouping: 'daily', startDate: '2026-07-01', endDate: '2026-07-01', anchorDate: '2026-07-01', labelAr: '1 يوليو', count: 2, isPartial: false },
      { grouping: 'daily', startDate: '2026-07-02', endDate: '2026-07-02', anchorDate: '2026-07-02', labelAr: '2 يوليو', count: 0, isPartial: false },
      { grouping: 'daily', startDate: '2026-07-03', endDate: '2026-07-03', anchorDate: '2026-07-03', labelAr: '3 يوليو', count: 3, isPartial: false }
    ]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeSeriesChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimeSeriesChartComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('dataset', mockDataset);
    fixture.componentRef.setInput('type', 'bar');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render canvas if dataset has periods', () => {
    const canvas = fixture.nativeElement.querySelector('canvas');
    expect(canvas).toBeTruthy();
    const emptyState = fixture.nativeElement.querySelector('.empty-state');
    expect(emptyState).toBeFalsy();
  });

  it('should render empty state if dataset is empty', () => {
    fixture.componentRef.setInput('dataset', { ...mockDataset, periods: [] });
    fixture.detectChanges();

    const canvas = fixture.nativeElement.querySelector('canvas');
    expect(canvas).toBeFalsy();
    const emptyState = fixture.nativeElement.querySelector('.empty-state');
    expect(emptyState).toBeTruthy();
    expect(emptyState.textContent).toContain('لا توجد بيانات متاحة في هذه الفترة');
  });
});

