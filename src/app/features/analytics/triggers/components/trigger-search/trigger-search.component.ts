import { Component, EventEmitter, Input, Output , ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TriggerStatus } from '../../models/trigger-view.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-trigger-search',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trigger-search.component.html',
  styleUrl: './trigger-search.component.scss'
})
export class TriggerSearchComponent {
  @Input({ required: true }) status: TriggerStatus = 'loading';
  @Output() queryChanged = new EventEmitter<string>();

  public query = '';

  public onInput(value: string): void {
    this.query = value;
    this.queryChanged.emit(value);
  }

  public clear(): void {
    this.query = '';
    this.queryChanged.emit('');
  }
}
