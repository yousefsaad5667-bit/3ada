import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CumulativeCountCardComponent } from './cumulative-count-card.component';

describe('CumulativeCountCardComponent', () => {
  let component: CumulativeCountCardComponent;
  let fixture: ComponentFixture<CumulativeCountCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CumulativeCountCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CumulativeCountCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
