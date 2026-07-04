import { Injectable, signal, Signal, inject } from '@angular/core';
import { StorageService } from './storage.service';
import {
  DashboardPreferences,
  DEFAULT_DASHBOARD_PREFERENCES,
} from '../models/dashboard-preferences.model';
import { STORAGE_KEYS } from '../constants/storage.constants';
import { ValidationResult } from '../models/validation-result.model';

@Injectable({ providedIn: 'root' })
export class DashboardPreferencesRepository {
  private storage = inject(StorageService);

  private readonly _preferences = signal<DashboardPreferences>(DEFAULT_DASHBOARD_PREFERENCES);
  readonly preferences: Signal<DashboardPreferences> = this._preferences.asReadonly();

  constructor() {
    this._reload();
  }

  _reload(): void {
    try {
      const data = this.storage.get<DashboardPreferences>(STORAGE_KEYS.DASHBOARD_PREFS);
      this._preferences.set(
        data && typeof data === 'object' ? data : DEFAULT_DASHBOARD_PREFERENCES
      );
    } catch {
      console.warn('Recovered from corrupted dashboard preferences data');
      this._preferences.set(DEFAULT_DASHBOARD_PREFERENCES);
    }
  }

  get(): DashboardPreferences {
    return this._preferences();
  }

  update(patch: Partial<DashboardPreferences>): ValidationResult<DashboardPreferences> {
    const current = this.get();
    const newValue: DashboardPreferences = {
      cardOrder: patch.cardOrder ?? current.cardOrder,
      hiddenCards: patch.hiddenCards ?? current.hiddenCards,
    };

    if (!Array.isArray(newValue.cardOrder) || !Array.isArray(newValue.hiddenCards)) {
      return {
        valid: false,
        value: null,
        errors: [{ field: 'preferences', messageAr: 'بيانات التفضيلات غير صالحة.' }],
      };
    }

    if (!this.storage.set(STORAGE_KEYS.DASHBOARD_PREFS, newValue)) {
      return {
        valid: false,
        value: null,
        errors: [{ field: 'storage', messageAr: 'فشل الحفظ: مساحة التخزين ممتلئة.' }],
      };
    }

    this._preferences.set(newValue);

    return { valid: true, value: newValue, errors: [] };
  }
}
