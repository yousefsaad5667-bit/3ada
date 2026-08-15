import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="error-page-container" dir="rtl">
      <div class="error-content">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="error-icon">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <h1>عذراً، حدث خطأ غير متوقع</h1>
        <p>الرجاء إعادة تحميل الصفحة أو مسح البيانات المحلية إذا استمرت المشكلة.</p>
        <div class="actions">
          <button class="btn btn-primary" (click)="reload()">إعادة تحميل</button>
          <button class="btn btn-danger" (click)="clearData()">مسح البيانات</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .error-page-container {
      position: fixed;
      inset: 0;
      background: var(--color-bg-primary);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .error-content {
      text-align: center;
      max-width: 400px;
    }
    .error-icon {
      width: 64px;
      height: 64px;
      color: var(--color-error);
      margin-bottom: 20px;
    }
    h1 {
      margin: 0 0 10px;
      font-size: 1.5rem;
    }
    p {
      color: var(--color-text-secondary);
      margin-bottom: 30px;
      line-height: 1.5;
    }
    .actions {
      display: flex;
      gap: 10px;
      justify-content: center;
    }
    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: var(--radius-md);
      font-weight: 600;
      cursor: pointer;
    }
    .btn-primary {
      background: var(--color-primary);
      color: white;
    }
    .btn-danger {
      background: var(--color-error);
      color: white;
    }
  `]
})
export class AppErrorPageComponent {
  reload(): void {
    window.location.reload();
  }

  clearData(): void {
    if (confirm('هل أنت متأكد من مسح جميع البيانات؟')) {
      localStorage.clear();
      window.location.reload();
    }
  }
}
