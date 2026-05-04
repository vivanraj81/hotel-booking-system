import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="login-wrapper">
      <div class="login-card-container">
        <mat-card class="login-card" data-testid="login-card">
          <div class="brand-area">
            <mat-icon class="brand-icon">hotel</mat-icon>
            <h1 class="brand-title">Hotel Booking</h1>
            <p class="brand-subtitle">Sign in to book your stay</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()" class="login-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Username</mat-label>
              <input
                matInput
                formControlName="username"
                autocomplete="username"
                data-testid="login-username-input">
              <mat-icon matPrefix>person</mat-icon>
              <mat-error *ngIf="form.controls.username.hasError('required')">
                Username is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input
                matInput
                [type]="hide() ? 'password' : 'text'"
                formControlName="password"
                autocomplete="current-password"
                data-testid="login-password-input">
              <mat-icon matPrefix>lock</mat-icon>
              <button
                mat-icon-button
                matSuffix
                type="button"
                (click)="hide.set(!hide())"
                [attr.aria-label]="'Toggle password visibility'">
                <mat-icon>{{ hide() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="form.controls.password.hasError('required')">
                Password is required
              </mat-error>
            </mat-form-field>

            <button
              mat-flat-button
              color="primary"
              class="login-btn full-width"
              type="submit"
              [disabled]="form.invalid || loading()"
              data-testid="login-submit-button">
              <mat-spinner *ngIf="loading()" diameter="20"></mat-spinner>
              <span *ngIf="!loading()">Sign In</span>
            </button>
          </form>

          <div class="hint" data-testid="login-hint">
            <strong>Demo accounts:</strong>
            <div class="hint-row">admin / admin123 &nbsp;<span class="badge admin">ADMIN</span></div>
            <div class="hint-row">user / user123 &nbsp;<span class="badge user">USER</span></div>
          </div>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1a237e 0%, #3949ab 50%, #5c6bc0 100%);
      padding: 20px;
    }
    .login-card-container { width: 100%; max-width: 420px; }
    .login-card { padding: 32px 28px 24px; border-radius: 12px; }
    .brand-area { text-align: center; margin-bottom: 24px; }
    .brand-icon { font-size: 48px; height: 48px; width: 48px; color: #3949ab; }
    .brand-title { margin: 8px 0 4px; font-size: 26px; font-weight: 500; color: #1a237e; }
    .brand-subtitle { color: #5c6b8a; margin: 0; font-size: 14px; }
    .login-form { display: flex; flex-direction: column; gap: 4px; }
    .full-width { width: 100%; }
    .login-btn { height: 44px; font-size: 15px; margin-top: 8px; }
    .hint {
      margin-top: 22px;
      padding: 14px 16px;
      background: #f4f6fb;
      border-radius: 8px;
      font-size: 13px;
      color: #455a64;
    }
    .hint-row { display: flex; align-items: center; margin-top: 4px; font-family: monospace; }
    .badge {
      display: inline-block;
      padding: 1px 8px;
      border-radius: 10px;
      font-size: 10px;
      letter-spacing: 0.5px;
      font-family: 'Roboto', sans-serif;
    }
    .badge.admin { background: #ffe0b2; color: #e65100; }
    .badge.user { background: #c8e6c9; color: #2e7d32; }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  hide = signal(true);
  loading = signal(false);

  form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.auth.login(this.form.getRawValue()).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.snack.open(`Welcome, ${res.username}!`, 'Close', {
          duration: 2500,
          panelClass: ['success-snack']
        });
        if (res.role === 'ADMIN') this.router.navigate(['/admin']);
        else this.router.navigate(['/hotels']);
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err?.error?.message || 'Login failed. Please try again.';
        this.snack.open(msg, 'Close', { duration: 3500, panelClass: ['error-snack'] });
      }
    });
  }
}
