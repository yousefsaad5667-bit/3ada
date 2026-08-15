import { Component, Input , ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PeriodSplitView, PatternStatus } from '../../models/pattern-view.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-period-split-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './period-split-card.component.html',
  styleUrl: './period-split-card.component.scss'
})
export class PeriodSplitCardComponent {
  @Input({ required: true }) periodSplit!: PeriodSplitView;
  @Input({ required: true }) status: PatternStatus = 'loading';
}
