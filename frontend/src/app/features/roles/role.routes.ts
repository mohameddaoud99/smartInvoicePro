import { Routes } from '@angular/router';
import { adminGuard } from '../../core/guards/role.guard';

export const roleRoutes: Routes = [
  {
    path: '',
    canActivate: [adminGuard],
    loadComponent: () => import('./role-list/role-list.component').then(m => m.RoleListComponent)
  }
];
