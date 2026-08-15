import { ApplicationConfig, provideZoneChangeDetection, provideAppInitializer, inject, ErrorHandler } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { MigrationService } from './core/services/migration.service';

import { provideAnimations } from '@angular/platform-browser/animations';
import { AppErrorHandler } from './core/errors/app-error-handler';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: ErrorHandler, useClass: AppErrorHandler },
    provideAnimations(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAppInitializer(() => {
      inject(MigrationService).runMigrations();
    }),
  ],
};
