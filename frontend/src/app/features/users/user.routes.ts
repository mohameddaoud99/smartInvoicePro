import { Routes } from '@angular/router';
import { adminGuard } from '../../core/guards/role.guard';

export const userRoutes: Routes = [
  {
    path: '',
    canActivate: [adminGuard],
    loadComponent: () => import('./user-list/user-list.component').then(m => m.UserListComponent)
  },
  {
    path: 'new',
    canActivate: [adminGuard],
    loadComponent: () => import('./user-form/user-form.component').then(m => m.UserFormComponent)
  },
  {
    path: ':id/edit',
    canActivate: [adminGuard],
    loadComponent: () => import('./user-form/user-form.component').then(m => m.UserFormComponent)
  }
];
