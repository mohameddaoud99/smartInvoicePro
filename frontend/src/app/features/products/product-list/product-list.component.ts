import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { ProductDTO } from '../../../core/models/product.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { NotificationService } from '../../../core/services/notification.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink, PageHeaderComponent, LoadingSpinnerComponent, EmptyStateComponent, ConfirmDialogComponent],
  template: `
    <app-page-header title="Products" subtitle="Manage your product catalog and pricing.">
      <a routerLink="/products/new" class="btn-sip-primary">
        <span class="material-icons" style="font-size:18px">add_box</span> Add Product
      </a>
    </app-page-header>

    <div class="sip-table-wrap">
      <div class="table-toolbar">
        <div class="table-toolbar-right ms-auto">
          <span class="fs-12 text-muted">{{ total() }} product{{ total() !== 1 ? 's' : '' }}</span>
        </div>
      </div>

      @if (loading()) {
        <app-loading-spinner></app-loading-spinner>
      } @else if (products().length === 0) {
        <app-empty-state icon="inventory_2" title="No products found"
          description="Build your catalog by adding products."
          actionLabel="Add Product" (action)="goCreate()">
        </app-empty-state>
      } @else {
        <table class="sip-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Code</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price (HT)</th>
              <th>TVA</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (p of products(); track p.id) {
              <tr>
                <td>
                  @if (p.photo1) {
                    <img [src]="getImageUrl(p.photo1)" style="width:40px;height:40px;border-radius:6px;object-fit:cover;border:1px solid var(--border-color)">
                  } @else {
                    <div style="width:40px;height:40px;border-radius:6px;background:var(--bg-elevated);display:flex;align-items:center;justify-content:center;color:var(--text-muted)">
                      <span class="material-icons" style="font-size:18px">image</span>
                    </div>
                  }
                </td>
                <td class="text-secondary fs-12">{{ p.code }}</td>
                <td class="td-primary fw-semibold">{{ p.libelle }}</td>
                <td>{{ p.categoryName || '-' }}</td>
                <td class="fw-semibold">{{ p.prix | currency:'MAD ':'symbol':'1.2-2' }}</td>
                <td>{{ p.tva }}%</td>
                <td>
                  <div class="td-actions">
                    <a [routerLink]="['/products', p.id, 'edit']" class="btn-icon" title="Edit">
                      <span class="material-icons" style="font-size:16px">edit</span>
                    </a>
                    <button class="btn-icon danger" title="Delete" (click)="confirmDelete(p)">
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
            @for (pg of pages(); track pg) {
              <button [class.active]="pg===page" (click)="changePage(pg)">{{ pg+1 }}</button>
            }
            <button (click)="changePage(page+1)"     [disabled]="page>=totalPages()-1">›</button>
            <button (click)="changePage(totalPages()-1)" [disabled]="page>=totalPages()-1">»</button>
          </div>
        </div>
      }
    </div>

    <app-confirm-dialog
      [(visible)]="showConfirm"
      title="Delete Product"
      [message]="'Delete product ' + (selected()?.libelle ?? '') + '? This cannot be undone.'"
      confirmLabel="Delete" [dangerMode]="true"
      (confirm)="doDelete()" (cancel)="showConfirm=false">
    </app-confirm-dialog>
  `
})
export class ProductListComponent implements OnInit {
  private svc    = inject(ProductService);
  private notify = inject(NotificationService);

  products    = signal<ProductDTO[]>([]);
  loading     = signal(true);
  total       = signal(0);
  totalPages  = signal(0);
  selected    = signal<ProductDTO | null>(null);

  page       = 0;
  pageSize   = 10;
  showConfirm = false;

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.svc.findAll(this.page, this.pageSize).subscribe({
      next: res => {
        this.products.set(res.content);
        this.total.set(res.totalElements);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  changePage(p: number): void { this.page = p; this.load(); }
  pages(): number[] { return Array.from({ length: Math.min(this.totalPages(), 5) }, (_, i) => i); }
  min(a: number, b: number): number { return Math.min(a, b); }

  getImageUrl(filename: string): string {
    return `${environment.uploadsUrl}/${filename}`;
  }

  confirmDelete(p: ProductDTO): void { this.selected.set(p); this.showConfirm = true; }
  doDelete(): void {
    const p = this.selected();
    if (!p) return;
    this.svc.delete(p.id).subscribe(() => {
      this.notify.success('Deleted', `Product removed.`);
      this.load();
    });
  }

  goCreate(): void { window.location.href = '/products/new'; }
}
