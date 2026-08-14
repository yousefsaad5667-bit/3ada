import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UrgeByHourChartComponent } from './urge-by-hour-chart.component';

describe('UrgeByHourChartComponent', () => {
  let component: UrgeByHourChartComponent;
  let fixture: ComponentFixture<UrgeByHourChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UrgeByHourChartComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(UrgeByHourChartComponent);
    component = fixture.componentInstance;
    component.byHour = [
      { hour: 14, label: '2 م', avgUrge: 8 }
    ];
    fixture.detectChanges();
  });

  it('should create and map chartSeries correctly', () => {
    expect(component).toBeTruthy();
    expect(component.chartSeries.length).toBe(1);
    expect(component.chartSeries[0].data.length).toBe(1);
    expect(component.chartSeries[0].data[0].label).toBe('2 م');
    expect(component.chartSeries[0].data[0].value).toBe(8);
  });
});
