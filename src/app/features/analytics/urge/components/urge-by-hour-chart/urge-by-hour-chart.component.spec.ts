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

  it('should create and sort entries', () => {
    expect(component).toBeTruthy();
    expect(component.sortedByHour[0].hour).toBe(14);
    expect(component.highestAvg).toBe(8);
  });
});
