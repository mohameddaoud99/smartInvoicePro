import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CategoryDTO } from '../../../core/models/category.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, PageHeaderComponent, LoadingSpinnerComponent],
  template: `
    <app-page-header [title]="isEdit ? 'Edit Product' : 'New Product'"
                     [subtitle]="isEdit ? 'Update product details.' : 'Add a new product to your catalog.'">
      <a routerLink="/products" class="btn-sip-secondary">
        <span class="material-icons" style="font-size:18px">arrow_back</span> Back
      </a>
    </app-page-header>

    @if (loadingData()) {
      <app-loading-spinner></app-loading-spinner>
    } @else {
      <div class="row justify-content-center">
        <div class="col-12 col-xl-9">
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="row g-4">
              <!-- MAIN DETAILS -->
              <div class="col-12 col-lg-8">
                <div class="sip-card h-100">
                  <h3 class="fs-13 fw-semibold text-secondary text-uppercase mb-3">Basic Details</h3>
                  <div class="row g-3">
                    <div class="col-12 col-md-8">
                      <div class="form-group">
                        <label class="form-label">Product Name *</label>
                        <input class="sip-input" formControlName="libelle" placeholder="e.g. MacBook Pro M3">
                        @if (f['libelle'].invalid && f['libelle'].touched) {
                          <span class="form-error"><span class="material-icons" style="font-size:13px">error_outline</span> Required</span>
                        }
                      </div>
                    </div>
                    <div class="col-12 col-md-4">
                      <div class="form-group">
                        <label class="form-label">Product Code *</label>
                        <input class="sip-input" formControlName="code" placeholder="PRD-001">
                        @if (f['code'].invalid && f['code'].touched) {
                          <span class="form-error"><span class="material-icons" style="font-size:13px">error_outline</span> Required</span>
                        }
                      </div>
                    </div>
                    <div class="col-12 col-md-6">
                      <div class="form-group">
                        <label class="form-label">Category</label>
                        <select class="sip-select" formControlName="categoryId">
                          <option [ngValue]="null">-- Select Category --</option>
                          @for (cat of categories(); track cat.id) {
                            <option [value]="cat.id">{{ cat.name }}</option>
                          }
                        </select>
                      </div>
                    </div>
                    <div class="col-12 col-md-3">
                      <div class="form-group">
                        <label class="form-label">Price (HT) *</label>
                        <input class="sip-input" type="number" step="0.01" formControlName="prix">
                        @if (f['prix'].invalid && f['prix'].touched) {
                          <span class="form-error"><span class="material-icons" style="font-size:13px">error_outline</span> Required</span>
                        }
                      </div>
                    </div>
                    <div class="col-12 col-md-3">
                      <div class="form-group">
                        <label class="form-label">TVA (%) *</label>
                        <input class="sip-input" type="number" step="0.1" formControlName="tva">
                        @if (f['tva'].invalid && f['tva'].touched) {
                          <span class="form-error"><span class="material-icons" style="font-size:13px">error_outline</span> Required</span>
                        }
                      </div>
                    </div>
                    <div class="col-12">
                      <div class="form-group">
                        <label class="form-label">Description</label>
                        <textarea class="sip-textarea" formControlName="description" placeholder="Product details..."></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- PHOTOS -->
              <div class="col-12 col-lg-4">
                <div class="sip-card h-100">
                  <h3 class="fs-13 fw-semibold text-secondary text-uppercase mb-3">Media</h3>
                  
                  <div class="form-group">
                    <label class="form-label">Main Photo (Photo 1)</label>
                    @if (existingPhotos[0]) {
                      <div class="mb-2">
                        <img [src]="getImageUrl(existingPhotos[0])" style="width:100%;height:140px;object-fit:cover;border-radius:6px;border:1px solid var(--border-color)">
                      </div>
                    }
                    <input class="sip-input p-1" type="file" accept="image/*" (change)="onFileChange($event, 1)">
                  </div>

                  <div class="form-group">
                    <label class="form-label">Photo 2</label>
                    @if (existingPhotos[1]) {
                      <div class="mb-2">
                        <img [src]="getImageUrl(existingPhotos[1])" style="width:100%;height:100px;object-fit:cover;border-radius:6px;border:1px solid var(--border-color)">
                      </div>
                    }
                    <input class="sip-input p-1" type="file" accept="image/*" (change)="onFileChange($event, 2)">
                  </div>

                  <div class="form-group">
                    <label class="form-label">Photo 3</label>
                    @if (existingPhotos[2]) {
                      <div class="mb-2">
                        <img [src]="getImageUrl(existingPhotos[2])" style="width:100%;height:100px;object-fit:cover;border-radius:6px;border:1px solid var(--border-color)">
                      </div>
                    }
                    <input class="sip-input p-1" type="file" accept="image/*" (change)="onFileChange($event, 3)">
                  </div>
                </div>
              </div>

              <div class="col-12">
                <div style="display:flex;justify-content:flex-end;gap:10px;padding-top:16px;border-top:1px solid var(--border-color)">
                  <a routerLink="/products" class="btn-sip-secondary">Cancel</a>
                  <button class="btn-sip-primary" type="submit" [disabled]="saving()">
                    @if (saving()) { <span class="spinner" style="width:16px;height:16px;border-width:2px"></span> }
                    {{ saving() ? 'Saving...' : (isEdit ? 'Update Product' : 'Save Product') }}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    }
  `
})
export class ProductFormComponent implements OnInit {
  private svc       = inject(ProductService);
  private catSvc    = inject(CategoryService);
  private notify    = inject(NotificationService);
  private router    = inject(Router);
  private route     = inject(ActivatedRoute);
  private fb        = inject(FormBuilder);

  loadingData = signal(true);
  saving      = signal(false);
  categories  = signal<CategoryDTO[]>([]);
  isEdit      = false;
  productId: number | null = null;
  
  existingPhotos: string[] = ['', '', ''];
  files: { [key: number]: File } = {};

  form = this.fb.group({
    libelle:     ['', Validators.required],
    code:        ['', Validators.required],
    description: [''],
    prix:        [0 as number | null, [Validators.required, Validators.min(0)]],
    tva:         [20 as number | null, [Validators.required, Validators.min(0)]],
    categoryId:  [null as number | null]
  });

  get f() { return this.form.controls; }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!id;
    this.productId = id ? +id : null;

    this.catSvc.findAllList().subscribe({
      next: cats => {
        this.categories.set(cats);
        if (this.isEdit) {
          this.svc.findById(this.productId!).subscribe(p => {
            this.form.patchValue({
              libelle: p.libelle,
              code: p.code,
              description: p.description,
              prix: p.prix,
              tva: p.tva,
              categoryId: p.categoryId || null
            });
            if (p.photo1) this.existingPhotos[0] = p.photo1;
            if (p.photo2) this.existingPhotos[1] = p.photo2;
            if (p.photo3) this.existingPhotos[2] = p.photo3;
            this.loadingData.set(false);
          });
        } else {
          this.loadingData.set(false);
        }
      },
      error: () => this.loadingData.set(false)
    });
  }

  getImageUrl(filename: string): string { return `${environment.uploadsUrl}/${filename}`; }

  onFileChange(event: any, index: number): void {
    if (event.target.files && event.target.files.length > 0) {
      this.files[index] = event.target.files[0];
    }
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    
    const val = this.form.value;
    const payload: any = {
      libelle: val.libelle,
      code: val.code,
      prix: val.prix,
      tva: val.tva
    };
    if (val.description) payload.description = val.description;
    if (val.categoryId)  payload.categoryId = val.categoryId;
    
    if (this.files[1]) payload.photo1 = this.files[1];
    if (this.files[2]) payload.photo2 = this.files[2];
    if (this.files[3]) payload.photo3 = this.files[3];

    const req = this.isEdit
      ? this.svc.update(this.productId!, payload)
      : this.svc.create(payload);

    req.subscribe({
      next: () => {
        this.notify.success('Success', `Product ${this.isEdit ? 'updated' : 'created'}.`);
        this.router.navigate(['/products']);
      },
      error: () => this.saving.set(false)
    });
  }
}
