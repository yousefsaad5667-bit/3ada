import { Injectable, inject } from '@angular/core';
import { StorageService } from './storage.service';
import { STORAGE_KEYS } from '../constants/storage.constants';
import { CURRENT_SCHEMA_VERSION } from '../constants/storage-version.constants';

@Injectable({ providedIn: 'root' })
export class MigrationService {
  private storage = inject(StorageService);

  private readonly MIGRATIONS: (((() => void) | null))[] = [null, this.migrateToV1.bind(this)];

  runMigrations(): void {
    try {
      const storedVersion = this.storage.get<number>(STORAGE_KEYS.SCHEMA_VERSION) ?? 0;

      for (let v = storedVersion + 1; v <= CURRENT_SCHEMA_VERSION; v++) {
        const migrationFn = this.MIGRATIONS[v];
        if (migrationFn) {
          migrationFn();
        }
      }

      this.storage.set(STORAGE_KEYS.SCHEMA_VERSION, CURRENT_SCHEMA_VERSION);
    } catch (e) {
      console.error('Migration failed:', e);
    }
  }

  getStoredVersion(): number {
    return this.storage.get<number>(STORAGE_KEYS.SCHEMA_VERSION) ?? 0;
  }

  private migrateToV1(): void {
    // No-op for new installs
  }
}
