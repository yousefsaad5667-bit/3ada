import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UrgeTimeSeriesChartComponent } from './urge-time-series-chart.component';

describe('UrgeTimeSeriesChartComponent', () => {
  let component: UrgeTimeSeriesChartComponent;
  let fixture: ComponentFixture<UrgeTimeSeriesChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UrgeTimeSeriesChartComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(UrgeTimeSeriesChartComponent);
    component = fixture.componentInstance;
    component.timeSeries = {
      entries: [],
      trendDirection: 'increasing'
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
