import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth   = inject(AuthService);
  const notify = inject(NotificationService);

  return next(req).pipe(
    catchError(err => {
      if (err.status === 401) {
        auth.logout();
        notify.error('Session expired', 'Please login again.');
      } else if (err.status === 403) {
        notify.error('Access denied', 'You do not have permission for this action.');
      } else if (err.status === 404) {
        notify.error('Not found', err.error?.message || 'Resource not found.');
      } else if (err.status === 409) {
        notify.error('Conflict', err.error?.message || 'This resource already exists.');
      } else if (err.status >= 500) {
        notify.error('Server error', 'An unexpected error occurred. Please try again.');
      } else if (err.status === 400) {
        const msg = err.error?.message || 'Validation error. Please check your input.';
        notify.error('Bad request', msg);
      }
      return throwError(() => err);
    })
  );
};
