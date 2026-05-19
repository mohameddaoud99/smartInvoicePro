import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { RoleService } from '../../../core/services/role.service';
import { NotificationService } from '../../../core/services/notification.service';
import { RoleResponse } from '../../../core/models/role.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, PageHeaderComponent, LoadingSpinnerComponent],
  template: `
    <app-page-header [title]="isEdit ? 'Edit User' : 'New User'"
                     [subtitle]="isEdit ? 'Update user information and roles.' : 'Create a new system user.'">
      <a routerLink="/users" class="btn-sip-secondary">
        <span class="material-icons" style="font-size:18px">arrow_back</span> Back
      </a>
    </app-page-header>

    @if (loadingData()) {
      <app-loading-spinner></app-loading-spinner>
    } @else {
      <div class="row justify-content-center">
        <div class="col-12 col-lg-7">
          <div class="sip-card">
            <form [formGroup]="form" (ngSubmit)="onSubmit()">
              <div class="row g-3">
                <div class="col-12 col-sm-6">
                  <div class="form-group">
                    <label class="form-label">First Name *</label>
                    <input class="sip-input" formControlName="firstName" placeholder="John" id="user-firstname">
                    @if (f['firstName'].invalid && f['firstName'].touched) {
                      <span class="form-error"><span class="material-icons" style="font-size:13px">error_outline</span> Required</span>
                    }
                  </div>
                </div>
                <div class="col-12 col-sm-6">
                  <div class="form-group">
                    <label class="form-label">Last Name *</label>
                    <input class="sip-input" formControlName="lastName" placeholder="Doe" id="user-lastname">
                    @if (f['lastName'].invalid && f['lastName'].touched) {
                      <span class="form-error"><span class="material-icons" style="font-size:13px">error_outline</span> Required</span>
                    }
                  </div>
                </div>
                <div class="col-12">
                  <div class="form-group">
                    <label class="form-label">Email Address *</label>
                    <input class="sip-input" type="email" formControlName="email"
                           placeholder="user@company.com" id="user-email">
                    @if (f['email'].invalid && f['email'].touched) {
                      <span class="form-error"><span class="material-icons" style="font-size:13px">error_outline</span> Valid email required</span>
                    }
                  </div>
                </div>
                <div class="col-12">
                  <div class="form-group">
                    <label class="form-label">Password {{ isEdit ? '(leave blank to keep)' : '*' }}</label>
                    <input class="sip-input" type="password" formControlName="password"
                           [placeholder]="isEdit ? 'Leave blank to keep current' : 'Min 8 characters'"
                           id="user-password" autocomplete="new-password">
                    @if (f['password'].invalid && f['password'].touched) {
                      <span class="form-error"><span class="material-icons" style="font-size:13px">error_outline</span> Min 8 characters</span>
                    }
                  </div>
                </div>
                <div class="col-12">
                  <div class="form-group">
                    <label class="form-label">Roles</label>
                    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:6px">
                      @for (role of roles(); track role.id) {
                        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:8px 14px;border-radius:8px;border:1px solid var(--border-color);background:var(--bg-elevated);transition:var(--transition)"
                               [style.border-color]="isRoleSelected(role.id) ? 'var(--color-primary)' : ''"
                               [style.background]="isRoleSelected(role.id) ? 'var(--color-primary-glow)' : ''">
                          <input type="checkbox" [checked]="isRoleSelected(role.id)"
                                 (change)="toggleRole(role.id)" style="accent-color:var(--color-primary)">
                          <span class="fs-12 fw-semibold">{{ role.name.replace('ROLE_','') }}</span>
                        </label>
                      }
                    </div>
                  </div>
                </div>
              </div>

              <div class="divider"></div>

              <div style="display:flex;justify-content:flex-end;gap:10px">
                <a routerLink="/users" class="btn-sip-secondary">Cancel</a>
                <button class="btn-sip-primary" type="submit" [disabled]="saving()" id="user-submit">
                  @if (saving()) {
                    <span class="spinner" style="width:16px;height:16px;border-width:2px"></span>
                  }
                  {{ saving() ? 'Saving...' : (isEdit ? 'Update User' : 'Create User') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    }
  `
})
export class UserFormComponent implements OnInit {
  private svc      = inject(UserService);
  private roleSvc  = inject(RoleService);
  private notify   = inject(NotificationService);
  private router   = inject(Router);
  private route    = inject(ActivatedRoute);
  private fb       = inject(FormBuilder);

  loadingData = signal(true);
  saving      = signal(false);
  roles       = signal<RoleResponse[]>([]);
  selectedRoleIds = signal<number[]>([]);
  isEdit = false;
  userId: number | null = null;

  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName:  ['', Validators.required],
    email:     ['', [Validators.required, Validators.email]],
    password:  ['', [Validators.minLength(8)]]
  });

  get f() { return this.form.controls; }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!id;
    this.userId = id ? +id : null;

    if (!this.isEdit) {
      this.f['password'].addValidators(Validators.required);
    }

    this.roleSvc.findAll().subscribe(roles => {
      this.roles.set(roles);
      if (this.isEdit && this.userId) {
        this.svc.findById(this.userId).subscribe(user => {
          this.form.patchValue({ firstName: user.firstName, lastName: user.lastName, email: user.email });
          this.selectedRoleIds.set(user.roles.map(r => r.id));
          this.loadingData.set(false);
        });
      } else {
        this.loadingData.set(false);
      }
    });
  }

  isRoleSelected(id: number): boolean { return this.selectedRoleIds().includes(id); }

  toggleRole(id: number): void {
    this.selectedRoleIds.update(ids =>
      ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]
    );
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const val = this.form.value;
    const payload: any = {
      firstName: val.firstName!,
      lastName:  val.lastName!,
      email:     val.email!,
      roleIds:   this.selectedRoleIds()
    };
    if (val.password) payload.password = val.password;

    const req = this.isEdit
      ? this.svc.update(this.userId!, payload)
      : this.svc.create(payload);

    req.subscribe({
      next: () => {
        this.notify.success('Success', `User ${this.isEdit ? 'updated' : 'created'} successfully.`);
        this.router.navigate(['/users']);
      },
      error: () => this.saving.set(false)
    });
  }
}
