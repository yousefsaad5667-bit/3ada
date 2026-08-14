import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UrgeCorrelationResult } from '../../../../../core/analytics/models/analytics.types';

@Component({
  selector: 'app-urge-correlation-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './urge-correlation-card.component.html',
  styleUrls: ['./urge-correlation-card.component.scss']
})
export class UrgeCorrelationCardComponent {
  @Input({ required: true }) correlation!: UrgeCorrelationResult;
}
