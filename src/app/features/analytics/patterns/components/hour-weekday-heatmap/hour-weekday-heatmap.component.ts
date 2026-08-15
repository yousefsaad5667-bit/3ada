import { Component, Input, OnChanges , ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HourWeekdayHeatmapView, PatternStatus, HourWeekdayCellView } from '../../models/pattern-view.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-hour-weekday-heatmap',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hour-weekday-heatmap.component.html',
  styleUrl: './hour-weekday-heatmap.component.scss'
})
export class HourWeekdayHeatmapComponent implements OnChanges {
  @Input({ required: true }) heatmap!: HourWeekdayHeatmapView;
  @Input({ required: true }) status: PatternStatus = 'loading';

  flatCells: HourWeekdayCellView[] = [];

  ngOnChanges() {
    if (this.status === 'data' && this.heatmap) {
      this.flatCells = [];
      for (let w = 0; w < 7; w++) {
        for (let h = 0; h < 24; h++) {
          this.flatCells.push(this.heatmap.cells[w][h]);
        }
      }
    }
  }

  getTooltip(cell: HourWeekdayCellView): string {
    const day = this.heatmap.weekdayLabelsAr[cell.weekday];
    const hour = this.heatmap.hourLabelsAr[Math.floor(cell.hour / 2)];
    return `${day}، ${cell.hour}:00 - ${cell.count} مرة`;
  }
}
