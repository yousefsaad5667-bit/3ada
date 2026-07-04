import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovingAverageCardComponent } from './moving-average-card.component';

describe('MovingAverageCardComponent', () => {
  let component: MovingAverageCardComponent;
  let fixture: ComponentFixture<MovingAverageCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovingAverageCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MovingAverageCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
