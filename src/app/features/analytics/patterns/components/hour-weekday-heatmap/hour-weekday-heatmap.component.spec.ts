import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HourWeekdayHeatmapComponent } from './hour-weekday-heatmap.component';

describe('HourWeekdayHeatmapComponent', () => {
  let component: HourWeekdayHeatmapComponent;
  let fixture: ComponentFixture<HourWeekdayHeatmapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HourWeekdayHeatmapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HourWeekdayHeatmapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
