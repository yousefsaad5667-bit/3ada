import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TriggerBucketView, TriggerStatus } from '../../models/trigger-view.model';

@Component({
  selector: 'app-trigger-ranking-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trigger-ranking-list.component.html',
  styleUrl: './trigger-ranking-list.component.scss'
})
export class TriggerRankingListComponent {
  @Input({ required: true }) triggers: TriggerBucketView[] = [];
  @Input({ required: true }) status: TriggerStatus = 'loading';
  @Input({ required: true }) selectedKeyword: string | null = null;
  @Output() keywordSelected = new EventEmitter<string | null>();

  public onSelect(keyword: string): void {
    if (this.selectedKeyword === keyword) {
      this.keywordSelected.emit(null);
    } else {
      this.keywordSelected.emit(keyword);
    }
  }

  public getUrgeClass(avgUrge: number | null): string {
    if (avgUrge === null) return 'none';
    if (avgUrge <= 3) return 'low';
    if (avgUrge <= 6) return 'mid';
    return 'high';
  }
}
