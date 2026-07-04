import { Component, Input, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimeSeriesAnalyticsService } from '../../services/time-series-analytics.service';
import { TimeSeriesDatasetView, TimeSeriesTableRow } from '../../models/time-series-view.model';

@Component({
  selector: 'app-time-series-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './time-series-table.component.html',
  styleUrl: './time-series-table.component.scss'
})
export class TimeSeriesTableComponent {
  private service = inject(TimeSeriesAnalyticsService);

  @Input({ required: true }) set dataset(val: TimeSeriesDatasetView) {
    this._dataset.set(val);
    this.page.set(0); // Reset page on new dataset
  }

  private _dataset = signal<TimeSeriesDatasetView | null>(null);
  
  public pageSize = signal<number>(10);
  public page = signal<number>(0);

  public readonly allRows = computed<TimeSeriesTableRow[]>(() => {
    const data = this._dataset();
    if (!data) return [];
    return this.service.mapToTableRows(data);
  });

  public readonly totalRows = computed(() => this.allRows().length);
  public readonly totalPages = computed(() => Math.ceil(this.totalRows() / this.pageSize()));

  public readonly paginatedRows = computed(() => {
    const rows = this.allRows();
    const startIndex = this.page() * this.pageSize();
    return rows.slice(startIndex, startIndex + this.pageSize());
  });

  public setPage(newPage: number) {
    if (newPage >= 0 && newPage < this.totalPages()) {
      this.page.set(newPage);
    }
  }

  public getChangeClass(change: number | null): string {
    if (change === null || change === 0) return 'neutral';
    return change > 0 ? 'negative' : 'positive'; // >0 means more relapses (negative outcome)
  }

  public getChangeIcon(change: number | null): string {
    if (change === null || change === 0) return '-';
    return change > 0 ? '↑' : '↓';
  }
}
