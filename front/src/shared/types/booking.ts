export type BookingStatus = 'CREATED' | 'CANCELLED';

export interface Booking {
  id: number;
  launchId: string;
  passengerName: string;
  passengerEmail: string;
  passengerPhone: string;
  status: BookingStatus;
}

export interface BookingRequest {
  launchId: string;
  passengerName: string;
  passengerEmail: string;
  passengerPhone: string;
}
