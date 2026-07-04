import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { StorageWarningComponent } from '../storage-warning/storage-warning.component';
import { AppRoute } from '../../../core/models/app-route.model';
import { APP_ROUTES } from '../../../core/constants/routes.constants';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, SidebarComponent, StorageWarningComponent],
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
})
export class ShellComponent {
  readonly isSidebarOpen = signal<boolean>(false);

  // App navigation definition
  readonly navigation: AppRoute[] = [
    { path: APP_ROUTES.DASHBOARD, label: 'لوحة القيادة', icon: 'dashboard', isActive: false },
    { path: APP_ROUTES.RELAPSES, label: 'الانتكاسات', icon: 'history', isActive: false },
    {
      path: APP_ROUTES.ANALYTICS_TIME_SERIES,
      label: 'السلاسل الزمنية',
      icon: 'timeline',
      isActive: false,
    },
    {
      path: APP_ROUTES.ANALYTICS_CALENDAR,
      label: 'التقويم',
      icon: 'calendar_month',
      isActive: false,
    },
    { path: APP_ROUTES.ANALYTICS_PATTERNS, label: 'الأنماط', icon: 'pattern', isActive: false },
    { path: APP_ROUTES.ANALYTICS_TRIGGERS, label: 'المحفزات', icon: 'flash_on', isActive: false },
    {
      path: APP_ROUTES.ANALYTICS_URGE,
      label: 'الرغبات المُلحة',
      icon: 'trending_up',
      isActive: false,
    },
    { path: APP_ROUTES.CHARTS, label: 'الرسوم البيانية', icon: 'bar_chart', isActive: false },
    { path: APP_ROUTES.SETTINGS, label: 'الإعدادات', icon: 'settings', isActive: false },
  ];

  toggleSidebar(): void {
    this.isSidebarOpen.update(v => !v);
  }

  closeSidebar(): void {
    if (this.isSidebarOpen()) {
      this.isSidebarOpen.set(false);
    }
  }
}
