import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (requiredRole: string): CanActivateFn => () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (auth.hasRole(requiredRole)) return true;
  router.navigate(['/dashboard']);
  return false;
};

export const adminGuard: CanActivateFn = roleGuard('ROLE_ADMIN');
