import { Component, signal, OnInit, inject , ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardState } from '../../../models/dashboard-card.model';
import { DashboardFilterService } from '../../../services/dashboard-filter.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-placeholder-card-a',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="placeholder-content">
      <h4>تحليل البيانات الوهمية أ</h4>
      <p>هذه البطاقة تختبر حالات الواجهة المختلفة.</p>
      
      <div class="filter-info">
        الفترة المحددة: {{ filterService.activeFilter().preset }}
      </div>

      <div class="state-controls">
        <button (click)="setState('loading')">تحميل</button>
        <button (click)="setState('empty')">فارغ</button>
        <button (click)="setState('error')">خطأ</button>
        <button (click)="setState('data')">بيانات</button>
      </div>
    </div>
  `,
  styles: [`
    .placeholder-content {
      padding: 1rem;
      text-align: center;
    }
    .state-controls {
      margin-top: 1rem;
      display: flex;
      gap: 0.5rem;
      justify-content: center;
      flex-wrap: wrap;
    }
    button {
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      border: 1px solid #ccc;
      background: #f9f9f9;
      cursor: pointer;
    }
    .filter-info {
      margin-top: 1rem;
      padding: 0.5rem;
      background-color: #e3f2fd;
      border-radius: 4px;
      font-size: 0.9rem;
    }
  `]
})
export class PlaceholderCardAComponent implements OnInit {
  filterService = inject(DashboardFilterService);
  cardState = signal<CardState>('loading');

  ngOnInit() {
    // Simulate initial loading then data
    setTimeout(() => {
      if (this.cardState() === 'loading') {
        this.cardState.set('data');
      }
    }, 1500);
  }

  setState(state: CardState) {
    this.cardState.set(state);
  }
}
