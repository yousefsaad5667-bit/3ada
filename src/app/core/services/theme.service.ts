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
    
    if (isAppTheme(storedTheme)) {
      this.applyTheme(storedTheme);
    } else if (window.matchMedia) {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.applyTheme(isDark ? 'dark' : 'light');
    } else {
      this.applyTheme('dark'); // default fallback
    }

    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        const stored = this.storage.get<unknown>(STORAGE_KEYS.THEME);
        if (!isAppTheme(stored)) {
          this.applyTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
  }

  toggleTheme(): void {
    const nextTheme = this._currentTheme() === 'dark' ? 'light' : 'dark';
    this.setTheme(nextTheme);
  }

  setTheme(theme: AppTheme): void {
    this.storage.set(STORAGE_KEYS.THEME, theme);
    this.applyTheme(theme);
  }

  private applyTheme(theme: AppTheme): void {
    this._currentTheme.set(theme);
    document.documentElement.setAttribute('data-theme', theme);
  }
}
