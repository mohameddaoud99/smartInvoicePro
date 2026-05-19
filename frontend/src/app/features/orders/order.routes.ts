import { Routes } from '@angular/router';

export const orderRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./order-list/order-list.component').then(m => m.OrderListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./order-form/order-form.component').then(m => m.OrderFormComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./order-form/order-form.component').then(m => m.OrderFormComponent)
  }
];
