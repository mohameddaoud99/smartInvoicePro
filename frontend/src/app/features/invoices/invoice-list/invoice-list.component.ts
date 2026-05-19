import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { InvoiceService } from '../../../core/services/invoice.service';
import { InvoiceResponse } from '../../../core/models/invoice.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { NotificationService } from '../../../core/services/notification.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, PageHeaderComponent, LoadingSpinnerComponent, EmptyStateComponent, ConfirmDialogComponent, StatusBadgeComponent],
  template: `
    <app-page-header title="Invoices" subtitle="Manage billing and payments.">
      <a routerLink="/invoices/new" class="btn-sip-primary">
        <span class="material-icons" style="font-size:18px">add</span> Create Invoice
      </a>
    </app-page-header>

    <div class="sip-table-wrap">
      <div class="table-toolbar">
        <div class="table-toolbar-left">
          <div class="search-bar">
            <span class="search-icon material-icons">search</span>
            <input class="sip-input" [(ngModel)]="searchTerm" (ngModelChange)="onSearch($event)"
                   placeholder="Search invoices..." style="min-width:260px">
          </div>
        </div>
        <div class="table-toolbar-right">
          <span class="fs-12 text-muted">{{ total() }} invoice{{ total() !== 1 ? 's' : '' }}</span>
        </div>
      </div>

      @if (loading()) {
        <app-loading-spinner></app-loading-spinner>
      } @else if (invoices().length === 0) {
        <app-empty-state icon="receipt" title="No invoices found"
          description="Create your first invoice."
          actionLabel="Create Invoice" (action)="goCreate()">
        </app-empty-state>
      } @else {
        <table class="sip-table">
          <thead>
            <tr>
              <th>Number</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Due Date</th>
              <th>Total TTC</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (i of invoices(); track i.id) {
              <tr>
                <td class="td-primary fw-semibold">{{ i.numero }}</td>
                <td>{{ i.customerName }}</td>
                <td>{{ i.invoiceDate | date:'mediumDate' }}</td>
                <td [class.text-danger]="isOverdue(i.dueDate || '', i.status)">{{ (i.dueDate || '') | date:'mediumDate' }}</td>
                <td class="fw-semibold">{{ i.totalTTC | currency:'MAD ':'symbol':'1.2-2' }}</td>
                <td><app-status-badge [status]="i.status"></app-status-badge></td>
                <td>
                  <div class="td-actions">
                    <button class="btn-icon" title="Download PDF" (click)="downloadPdf(i.id)">
                      <span class="material-icons" style="font-size:16px">picture_as_pdf</span>
                    </button>
                    <a [routerLink]="['/invoices', i.id, 'edit']" class="btn-icon" title="Edit">
                      <span class="material-icons" style="font-size:16px">edit</span>
                    </a>
                    <button class="btn-icon danger" title="Delete" (click)="confirmDelete(i)">
                      <span class="material-icons" style="font-size:16px">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>

        <div class="sip-pagination">
          <span>Showing {{ pageSize * page + 1 }}–{{ min(pageSize * (page+1), total()) }} of {{ total() }}</span>
          <div class="pagination-btns">
            <button (click)="changePage(0)"          [disabled]="page===0">«</button>
            <button (click)="changePage(page-1)"     [disabled]="page===0">‹</button>
            @for (p of pages(); track p) {
              <button [class.active]="p===page" (click)="changePage(p)">{{ p+1 }}</button>
            }
            <button (click)="changePage(page+1)"     [disabled]="page>=totalPages()-1">›</button>
            <button (click)="changePage(totalPages()-1)" [disabled]="page>=totalPages()-1">»</button>
          </div>
        </div>
      }
    </div>

    <app-confirm-dialog
      [(visible)]="showConfirm"
      title="Delete Invoice"
      [message]="'Delete invoice ' + (selected()?.numero ?? '') + '? This cannot be undone.'"
      confirmLabel="Delete" [dangerMode]="true"
      (confirm)="doDelete()" (cancel)="showConfirm=false">
    </app-confirm-dialog>
  `
})
export class InvoiceListComponent implements OnInit {
  private svc    = inject(InvoiceService);
  private notify = inject(NotificationService);

  invoices   = signal<InvoiceResponse[]>([]);
  loading    = signal(true);
  total      = signal(0);
  totalPages = signal(0);
  selected   = signal<InvoiceResponse | null>(null);

  searchTerm = ''; page = 0; pageSize = 10; showConfirm = false;
  private search$ = new Subject<string>();

  ngOnInit(): void {
    this.load();
    this.search$.pipe(debounceTime(400), distinctUntilChanged(), switchMap(q => { this.page = 0; this.loading.set(true); return this.svc.findAll(q, 0, this.pageSize); })).subscribe(res => this.setPage(res));
  }
  load(): void { this.loading.set(true); this.svc.findAll(this.searchTerm, this.page, this.pageSize).subscribe(res => this.setPage(res)); }
  setPage(res: any): void { this.invoices.set(res.content); this.total.set(res.totalElements); this.totalPages.set(res.totalPages); this.loading.set(false); }
  onSearch(val: string): void { this.search$.next(val); }
  changePage(p: number): void { this.page = p; this.load(); }
  pages(): number[] { return Array.from({ length: Math.min(this.totalPages(), 5) }, (_, i) => i); }
  min(a: number, b: number): number { return Math.min(a, b); }

  isOverdue(dateStr: string, status: string): boolean {
    return status !== 'PAID' && new Date(dateStr).getTime() < new Date().getTime();
  }

  downloadPdf(id: number): void { window.open(`${environment.apiUrl}/invoices/${id}/pdf`, '_blank'); }
  confirmDelete(i: InvoiceResponse): void { this.selected.set(i); this.showConfirm = true; }
  doDelete(): void {
    const i = this.selected(); if (!i) return;
    this.svc.delete(i.id).subscribe(() => { this.notify.success('Deleted', `Invoice removed.`); this.load(); });
  }
  goCreate(): void { window.location.href = '/invoices/new'; }
}
