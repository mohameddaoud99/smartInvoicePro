import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (visible) {
      <div class="sip-dialog-backdrop" (click)="onBackdrop($event)">
        <div class="sip-dialog" style="max-width:420px" role="dialog" aria-modal="true">
          <div class="sip-dialog-header">
            <div style="display:flex;align-items:center;gap:10px">
              <span class="material-icons" [style.color]="dangerMode ? 'var(--color-danger)' : 'var(--color-warning)'">
                {{ dangerMode ? 'delete_forever' : 'help_outline' }}
              </span>
              <span class="sip-dialog-title">{{ title }}</span>
            </div>
          </div>
          <div class="sip-dialog-body">
            <p class="text-secondary fs-13">{{ message }}</p>
          </div>
          <div class="sip-dialog-footer">
            <button class="btn-sip-secondary" (click)="cancel.emit(); visible=false">Cancel</button>
            <button [class]="dangerMode ? 'btn-sip-danger' : 'btn-sip-primary'" (click)="confirm.emit(); visible=false">
              {{ confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class ConfirmDialogComponent {
  @Input() visible      = false;
  @Input() title        = 'Confirm Action';
  @Input() message      = 'Are you sure?';
  @Input() confirmLabel = 'Confirm';
  @Input() dangerMode   = false;
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel  = new EventEmitter<void>();
  @Output() visibleChange = new EventEmitter<boolean>();

  onBackdrop(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('sip-dialog-backdrop')) {
      this.visible = false;
      this.visibleChange.emit(false);
      this.cancel.emit();
    }
  }
}
