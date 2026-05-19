import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card slide-up" style="max-width:480px">
        <div class="auth-logo">
          <div class="auth-logo-icon">
            <span class="material-icons">receipt_long</span>
          </div>
          <span class="auth-logo-text">Smart<span>Invoice</span>Pro</span>
        </div>

        <h2 class="auth-title">Create account</h2>
        <p class="auth-subtitle">Start managing your business today</p>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="row g-3">
            <div class="col-6">
              <div class="form-group">
                <label class="form-label">First name</label>
                <input class="sip-input" formControlName="firstName" placeholder="John" id="reg-firstname">
                @if (form.get('firstName')?.invalid && form.get('firstName')?.touched) {
                  <span class="form-error"><span class="material-icons" style="font-size:13px">error_outline</span> Required</span>
                }
              </div>
            </div>
            <div class="col-6">
              <div class="form-group">
                <label class="form-label">Last name</label>
                <input class="sip-input" formControlName="lastName" placeholder="Doe" id="reg-lastname">
                @if (form.get('lastName')?.invalid && form.get('lastName')?.touched) {
                  <span class="form-error"><span class="material-icons" style="font-size:13px">error_outline</span> Required</span>
                }
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Email address</label>
            <input class="sip-input" type="email" formControlName="email"
                   placeholder="you@company.com" id="reg-email">
            @if (form.get('email')?.invalid && form.get('email')?.touched) {
              <span class="form-error"><span class="material-icons" style="font-size:13px">error_outline</span> Valid email required</span>
            }
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <input class="sip-input" type="password" formControlName="password"
                   placeholder="Min 8 characters" id="reg-password">
            @if (form.get('password')?.invalid && form.get('password')?.touched) {
              <span class="form-error"><span class="material-icons" style="font-size:13px">error_outline</span> At least 8 characters required</span>
            }
          </div>

          <button class="btn-sip-primary mt-2" type="submit"
                  [disabled]="loading()" id="reg-submit"
                  style="width:100%;justify-content:center">
            @if (loading()) {
              <span class="spinner" style="width:18px;height:18px;border-width:2px"></span>
            } @else {
              <span class="material-icons" style="font-size:18px">person_add</span>
            }
            {{ loading() ? 'Creating account...' : 'Create account' }}
          </button>
        </form>

        <p class="text-center mt-3 fs-13 text-muted">
          Already have an account?
          <a routerLink="/auth/login" class="text-accent fw-semibold">Sign in</a>
        </p>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private auth   = inject(AuthService);
  private notify = inject(NotificationService);
  private fb     = inject(FormBuilder);
  private router = inject(Router);

  loading = signal(false);

  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName:  ['', Validators.required],
    email:     ['', [Validators.required, Validators.email]],
    password:  ['', [Validators.required, Validators.minLength(8)]]
  });

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.auth.register(this.form.value as any).subscribe({
      next: () => {
        this.notify.success('Account created!', 'Welcome to SmartInvoicePro.');
        this.router.navigate(['/dashboard']);
      },
      error: () => this.loading.set(false)
    });
  }
}
