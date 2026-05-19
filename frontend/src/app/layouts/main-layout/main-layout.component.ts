import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { NotificationComponent } from '../../shared/components/notification/notification.component';

interface NavItem {
  label: string;
  icon:  string;
  route: string;
  adminOnly?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, RouterLinkActive, NotificationComponent],
  template: `
    <app-notification></app-notification>

    <!-- SIDEBAR -->
    <aside class="app-sidebar" [class.open]="sidebarOpen()">
      <a class="sidebar-logo" routerLink="/dashboard">
        <div class="sidebar-logo-icon">
          <span class="material-icons">receipt_long</span>
        </div>
        <span class="sidebar-logo-text">Smart<span>Invoice</span></span>
      </a>

      <nav class="sidebar-nav">
        @for (section of navSections; track section.title) {
          <div class="nav-section-title">{{ section.title }}</div>
          @for (item of section.items; track item.route) {
            @if (!item.adminOnly || auth.isAdmin()) {
              <a class="nav-item"
                 [routerLink]="item.route"
                 routerLinkActive="active"
                 (click)="sidebarOpen.set(false)">
                <span class="nav-icon material-icons">{{ item.icon }}</span>
                {{ item.label }}
              </a>
            }
          }
        }
      </nav>

      <div class="sidebar-footer">
        <div class="user-menu" (click)="auth.logout()">
          <div class="user-avatar">
            {{ initials() }}
          </div>
          <div style="flex:1;min-width:0">
            <div class="user-name text-truncate">{{ fullName() }}</div>
            <div class="user-role">{{ firstRole() }}</div>
          </div>
          <span class="material-icons" style="color:var(--text-muted);font-size:18px">logout</span>
        </div>
      </div>
    </aside>

    <!-- TOPBAR -->
    <header class="app-topbar">
      <button class="btn-icon d-md-none" (click)="toggleSidebar()">
        <span class="material-icons">menu</span>
      </button>
      <div class="topbar-title">
        <span style="color:var(--text-muted);font-size:12px">SmartInvoicePro</span>
      </div>
      <div class="topbar-actions">
        <button class="btn-icon" (click)="themeService.toggleTheme()" style="border-radius: 50%;" [title]="themeService.currentTheme() === 'light' ? 'Switch to dark mode' : 'Switch to light mode'">
          <span class="material-icons">{{ themeService.currentTheme() === 'light' ? 'dark_mode' : 'light_mode' }}</span>
        </button>
        <div style="display:flex;align-items:center;gap:8px;margin-left:8px">
          <div class="user-avatar" style="width:32px;height:32px;font-size:12px">{{ initials() }}</div>
          <span class="fs-13 fw-semibold">{{ fullName() }}</span>
        </div>
      </div>
    </header>

    <!-- CONTENT -->
    <main class="app-content fade-in">
      <router-outlet></router-outlet>
    </main>

    <!-- BACKDROP -->
    @if (sidebarOpen()) {
      <div class="sidebar-backdrop" (click)="sidebarOpen.set(false)"
           style="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:99;display:none"
           [style.display]="'block'">
      </div>
    }
  `
})
export class MainLayoutComponent {
  auth = inject(AuthService);
  themeService = inject(ThemeService);
  sidebarOpen = signal(false);

  navSections: NavSection[] = [
    {
      title: 'Overview',
      items: [
        { label: 'Dashboard',  icon: 'dashboard',     route: '/dashboard' }
      ]
    },
    {
      title: 'Sales',
      items: [
        { label: 'Quotations', icon: 'request_quote',  route: '/quotations' },
        { label: 'Orders',     icon: 'shopping_cart',  route: '/orders' },
        { label: 'Invoices',   icon: 'receipt',        route: '/invoices' }
      ]
    },
    {
      title: 'Catalog',
      items: [
        { label: 'Products',   icon: 'inventory_2',    route: '/products' },
        { label: 'Categories', icon: 'category',       route: '/categories' },
        { label: 'Customers',  icon: 'people',         route: '/customers' }
      ]
    },
    {
      title: 'Administration',
      items: [
        { label: 'Users',      icon: 'manage_accounts', route: '/users',  adminOnly: true },
        { label: 'Roles',      icon: 'shield',           route: '/roles',  adminOnly: true }
      ]
    }
  ];

  fullName() {
    const u = this.auth.currentUser();
    return u ? `${u.firstName} ${u.lastName}` : '';
  }

  initials() {
    const u = this.auth.currentUser();
    return u ? `${u.firstName[0]}${u.lastName[0]}`.toUpperCase() : '?';
  }

  firstRole() {
    const u = this.auth.currentUser();
    return u?.roles?.[0]?.replace('ROLE_', '') ?? '';
  }

  toggleSidebar() {
    this.sidebarOpen.set(!this.sidebarOpen());
  }
}
