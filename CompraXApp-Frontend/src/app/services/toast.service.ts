import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts: Toast[] = [];
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  private idCounter = 0;

  toasts$ = this.toastsSubject.asObservable();

  show(type: Toast['type'], title: string, message: string, duration: number = 4000): void {
    const toast: Toast = {
      id: ++this.idCounter,
      type,
      title,
      message,
      duration
    };

    this.toasts.push(toast);
    this.toastsSubject.next([...this.toasts]);

    if (duration > 0) {
      setTimeout(() => this.dismiss(toast.id), duration);
    }
  }

  success(message: string, title: string = '¡Éxito!'): void {
    this.show('success', title, message);
  }

  error(message: string, title: string = 'Error'): void {
    this.show('error', title, message, 5000);
  }

  warning(message: string, title: string = 'Advertencia'): void {
    this.show('warning', title, message);
  }

  info(message: string, title: string = 'Información'): void {
    this.show('info', title, message);
  }

  dismiss(id: number): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.toastsSubject.next([...this.toasts]);
  }

  dismissAll(): void {
    this.toasts = [];
    this.toastsSubject.next([]);
  }
}
