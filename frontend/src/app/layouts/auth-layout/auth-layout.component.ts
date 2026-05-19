import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NotificationComponent } from '../../shared/components/notification/notification.component';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterModule, NotificationComponent],
  template: `
    <app-notification></app-notification>
    <router-outlet></router-outlet>
  `
})
export class AuthLayoutComponent {}
