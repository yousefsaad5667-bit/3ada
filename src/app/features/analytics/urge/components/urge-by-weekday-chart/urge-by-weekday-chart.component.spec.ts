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

  it('should create and map chartSeries correctly', () => {
    expect(component).toBeTruthy();
    expect(component.chartSeries.length).toBe(1);
    expect(component.chartSeries[0].data.length).toBe(1);
    expect(component.chartSeries[0].data[0].label).toBe('الأحد');
    expect(component.chartSeries[0].data[0].value).toBe(5);
  });
});
