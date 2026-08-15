import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  effect,
  inject,
  input,
  output,
, ChangeDetectionStrategy } from '@angular/core';
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
 * T024 — DoughnutChartComponent
 * Chart.js 'doughnut' type with cutout: '65%'.
 * Legend and tooltip identical to PieChartComponent.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-doughnut-chart',
  standalone: true,
  imports: [CommonModule, ChartCardComponent, ChartEmptyStateComponent, ChartLoadingSkeletonComponent],
  templateUrl: './doughnut-chart.component.html',
  styleUrls: ['./doughnut-chart.component.scss'],
})
export class DoughnutChartComponent extends BaseChartDirective implements AfterViewInit {
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
    const series = this.series();
    if (!series.length) return true;
    const total = series[0]?.data.reduce((sum, p) => sum + (p.value ?? 0), 0) ?? 0;
    return !this.loading() && total === 0;
  }

  get titleAr(): string { return this.config().titleAr ?? ''; }

  onExportPng(): void {
    if (!this.canvasRef?.nativeElement) return;
    const filename = this.config().exportFilename ?? 'doughnut-chart';
    exportAsPng(this.canvasRef.nativeElement, filename, 2);
    this.exported.emit({ format: 'png', filename, pixelRatio: 2 });
  }

  onExportSvg(): void {
    if (!this.canvasRef?.nativeElement) return;
    const filename = this.config().exportFilename ?? 'doughnut-chart';
    exportAsSvg(this.canvasRef.nativeElement, filename);
    this.exported.emit({ format: 'svg', filename });
  }

  private renderChart(series: ChartDataSeries[], theme: ChartTheme): void {
    const palette = resolvePalette(theme);
    const cfg = this.config();
    const firstSeries = series[0];

    const data: ChartData<'doughnut'> = {
      labels: firstSeries.data.map(p => p.label),
      datasets: [{
        data: firstSeries.data.map(p => p.value ?? 0),
        backgroundColor: (cfg.colorPalette ?? palette.seriesColors).slice(0, firstSeries.data.length),
        borderColor: palette.background,
        borderWidth: 2,
        // @ts-ignore — Chart.js doughnut cutout option
        cutout: '65%',
      }],
    };

    const options: ChartOptions<'doughnut'> = {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: cfg.aspectRatio ?? 1.5,
      cutout: '65%',
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
    };

    this.initChart(this.canvasRef.nativeElement, 'doughnut', data, options);
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
