import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeekdayChartComponent } from './weekday-chart.component';

describe('WeekdayChartComponent', () => {
  let component: WeekdayChartComponent;
  let fixture: ComponentFixture<WeekdayChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeekdayChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeekdayChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
