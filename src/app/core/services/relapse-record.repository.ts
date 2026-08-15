import { Injectable, signal, Signal, inject } from '@angular/core';
import { StorageService } from './storage.service';
import { RelapseRecord } from '../models/relapse-record.model';
import { AnalyticsMemoService } from '../analytics/services/analytics-memo.service';
import { STORAGE_KEYS } from '../constants/storage.constants';
import { validateRelapseRecord } from '../validators/relapse-record.validator';
import { ValidationResult } from '../models/validation-result.model';

@Injectable({ providedIn: 'root' })
export class RelapseRecordRepository {
  private storage = inject(StorageService);
  private memoService = inject(AnalyticsMemoService);

  private readonly _records = signal<RelapseRecord[]>([]);
  readonly records: Signal<RelapseRecord[]> = this._records.asReadonly();
  
  public readonly hasError = signal<boolean>(false);

  constructor() {
    this._reload();
  }

  _reload(): void {
    try {
      const data = this.storage.get<RelapseRecord[]>(STORAGE_KEYS.RELAPSE_RECORDS);
      this._records.set(Array.isArray(data) ? data : []);
      this.hasError.set(false);
    } catch {
      console.warn('Recovered from corrupted relapse records data');
      this._records.set([]);
      this.hasError.set(true);
    }
  }

  getAll(): RelapseRecord[] {
    return [...this._records()].sort((a, b) => {
      if (a.date !== b.date) {
        return a.date > b.date ? -1 : 1;
      }
      const timeA = a.time ?? '';
      const timeB = b.time ?? '';
      if (timeA !== timeB) {
        return timeA > timeB ? -1 : 1;
      }
      return 0;
    });
  }

  getById(id: string): RelapseRecord | null {
    return this._records().find(r => r.id === id) ?? null;
  }

  create(
    draft: Omit<RelapseRecord, 'id' | 'createdAt' | 'updatedAt'>
  ): ValidationResult<RelapseRecord> {
    const result = validateRelapseRecord(draft);
    if (!result.valid || !result.value) {
      return { valid: false, value: null, errors: result.errors };
    }

    const now = new Date().toISOString();
    const newRecord: RelapseRecord = {
      ...result.value,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    const currentRecords = this._records();
    const updatedRecords = [...currentRecords, newRecord];

    if (!this.storage.set(STORAGE_KEYS.RELAPSE_RECORDS, updatedRecords)) {
      return {
        valid: false,
        value: null,
        errors: [{ field: 'storage', messageAr: 'فشل الحفظ: مساحة التخزين ممتلئة.' }],
      };
    }

    this._records.set(updatedRecords);
    this.memoService.clearAll();

    return { valid: true, value: newRecord, errors: [] };
  }

  update(
    id: string,
    patch: Partial<Omit<RelapseRecord, 'id' | 'createdAt'>>
  ): ValidationResult<RelapseRecord> {
    const currentRecords = this._records();
    const existingIndex = currentRecords.findIndex(r => r.id === id);
    if (existingIndex === -1) {
      return {
        valid: false,
        value: null,
        errors: [{ field: 'id', messageAr: 'السجل غير موجود.' }],
      };
    }

    const existingRecord = currentRecords[existingIndex];

    const draft: Omit<RelapseRecord, 'id' | 'createdAt' | 'updatedAt'> = {
      date: patch.date ?? existingRecord.date,
      time: patch.time !== undefined ? patch.time : existingRecord.time,
      ampm: patch.ampm !== undefined ? patch.ampm : existingRecord.ampm,
      count: patch.count ?? existingRecord.count,
      urgeLevel: patch.urgeLevel !== undefined ? patch.urgeLevel : existingRecord.urgeLevel,
      reason: patch.reason !== undefined ? patch.reason : existingRecord.reason,
      notes: patch.notes !== undefined ? patch.notes : existingRecord.notes,
    };

    const validation = validateRelapseRecord(draft);
    if (!validation.valid || !validation.value) {
      return { valid: false, value: null, errors: validation.errors };
    }

    const updatedRecord: RelapseRecord = {
      ...existingRecord,
      ...validation.value,
      updatedAt: new Date().toISOString(),
    };

    const updatedRecords = [...currentRecords];
    updatedRecords[existingIndex] = updatedRecord;

    if (!this.storage.set(STORAGE_KEYS.RELAPSE_RECORDS, updatedRecords)) {
      return {
        valid: false,
        value: null,
        errors: [{ field: 'storage', messageAr: 'فشل الحفظ: مساحة التخزين ممتلئة.' }],
      };
    }

    this._records.set(updatedRecords);
    this.memoService.clearAll();

    return { valid: true, value: updatedRecord, errors: [] };
  }

  delete(id: string): boolean {
    const currentRecords = this._records();
    const existingIndex = currentRecords.findIndex(r => r.id === id);
    if (existingIndex === -1) {
      return false;
    }

    const updatedRecords = currentRecords.filter(r => r.id !== id);
    this.storage.set(STORAGE_KEYS.RELAPSE_RECORDS, updatedRecords);
    this._records.set(updatedRecords);
    this.memoService.clearAll();

    return true;
  }
}
