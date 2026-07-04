import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
  },
  {
    path: 'relapses',
    loadComponent: () =>
      import('./features/relapses/relapses.component').then(m => m.RelapsesComponent),
  },
  {
    path: 'analytics/time-series',
    loadComponent: () =>
      import('./features/analytics/time-series/time-series.component').then(
        m => m.TimeSeriesComponent
      ),
  },
  {
    path: 'analytics/calendar',
    loadComponent: () =>
      import('./features/analytics/calendar/calendar.component').then(m => m.CalendarComponent),
  },
  {
    path: 'analytics/patterns',
    loadComponent: () =>
      import('./features/analytics/patterns/patterns.component').then(m => m.PatternsComponent),
  },
  {
    path: 'analytics/triggers',
    loadComponent: () =>
      import('./features/analytics/triggers/triggers.component').then(m => m.TriggersComponent),
  },
  {
    path: 'analytics/urge',
    loadComponent: () =>
      import('./features/analytics/urge/urge.component').then(m => m.UrgeComponent),
  },
  {
    path: 'charts',
    loadComponent: () => import('./features/charts/charts.component').then(m => m.ChartsComponent),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./features/settings/settings.component').then(m => m.SettingsComponent),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent),
  },
];
