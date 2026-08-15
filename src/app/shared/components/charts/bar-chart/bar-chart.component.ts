import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartData, ChartOptions } from 'chart.js/auto';

import { BaseChartDirective } from '../directives/base-chart.directive';
import { ChartDataSeries, ChartConfig, ChartExportRequest, ChartTheme } from '../models/chart.models';
import { ChartCardComponent } from '../partials/chart-card.component';
import { ChartEmptyStateComponent } from '../partials/chart-empty-state.component';
import { ChartLoadingSkeletonComponent } from '../partials/chart-loading-skeleton.component';
import { ChartThemeService } from '../services/chart-theme.service';
import { resolvePalette } from '../utils/chart-theme.util';
import { exportAsPng, exportAsSvg } from '../utils/chart-export.util';

/**
 * T015 — BarChartComponent
 * Supports vertical bars (default), horizontal bars via config.horizontal,
 * and stacked bars via config.stacked.
 */
@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [CommonModule, ChartCardComponent, ChartEmptyStateComponent, ChartLoadingSkeletonComponent],
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss'],
})
export class BarChartComponent extends BaseChartDirective implements AfterViewInit {
  @ViewChild('chartCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  series  = input.required<ChartDataSeries[]>();
  config  = input<ChartConfig>({});
  loading = input<boolean>(false);
  exported = output<ChartExportRequest>();

  private themeService = inject(ChartThemeService);
  private resizeObserver: ResizeObserver | null = null;

  constructor() {
    super();
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

  get titleAr(): string { return this.config().titleAr ?? ''; }

  onExportPng(): void {
    if (!this.canvasRef?.nativeElement) return;
    const filename = this.config().exportFilename ?? 'bar-chart';
    exportAsPng(this.canvasRef.nativeElement, filename, 2);
    this.exported.emit({ format: 'png', filename, pixelRatio: 2 });
  }

  onExportSvg(): void {
    if (!this.canvasRef?.nativeElement) return;
    const filename = this.config().exportFilename ?? 'bar-chart';
    exportAsSvg(this.canvasRef.nativeElement, filename);
    this.exported.emit({ format: 'svg', filename });
  }

  private renderChart(series: ChartDataSeries[], theme: ChartTheme): void {
    const palette = resolvePalette(theme);
    const cfg = this.config();
    const isHorizontal = cfg.horizontal ?? false;
    const isStacked = cfg.stacked ?? false;

    const data: ChartData = {
      labels: series[0]?.data.map(p => p.label) ?? [],
      datasets: series.map((s, i) => ({
        label: s.label,
        data: s.data.map(p => p.value ?? 0),
        backgroundColor: s.color ?? palette.seriesColors[i % palette.seriesColors.length],
        borderColor: s.color ?? palette.seriesColors[i % palette.seriesColors.length],
        borderWidth: 1,
        hidden: s.hidden ?? false,
      })),
    };

    const options: ChartOptions = {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: cfg.aspectRatio ?? 2,
      indexAxis: isHorizontal ? 'y' : 'x',
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
          stacked: isStacked,
          ticks: { color: palette.tickColor, font: { family: 'inherit' } },
          grid: { color: cfg.showGrid !== false ? palette.gridLines : 'transparent' },
        },
        y: {
          stacked: isStacked,
          ticks: { color: palette.tickColor, font: { family: 'inherit' } },
          grid: { color: cfg.showGrid !== false ? palette.gridLines : 'transparent' },
        },
      },
    };

    this.initChart(this.canvasRef.nativeElement, 'bar', data, options);
  }

  private setupResizeObserver(): void {
    const container = this.canvasRef?.nativeElement?.parentElement;
    if (!container) return;
    this.resizeObserver = new ResizeObserver(() => this.resizeChart());
    this.resizeObserver.observe(container);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }
}
