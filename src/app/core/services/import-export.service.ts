import { Injectable, inject, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { RelapseRecordRepository } from './relapse-record.repository';
import { SettingsRepository } from './settings.repository';
import { DashboardPreferencesRepository } from './dashboard-preferences.repository';
import { ExportBundle } from '../models/export-bundle.model';
import { ValidationResult } from '../models/validation-result.model';
import { ImportSummary } from '../models/import-summary.model';
import { ImportStrategy } from '../models/import-strategy.model';
import { ImportProgress } from '../models/import-progress.model';
import { validateExportBundle } from '../validators/export-bundle.validator';
import { CURRENT_SCHEMA_VERSION } from '../constants/storage-version.constants';
import { STORAGE_KEYS } from '../constants/storage.constants';

@Injectable({ providedIn: 'root' })
export class ImportExportService {
  private storage = inject(StorageService);
  private relapseRecordRepository = inject(RelapseRecordRepository);
  private settingsRepository = inject(SettingsRepository);
  private dashboardPreferencesRepository = inject(DashboardPreferencesRepository);

  private readonly _importProgress = signal<ImportProgress>({ status: 'idle', totalRecords: 0, processedRecords: 0, percentComplete: 0, errorMessageAr: null });
  public readonly importProgress = this._importProgress.asReadonly();

  exportAll(): boolean {
    try {
      const bundle: ExportBundle = {
        schemaVersion: CURRENT_SCHEMA_VERSION,
        exportedAt: new Date().toISOString(),
        relapseRecords: this.relapseRecordRepository.getAll(),
        settings: this.settingsRepository.get(),
        dashboardPreferences: this.dashboardPreferencesRepository.get(),
      };

      const jsonString = JSON.stringify(bundle, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const dateStr = new Date().toISOString().slice(0, 10);
      const filename = `habit-tracker-backup-${dateStr}.json`;

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return true;
    } catch (e) {
      console.error('Export failed:', e);
      return false;
    }
  }

  importFromJson(jsonContent: string, strategy: ImportStrategy): ValidationResult<ImportSummary> {
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonContent);
    } catch {
      return {
        valid: false,
        value: null,
        errors: [{ field: 'file', messageAr: 'ملف الاستيراد غير صالح أو تالف.' }],
      };
    }

    const validation = validateExportBundle(parsed);
    if (!validation.valid || !validation.value) {
      return { valid: false, value: null, errors: validation.errors };
    }

    const bundle = validation.value;
    let recordsImported = 0;
    let recordsSkipped = 0;

    if (strategy === 'replace') {
      this.clearAll();
      this.storage.set(STORAGE_KEYS.RELAPSE_RECORDS, bundle.relapseRecords);
      this.storage.set(STORAGE_KEYS.SETTINGS, bundle.settings);
      this.storage.set(STORAGE_KEYS.DASHBOARD_PREFS, bundle.dashboardPreferences);

      recordsImported = bundle.relapseRecords.length;

      this.relapseRecordRepository._reload();
      this.settingsRepository._reload();
      this.dashboardPreferencesRepository._reload();
    } else {
      const currentRecords = this.relapseRecordRepository.getAll();
      const currentIds = new Set(currentRecords.map(r => r.id));

      const newRecords = [];
      for (const r of bundle.relapseRecords) {
        if (currentIds.has(r.id)) {
          recordsSkipped++;
        } else {
          newRecords.push(r);
          currentIds.add(r.id);
          recordsImported++;
        }
      }

      if (newRecords.length > 0) {
        const mergedRecords = [...currentRecords, ...newRecords];
        this.storage.set(STORAGE_KEYS.RELAPSE_RECORDS, mergedRecords);
        this.relapseRecordRepository._reload();
      }
    }

    return { valid: true, value: { recordsImported, recordsSkipped, strategy }, errors: [] };
  }

  importRecordsNonBlocking(jsonContent: string, strategy: ImportStrategy): void {
    this._importProgress.set({ status: 'parsing', totalRecords: 0, processedRecords: 0, percentComplete: 0, errorMessageAr: null });
    
    setTimeout(() => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(jsonContent);
      } catch {
        this._importProgress.set({ status: 'error', totalRecords: 0, processedRecords: 0, percentComplete: 0, errorMessageAr: 'ملف الاستيراد غير صالح أو تالف.' });
        return;
      }

      const validation = validateExportBundle(parsed);
      if (!validation.valid || !validation.value) {
        this._importProgress.set({ status: 'error', totalRecords: 0, processedRecords: 0, percentComplete: 0, errorMessageAr: validation.errors[0]?.messageAr || 'بيانات الملف غير صالحة.' });
        return;
      }

      const bundle = validation.value;
      const totalRecords = bundle.relapseRecords.length;
      
      this._importProgress.set({ status: 'processing', totalRecords, processedRecords: 0, percentComplete: 0, errorMessageAr: null });

      if (strategy === 'replace') {
        this.clearAll();
        this.storage.set(STORAGE_KEYS.RELAPSE_RECORDS, bundle.relapseRecords);
        this.storage.set(STORAGE_KEYS.SETTINGS, bundle.settings);
        this.storage.set(STORAGE_KEYS.DASHBOARD_PREFS, bundle.dashboardPreferences);

        this.relapseRecordRepository._reload();
        this.settingsRepository._reload();
        this.dashboardPreferencesRepository._reload();

        this._importProgress.set({
          status: 'done',
          totalRecords,
          processedRecords: totalRecords,
          percentComplete: 100,
          errorMessageAr: null,
          summary: { recordsImported: totalRecords, recordsSkipped: 0, strategy }
        });
      } else {
        const currentRecords = this.relapseRecordRepository.getAll();
        const currentIds = new Set(currentRecords.map(r => r.id));
        const newRecords: any[] = [];
        let recordsImported = 0;
        let recordsSkipped = 0;
        let currentIndex = 0;
        const IMPORT_CHUNK_SIZE = 500;

        const processChunk = () => {
          const end = Math.min(currentIndex + IMPORT_CHUNK_SIZE, totalRecords);
          for (let i = currentIndex; i < end; i++) {
            const r = bundle.relapseRecords[i];
            if (currentIds.has(r.id)) {
              recordsSkipped++;
            } else {
              newRecords.push(r);
              currentIds.add(r.id);
              recordsImported++;
            }
          }
          currentIndex = end;
          const percentComplete = totalRecords > 0 ? Math.round((currentIndex / totalRecords) * 100) : 100;
          
          this._importProgress.set({ status: 'processing', totalRecords, processedRecords: currentIndex, percentComplete, errorMessageAr: null });

          if (currentIndex < totalRecords) {
            setTimeout(processChunk, 0);
          } else {
            if (newRecords.length > 0) {
              const mergedRecords = [...currentRecords, ...newRecords];
              this.storage.set(STORAGE_KEYS.RELAPSE_RECORDS, mergedRecords);
              this.relapseRecordRepository._reload();
            }
            this._importProgress.set({
              status: 'done',
              totalRecords,
              processedRecords: totalRecords,
              percentComplete: 100,
              errorMessageAr: null,
              summary: { recordsImported, recordsSkipped, strategy }
            });
          }
        };

        processChunk();
      }
    }, 0);
  }

  clearAll(): boolean {
    this.storage.clearAll();
    this.relapseRecordRepository._reload();
    this.settingsRepository._reload();
    this.dashboardPreferencesRepository._reload();
    return true;
  }
}
