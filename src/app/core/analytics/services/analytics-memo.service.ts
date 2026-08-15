import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AnalyticsMemoService {
  private cache = new Map<string, unknown>();
  private readonly _cacheSize = signal(0);
  readonly cacheSize = this._cacheSize.asReadonly();

  memoize<T>(key: string, compute: () => T): T {
    if (this.cache.has(key)) {
      return this.cache.get(key) as T;
    }
    const result = compute();
    this.cache.set(key, result);
    this._cacheSize.set(this.cache.size);
    return result;
  }

  clearAll(): void {
    this.cache.clear();
    this._cacheSize.set(0);
  }
}
