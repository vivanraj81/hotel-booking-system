import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { BookingResponse } from '../../core/models/api.models';
import { HotelService } from '../../core/services/hotel.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatTableModule, MatIconModule,
    MatProgressSpinnerModule, MatChipsModule
  ],
  template: `
    <div class="app-container">
      <header class="header">
        <h1 class="page-title">
          <mat-icon>dashboard</mat-icon>&nbsp;Admin Dashboard
        </h1>
        <p class="page-subtitle">All bookings across all hotels.</p>
      </header>

      <div class="stats-row">
        <mat-card class="stat-card stat-blue">
          <div class="stat-label">Total Bookings</div>
          <div class="stat-value" data-testid="stat-total-bookings">{{ bookings().length }}</div>
        </mat-card>
        <mat-card class="stat-card stat-green">
          <div class="stat-label">Total Revenue</div>
          <div class="stat-value" data-testid="stat-total-revenue">
            &#8377;{{ totalRevenue() | number: '1.0-0' }}
          </div>
        </mat-card>
        <mat-card class="stat-card stat-amber">
          <div class="stat-label">Unique Guests</div>
          <div class="stat-value" data-testid="stat-unique-guests">{{ uniqueGuests() }}</div>
        </mat-card>
      </div>

      <mat-card class="table-card" data-testid="bookings-table-card">
        <div *ngIf="loading()" class="loading-state">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Loading bookings...</p>
        </div>

        <div *ngIf="!loading()">
          <table mat-table [dataSource]="bookings()" class="full-width" data-testid="bookings-table">
            <ng-container matColumnDef="hotelName">
              <th mat-header-cell *matHeaderCellDef>Hotel Name</th>
              <td mat-cell *matCellDef="let b">
                <span class="cell-strong">{{ b.hotelName }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="reservedDate">
              <th mat-header-cell *matHeaderCellDef>Reserved Date</th>
              <td mat-cell *matCellDef="let b">
                <mat-icon class="date-icon">event</mat-icon>
                {{ b.reservedDate | date: 'mediumDate' }}
              </td>
            </ng-container>

            <ng-container matColumnDef="username">
              <th mat-header-cell *matHeaderCellDef>Reserved For User</th>
              <td mat-cell *matCellDef="let b">
                <mat-icon class="user-icon">person</mat-icon>
                {{ b.username }}
              </td>
            </ng-container>

            <ng-container matColumnDef="amountPaid">
              <th mat-header-cell *matHeaderCellDef>Amount Paid</th>
              <td mat-cell *matCellDef="let b">
                <span class="amount-cell">&#8377;{{ b.amountPaid | number: '1.0-0' }}</span>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"
                [attr.data-testid]="'booking-row-' + row.id"></tr>
          </table>

          <div *ngIf="bookings().length === 0" class="empty" data-testid="no-bookings">
            <mat-icon>inbox</mat-icon>
            <p>No bookings yet.</p>
          </div>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .header { display: flex; flex-direction: column; margin-bottom: 24px; }
    .page-title { display: flex; align-items: center; }
    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .stat-card {
      padding: 20px 22px !important;
      border-radius: 12px;
      border-left: 4px solid;
    }
    .stat-blue { border-color: #3949ab; }
    .stat-green { border-color: #2e7d32; }
    .stat-amber { border-color: #ff8f00; }
    .stat-label {
      text-transform: uppercase;
      font-size: 12px;
      color: #5c6b8a;
      letter-spacing: 0.6px;
      margin-bottom: 6px;
    }
    .stat-value { font-size: 28px; font-weight: 500; color: #1a237e; }
    .stat-green .stat-value { color: #2e7d32; }
    .stat-amber .stat-value { color: #ef6c00; }
    .table-card { padding: 8px 0 !important; border-radius: 12px; overflow: hidden; }
    .full-width { width: 100%; }
    .cell-strong { font-weight: 500; color: #1a237e; }
    .date-icon, .user-icon {
      font-size: 16px; height: 16px; width: 16px;
      vertical-align: middle; color: #5c6b8a;
    }
    .amount-cell { font-weight: 500; color: #2e7d32; }
    .loading-state { text-align: center; padding: 60px 0; }
    .loading-state p { margin-top: 12px; color: #5c6b8a; }
    .empty { text-align: center; padding: 60px 0; color: #5c6b8a; }
    .empty mat-icon { font-size: 56px; height: 56px; width: 56px; opacity: 0.4; }

    th.mat-mdc-header-cell {
      background: #f4f6fb;
      font-weight: 600;
      color: #1a237e !important;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
    tr.mat-mdc-row:hover { background: #f4f6fb; }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private hotelService = inject(HotelService);

  bookings = signal<BookingResponse[]>([]);
  loading = signal<boolean>(true);
  displayedColumns = ['hotelName', 'reservedDate', 'username', 'amountPaid'];

  totalRevenue = () => this.bookings().reduce((s, b) => s + (b.amountPaid || 0), 0);
  uniqueGuests = () => new Set(this.bookings().map((b) => b.username)).size;

  ngOnInit(): void {
    this.hotelService.getAllBookings().subscribe({
      next: (list) => {
        this.bookings.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
