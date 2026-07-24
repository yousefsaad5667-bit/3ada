import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatternSummaryCardComponent } from './pattern-summary-card.component';

describe('PatternSummaryCardComponent', () => {
  let component: PatternSummaryCardComponent;
  let fixture: ComponentFixture<PatternSummaryCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatternSummaryCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatternSummaryCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
