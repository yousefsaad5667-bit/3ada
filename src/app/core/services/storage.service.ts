import { Injectable, signal, Signal, inject, ErrorHandler } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AppErrorHandler } from '../errors/app-error-handler';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private readonly _isAvailable = signal<boolean>(false);
  readonly isAvailable: Signal<boolean> = this._isAvailable.asReadonly();
  
  private readonly errorHandler = inject(ErrorHandler) as AppErrorHandler;

  constructor() {
    this._isAvailable.set(this.checkAvailability());
  }

  private checkAvailability(): boolean {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  private getKey(key: string): string {
    return `${environment.storageKeyPrefix}${key}`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  get<T>(key: string): T | null {
    if (!this._isAvailable()) {
      return null;
    }
    try {
      const item = localStorage.getItem(this.getKey(key));
      return item ? (JSON.parse(item) as T) : null;
    } catch (error) {
      console.error('Error reading from localStorage', error);
      this.errorHandler.handleStorageCorruption?.();
      return null;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  set<T>(key: string, value: T): boolean {
    if (!this._isAvailable()) {
      return false;
    }
    try {
      localStorage.setItem(this.getKey(key), JSON.stringify(value));
      return true;
    } catch {
      console.error('Error writing to localStorage');
      return false;
    }
  }

  remove(key: string): boolean {
    if (!this._isAvailable()) {
      return false;
    }
    try {
      localStorage.removeItem(this.getKey(key));
      return true;
    } catch {
      return false;
    }
  }

  has(key: string): boolean {
    if (!this._isAvailable()) {
      return false;
    }
    return localStorage.getItem(this.getKey(key)) !== null;
  }

  clearAll(): void {
    if (!this._isAvailable()) {
      return;
    }
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(environment.storageKeyPrefix)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => { localStorage.removeItem(key); });
      this._isAvailable.set(this.checkAvailability());
    } catch {
      console.error('Error clearing localStorage');
    }
  }
}
