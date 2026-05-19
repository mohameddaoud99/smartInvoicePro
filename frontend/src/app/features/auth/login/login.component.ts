import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card slide-up">
        <div class="auth-logo">
          <div class="auth-logo-icon">
            <span class="material-icons">receipt_long</span>
          </div>
          <span class="auth-logo-text">Smart<span>Invoice</span>Pro</span>
        </div>

        <h2 class="auth-title">Welcome back</h2>
        <p class="auth-subtitle">Sign in to your account to continue</p>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label">Email address</label>
            <input class="sip-input" type="email" formControlName="email"
                   placeholder="you@company.com" id="login-email" autocomplete="email">
            @if (form.get('email')?.invalid && form.get('email')?.touched) {
              <span class="form-error">
                <span class="material-icons" style="font-size:13px">error_outline</span>
                Valid email is required
              </span>
            }
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <div style="position:relative">
              <input class="sip-input" [type]="showPass() ? 'text' : 'password'"
                     formControlName="password" placeholder="••••••••"
                     id="login-password" autocomplete="current-password"
                     style="padding-right:42px">
              <button type="button" class="btn-icon"
                      style="position:absolute;right:6px;top:50%;transform:translateY(-50%);border:none;background:transparent"
                      (click)="toggleShowPass()">
                <span class="material-icons" style="font-size:18px;color:var(--text-muted)">
                  {{ showPass() ? 'visibility_off' : 'visibility' }}
                </span>
              </button>
            </div>
            @if (form.get('password')?.invalid && form.get('password')?.touched) {
              <span class="form-error">
                <span class="material-icons" style="font-size:13px">error_outline</span>
                Password is required
              </span>
            }
          </div>

          <button class="btn-sip-primary w-100 justify-content-center mt-2"
                  type="submit" [disabled]="loading()" id="login-submit"
                  style="width:100%;justify-content:center">
            @if (loading()) {
              <span class="spinner" style="width:18px;height:18px;border-width:2px"></span>
            } @else {
              <span class="material-icons" style="font-size:18px">login</span>
            }
            {{ loading() ? 'Signing in...' : 'Sign in' }}
          </button>
        </form>

        <p class="text-center mt-3 fs-13 text-muted">
          Don't have an account?
          <a routerLink="/auth/register" class="text-accent fw-semibold">Create account</a>
        </p>
      </div>
    </div>
  `
})
export class LoginComponent {
  private auth   = inject(AuthService);
  private notify = inject(NotificationService);
  private fb     = inject(FormBuilder);
  private router = inject(Router);

  loading  = signal(false);
  showPass = signal(false);

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.auth.login(this.form.value as any).subscribe({
      next: () => {
        this.notify.success('Welcome back!', 'Login successful.');
        this.router.navigate(['/dashboard']);
      },
      error: () => this.loading.set(false)
    });
  }

  toggleShowPass(): void {
    this.showPass.set(!this.showPass());
  }
}
