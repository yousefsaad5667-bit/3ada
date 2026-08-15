import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { A11yModule } from '@angular/cdk/a11y';
import { RelapseRecord } from '../../../../core/models/relapse-record.model';
import { validateRelapseRecord } from '../../../../core/validators/relapse-record.validator';
import { CommonModule } from '@angular/common';

export interface RecordFormDialogData {
  record?: RelapseRecord;
  draft?: Omit<RelapseRecord, 'id' | 'createdAt' | 'updatedAt'>;
}

export interface RecordFormDialogResult {
  action: 'saved' | 'cancelled';
  record?: RelapseRecord;
}

@Component({
  selector: 'app-record-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, A11yModule],
  templateUrl: './record-form.component.html',
  styleUrls: ['./record-form.component.scss'],
})
export class RecordFormComponent implements OnInit {
  mode: 'create' | 'edit' = 'create';

  form = new FormGroup({
    date: new FormControl<string>('', { nonNullable: true }),
    time: new FormControl<string>('', { nonNullable: true }),
    ampm: new FormControl<'am' | 'pm' | ''>('', { nonNullable: true }),
    count: new FormControl<number | null>(null),
    urgeLevel: new FormControl<number | null>(null),
    reason: new FormControl<string>('', { nonNullable: true }),
    notes: new FormControl<string>('', { nonNullable: true }),
  });

  validationErrors = signal<Record<string, string>>({});

  public dialogRef = inject<DialogRef<RecordFormDialogResult>>(DialogRef);
  public data = inject<RecordFormDialogData>(DIALOG_DATA, { optional: true });

  ngOnInit(): void {
    if (this.data?.record) {
      this.mode = 'edit';
      const r = this.data.record;
      this.form.patchValue({
        date: r.date,
        time: r.time ?? '',
        ampm: r.ampm ?? '',
        count: r.count,
        urgeLevel: r.urgeLevel,
        reason: r.reason ?? '',
        notes: r.notes ?? '',
      });
    } else if (this.data?.draft) {
      this.mode = 'create';
      const d = this.data.draft;
      this.form.patchValue({
        date: d.date,
        time: d.time ?? '',
        ampm: d.ampm ?? '',
        count: d.count,
        urgeLevel: d.urgeLevel,
        reason: d.reason ?? '',
        notes: d.notes ?? '',
      });
    } else {
      this.mode = 'create';
      const today = new Date();
      const formatISO = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${String(year)}-${month}-${day}`;
      };
      this.form.patchValue({ date: formatISO(today), count: 1 });
    }
  }

  save(): void {
    const raw = this.form.getRawValue();
    const draft: Omit<RelapseRecord, 'id' | 'createdAt' | 'updatedAt'> = {
      date: raw.date,
      time: raw.time,
      ampm: raw.ampm === '' ? null : raw.ampm,
      count: raw.count ?? 1,
      urgeLevel: raw.urgeLevel,
      reason: raw.reason,
      notes: raw.notes,
    };

    const result = validateRelapseRecord(draft);

    if (!result.valid) {
      const errorMap: Record<string, string> = {};
      result.errors.forEach(err => {
        errorMap[err.field] = err.messageAr;
      });
      this.validationErrors.set(errorMap);
      return;
    }

    const recordToSave: RelapseRecord = {
      ...(this.data?.record ?? {}),
      ...draft,
      id: this.data?.record?.id ?? crypto.randomUUID(),
      createdAt: this.data?.record?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as RelapseRecord;

    this.dialogRef.close({ action: 'saved', record: recordToSave });
  }

  cancel(): void {
    this.dialogRef.close({ action: 'cancelled' });
  }
}
