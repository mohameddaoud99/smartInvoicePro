import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CategoryService } from '../../../core/services/category.service';
import { CategoryDTO } from '../../../core/models/category.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, RouterLink, PageHeaderComponent, LoadingSpinnerComponent, EmptyStateComponent, ConfirmDialogComponent],
  template: `
    <app-page-header title="Categories" subtitle="Manage product categories and taxonomy.">
      <a routerLink="/categories/new" class="btn-sip-primary">
        <span class="material-icons" style="font-size:18px">add</span> Add Category
      </a>
    </app-page-header>

    <div class="sip-table-wrap">
      <div class="table-toolbar">
        <div class="table-toolbar-right ms-auto">
          <span class="fs-12 text-muted">{{ total() }} categor{{ total() !== 1 ? 'ies' : 'y' }}</span>
        </div>
      </div>

      @if (loading()) {
        <app-loading-spinner></app-loading-spinner>
      } @else if (categories().length === 0) {
        <app-empty-state icon="category" title="No categories"
          description="Create categories to organize your products."
          actionLabel="Add Category" (action)="goCreate()">
        </app-empty-state>
      } @else {
        <table class="sip-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Parent Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (c of categories(); track c.id) {
              <tr>
                <td class="td-primary fw-semibold">{{ c.name }}</td>
                <td class="text-secondary">{{ c.description || '-' }}</td>
                <td>
                  @if (c.parentName) {
                    <span class="badge-status badge-draft">{{ c.parentName }}</span>
                  } @else {
                    <span class="text-muted fs-12">-</span>
                  }
                </td>
                <td>
                  <div class="td-actions">
                    <a [routerLink]="['/categories', c.id, 'edit']" class="btn-icon" title="Edit">
                      <span class="material-icons" style="font-size:16px">edit</span>
                    </a>
                    <button class="btn-icon danger" title="Delete" (click)="confirmDelete(c)">
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
      title="Delete Category"
      [message]="'Delete category ' + (selected()?.name ?? '') + '? Products in this category may be affected.'"
      confirmLabel="Delete" [dangerMode]="true"
      (confirm)="doDelete()" (cancel)="showConfirm=false">
    </app-confirm-dialog>
  `
})
export class CategoryListComponent implements OnInit {
  private svc    = inject(CategoryService);
  private notify = inject(NotificationService);

  categories  = signal<CategoryDTO[]>([]);
  loading     = signal(true);
  total       = signal(0);
  totalPages  = signal(0);
  selected    = signal<CategoryDTO | null>(null);

  page       = 0;
  pageSize   = 10;
  showConfirm = false;

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.svc.findAll(this.page, this.pageSize).subscribe({
      next: res => {
        this.categories.set(res.content);
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

  confirmDelete(c: CategoryDTO): void { this.selected.set(c); this.showConfirm = true; }
  doDelete(): void {
    const c = this.selected();
    if (!c) return;
    this.svc.delete(c.id).subscribe(() => {
      this.notify.success('Deleted', `Category removed.`);
      this.load();
    });
  }

  goCreate(): void { window.location.href = '/categories/new'; }
}
