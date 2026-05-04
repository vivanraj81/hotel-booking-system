import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatToolbarModule, MatButtonModule, MatIconModule],
  template: `
    <mat-toolbar color="primary" class="app-toolbar" *ngIf="auth.isLoggedIn()">
      <mat-icon>hotel</mat-icon>
      <span class="brand">&nbsp;Hotel Booking</span>
      <span class="spacer"></span>
      <button mat-button (click)="goToHotels()" data-testid="nav-hotels">
        <mat-icon>apartment</mat-icon>&nbsp;Hotels
      </button>
      <button
        *ngIf="auth.getRole() === 'ADMIN'"
        mat-button
        (click)="goToAdmin()"
        data-testid="nav-admin">
        <mat-icon>dashboard</mat-icon>&nbsp;Admin
      </button>
      <span class="user-info">
        <mat-icon>person</mat-icon>&nbsp;{{ auth.getUsername() }}
        <span class="role-chip">{{ auth.getRole() }}</span>
      </span>
      <button mat-button (click)="logout()" data-testid="logout-button">
        <mat-icon>logout</mat-icon>&nbsp;Logout
      </button>
    </mat-toolbar>
    <router-outlet></router-outlet>
  `,
  styles: [`
    .app-toolbar { box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .brand { font-weight: 500; font-size: 18px; }
    .spacer { flex: 1 1 auto; }
    .user-info {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin: 0 12px;
      font-size: 14px;
    }
    .role-chip {
      background: rgba(255,255,255,0.2);
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 11px;
      letter-spacing: 0.5px;
      margin-left: 4px;
    }
  `]
})
export class AppComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  goToHotels() { this.router.navigate(['/hotels']); }
  goToAdmin() { this.router.navigate(['/admin']); }
  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
