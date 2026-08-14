import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UrgeComponent } from './urge.component';
import { UrgeAnalyticsService } from './services/urge-analytics.service';
import { signal } from '@angular/core';

describe('UrgeComponent', () => {
  let component: UrgeComponent;
  let fixture: ComponentFixture<UrgeComponent>;
  let mockService: any;

  beforeEach(async () => {
    mockService = {
      state: signal({
        status: 'empty',
        summary: {},
        timeSeries: { entries: [] },
        distribution: [],
        byHour: [],
        byWeekday: [],
        byTrigger: [],
        correlation: {},
        excludedRecordCount: 0,
        errorMessageAr: null
      })
    };

    await TestBed.configureTestingModule({
      imports: [UrgeComponent],
      providers: [
        { provide: UrgeAnalyticsService, useValue: mockService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UrgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display empty state when status is empty', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.empty-state')).toBeTruthy();
  });

  it('should display error state when status is error', () => {
    mockService.state.set({ status: 'error', errorMessageAr: 'Test error' });
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.error-state')).toBeTruthy();
    expect(compiled.querySelector('.error-state h3')?.textContent).toContain('Test error');
  });

  it('should display data view when status is data', () => {
    mockService.state.set({ status: 'data', summary: {}, timeSeries: { entries: [] } });
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.analytics-content')).toBeTruthy();
  });
});
