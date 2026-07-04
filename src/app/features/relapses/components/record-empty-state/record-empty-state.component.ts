import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-record-empty-state',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './record-empty-state.component.html',
  styleUrls: ['./record-empty-state.component.scss'],
})
export class RecordEmptyStateComponent {
  @Input() mode: 'empty' | 'no-match' = 'empty';
  @Output() addRecord = new EventEmitter<void>();
}
