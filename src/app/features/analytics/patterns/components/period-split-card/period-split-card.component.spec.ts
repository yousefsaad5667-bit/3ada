import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeriodSplitCardComponent } from './period-split-card.component';

describe('PeriodSplitCardComponent', () => {
  let component: PeriodSplitCardComponent;
  let fixture: ComponentFixture<PeriodSplitCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PeriodSplitCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PeriodSplitCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
