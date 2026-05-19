import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CategoryService } from '../../../core/services/category.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CategoryDTO } from '../../../core/models/category.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, PageHeaderComponent, LoadingSpinnerComponent],
  template: `
    <app-page-header [title]="isEdit ? 'Edit Category' : 'New Category'"
                     [subtitle]="isEdit ? 'Update category.' : 'Create a new product category.'">
      <a routerLink="/categories" class="btn-sip-secondary">
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
              <div class="form-group">
                <label class="form-label">Category Name *</label>
                <input class="sip-input" formControlName="name" placeholder="e.g. Electronics">
                @if (f['name'].invalid && f['name'].touched) {
                  <span class="form-error"><span class="material-icons" style="font-size:13px">error_outline</span> Required</span>
                }
              </div>
              <div class="form-group">
                <label class="form-label">Parent Category</label>
                <select class="sip-select" formControlName="parentId">
                  <option [ngValue]="null">-- None (Top Level) --</option>
                  @for (cat of availableParents(); track cat.id) {
                    <option [value]="cat.id">{{ cat.name }}</option>
                  }
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Description</label>
                <textarea class="sip-textarea" formControlName="description" placeholder="Optional description..."></textarea>
              </div>

              <div class="divider"></div>
              <div style="display:flex;justify-content:flex-end;gap:10px">
                <a routerLink="/categories" class="btn-sip-secondary">Cancel</a>
                <button class="btn-sip-primary" type="submit" [disabled]="saving()">
                  @if (saving()) { <span class="spinner" style="width:16px;height:16px;border-width:2px"></span> }
                  {{ saving() ? 'Saving...' : (isEdit ? 'Update Category' : 'Save Category') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    }
  `
})
export class CategoryFormComponent implements OnInit {
  private svc    = inject(CategoryService);
  private notify = inject(NotificationService);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);
  private fb     = inject(FormBuilder);

  loadingData      = signal(true);
  saving           = signal(false);
  availableParents = signal<CategoryDTO[]>([]);
  isEdit           = false;
  categoryId: number | null = null;

  form = this.fb.group({
    name:        ['', Validators.required],
    description: [''],
    parentId:    [null as number | null]
  });

  get f() { return this.form.controls; }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!id;
    this.categoryId = id ? +id : null;

    this.svc.findAllList().subscribe({
      next: all => {
        // filter out itself to prevent cyclic parenting
        const filtered = this.isEdit ? all.filter(c => c.id !== this.categoryId) : all;
        this.availableParents.set(filtered);

        if (this.isEdit) {
          this.svc.findById(this.categoryId!).subscribe(c => {
            this.form.patchValue({
              name: c.name,
              description: c.description,
              parentId: c.parentId || null
            });
            this.loadingData.set(false);
          });
        } else {
          this.loadingData.set(false);
        }
      },
      error: () => this.loadingData.set(false)
    });
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const req = this.isEdit
      ? this.svc.update(this.categoryId!, this.form.value as any)
      : this.svc.create(this.form.value as any);

    req.subscribe({
      next: () => {
        this.notify.success('Success', `Category ${this.isEdit ? 'updated' : 'created'}.`);
        this.router.navigate(['/categories']);
      },
      error: () => this.saving.set(false)
    });
  }
}
