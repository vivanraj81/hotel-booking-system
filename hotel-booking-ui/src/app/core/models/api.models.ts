export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  role: 'ADMIN' | 'USER';
  username: string;
}

export interface Hotel {
  id: number;
  name: string;
  price: number;
}

export interface Availability {
  hotelId: number;
  hotelName: string;
  availableDates: string[];
  bookedDates: string[];
}

export interface BookingRequest {
  hotelId: number;
  date: string;
}

export interface BookingResponse {
  id: number;
  hotelId: number;
  hotelName: string;
  username: string;
  reservedDate: string;
  amountPaid: number;
  success: boolean;
  message: string;
}
