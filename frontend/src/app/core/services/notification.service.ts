import { Injectable, signal } from '@angular/core';

export type ToastSeverity = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  severity: ToastSeverity;
  title: string;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  toasts = signal<Toast[]>([]);

  success(title: string, message?: string) { this.add('success', title, message); }
  error(title: string, message?: string)   { this.add('error',   title, message); }
  warning(title: string, message?: string) { this.add('warning', title, message); }
  info(title: string, message?: string)    { this.add('info',    title, message); }

  private add(severity: ToastSeverity, title: string, message?: string): void {
    const id = crypto.randomUUID();
    this.toasts.update(t => [...t, { id, severity, title, message }]);
    setTimeout(() => this.remove(id), 4500);
  }

  remove(id: string): void {
    this.toasts.update(t => t.filter(x => x.id !== id));
  }
}
