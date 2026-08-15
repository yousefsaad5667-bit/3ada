import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ImportExportService } from '../../core/services/import-export.service';
import { CommonModule } from '@angular/common';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  importExportService = inject(ImportExportService);

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        this.importExportService.importRecordsNonBlocking(content, 'replace');
      }
    };
    reader.readAsText(file);
  }
}
