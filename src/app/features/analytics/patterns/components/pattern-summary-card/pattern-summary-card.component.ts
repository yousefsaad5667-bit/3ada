import { Component, Input , ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatternSummaryView, PatternStatus } from '../../models/pattern-view.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-pattern-summary-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pattern-summary-card.component.html',
  styleUrl: './pattern-summary-card.component.scss'
})
export class PatternSummaryCardComponent {
  @Input({ required: true }) summary!: PatternSummaryView;
  @Input({ required: true }) status: PatternStatus = 'loading';
}
