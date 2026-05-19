import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  // Authentication Flow
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadComponent: () => import('./layouts/auth-layout/auth-layout.component').then(m => m.AuthLayoutComponent),
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  },

  // Main Application Flow
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.dashboardRoutes)
      },
      {
        path: 'users',
        loadChildren: () => import('./features/users/user.routes').then(m => m.userRoutes)
      },
      {
        path: 'roles',
        loadChildren: () => import('./features/roles/role.routes').then(m => m.roleRoutes)
      },
      {
        path: 'customers',
        loadChildren: () => import('./features/customers/customer.routes').then(m => m.customerRoutes)
      },
      {
        path: 'categories',
        loadChildren: () => import('./features/categories/category.routes').then(m => m.categoryRoutes)
      },
      {
        path: 'products',
        loadChildren: () => import('./features/products/product.routes').then(m => m.productRoutes)
      },
      {
        path: 'quotations',
        loadChildren: () => import('./features/quotations/quotation.routes').then(m => m.quotationRoutes)
      },
      {
        path: 'orders',
        loadChildren: () => import('./features/orders/order.routes').then(m => m.orderRoutes)
      },
      {
        path: 'invoices',
        loadChildren: () => import('./features/invoices/invoice.routes').then(m => m.invoiceRoutes)
      }
    ]
  },

  // Fallback Route
  { path: '**', redirectTo: 'dashboard' }
];
