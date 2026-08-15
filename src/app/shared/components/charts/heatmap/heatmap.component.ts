import {
  Component,
  computed,
  ElementRef,
  inject,
  input,
  output,
  signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HeatmapCell, ChartConfig, ChartExportRequest } from '../models/chart.models';
import { ChartCardComponent } from '../partials/chart-card.component';
import { ChartEmptyStateComponent } from '../partials/chart-empty-state.component';
import { ChartLoadingSkeletonComponent } from '../partials/chart-loading-skeleton.component';
import { ChartThemeService } from '../services/chart-theme.service';
import { exportAsPng, exportAsSvgFromDom } from '../utils/chart-export.util';

/**
 * T029 — HeatmapComponent
 * CSS-grid heatmap (rows × columns). No Chart.js.
 * Renders cells with intensity-0 through intensity-4 classes.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-heatmap',
  standalone: true,
  imports: [CommonModule, ChartCardComponent, ChartEmptyStateComponent, ChartLoadingSkeletonComponent],
  templateUrl: './heatmap.component.html',
  styleUrls: ['./heatmap.component.scss'],
  host: { dir: 'rtl' },
})
export class HeatmapComponent {
  cells      = input.required<HeatmapCell[]>();
  rowLabels  = input.required<string[]>();
  colLabels  = input.required<string[]>();
  config     = input<ChartConfig>({});
  loading    = input<boolean>(false);
  exported   = output<ChartExportRequest>();

  private hostRef = inject(ElementRef) as ElementRef<HTMLElement>;
  private themeService = inject(ChartThemeService);

  get isEmpty(): boolean {
    return !this.loading() && this.cells().length === 0;
  }

  get titleAr(): string { return this.config().titleAr ?? ''; }

  /** Max value in dataset for intensity normalization. */
  readonly maxValue = computed<number>(() => {
    const values = this.cells().map(c => Math.max(0, c.value));
    return values.length ? Math.max(...values) : 1;
  });

  /** Map from `${rowKey}|${colKey}` to intensity level 0–4. */
  readonly intensityMap = computed<Map<string, number>>(() => {
    const max = this.maxValue();
    const map = new Map<string, number>();
    for (const cell of this.cells()) {
      const normalized = max > 0 ? Math.max(0, cell.value) / max : 0;
      const intensity = Math.min(4, Math.floor(normalized * 5));
      map.set(`${cell.rowKey}|${cell.colKey}`, intensity);
    }
    return map;
  });

  /** Tooltip text map: `${rowKey}|${colKey}` → Arabic tooltip. */
  readonly tooltipMap = computed<Map<string, string>>(() => {
    const map = new Map<string, string>();
    for (const cell of this.cells()) {
      map.set(`${cell.rowKey}|${cell.colKey}`, cell.tooltipLabelAr);
    }
    return map;
  });

  getIntensity(rowKey: string, colKey: string): number {
    return this.intensityMap().get(`${rowKey}|${colKey}`) ?? 0;
  }

  getTooltip(rowKey: string, colKey: string): string {
    return this.tooltipMap().get(`${rowKey}|${colKey}`) ?? '';
  }

  onExportPng(): void {
    const filename = this.config().exportFilename ?? 'heatmap';
    // Heatmap uses DOM element export
    exportAsSvgFromDom(this.hostRef.nativeElement, filename);
    this.exported.emit({ format: 'png', filename });
  }

  onExportSvg(): void {
    const filename = this.config().exportFilename ?? 'heatmap';
    exportAsSvgFromDom(this.hostRef.nativeElement, filename);
    this.exported.emit({ format: 'svg', filename });
  }
}
