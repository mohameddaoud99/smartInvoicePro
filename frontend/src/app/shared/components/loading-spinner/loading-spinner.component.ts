import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-overlay">
      <div class="spinner"></div>
      <span class="text-muted fs-13">{{ message }}</span>
    </div>
  `
})
export class LoadingSpinnerComponent {
  @Input() message = 'Loading...';
}
