import { Component, EventEmitter, Input, Output, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { RelapseRecord } from '../../../../core/models/relapse-record.model';
import { SortDir, SortField } from '../../models/record-filter.types';

@Component({
  selector: 'app-record-table',
  standalone: true,
  imports: [CommonModule, ScrollingModule],
  templateUrl: './record-table.component.html',
  styleUrls: ['./record-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecordTableComponent {
  @Input() records: RelapseRecord[] = [];
  @Input() sortField: SortField = 'date';
  @Input() sortDir: SortDir = 'desc';

  @Output() sortChange = new EventEmitter<{ field: SortField; dir: SortDir }>();
  @Output() editRecord = new EventEmitter<string>();
  @Output() deleteRecord = new EventEmitter<string>();
  @Output() duplicateRecord = new EventEmitter<string>();

  pendingDeleteId = signal<string | null>(null);

  readonly ROW_HEIGHT = 48;
  trackById = (_: number, r: RelapseRecord) => r.id;

  toggleSort(field: SortField) {
    if (this.sortField === field) {
      this.sortChange.emit({ field, dir: this.sortDir === 'asc' ? 'desc' : 'asc' });
    } else {
      this.sortChange.emit({ field, dir: 'desc' });
    }
  }

  initiateDelete(id: string) {
    this.pendingDeleteId.set(id);
  }

  cancelDelete() {
    this.pendingDeleteId.set(null);
  }

  confirmDelete(id: string) {
    this.deleteRecord.emit(id);
    this.pendingDeleteId.set(null);
  }
}
