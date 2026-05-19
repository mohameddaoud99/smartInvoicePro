import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CustomerService } from '../../../core/services/customer.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, PageHeaderComponent, LoadingSpinnerComponent],
  template: `
    <app-page-header [title]="isEdit ? 'Edit Customer' : 'New Customer'"
                     [subtitle]="isEdit ? 'Update client details.' : 'Add a new client to your database.'">
      <a routerLink="/customers" class="btn-sip-secondary">
        <span class="material-icons" style="font-size:18px">arrow_back</span> Back
      </a>
    </app-page-header>

    @if (loadingData()) {
      <app-loading-spinner></app-loading-spinner>
    } @else {
      <div class="row justify-content-center">
        <div class="col-12 col-lg-8">
          <div class="sip-card">
            <form [formGroup]="form" (ngSubmit)="onSubmit()">
              <div class="row g-3">
                <div class="col-12 col-md-6">
                  <div class="form-group">
                    <label class="form-label">First Name *</label>
                    <input class="sip-input" formControlName="firstName" placeholder="Jane">
                    @if (f['firstName'].invalid && f['firstName'].touched) {
                      <span class="form-error"><span class="material-icons" style="font-size:13px">error_outline</span> Required</span>
                    }
                  </div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="form-group">
                    <label class="form-label">Last Name *</label>
                    <input class="sip-input" formControlName="lastName" placeholder="Smith">
                    @if (f['lastName'].invalid && f['lastName'].touched) {
                      <span class="form-error"><span class="material-icons" style="font-size:13px">error_outline</span> Required</span>
                    }
                  </div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="form-group">
                    <label class="form-label">Email *</label>
                    <input class="sip-input" type="email" formControlName="email" placeholder="jane@client.com">
                    @if (f['email'].invalid && f['email'].touched) {
                      <span class="form-error"><span class="material-icons" style="font-size:13px">error_outline</span> Valid email required</span>
                    }
                  </div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="form-group">
                    <label class="form-label">Phone</label>
                    <input class="sip-input" formControlName="phone" placeholder="+1 234 567 890">
                  </div>
                </div>
                <div class="col-12">
                  <div class="form-group">
                    <label class="form-label">Address</label>
                    <textarea class="sip-textarea" formControlName="address" placeholder="123 Business Rd..."></textarea>
                  </div>
                </div>
                <div class="col-12">
                   <div class="form-group" style="display:flex;align-items:center;gap:10px">
                     <input type="checkbox" formControlName="active" id="active-check" style="width:16px;height:16px;accent-color:var(--color-primary)">
                     <label for="active-check" class="form-label mb-0" style="cursor:pointer">Active Customer</label>
                   </div>
                </div>
              </div>

              <div class="divider"></div>

              <div style="display:flex;justify-content:flex-end;gap:10px">
                <a routerLink="/customers" class="btn-sip-secondary">Cancel</a>
                <button class="btn-sip-primary" type="submit" [disabled]="saving()">
                  @if (saving()) { <span class="spinner" style="width:16px;height:16px;border-width:2px"></span> }
                  {{ saving() ? 'Saving...' : (isEdit ? 'Update Customer' : 'Save Customer') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    }
  `
})
export class CustomerFormComponent implements OnInit {
  private svc    = inject(CustomerService);
  private notify = inject(NotificationService);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);
  private fb     = inject(FormBuilder);

  loadingData = signal(true);
  saving      = signal(false);
  isEdit      = false;
  customerId: number | null = null;

  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName:  ['', Validators.required],
    email:     ['', [Validators.required, Validators.email]],
    phone:     [''],
    address:   [''],
    active:    [true]
  });

  get f() { return this.form.controls; }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!id;
    this.customerId = id ? +id : null;

    if (this.isEdit && this.customerId) {
      this.svc.findById(this.customerId).subscribe(c => {
        this.form.patchValue(c);
        this.loadingData.set(false);
      });
    } else {
      this.loadingData.set(false);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const req = this.isEdit
      ? this.svc.update(this.customerId!, this.form.value as any)
      : this.svc.create(this.form.value as any);

    req.subscribe({
      next: () => {
        this.notify.success('Success', `Customer ${this.isEdit ? 'updated' : 'created'}.`);
        this.router.navigate(['/customers']);
      },
      error: () => this.saving.set(false)
    });
  }
}
