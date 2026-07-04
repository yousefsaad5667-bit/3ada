import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardState } from '../../../models/dashboard-card.model';

@Component({
  selector: 'app-placeholder-card-b',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="placeholder-content">
      <h4>تحليل البيانات الوهمية ب (اختبار الأخطاء)</h4>
      <p>هذه البطاقة تختبر حالة الخطأ بشكل افتراضي.</p>
      
      <div class="state-controls">
        <button (click)="simulateError()">محاكاة خطأ</button>
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
    }
    button {
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      border: 1px solid #ccc;
      background: #f9f9f9;
      cursor: pointer;
    }
  `]
})
export class PlaceholderCardBComponent implements OnInit {
  cardState = signal<CardState>('loading');

  ngOnInit() {
    this.simulateError();
  }

  simulateError() {
    this.cardState.set('loading');
    setTimeout(() => {
      this.cardState.set('error');
    }, 1000);
  }

  // Contract method called by shell
  onRetry() {
    this.cardState.set('loading');
    setTimeout(() => {
      // Recover successfully on retry
      this.cardState.set('data');
    }, 1000);
  }
}
