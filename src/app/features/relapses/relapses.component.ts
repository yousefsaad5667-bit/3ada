import { Component, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { RelapseRecordRepository } from '../../core/services/relapse-record.repository';
import { RelapseRecord } from '../../core/models/relapse-record.model';
import { RecordEmptyStateComponent } from './components/record-empty-state/record-empty-state.component';
import {
  RecordFormComponent,
  RecordFormDialogResult,
} from './components/record-form/record-form.component';
import { RecordFilterBarComponent } from './components/record-filter-bar/record-filter-bar.component';
import { RecordTableComponent } from './components/record-table/record-table.component';
import { DatePreset, SortField, SortDir, getDateRangeBounds } from './models/record-filter.types';

@Component({
  selector: 'app-relapses',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    RecordEmptyStateComponent,
    RecordFilterBarComponent,
    RecordTableComponent,
  ],
  templateUrl: './relapses.component.html',
  styleUrls: ['./relapses.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RelapsesComponent {
  private repository = inject(RelapseRecordRepository);
  private dialog = inject(Dialog);

  _searchQuery = signal<string>('');
  _datePreset = signal<DatePreset>('all');
  _sortField = signal<SortField>('date');
  _sortDir = signal<SortDir>('desc');

  private searchDebounce: ReturnType<typeof setTimeout> | null = null;

  filteredRecords = computed(() => {
    let records = [...this.repository.records()];

    // 1. Apply Date Preset
    const preset = this._datePreset();
    const bounds = getDateRangeBounds(preset);
    if (bounds && (bounds.from || bounds.to)) {
      records = records.filter(r => {
        if (bounds.from && r.date < bounds.from) return false;
        if (bounds.to && r.date > bounds.to) return false;
        return true;
      });
    }

    // 2. Apply Search
    const q = this._searchQuery().trim().toLowerCase();
    if (q) {
      records = records.filter(
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        r => r.reason?.toLowerCase().includes(q) || r.notes?.toLowerCase().includes(q)
      );
    }

    // 3. Apply Sort
    const field = this._sortField();
    const dir = this._sortDir() === 'asc' ? 1 : -1;

    return records.sort((a, b) => {
      if (field === 'count') {
        return (a.count - b.count) * dir;
      } else {
        // field === 'date'
        const dateA = a.date + (a.time ?? '');
        const dateB = b.date + (b.time ?? '');
        if (dateA < dateB) return -1 * dir;
        if (dateA > dateB) return 1 * dir;
        return 0;
      }
    });
  });

  isEmpty = computed(() => this.repository.records().length === 0);
  noMatch = computed(() => !this.isEmpty() && this.filteredRecords().length === 0);

  updateSearch(q: string) {
    if (this.searchDebounce) {
      clearTimeout(this.searchDebounce);
    }
    this.searchDebounce = setTimeout(() => {
      this._searchQuery.set(q);
    }, 150);
  }

  updateDatePreset(p: DatePreset) {
    this._datePreset.set(p);
  }

  updateSort(event: { field: SortField; dir: SortDir }) {
    this._sortField.set(event.field);
    this._sortDir.set(event.dir);
  }

  clearFilters() {
    this._searchQuery.set('');
    this._datePreset.set('all');
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open<RecordFormDialogResult>(RecordFormComponent, {
      data: {},
    });

    dialogRef.closed.subscribe(result => {
      if (result?.action === 'saved' && result.record) {
        this.repository.create(result.record);
      }
    });
  }

  openEditDialog(id: string): void {
    const record: RelapseRecord | undefined = this.repository.records().find(r => r.id === id);
    if (!record) return;

    const dialogRef = this.dialog.open<RecordFormDialogResult>(RecordFormComponent, {
      data: { record },
    });

    dialogRef.closed.subscribe(result => {
      if (result?.action === 'saved' && result.record) {
        this.repository.update(result.record.id, result.record);
      }
    });
  }

  openDuplicateDialog(id: string): void {
    const record: RelapseRecord | undefined = this.repository.records().find(r => r.id === id);
    if (!record) return;

    const draft: Omit<RelapseRecord, 'id' | 'createdAt' | 'updatedAt'> = {
      date: record.date,
      time: record.time,
      ampm: record.ampm,
      count: record.count,
      urgeLevel: record.urgeLevel,
      reason: record.reason,
      notes: record.notes,
    };

    const dialogRef = this.dialog.open<RecordFormDialogResult>(RecordFormComponent, {
      data: { draft },
    });

    dialogRef.closed.subscribe(result => {
      if (result?.action === 'saved' && result.record) {
        this.repository.create(result.record);
      }
    });
  }

  deleteRecord(id: string): void {
    this.repository.delete(id);
  }
}
