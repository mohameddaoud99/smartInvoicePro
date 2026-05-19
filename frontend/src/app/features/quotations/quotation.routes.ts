import { Routes } from '@angular/router';

export const quotationRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./quotation-list/quotation-list.component').then(m => m.QuotationListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./quotation-form/quotation-form.component').then(m => m.QuotationFormComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./quotation-form/quotation-form.component').then(m => m.QuotationFormComponent)
  }
];
