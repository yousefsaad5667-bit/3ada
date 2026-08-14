import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UrgeByTriggerChartComponent } from './urge-by-trigger-chart.component';

describe('UrgeByTriggerChartComponent', () => {
  let component: UrgeByTriggerChartComponent;
  let fixture: ComponentFixture<UrgeByTriggerChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UrgeByTriggerChartComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(UrgeByTriggerChartComponent);
    component = fixture.componentInstance;
    component.byTrigger = [
      { keyword: 'test', count: 1, avgUrge: 8, isLimitedSample: true }
    ];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
