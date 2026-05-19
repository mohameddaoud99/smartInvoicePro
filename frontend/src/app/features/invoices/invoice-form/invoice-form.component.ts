import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { InvoiceService } from '../../../core/services/invoice.service';
import { CustomerService } from '../../../core/services/customer.service';
import { ProductService } from '../../../core/services/product.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CustomerResponse } from '../../../core/models/customer.model';
import { ProductDTO } from '../../../core/models/product.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, PageHeaderComponent, LoadingSpinnerComponent],
  template: `
    <app-page-header [title]="isEdit ? 'Edit Invoice' : 'New Invoice'"
                     [subtitle]="isEdit ? 'Update billing details.' : 'Create a new invoice.'">
      <a routerLink="/invoices" class="btn-sip-secondary">
        <span class="material-icons" style="font-size:18px">arrow_back</span> Back
      </a>
    </app-page-header>

    @if (loadingData()) {
      <app-loading-spinner></app-loading-spinner>
    } @else {
      <div class="row">
        <div class="col-12">
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            
            <div class="row g-4">
              <!-- Header Information -->
              <div class="col-12 col-lg-3">
                <div class="sip-card h-100">
                  <h3 class="fs-13 fw-semibold text-secondary text-uppercase mb-3">General Info</h3>
                  <div class="form-group">
                    <label class="form-label">Customer *</label>
                    <select class="sip-select" formControlName="customerId">
                      <option [ngValue]="null">-- Select Customer --</option>
                      @for (c of customers(); track c.id) {
                        <option [value]="c.id">{{ c.firstName }} {{ c.lastName }}</option>
                      }
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Order Reference ID</label>
                    <input class="sip-input" type="number" formControlName="orderId" placeholder="Optional">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Date *</label>
                    <input class="sip-input" type="date" formControlName="invoiceDate">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Due Date *</label>
                    <input class="sip-input" type="date" formControlName="dueDate">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Status</label>
                    <select class="sip-select" formControlName="status">
                      <option value="DRAFT">Draft</option>
                      <option value="SENT">Sent</option>
                      <option value="PAID">Paid</option>
                      <option value="CANCELLED">Cancelled</option>
                      <option value="OVERDUE">Overdue</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Notes</label>
                    <textarea class="sip-textarea" formControlName="notes" rows="2"></textarea>
                  </div>
                </div>
              </div>

              <!-- Lines -->
              <div class="col-12 col-lg-9">
                <div class="sip-card h-100" style="display:flex;flex-direction:column">
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <h3 class="fs-13 fw-semibold text-secondary text-uppercase mb-0">Line Items</h3>
                    <button type="button" class="btn-sip-primary fs-12" (click)="addLine()">
                      <span class="material-icons" style="font-size:16px">add</span> Add Line
                    </button>
                  </div>

                  <div style="flex:1;overflow-x:auto">
                    <table class="sip-table">
                      <thead>
                        <tr>
                          <th style="min-width:250px">Product</th>
                          <th style="width:100px">Qty</th>
                          <th style="width:120px">Price HT</th>
                          <th style="width:100px">Discount %</th>
                          <th style="width:120px">TVA %</th>
                          <th style="width:120px">Total TTC</th>
                          <th style="width:60px"></th>
                        </tr>
                      </thead>
                      <tbody formArrayName="lines">
                        @for (line of lines.controls; track i; let i = $index) {
                          <tr [formGroupName]="i">
                            <td>
                              <select class="sip-select py-1" formControlName="productId" (change)="onProductChange(i)">
                                <option [ngValue]="null">-- Select --</option>
                                @for (p of products(); track p.id) {
                                  <option [value]="p.id">{{ p.libelle }} ({{ p.code }})</option>
                                }
                              </select>
                            </td>
                            <td><input class="sip-input py-1 text-center" type="number" min="1" formControlName="quantity"></td>
                            <td><input class="sip-input py-1 text-end" type="number" step="0.01" formControlName="unitPrice"></td>
                            <td><input class="sip-input py-1 text-center" type="number" step="0.1" formControlName="remise"></td>
                            <td><input class="sip-input py-1 text-center" type="number" step="0.1" formControlName="tva"></td>
                            <td class="text-end fw-semibold">{{ calculateLineTotal(i) | currency:'MAD ':'symbol':'1.2-2' }}</td>
                            <td class="text-center">
                              <button type="button" class="btn-icon danger" (click)="removeLine(i)">
                                <span class="material-icons" style="font-size:16px">close</span>
                              </button>
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>

                  <!-- Totals -->
                  <div class="mt-4 d-flex justify-content-end">
                    <div style="width:300px;background:var(--bg-elevated);border:1px solid var(--border-color);border-radius:8px;padding:16px">
                      <div class="d-flex justify-content-between mb-2 fs-13 text-secondary">
                        <span>Total HT</span><span>{{ totalHT() | currency:'MAD ':'symbol':'1.2-2' }}</span>
                      </div>
                      <div class="d-flex justify-content-between mb-2 fs-13 text-secondary">
                        <span>Total Discount</span><span>-{{ totalDiscount() | currency:'MAD ':'symbol':'1.2-2' }}</span>
                      </div>
                      <div class="d-flex justify-content-between mb-2 fs-13 text-secondary">
                        <span>Total TVA</span><span>{{ totalTVA() | currency:'MAD ':'symbol':'1.2-2' }}</span>
                      </div>
                      <div class="divider"></div>
                      <div class="d-flex justify-content-between fw-bold fs-16" style="color:var(--color-primary-dark)">
                        <span>Total TTC</span><span>{{ totalTTC() | currency:'MAD ':'symbol':'1.2-2' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-4 d-flex justify-content-end gap-2">
              <a routerLink="/invoices" class="btn-sip-secondary">Cancel</a>
              <button class="btn-sip-primary" type="submit" [disabled]="saving() || lines.length === 0">
                @if (saving()) { <span class="spinner" style="width:16px;height:16px;border-width:2px"></span> }
                {{ saving() ? 'Saving...' : (isEdit ? 'Update Invoice' : 'Save Invoice') }}
              </button>
            </div>

          </form>
        </div>
      </div>
    }
  `
})
export class InvoiceFormComponent implements OnInit {
  private svc     = inject(InvoiceService);
  private custSvc = inject(CustomerService);
  private prodSvc = inject(ProductService);
  private notify  = inject(NotificationService);
  private router  = inject(Router);
  private route   = inject(ActivatedRoute);
  private fb      = inject(FormBuilder);

  loadingData = signal(true);
  saving      = signal(false);
  customers   = signal<CustomerResponse[]>([]);
  products    = signal<ProductDTO[]>([]);
  isEdit = false; id: number | null = null;
  linesValue = signal<any[]>([]);

  form = this.fb.group({
    customerId:    [null as number | null, Validators.required],
    orderId:       [null as number | null],
    invoiceDate:   [this.today(), Validators.required],
    dueDate:       [this.todayPlusDays(30), Validators.required],
    status:        ['DRAFT'],
    notes:         [''],
    lines:         this.fb.array([])
  });

  get lines() { return this.form.get('lines') as FormArray; }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!idParam; this.id = idParam ? +idParam : null;

    forkJoin({ c: this.custSvc.findAllList(), p: this.prodSvc.findAllList() }).subscribe({
      next: ({ c, p }) => {
        this.customers.set(c); this.products.set(p);
        if (this.isEdit) {
          this.svc.findById(this.id!).subscribe(i => {
            this.form.patchValue({
              customerId: i.customerId, orderId: i.orderId, invoiceDate: i.invoiceDate,
              dueDate: i.dueDate, status: i.status
            });
            i.lines.forEach(l => {
              this.lines.push(this.fb.group({
                productId: [l.productId, Validators.required], quantity: [l.quantity, [Validators.required, Validators.min(1)]],
                unitPrice: [l.unitPrice, [Validators.required, Validators.min(0)]], remise: [0, [Validators.required, Validators.min(0)]],
                tva: [l.tvaRate || 20, [Validators.required, Validators.min(0)]]
              }));
            });
            this.loadingData.set(false);
          });
        } else { this.addLine(); this.loadingData.set(false); }
      },
      error: () => this.loadingData.set(false)
    });

    this.form.valueChanges.subscribe(() => this.linesValue.set(this.lines.getRawValue()));
  }

  addLine(): void {
    this.lines.push(this.fb.group({
      productId: [null, Validators.required], quantity: [1, Validators.required],
      unitPrice: [0, Validators.required], remise: [0, Validators.required], tva: [20, Validators.required]
    }));
    this.linesValue.set(this.lines.getRawValue());
  }

  removeLine(i: number): void { this.lines.removeAt(i); this.linesValue.set(this.lines.getRawValue()); }
  onProductChange(i: number): void {
    const line = this.lines.at(i); const pid = line.get('productId')?.value;
    if (pid) {
      const p = this.products().find(x => x.id === pid);
      if (p) line.patchValue({ unitPrice: p.prix, tva: p.tva, remise: 0 });
    }
  }

  calculateLineTotal(i: number): number {
    const l = this.linesValue()[i]; if (!l) return 0;
    const gross = l.quantity * l.unitPrice; const net = gross * (1 - l.remise / 100);
    return net * (1 + l.tva / 100);
  }

  totalHT = computed(() => this.linesValue().reduce((acc, l) => acc + (l.quantity * l.unitPrice), 0));
  totalDiscount = computed(() => this.linesValue().reduce((acc, l) => acc + ((l.quantity * l.unitPrice) * (l.remise / 100)), 0));
  totalTVA = computed(() => this.linesValue().reduce((acc, l) => {
    const gross = l.quantity * l.unitPrice; const net = gross * (1 - l.remise / 100); return acc + (net * (l.tva / 100));
  }, 0));
  totalTTC = computed(() => this.totalHT() - this.totalDiscount() + this.totalTVA());

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    if (this.lines.length === 0) { this.notify.error('Error', 'Add at least one line.'); return; }
    this.saving.set(true);

    const payload = { ...this.form.value } as any;
    if (payload.invoiceDate && payload.invoiceDate.length === 10) payload.invoiceDate += 'T00:00:00';
    if (payload.dueDate && payload.dueDate.length === 10) payload.dueDate += 'T00:00:00';

    const req = this.isEdit ? this.svc.update(this.id!, payload) : this.svc.create(payload);
    req.subscribe({
      next: () => { this.notify.success('Success', `Invoice saved.`); this.router.navigate(['/invoices']); },
      error: () => this.saving.set(false)
    });
  }

  private today(): string { return new Date().toISOString().split('T')[0]; }
  private todayPlusDays(d: number): string { const dt = new Date(); dt.setDate(dt.getDate() + d); return dt.toISOString().split('T')[0]; }
}
