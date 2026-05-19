import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty-state">
      <div class="empty-state-icon material-icons">{{ icon }}</div>
      <div class="empty-state-title">{{ title }}</div>
      <div class="empty-state-text">{{ description }}</div>
      @if (actionLabel) {
        <button class="btn-sip-primary mt-3" (click)="action.emit()">
          <span class="material-icons" style="font-size:18px">add</span>
          {{ actionLabel }}
        </button>
      }
    </div>
  `
})
export class EmptyStateComponent {
  @Input() icon        = 'inbox';
  @Input() title       = 'No data found';
  @Input() description = 'There are no items to display.';
  @Input() actionLabel = '';
  @Output() action = new EventEmitter<void>();
}
