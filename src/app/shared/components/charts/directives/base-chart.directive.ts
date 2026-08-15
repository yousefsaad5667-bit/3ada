// ─────────────────────────────────────────────────────────────────────────────
// base-chart.directive.ts
// Shared Angular @Directive that encapsulates the Chart.js canvas lifecycle.
// Used by all 8 canvas-based chart components (NOT used by heatmap/calendar).
// ─────────────────────────────────────────────────────────────────────────────
import { Directive, DestroyRef, inject } from '@angular/core';
import { Chart, ChartType, ChartData, ChartOptions } from 'chart.js/auto';

// Import the theme util here so Chart.js global RTL defaults are applied early
import '../utils/chart-theme.util';

@Directive()
export abstract class BaseChartDirective {
  protected chartInstance: Chart | null = null;
  private destroyRef = inject(DestroyRef);

  constructor() {
    this.destroyRef.onDestroy(() => { this.destroy(); });
  }

  /**
   * Creates a new Chart.js instance on the given canvas.
   * Destroys any existing instance first.
   */
  protected initChart(
    canvas: HTMLCanvasElement,
    type: ChartType,
    data: ChartData,
    options: ChartOptions
  ): void {
    this.destroy();
    this.chartInstance = new Chart(canvas, { type, data, options });
  }

  /**
   * Updates chart data reactively without full re-render.
   * Mode 'active' preserves hover state; use 'none' for silent updates.
   */
  protected updateChart(data: ChartData, mode: 'active' | 'none' = 'active'): void {
    if (!this.chartInstance) return;
    this.chartInstance.data = data;
    this.chartInstance.update(mode);
  }

  /** Calls Chart.js resize — use after container size changes. */
  protected resizeChart(): void {
    this.chartInstance?.resize();
  }

  /** Destroys the Chart.js instance and frees WebGL/canvas resources. */
  protected destroy(): void {
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }
  }
}
