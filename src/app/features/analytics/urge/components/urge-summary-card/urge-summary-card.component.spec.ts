import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UrgeSummaryCardComponent } from './urge-summary-card.component';

describe('UrgeSummaryCardComponent', () => {
  let component: UrgeSummaryCardComponent;
  let fixture: ComponentFixture<UrgeSummaryCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UrgeSummaryCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(UrgeSummaryCardComponent);
    component = fixture.componentInstance;
    component.summary = {
      average: 5,
      max: 10,
      min: 1,
      median: 4,
      trendDirection: 'increasing'
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute trendLabel and trendClass correctly', () => {
    expect(component.trendLabel).toBe('متزايد ↑');
    expect(component.trendClass).toBe('trend-bad');
    
    component.summary.trendDirection = 'decreasing';
    expect(component.trendLabel).toBe('متناقص ↓');
    expect(component.trendClass).toBe('trend-good');
  });
});
