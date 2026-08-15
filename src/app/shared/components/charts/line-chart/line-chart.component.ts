import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  effect,
  inject,
  input,
  output, OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartData, ChartOptions } from 'chart.js/auto';

import { BaseChartDirective } from '../directives/base-chart.directive';
import { ChartDataSeries, ChartConfig, ChartExportRequest } from '../models/chart.models';
import { ChartCardComponent } from '../partials/chart-card.component';
import { ChartEmptyStateComponent } from '../partials/chart-empty-state.component';
import { ChartLoadingSkeletonComponent } from '../partials/chart-loading-skeleton.component';
import { ChartThemeService } from '../services/chart-theme.service';
import { resolvePalette } from '../utils/chart-theme.util';
import { exportAsPng, exportAsSvg } from '../utils/chart-export.util';

/**
 * T008 — LineChartComponent
 * Standalone Angular component rendering a Chart.js line chart.
 * Supports RTL Arabic tooltips, dark-mode, empty/loading states, and PNG/SVG export.
 */
@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [CommonModule, ChartCardComponent, ChartEmptyStateComponent, ChartLoadingSkeletonComponent],
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss'],
})
export class LineChartComponent extends BaseChartDirective implements AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  // Inputs
  series = input.required<ChartDataSeries[]>();
  config  = input<ChartConfig>({});
  loading = input<boolean>(false);

  // Outputs
  exported = output<ChartExportRequest>();

  private themeService = inject(ChartThemeService);
  private resizeObserver: ResizeObserver | null = null;

  constructor() {
    super();

    // Reactive: re-render when series or theme changes
    effect(() => {
      const seriesData = this.series();
      const theme = this.themeService.theme();
      if (this.canvasRef?.nativeElement && seriesData.length > 0) {
        this.renderChart(seriesData, theme);
      }
    });
  }

  ngAfterViewInit(): void {
    const seriesData = this.series();
    if (seriesData.length > 0) {
      this.renderChart(seriesData, this.themeService.theme());
    }
    this.setupResizeObserver();
  }

  get isEmpty(): boolean {
    return !this.loading() && this.series().length === 0;
  }

  get titleAr(): string {
    return this.config().titleAr ?? '';
  }

  onExportPng(): void {
    if (!this.canvasRef?.nativeElement) return;
    const filename = this.config().exportFilename ?? 'line-chart';
    exportAsPng(this.canvasRef.nativeElement, filename, 2);
    this.exported.emit({ format: 'png', filename, pixelRatio: 2 });
  }

  onExportSvg(): void {
    if (!this.canvasRef?.nativeElement) return;
    const filename = this.config().exportFilename ?? 'line-chart';
    exportAsSvg(this.canvasRef.nativeElement, filename);
    this.exported.emit({ format: 'svg', filename });
  }

  private renderChart(series: ChartDataSeries[], theme: import('../models/chart.models').ChartTheme): void {
    const palette = resolvePalette(theme);
    const cfg = this.config();
    const tension = cfg.smooth ? 0.4 : 0;

    const data: ChartData = {
      labels: series[0]?.data.map(p => p.label) ?? [],
      datasets: series.map((s, i) => ({
        label: s.label,
        data: s.data.map(p => p.value),
        borderColor: s.color ?? palette.seriesColors[i % palette.seriesColors.length],
        backgroundColor: `${s.color ?? palette.seriesColors[i % palette.seriesColors.length]}22`,
        tension,
        spanGaps: false,
        fill: false,
        hidden: s.hidden ?? false,
        pointRadius: 3,
        pointHoverRadius: 5,
      })),
    };

    const options: ChartOptions = {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: cfg.aspectRatio ?? 2,
      plugins: {
        legend: {
          display: cfg.showLegend !== false,
          position: cfg.legendPosition ?? 'bottom',
          rtl: true,
          labels: { color: palette.tickColor, font: { family: 'inherit' } },
        },
        tooltip: {
          rtl: true,
          backgroundColor: palette.tooltipBackground,
          titleColor: palette.tooltipText,
          bodyColor: palette.tooltipText,
        },
      },
      scales: {
        x: {
          ticks: { color: palette.tickColor, font: { family: 'inherit' } },
          grid: { color: cfg.showGrid !== false ? palette.gridLines : 'transparent' },
        },
        y: {
          ticks: { color: palette.tickColor, font: { family: 'inherit' } },
          grid: { color: cfg.showGrid !== false ? palette.gridLines : 'transparent' },
          title: cfg.yAxisLabelAr ? { display: true, text: cfg.yAxisLabelAr, color: palette.tickColor } : undefined,
        },
      },
    };

    this.initChart(this.canvasRef.nativeElement, 'line', data, options);
  }

  private setupResizeObserver(): void {
    const container = this.canvasRef?.nativeElement?.parentElement;
    if (!container) return;
    this.resizeObserver = new ResizeObserver(() => { this.resizeChart(); });
    this.resizeObserver.observe(container);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }
}
