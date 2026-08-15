import {
  Component,
  computed,
  ElementRef,
  inject,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { HeatmapCell, ChartConfig, ChartExportRequest } from '../models/chart.models';
import { ChartCardComponent } from '../partials/chart-card.component';
import { ChartEmptyStateComponent } from '../partials/chart-empty-state.component';
import { ChartLoadingSkeletonComponent } from '../partials/chart-loading-skeleton.component';
import { ChartThemeService } from '../services/chart-theme.service';
import { exportAsSvgFromDom } from '../utils/chart-export.util';

export interface WeekColumn {
  weekIndex: number;
  days: DayCell[];
}

export interface DayCell {
  date: string;       // YYYY-MM-DD or '' for padding
  value: number;
  intensity: number;  // 0–4
  tooltipLabelAr: string;
  dayOfWeek: number;  // 0=Sun...6=Sat
}

const ARABIC_DAY_LABELS = ['ح', 'ن', 'ث', 'ع', 'خ', 'ج', 'س']; // Sun–Sat

/**
 * T032 — CalendarHeatmapComponent
 * Year-at-a-glance 53-week × 7-day CSS-grid calendar (GitHub contribution graph style).
 * Uses HeatmapCell[] input; computes WeekColumn[] grid with month labels.
 */
@Component({
  selector: 'app-calendar-heatmap',
  standalone: true,
  imports: [CommonModule, ChartCardComponent, ChartEmptyStateComponent, ChartLoadingSkeletonComponent],
  templateUrl: './calendar-heatmap.component.html',
  styleUrls: ['./calendar-heatmap.component.scss'],
  host: { dir: 'rtl' },
})
export class CalendarHeatmapComponent {
  cells   = input.required<HeatmapCell[]>();
  year    = input.required<number>();
  config  = input<ChartConfig>({});
  loading = input<boolean>(false);
  exported = output<ChartExportRequest>();

  private hostRef = inject(ElementRef) as ElementRef<HTMLElement>;

  readonly dayLabels = ARABIC_DAY_LABELS;

  get isEmpty(): boolean {
    return !this.loading() && this.cells().length === 0;
  }

  get titleAr(): string { return this.config().titleAr ?? ''; }

  /** Resolved max value for intensity thresholds. */
  private readonly maxValue = computed<number>(() => {
    const vals = this.cells().map(c => Math.max(0, c.value));
    return vals.length ? Math.max(...vals) : 1;
  });

  /** Cell lookup: date string → HeatmapCell */
  private readonly cellMap = computed<Map<string, HeatmapCell>>(() => {
    const map = new Map<string, HeatmapCell>();
    for (const cell of this.cells()) {
      map.set(cell.colKey, cell); // colKey = YYYY-MM-DD date string
    }
    return map;
  });

  /** 53-column week grid for the selected year. */
  readonly calendarGrid = computed<WeekColumn[]>(() => {
    const yr = this.year();
    const max = this.maxValue();
    const lookup = this.cellMap();

    const jan1 = new Date(yr, 0, 1);
    const dec31 = new Date(yr, 11, 31);

    // Start from Sunday before Jan 1
    const startDate = new Date(jan1);
    startDate.setDate(jan1.getDate() - jan1.getDay());

    const weeks: WeekColumn[] = [];
    let current = new Date(startDate);

    while (current <= dec31 || current.getDay() !== 0) {
      const week: WeekColumn = { weekIndex: weeks.length, days: [] };
      for (let d = 0; d < 7; d++) {
        const dateStr = formatDate(current);
        const isCurrentYear = current.getFullYear() === yr;
        const cell = lookup.get(dateStr);
        const value = cell?.value ?? 0;
        const normalized = max > 0 ? Math.max(0, value) / max : 0;
        const intensity = isCurrentYear ? Math.min(4, Math.floor(normalized * 5)) : 0;

        week.days.push({
          date: isCurrentYear ? dateStr : '',
          value,
          intensity: isCurrentYear ? intensity : 0,
          tooltipLabelAr: cell?.tooltipLabelAr ?? (isCurrentYear ? formatDateAr(current) : ''),
          dayOfWeek: d,
        });
        current.setDate(current.getDate() + 1);
      }
      weeks.push(week);
      if (weeks.length > 54) break; // safety guard
    }

    return weeks;
  });

  /** Month label positions: array of {month: string, colIndex: number} */
  readonly monthLabels = computed<Array<{ label: string; colIndex: number }>>(() => {
    const grid = this.calendarGrid();
    const labels: Array<{ label: string; colIndex: number }> = [];
    const ARABIC_MONTHS = [
      'يناير','فبراير','مارس','أبريل','مايو','يونيو',
      'يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر',
    ];
    let lastMonth = -1;
    grid.forEach((week, i) => {
      const firstValidDay = week.days.find(d => d.date !== '');
      if (firstValidDay) {
        const month = new Date(firstValidDay.date).getMonth();
        if (month !== lastMonth) {
          labels.push({ label: ARABIC_MONTHS[month], colIndex: i });
          lastMonth = month;
        }
      }
    });
    return labels;
  });

  onExportPng(): void {
    const filename = this.config().exportFilename ?? 'calendar-heatmap';
    exportAsSvgFromDom(this.hostRef.nativeElement, filename);
    this.exported.emit({ format: 'png', filename });
  }

  onExportSvg(): void {
    const filename = this.config().exportFilename ?? 'calendar-heatmap';
    exportAsSvgFromDom(this.hostRef.nativeElement, filename);
    this.exported.emit({ format: 'svg', filename });
  }
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDateAr(date: Date): string {
  return date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
}
