import { httpClient } from '../../shared/api/httpClient';
import type { Booking, BookingRequest } from '../../shared/types/booking';

export class BookingsApi {
  async createBooking(req: BookingRequest): Promise<Booking> {
    console.log('[BookingsApi] creating booking');
    return httpClient.post<Booking>('/api/bookings', req);
  }

  async cancelBooking(id: number): Promise<Booking> {
    console.log('[BookingsApi] cancelling booking', id);
    return httpClient.post<Booking>(`/api/bookings/${id}/cancel`, {});
  }

  async getBookingsByLaunch(launchId: string): Promise<Booking[]> {
    console.log('[BookingsApi] fetching bookings for launch', launchId);
    return httpClient.get<Booking[]>(`/api/bookings?launchId=${launchId}`);
  }

  async getMyBookings(email: string): Promise<Booking[]> {
    console.log('[BookingsApi] fetching bookings for', email);
    return httpClient.get<Booking[]>(`/api/bookings?email=${encodeURIComponent(email)}`);
  }
}

export const bookingsApi = new BookingsApi();
