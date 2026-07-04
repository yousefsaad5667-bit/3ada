import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TrendSummaryCardComponent } from './trend-summary-card.component';
import { TimeSeriesAnalyticsService } from '../../services/time-series-analytics.service';
import { signal } from '@angular/core';

describe('TrendSummaryCardComponent', () => {
  let component: TrendSummaryCardComponent;
  let fixture: ComponentFixture<TrendSummaryCardComponent>;
  
  const mockState = signal<any>({
    trend: {
      direction: 'insufficient-data',
      growthRatePercent: null,
      averageDailyCount: 0,
      confidence: 'insufficient',
      messageAr: 'بيانات غير كافية'
    }
  });

  const mockService = {
    state: mockState
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrendSummaryCardComponent],
      providers: [
        { provide: TimeSeriesAnalyticsService, useValue: mockService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrendSummaryCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display insufficient-data state', () => {
    mockState.set({
      trend: { direction: 'insufficient-data', messageAr: 'بيانات غير كافية' }
    });
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('بيانات غير كافية');
  });

  it('should display increasing state', () => {
    mockState.set({
      trend: { direction: 'increasing', messageAr: 'يوجد زيادة', growthRatePercent: 10, averageDailyCount: 5 }
    });
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('يوجد زيادة');
  });
  
  it('should display decreasing state', () => {
    mockState.set({
      trend: { direction: 'decreasing', messageAr: 'يوجد انخفاض', growthRatePercent: -10, averageDailyCount: 5 }
    });
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('يوجد انخفاض');
  });
});
