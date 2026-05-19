import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RoleService } from '../../../core/services/role.service';
import { NotificationService } from '../../../core/services/notification.service';
import { RoleResponse } from '../../../core/models/role.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageHeaderComponent, LoadingSpinnerComponent, ConfirmDialogComponent, EmptyStateComponent],
  template: `
    <app-page-header title="Roles" subtitle="Define roles and permissions for system users.">
      <button class="btn-sip-primary" (click)="openCreate()" id="btn-create-role">
        <span class="material-icons" style="font-size:18px">add</span> Add Role
      </button>
    </app-page-header>

    <div class="row g-3">
      <!-- Roles List -->
      <div class="col-12 col-lg-7">
        <div class="sip-table-wrap">
          @if (loading()) {
            <app-loading-spinner></app-loading-spinner>
          } @else if (roles().length === 0) {
            <app-empty-state icon="shield_off" title="No roles found"
              description="Create roles to assign permissions to users."
              actionLabel="Add Role" (action)="openCreate()">
            </app-empty-state>
          } @else {
            <table class="sip-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Role Name</th>
                  <th>Display Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (role of roles(); track role.id) {
                  <tr>
                    <td class="text-muted fs-12">{{ role.id }}</td>
                    <td class="td-primary">
                      <span class="badge-status badge-converted">{{ role.name }}</span>
                    </td>
                    <td class="text-secondary">{{ role.name.replace('ROLE_','') | titlecase }}</td>
                    <td>
                      <div class="td-actions">
                        <button class="btn-icon" title="Edit" (click)="openEdit(role)">
                          <span class="material-icons" style="font-size:16px">edit</span>
                        </button>
                        <button class="btn-icon danger" title="Delete" (click)="confirmDelete(role)">
                          <span class="material-icons" style="font-size:16px">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>
      </div>

      <!-- Form Panel -->
      <div class="col-12 col-lg-5">
        @if (showForm()) {
          <div class="sip-card slide-up">
            <h3 class="fw-semibold mb-3" style="font-size:15px">
              {{ editingRole() ? 'Edit Role' : 'New Role' }}
            </h3>
            <form [formGroup]="form" (ngSubmit)="onSubmit()">
              <div class="form-group">
                <label class="form-label">Role Name *</label>
                <input class="sip-input" formControlName="name"
                       placeholder="ROLE_MANAGER" id="role-name">
                <span class="form-error" style="display:block;margin-top:6px;font-size:11px;color:var(--text-muted)">
                  Format: ROLE_UPPERCASE (e.g. ROLE_ADMIN)
                </span>
                @if (form.get('name')?.invalid && form.get('name')?.touched) {
                  <span class="form-error">
                    <span class="material-icons" style="font-size:13px">error_outline</span>
                    Must start with ROLE_ and be uppercase
                  </span>
                }
              </div>
              <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px">
                <button type="button" class="btn-sip-secondary" (click)="closeForm()">Cancel</button>
                <button type="submit" class="btn-sip-primary" [disabled]="saving()" id="role-submit">
                  @if (saving()) { <span class="spinner" style="width:16px;height:16px;border-width:2px"></span> }
                  {{ saving() ? 'Saving...' : (editingRole() ? 'Update' : 'Create') }}
                </button>
              </div>
            </form>
          </div>
        }
      </div>
    </div>

    <app-confirm-dialog
      [(visible)]="showConfirm"
      title="Delete Role"
      [message]="'Delete role ' + (selectedRole()?.name ?? '') + '? Users with this role may lose access.'"
      confirmLabel="Delete" [dangerMode]="true"
      (confirm)="doDelete()" (cancel)="showConfirm=false">
    </app-confirm-dialog>
  `
})
export class RoleListComponent implements OnInit {
  private svc    = inject(RoleService);
  private notify = inject(NotificationService);
  private fb     = inject(FormBuilder);

  roles        = signal<RoleResponse[]>([]);
  loading      = signal(true);
  saving       = signal(false);
  showForm     = signal(false);
  editingRole  = signal<RoleResponse | null>(null);
  selectedRole = signal<RoleResponse | null>(null);
  showConfirm  = false;

  form = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(/^ROLE_[A-Z_]+$/)]]
  });

  ngOnInit() { this.load(); }

  load(): void {
    this.loading.set(true);
    this.svc.findAll().subscribe(roles => { this.roles.set(roles); this.loading.set(false); });
  }

  openCreate(): void { this.editingRole.set(null); this.form.reset(); this.showForm.set(true); }
  openEdit(role: RoleResponse): void { this.editingRole.set(role); this.form.patchValue({ name: role.name }); this.showForm.set(true); }
  closeForm(): void { this.showForm.set(false); this.editingRole.set(null); }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const req = this.editingRole()
      ? this.svc.update(this.editingRole()!.id, this.form.value as any)
      : this.svc.create(this.form.value as any);

    req.subscribe({
      next: () => {
        this.notify.success('Success', `Role ${this.editingRole() ? 'updated' : 'created'}.`);
        this.closeForm();
        this.load();
        this.saving.set(false);
      },
      error: () => this.saving.set(false)
    });
  }

  confirmDelete(role: RoleResponse): void { this.selectedRole.set(role); this.showConfirm = true; }
  doDelete(): void {
    const r = this.selectedRole();
    if (!r) return;
    this.svc.delete(r.id).subscribe(() => {
      this.notify.success('Deleted', `Role ${r.name} removed.`);
      this.load();
    });
  }
}
