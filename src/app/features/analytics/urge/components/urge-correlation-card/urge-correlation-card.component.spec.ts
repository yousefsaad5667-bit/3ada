import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UrgeCorrelationCardComponent } from './urge-correlation-card.component';

describe('UrgeCorrelationCardComponent', () => {
  let component: UrgeCorrelationCardComponent;
  let fixture: ComponentFixture<UrgeCorrelationCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UrgeCorrelationCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(UrgeCorrelationCardComponent);
    component = fixture.componentInstance;
    component.correlation = {
      direction: 'positive',
      pearsonR: 0.8,
      explanationAr: 'Test',
      weeklyBucketsCount: 10
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
