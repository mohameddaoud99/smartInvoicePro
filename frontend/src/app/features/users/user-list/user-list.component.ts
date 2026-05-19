import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';
import { UserService } from '../../../core/services/user.service';
import { UserResponse } from '../../../core/models/user.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, PageHeaderComponent, LoadingSpinnerComponent, EmptyStateComponent, ConfirmDialogComponent],
  template: `
    <app-page-header title="Users" subtitle="Manage system users and their access levels.">
      <a routerLink="/users/new" class="btn-sip-primary" id="btn-create-user">
        <span class="material-icons" style="font-size:18px">person_add</span> Add User
      </a>
    </app-page-header>

    <div class="sip-table-wrap">
      <!-- TOOLBAR -->
      <div class="table-toolbar">
        <div class="table-toolbar-left">
          <div class="search-bar">
            <span class="search-icon material-icons">search</span>
            <input class="sip-input" [(ngModel)]="searchTerm" (ngModelChange)="onSearch($event)"
                   placeholder="Search users..." id="user-search" style="min-width:260px">
          </div>
        </div>
        <div class="table-toolbar-right">
          <span class="fs-12 text-muted">{{ total() }} user{{ total() !== 1 ? 's' : '' }}</span>
        </div>
      </div>

      @if (loading()) {
        <app-loading-spinner></app-loading-spinner>
      } @else if (users().length === 0) {
        <app-empty-state icon="person_off" title="No users found"
          description="No users match your search. Try different keywords or create a new user."
          actionLabel="Add User" (action)="goCreate()">
        </app-empty-state>
      } @else {
        <table class="sip-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Roles</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (user of users(); track user.id) {
              <tr>
                <td class="text-muted fs-12">{{ user.id }}</td>
                <td class="td-primary">
                  <div style="display:flex;align-items:center;gap:10px">
                    <div class="user-avatar" style="width:32px;height:32px;font-size:12px;flex-shrink:0">
                      {{ user.firstName[0] }}{{ user.lastName[0] }}
                    </div>
                    {{ user.firstName }} {{ user.lastName }}
                  </div>
                </td>
                <td>{{ user.email }}</td>
                <td>
                  <div style="display:flex;gap:4px;flex-wrap:wrap">
                    @for (role of user.roles; track role.id) {
                      <span class="badge-status badge-converted" style="font-size:10px">{{ role.name.replace('ROLE_','') }}</span>
                    }
                  </div>
                </td>
                <td>
                  <span [class]="'badge-status ' + (user.active ? 'badge-active' : 'badge-inactive')">
                    {{ user.active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td>
                  <div class="td-actions">
                    <a [routerLink]="['/users', user.id, 'edit']" class="btn-icon" title="Edit">
                      <span class="material-icons" style="font-size:16px">edit</span>
                    </a>
                    <button class="btn-icon" title="Toggle status" (click)="toggle(user)">
                      <span class="material-icons" style="font-size:16px">{{ user.active ? 'toggle_on' : 'toggle_off' }}</span>
                    </button>
                    <button class="btn-icon danger" title="Delete" (click)="confirmDelete(user)">
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
      title="Delete User"
      [message]="'Are you sure you want to delete ' + (selectedUser()?.firstName ?? '') + '? This cannot be undone.'"
      confirmLabel="Delete"
      [dangerMode]="true"
      (confirm)="doDelete()"
      (cancel)="showConfirm=false">
    </app-confirm-dialog>
  `
})
export class UserListComponent implements OnInit {
  private svc    = inject(UserService);
  private notify = inject(NotificationService);

  users       = signal<UserResponse[]>([]);
  loading     = signal(true);
  total       = signal(0);
  totalPages  = signal(0);
  selectedUser = signal<UserResponse | null>(null);

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
    this.users.set(res.content);
    this.total.set(res.totalElements);
    this.totalPages.set(res.totalPages);
    this.loading.set(false);
  }

  onSearch(val: string): void { this.search$.next(val); }
  changePage(p: number): void { this.page = p; this.load(); }
  pages(): number[] { return Array.from({ length: Math.min(this.totalPages(), 5) }, (_, i) => i); }
  min(a: number, b: number): number { return Math.min(a, b); }

  toggle(user: UserResponse): void {
    this.svc.toggleActive(user.id).subscribe(() => {
      this.notify.success('Updated', `User ${user.firstName} status changed.`);
      this.load();
    });
  }

  confirmDelete(user: UserResponse): void {
    this.selectedUser.set(user);
    this.showConfirm = true;
  }

  doDelete(): void {
    const u = this.selectedUser();
    if (!u) return;
    this.svc.delete(u.id).subscribe(() => {
      this.notify.success('Deleted', `User ${u.firstName} deleted.`);
      this.load();
    });
  }

  goCreate(): void { window.location.href = '/users/new'; }
}
