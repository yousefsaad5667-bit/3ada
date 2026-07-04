import { Injectable, signal, Signal, inject } from '@angular/core';
import { AppTheme } from '../models/app-theme.model';
import { StorageService } from './storage.service';
import { STORAGE_KEYS } from '../constants/storage.constants';
import { isAppTheme } from '../../shared/utils/type-guards';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly storage = inject(StorageService);

  private readonly _currentTheme = signal<AppTheme>('dark');
  readonly currentTheme: Signal<AppTheme> = this._currentTheme.asReadonly();

  initialize(): void {
    const storedTheme = this.storage.get<unknown>(STORAGE_KEYS.THEME);
    const themeToApply: AppTheme = isAppTheme(storedTheme) ? storedTheme : 'dark';
    this.setTheme(themeToApply);
  }

  toggleTheme(): void {
    const nextTheme = this._currentTheme() === 'dark' ? 'light' : 'dark';
    this.setTheme(nextTheme);
  }

  setTheme(theme: AppTheme): void {
    this._currentTheme.set(theme);
    this.storage.set(STORAGE_KEYS.THEME, theme);
    document.documentElement.setAttribute('data-theme', theme);
  }
}
