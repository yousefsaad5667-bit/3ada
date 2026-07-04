import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailySeriesCardComponent } from './daily-series-card.component';

describe('DailySeriesCardComponent', () => {
  let component: DailySeriesCardComponent;
  let fixture: ComponentFixture<DailySeriesCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailySeriesCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DailySeriesCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
