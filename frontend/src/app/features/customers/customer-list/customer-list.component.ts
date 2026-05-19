import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { CustomerService } from '../../../core/services/customer.service';
import { CustomerResponse } from '../../../core/models/customer.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, PageHeaderComponent, LoadingSpinnerComponent, EmptyStateComponent, ConfirmDialogComponent],
  template: `
    <app-page-header title="Customers" subtitle="Manage your client base and contacts.">
      <a routerLink="/customers/new" class="btn-sip-primary">
        <span class="material-icons" style="font-size:18px">person_add</span> Add Customer
      </a>
    </app-page-header>

    <div class="sip-table-wrap">
      <div class="table-toolbar">
        <div class="table-toolbar-left">
          <div class="search-bar">
            <span class="search-icon material-icons">search</span>
            <input class="sip-input" [(ngModel)]="searchTerm" (ngModelChange)="onSearch($event)"
                   placeholder="Search customers..." style="min-width:260px">
          </div>
        </div>
        <div class="table-toolbar-right">
          <span class="fs-12 text-muted">{{ total() }} customer{{ total() !== 1 ? 's' : '' }}</span>
        </div>
      </div>

      @if (loading()) {
        <app-loading-spinner></app-loading-spinner>
      } @else if (customers().length === 0) {
        <app-empty-state icon="people" title="No customers found"
          description="Start by adding your first customer."
          actionLabel="Add Customer" (action)="goCreate()">
        </app-empty-state>
      } @else {
        <table class="sip-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (c of customers(); track c.id) {
              <tr>
                <td class="td-primary">
                  <div style="display:flex;align-items:center;gap:10px">
                    <div class="user-avatar" style="width:32px;height:32px;font-size:12px;flex-shrink:0;background:var(--color-info)">
                      {{ c.firstName[0] }}{{ c.lastName[0] }}
                    </div>
                    {{ c.firstName }} {{ c.lastName }}
                  </div>
                </td>
                <td>{{ c.email }}</td>
                <td>{{ c.phone || '-' }}</td>
                <td>
                  <span [class]="'badge-status ' + (c.active ? 'badge-active' : 'badge-inactive')">
                    {{ c.active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td>
                  <div class="td-actions">
                    <a [routerLink]="['/customers', c.id, 'edit']" class="btn-icon" title="Edit">
                      <span class="material-icons" style="font-size:16px">edit</span>
                    </a>
                    <button class="btn-icon" title="Toggle status" (click)="toggle(c)">
                      <span class="material-icons" style="font-size:16px">{{ c.active ? 'toggle_on' : 'toggle_off' }}</span>
                    </button>
                    <button class="btn-icon danger" title="Delete" (click)="confirmDelete(c)">
                      <span class="material-icons" style="font-size:16px">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>

        <!-- PAGINATION -->
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
      title="Delete Customer"
      [message]="'Delete ' + (selected()?.firstName ?? '') + '? This action cannot be undone.'"
      confirmLabel="Delete" [dangerMode]="true"
      (confirm)="doDelete()" (cancel)="showConfirm=false">
    </app-confirm-dialog>
  `
})
export class CustomerListComponent implements OnInit {
  private svc    = inject(CustomerService);
  private notify = inject(NotificationService);

  customers   = signal<CustomerResponse[]>([]);
  loading     = signal(true);
  total       = signal(0);
  totalPages  = signal(0);
  selected    = signal<CustomerResponse | null>(null);

  searchTerm = '';
  page       = 0;
  pageSize   = 10;
  showConfirm = false;

  private search$ = new Subject<string>();

  ngOnInit(): void {
    this.load();
    this.search$.pipe(debounceTime(400), distinctUntilChanged(),
      switchMap(q => { this.page = 0; this.loading.set(true); return this.svc.findAll(q, 0, this.pageSize); })
    ).subscribe(res => this.setPage(res));
  }

  load(): void {
    this.loading.set(true);
    this.svc.findAll(this.searchTerm, this.page, this.pageSize).subscribe(res => this.setPage(res));
  }

  setPage(res: any): void {
    this.customers.set(res.content);
    this.total.set(res.totalElements);
    this.totalPages.set(res.totalPages);
    this.loading.set(false);
  }

  onSearch(val: string): void { this.search$.next(val); }
  changePage(p: number): void { this.page = p; this.load(); }
  pages(): number[] { return Array.from({ length: Math.min(this.totalPages(), 5) }, (_, i) => i); }
  min(a: number, b: number): number { return Math.min(a, b); }

  toggle(c: CustomerResponse): void {
    this.svc.toggleActive(c.id).subscribe(() => {
      this.notify.success('Updated', `Customer status changed.`);
      this.load();
    });
  }

  confirmDelete(c: CustomerResponse): void { this.selected.set(c); this.showConfirm = true; }
  doDelete(): void {
    const c = this.selected();
    if (!c) return;
    this.svc.delete(c.id).subscribe(() => {
      this.notify.success('Deleted', `Customer removed.`);
      this.load();
    });
  }

  goCreate(): void { window.location.href = '/customers/new'; }
}
