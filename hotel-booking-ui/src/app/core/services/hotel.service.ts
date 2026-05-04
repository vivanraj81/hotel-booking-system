import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Availability,
  BookingRequest,
  BookingResponse,
  Hotel
} from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class HotelService {
  private http = inject(HttpClient);
  private base = environment.bookingApiUrl;

  getHotels(): Observable<Hotel[]> {
    return this.http.get<Hotel[]>(`${this.base}/hotels`);
  }

  getAvailability(hotelId: number): Observable<Availability> {
    return this.http.get<Availability>(`${this.base}/hotels/${hotelId}/availability`);
  }

  createBooking(req: BookingRequest): Observable<BookingResponse> {
    return this.http.post<BookingResponse>(`${this.base}/bookings`, req);
  }

  getAllBookings(): Observable<BookingResponse[]> {
    return this.http.get<BookingResponse[]>(`${this.base}/admin/bookings`);
  }
}
