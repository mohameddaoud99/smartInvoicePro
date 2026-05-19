import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { InvoiceService } from '../../core/services/invoice.service';
import { OrderService } from '../../core/services/order.service';
import { QuotationService } from '../../core/services/quotation.service';
import { CustomerService } from '../../core/services/customer.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, PageHeaderComponent, LoadingSpinnerComponent, StatusBadgeComponent],
  template: `
    <app-page-header title="Dashboard" subtitle="Welcome back — here's your business at a glance.">
    </app-page-header>

    @if (loading()) {
      <app-loading-spinner></app-loading-spinner>
    } @else {
      <!-- STATS GRID -->
      <div class="row g-3 mb-4">
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="stat-card">
            <div class="stat-icon primary"><span class="material-icons">receipt</span></div>
            <div class="stat-body">
              <div class="stat-label">Total Invoices</div>
              <div class="stat-value">{{ stats().invoices }}</div>
              <div class="stat-change up"><span class="material-icons" style="font-size:13px">trending_up</span> All time</div>
            </div>
          </div>
        </div>
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="stat-card">
            <div class="stat-icon success"><span class="material-icons">shopping_cart</span></div>
            <div class="stat-body">
              <div class="stat-label">Total Orders</div>
              <div class="stat-value">{{ stats().orders }}</div>
              <div class="stat-change up"><span class="material-icons" style="font-size:13px">trending_up</span> Active</div>
            </div>
          </div>
        </div>
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="stat-card">
            <div class="stat-icon warning"><span class="material-icons">request_quote</span></div>
            <div class="stat-body">
              <div class="stat-label">Quotations</div>
              <div class="stat-value">{{ stats().quotations }}</div>
              <div class="stat-change up"><span class="material-icons" style="font-size:13px">trending_up</span> Pending</div>
            </div>
          </div>
        </div>
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="stat-card">
            <div class="stat-icon info"><span class="material-icons">people</span></div>
            <div class="stat-body">
              <div class="stat-label">Customers</div>
              <div class="stat-value">{{ stats().customers }}</div>
              <div class="stat-change up"><span class="material-icons" style="font-size:13px">trending_up</span> Registered</div>
            </div>
          </div>
        </div>
      </div>

      <!-- RECENT DATA -->
      <div class="row g-3">
        <!-- Recent Invoices -->
        <div class="col-12 col-lg-6">
          <div class="sip-card" style="padding:0">
            <div class="table-toolbar">
              <div class="d-flex align-items-center gap-2">
                <span class="material-icons" style="color:var(--color-primary-light)">receipt</span>
                <span class="fw-semibold">Recent Invoices</span>
              </div>
              <a routerLink="/invoices" class="btn-sip-ghost fs-12">View all</a>
            </div>
            <table class="sip-table">
              <thead>
                <tr>
                  <th>Number</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                @for (inv of recentInvoices(); track inv.id) {
                  <tr>
                    <td class="td-primary">{{ inv.numero }}</td>
                    <td>{{ inv.customerName }}</td>
                    <td class="fw-semibold" style="color:var(--color-success)">{{ inv.totalTTC | currency:'MAD ':'symbol':'1.2-2' }}</td>
                    <td><app-status-badge [status]="inv.status"></app-status-badge></td>
                  </tr>
                }
                @empty {
                  <tr><td colspan="4" class="text-center text-muted py-3">No invoices yet</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Recent Quotations -->
        <div class="col-12 col-lg-6">
          <div class="sip-card" style="padding:0">
            <div class="table-toolbar">
              <div class="d-flex align-items-center gap-2">
                <span class="material-icons" style="color:var(--color-warning)">request_quote</span>
                <span class="fw-semibold">Recent Quotations</span>
              </div>
              <a routerLink="/quotations" class="btn-sip-ghost fs-12">View all</a>
            </div>
            <table class="sip-table">
              <thead>
                <tr>
                  <th>Number</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                @for (q of recentQuotations(); track q.id) {
                  <tr>
                    <td class="td-primary">{{ q.numero }}</td>
                    <td>{{ q.customerName }}</td>
                    <td class="fw-semibold">{{ q.totalTTC | currency:'MAD ':'symbol':'1.2-2' }}</td>
                    <td><app-status-badge [status]="q.status"></app-status-badge></td>
                  </tr>
                }
                @empty {
                  <tr><td colspan="4" class="text-center text-muted py-3">No quotations yet</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="col-12">
          <div class="sip-card">
            <div class="fw-semibold mb-3">Quick Actions</div>
            <div class="d-flex flex-wrap gap-3">
              <a routerLink="/invoices/new" class="btn-sip-primary">
                <span class="material-icons" style="font-size:18px">add</span> New Invoice
              </a>
              <a routerLink="/quotations/new" class="btn-sip-secondary">
                <span class="material-icons" style="font-size:18px">add</span> New Quotation
              </a>
              <a routerLink="/orders/new" class="btn-sip-secondary">
                <span class="material-icons" style="font-size:18px">add</span> New Order
              </a>
              <a routerLink="/customers/new" class="btn-sip-secondary">
                <span class="material-icons" style="font-size:18px">person_add</span> New Customer
              </a>
              <a routerLink="/products/new" class="btn-sip-secondary">
                <span class="material-icons" style="font-size:18px">add_box</span> New Product
              </a>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class DashboardComponent implements OnInit {
  private invoiceSvc    = inject(InvoiceService);
  private orderSvc      = inject(OrderService);
  private quotationSvc  = inject(QuotationService);
  private customerSvc   = inject(CustomerService);

  loading          = signal(true);
  stats            = signal({ invoices: 0, orders: 0, quotations: 0, customers: 0 });
  recentInvoices   = signal<any[]>([]);
  recentQuotations = signal<any[]>([]);

  ngOnInit(): void {
    forkJoin({
      invoices:   this.invoiceSvc.findAll('', 0, 5),
      orders:     this.orderSvc.findAll('', 0, 5),
      quotations: this.quotationSvc.findAll('', 0, 5),
      customers:  this.customerSvc.findAll('', 0, 5)
    }).subscribe({
      next: ({ invoices, orders, quotations, customers }) => {
        this.stats.set({
          invoices:   invoices.totalElements,
          orders:     orders.totalElements,
          quotations: quotations.totalElements,
          customers:  customers.totalElements
        });
        this.recentInvoices.set(invoices.content);
        this.recentQuotations.set(quotations.content);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
