import { Component, inject, signal } from '@angular/core';
import { StorageService } from '../../../core/services/storage.service';

@Component({
  selector: 'app-storage-warning',
  standalone: true,
  templateUrl: './storage-warning.component.html',
  styleUrls: ['./storage-warning.component.scss'],
})
export class StorageWarningComponent {
  private readonly storage = inject(StorageService);

  readonly showWarning = signal<boolean>(!this.storage.isAvailable());

  dismiss(): void {
    this.showWarning.set(false);
  }
}
