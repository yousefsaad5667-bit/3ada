import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private _toasts = signal<ToastMessage[]>([]);
  readonly toasts = this._toasts.asReadonly();

  show(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    const id = crypto.randomUUID();
    const toast: ToastMessage = { id, message, type };
    
    this._toasts.update(t => [...t, toast]);
    
    setTimeout(() => {
      this.remove(id);
    }, 5000);
  }

  error(message: string): void {
    this.show(message, 'error');
  }

  remove(id: string): void {
    this._toasts.update(t => t.filter(toast => toast.id !== id));
  }
}
