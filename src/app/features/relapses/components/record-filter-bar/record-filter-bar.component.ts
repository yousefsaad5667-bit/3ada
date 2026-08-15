import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePreset } from '../../models/record-filter.types';

@Component({
  selector: 'app-record-filter-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './record-filter-bar.component.html',
  styleUrls: ['./record-filter-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecordFilterBarComponent {
  @Input() searchQuery = '';
  @Input() datePreset: DatePreset = 'all';

  @Output() searchChange = new EventEmitter<string>();
  @Output() datePresetChange = new EventEmitter<DatePreset>();
  @Output() clearFilters = new EventEmitter<void>();

  presets: { value: DatePreset; label: string }[] = [
    { value: 'today', label: 'اليوم' },
    { value: 'last7', label: 'آخر 7 أيام' },
    { value: 'last30', label: 'آخر 30 يومًا' },
    { value: 'last90', label: 'آخر 90 يومًا' },
    { value: 'lastYear', label: 'آخر سنة' },
    { value: 'all', label: 'الكل' },
  ];

  onSearchInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchChange.emit(input.value);
  }
}
