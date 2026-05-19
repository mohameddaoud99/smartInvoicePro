import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="sip-toast-container">
      @for (toast of notify.toasts(); track toast.id) {
        <div class="sip-toast {{ toast.severity }}" style="animation:slideInRight 0.25s ease">
          <span class="sip-toast-icon {{ toast.severity }} material-icons">
            {{ iconMap[toast.severity] }}
          </span>
          <div>
            <div class="sip-toast-title">{{ toast.title }}</div>
            @if (toast.message) {
              <div class="sip-toast-msg">{{ toast.message }}</div>
            }
          </div>
          <button class="btn-icon ms-auto" style="flex-shrink:0" (click)="notify.remove(toast.id)">
            <span class="material-icons" style="font-size:16px">close</span>
          </button>
        </div>
      }
    </div>
  `
})
export class NotificationComponent {
  notify = inject(NotificationService);
  iconMap: Record<string, string> = {
    success: 'check_circle',
    error:   'error',
    warning: 'warning',
    info:    'info'
  };
}
