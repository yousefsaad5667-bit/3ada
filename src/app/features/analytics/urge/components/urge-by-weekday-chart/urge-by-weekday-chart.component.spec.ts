import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UrgeByWeekdayChartComponent } from './urge-by-weekday-chart.component';

describe('UrgeByWeekdayChartComponent', () => {
  let component: UrgeByWeekdayChartComponent;
  let fixture: ComponentFixture<UrgeByWeekdayChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UrgeByWeekdayChartComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(UrgeByWeekdayChartComponent);
    component = fixture.componentInstance;
    component.byWeekday = [
      { weekday: 0, labelAr: 'الأحد', avgUrge: 5 }
    ];
    fixture.detectChanges();
  });

  it('should create and calculate highest average', () => {
    expect(component).toBeTruthy();
    expect(component.highestAvg).toBe(5);
    expect(component.hasData).toBe(true);
  });
});
