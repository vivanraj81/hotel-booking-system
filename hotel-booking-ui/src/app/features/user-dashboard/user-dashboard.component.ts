import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  MAT_DATE_FORMATS,
  DateAdapter,
  MAT_DATE_LOCALE
} from '@angular/material/core';
import {
  MAT_MOMENT_DATE_FORMATS,
  MomentDateAdapter
} from '@angular/material-moment-adapter';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import moment, { Moment } from 'moment';
import { Hotel, Availability } from '../../core/models/api.models';
import { HotelService } from '../../core/services/hotel.service';

interface HotelWithState extends Hotel {
  selectedDate?: Moment | null;
  bookedDates: string[];
  availableDates: string[];
  loadingAvailability: boolean;
  booking: boolean;
}

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule,
    MatDatepickerModule, MatFormFieldModule, MatInputModule,
    MatProgressSpinnerModule, MatChipsModule, MatTooltipModule
  ],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS }
  ],
  template: `
    <div class="app-container">
      <header class="header">
        <h1 class="page-title">Available Hotels</h1>
        <p class="page-subtitle">
          Select a hotel and pick an available date in the next 7 days.
        </p>
      </header>

      <div *ngIf="loading()" class="loading-state" data-testid="hotels-loading">
        <mat-spinner diameter="48"></mat-spinner>
        <p>Loading hotels...</p>
      </div>

      <div class="hotels-grid" *ngIf="!loading()">
        <mat-card
          *ngFor="let hotel of hotels()"
          class="hotel-card"
          [attr.data-testid]="'hotel-card-' + hotel.id">
          <div class="hotel-banner">
            <mat-icon class="hotel-icon">apartment</mat-icon>
          </div>
          <mat-card-content class="hotel-content">
            <h2 class="hotel-name" [attr.data-testid]="'hotel-name-' + hotel.id">
              {{ hotel.name }}
            </h2>
            <div class="hotel-price" [attr.data-testid]="'hotel-price-' + hotel.id">
              <span class="currency">&#8377;</span>
              <span class="amount">{{ hotel.price | number: '1.0-0' }}</span>
              <span class="per">/ night</span>
            </div>

            <div class="dates-section" *ngIf="!hotel.loadingAvailability">
              <p class="dates-label">
                <mat-icon class="small-icon">event_available</mat-icon>
                Next 7 days
              </p>
              <mat-chip-set>
                <mat-chip
                  *ngFor="let d of hotel.bookedDates"
                  class="booked-chip"
                  disabled>
                  {{ d | date: 'MMM d' }}
                </mat-chip>
                <span *ngIf="hotel.bookedDates.length === 0" class="all-available">
                  All dates available
                </span>
              </mat-chip-set>
            </div>

            <mat-form-field appearance="outline" class="full-width date-field">
              <mat-label>Select booking date</mat-label>
              <input
                matInput
                [matDatepicker]="picker"
                [matDatepickerFilter]="dateFilter(hotel)"
                [min]="minDate"
                [max]="maxDate"
                [(ngModel)]="hotel.selectedDate">
              <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </mat-form-field>

            <button
              mat-flat-button
              color="primary"
              class="book-btn full-width"
              [disabled]="!hotel.selectedDate || hotel.booking"
              (click)="book(hotel)"
              [attr.data-testid]="'book-button-' + hotel.id">
              <mat-spinner *ngIf="hotel.booking" diameter="18"></mat-spinner>
              <span *ngIf="!hotel.booking">
                <mat-icon>check_circle</mat-icon>&nbsp;Book It
              </span>
            </button>
          </mat-card-content>
        </mat-card>
      </div>

      <div *ngIf="!loading() && hotels().length === 0" class="empty">
        <mat-icon>hotel</mat-icon>
        <p>No hotels available right now.</p>
      </div>
    </div>
  `,
  styles: [`
    .header { margin-bottom: 24px; }
    .hotels-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
    }
    .hotel-card {
      border-radius: 14px;
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .hotel-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 24px rgba(0,0,0,0.12);
    }
    .hotel-banner {
      height: 100px;
      background: linear-gradient(135deg, #3949ab 0%, #5c6bc0 100%);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .hotel-icon { font-size: 56px; height: 56px; width: 56px; color: #fff; opacity: 0.85; }
    .hotel-content { padding: 20px !important; }
    .hotel-name { font-size: 20px; margin: 0 0 8px; color: #1a237e; font-weight: 500; }
    .hotel-price {
      display: flex;
      align-items: baseline;
      gap: 4px;
      margin-bottom: 14px;
      color: #2e7d32;
      font-weight: 500;
    }
    .currency { font-size: 18px; }
    .amount { font-size: 26px; }
    .per { font-size: 13px; color: #5c6b8a; }
    .dates-section { margin-bottom: 16px; }
    .dates-label {
      display: flex;
      align-items: center;
      gap: 4px;
      margin: 0 0 6px;
      font-size: 12px;
      color: #5c6b8a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .small-icon { font-size: 14px; height: 14px; width: 14px; }
    .info-icon {
      font-size: 14px; height: 14px; width: 14px;
      cursor: help; color: #90a4ae; margin-left: 4px;
    }
    .booked-chip {
      background: #ffebee !important;
      color: #c62828 !important;
      font-size: 12px !important;
      text-decoration: line-through;
    }
    .all-available { color: #2e7d32; font-size: 13px; }
    .date-field { margin-top: 8px; }
    .full-width { width: 100%; }
    .book-btn { height: 44px; font-size: 15px; }
    .loading-state {
      text-align: center;
      padding: 80px 0;
    }
    .loading-state p { margin-top: 16px; color: #5c6b8a; }
    .empty {
      text-align: center;
      padding: 80px 0;
      color: #5c6b8a;
    }
    .empty mat-icon { font-size: 64px; height: 64px; width: 64px; opacity: 0.4; }
  `]
})
export class UserDashboardComponent implements OnInit {
  private hotelService = inject(HotelService);
  private snack = inject(MatSnackBar);

  hotels = signal<HotelWithState[]>([]);
  loading = signal<boolean>(true);

  minDate = moment().startOf('day');
  maxDate = moment().add(6, 'days').endOf('day');

  ngOnInit(): void {
    this.loadHotels();
  }

  loadHotels(): void {
    this.loading.set(true);
    this.hotelService.getHotels().subscribe({
      next: (list) => {
        const enriched: HotelWithState[] = list.map((h) => ({
          ...h,
          bookedDates: [],
          availableDates: [],
          loadingAvailability: true,
          booking: false,
          selectedDate: null
        }));
        this.hotels.set(enriched);
        this.loading.set(false);
        enriched.forEach((h) => this.loadAvailability(h));
      },
      error: () => {
        this.loading.set(false);
        this.snack.open('Failed to load hotels. Please try again!!', 'Close', {
          duration: 3000, panelClass: ['error-snack']
        });
      }
    });
  }

  loadAvailability(hotel: HotelWithState): void {
    this.hotelService.getAvailability(hotel.id).subscribe({
      next: (av: Availability) => {
        hotel.bookedDates = av.bookedDates || [];
        hotel.availableDates = av.availableDates || [];
        hotel.loadingAvailability = false;
        this.hotels.update((arr) => [...arr]);
      },
      error: () => {
        hotel.loadingAvailability = false;
      }
    });
  }

  dateFilter(hotel: HotelWithState) {
    return (d: Moment | null): boolean => {
      if (!d) return false;

      const today = moment().startOf('day');
      const maxDate = moment().add(6, 'days').endOf('day');

      const ds = d.format('YYYY-MM-DD');

      return (
        d.isSameOrAfter(today) &&
        d.isSameOrBefore(maxDate) &&
        !hotel.bookedDates.includes(ds)
      );
    };
  }

  book(hotel: HotelWithState): void {
    if (!hotel.selectedDate) return;
    const dateStr = hotel.selectedDate.format('YYYY-MM-DD');
    hotel.booking = true;

    // Re-fetch availability before committing to prevent stale UI
    this.hotelService.getAvailability(hotel.id).subscribe({
      next: (av) => {
        hotel.bookedDates = av.bookedDates || [];
        hotel.availableDates = av.availableDates || [];
        if (hotel.bookedDates.includes(dateStr)) {
          hotel.booking = false;
          hotel.selectedDate = null;
          this.hotels.update((arr) => [...arr]);
          this.snack.open('Something went wrong. Please try again.', 'Close', {
            duration: 3500, panelClass: ['error-snack']
          });
          return;
        }

        this.hotelService.createBooking({ hotelId: hotel.id, date: dateStr }).subscribe({
          next: (res) => {
            hotel.booking = false;
            hotel.selectedDate = null;
            this.snack.open(res.message, 'Close', {
              duration: 4000, panelClass: ['success-snack']
            });
            this.loadAvailability(hotel);
          },
          error: () => {
            hotel.booking = false;
            this.loadAvailability(hotel);
            this.snack.open('Something went wrong. Please try again.', 'Close', {
              duration: 3500, panelClass: ['error-snack']
            });
          }
        });
      },
      error: () => {
        hotel.booking = false;
        this.snack.open('Something went wrong. Please try again.', 'Close', {
          duration: 3500, panelClass: ['error-snack']
        });
      }
    });
  }
}
