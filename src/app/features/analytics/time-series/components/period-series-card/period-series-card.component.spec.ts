import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeriodSeriesCardComponent } from './period-series-card.component';

describe('PeriodSeriesCardComponent', () => {
  let component: PeriodSeriesCardComponent;
  let fixture: ComponentFixture<PeriodSeriesCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PeriodSeriesCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PeriodSeriesCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
