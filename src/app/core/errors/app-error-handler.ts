import { ErrorHandler, Injectable, Injector, NgZone, signal } from '@angular/core';
import { ToastService } from '../services/toast.service';

@Injectable({ providedIn: 'root' })
export class AppErrorHandler implements ErrorHandler {
  public hasCriticalError = signal<boolean>(false);

  constructor(private injector: Injector, private zone: NgZone) {}

  handleError(error: any): void {
    const toastService = this.injector.get(ToastService);
    
    const message = error?.message ? error.message : error?.toString() || 'حدث خطأ غير متوقع';

    // Run inside Angular zone so UI updates correctly
    this.zone.run(() => {
      toastService.error(message);
    });

    console.error('AppErrorHandler caught:', error);
  }

  handleStorageCorruption(): void {
    this.zone.run(() => {
      this.hasCriticalError.set(true);
    });
  }
}
