import { Component, ElementRef, OnDestroy, effect, input, viewChild } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { TimeSeriesDatasetView } from '../../models/time-series-view.model';

Chart.register(...registerables);

@Component({
  selector: 'app-time-series-chart',
  templateUrl: './time-series-chart.component.html',
  styleUrl: './time-series-chart.component.scss'
})
export class TimeSeriesChartComponent implements OnDestroy {
  dataset = input.required<TimeSeriesDatasetView>();
  type = input<'line' | 'bar'>('bar');
  
  chartCanvas = viewChild<ElementRef<HTMLCanvasElement>>('chartCanvas');

  private chartInstance: Chart | null = null;

  constructor() {
    effect(() => {
      const data = this.dataset();
      const chartType = this.type();
      const canvas = this.chartCanvas();
      
      if (canvas) {
        this.renderChart(canvas.nativeElement, data, chartType);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
  }

  private renderChart(canvasEl: HTMLCanvasElement, data: TimeSeriesDatasetView, type: 'line' | 'bar'): void {
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }

    if (!data || data.periods.length === 0) {
      return;
    }

    const labels = data.periods.map(p => p.labelAr);
    const counts = data.periods.map(p => p.count);

    const config: ChartConfiguration = {
      type,
      data: {
        labels,
        datasets: [{
          label: 'مرات الانتكاس',
          data: counts,
          backgroundColor: '#3b82f6',
          borderColor: '#2563eb',
          borderWidth: 1,
          borderRadius: type === 'bar' ? 4 : 0,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            textDirection: 'rtl',
            titleFont: { family: 'inherit' },
            bodyFont: { family: 'inherit' }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { family: 'inherit' } },
            reverse: true // RTL
          },
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1, precision: 0, font: { family: 'inherit' } },
            position: 'right'
          }
        }
      }
    };

    this.chartInstance = new Chart(canvasEl, config);
  }
}
