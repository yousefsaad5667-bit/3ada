import { Injectable, signal, Signal, inject } from '@angular/core';
import { StorageService } from './storage.service';
import { Settings, DEFAULT_SETTINGS } from '../models/settings.model';
import { STORAGE_KEYS } from '../constants/storage.constants';
import { validateSettings } from '../validators/settings.validator';
import { ValidationResult } from '../models/validation-result.model';

@Injectable({ providedIn: 'root' })
export class SettingsRepository {
  private storage = inject(StorageService);

  private readonly _settings = signal<Settings>(DEFAULT_SETTINGS);
  readonly settings: Signal<Settings> = this._settings.asReadonly();

  constructor() {
    this._reload();
  }

  _reload(): void {
    try {
      const data = this.storage.get<Settings>(STORAGE_KEYS.SETTINGS);
      // Validate object structure briefly if needed, but fallback to DEFAULT_SETTINGS
      this._settings.set(data && typeof data === 'object' ? data : DEFAULT_SETTINGS);
    } catch {
      console.warn('Recovered from corrupted settings data');
      this._settings.set(DEFAULT_SETTINGS);
    }
  }

  get(): Settings {
    return this._settings();
  }

  update(patch: Partial<Settings>): ValidationResult<Settings> {
    const currentSettings = this.get();
    const draft: Partial<Settings> = { ...currentSettings, ...patch };

    const result = validateSettings(draft);
    if (!result.valid || !result.value) {
      return result;
    }

    if (!this.storage.set(STORAGE_KEYS.SETTINGS, result.value)) {
      return {
        valid: false,
        value: null,
        errors: [{ field: 'storage', messageAr: 'فشل الحفظ: مساحة التخزين ممتلئة.' }],
      };
    }

    this._settings.set(result.value);

    return result;
  }
}
