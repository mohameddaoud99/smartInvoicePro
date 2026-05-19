import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge-status badge-{{ status | lowercase }}">
      {{ labelMap[status] || status }}
    </span>
  `
})
export class StatusBadgeComponent {
  @Input() status = '';

  labelMap: Record<string, string> = {
    DRAFT:     'Draft',
    SENT:      'Sent',
    ACCEPTED:  'Accepted',
    REJECTED:  'Rejected',
    CONVERTED: 'Converted',
    CONFIRMED: 'Confirmed',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
    PAID:      'Paid',
    OVERDUE:   'Overdue'
  };
}
