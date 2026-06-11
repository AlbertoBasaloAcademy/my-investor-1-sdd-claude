import { useCallback, useEffect, useState } from 'react';
import { bookingsApi } from './bookingsApi';
import type { Booking, BookingRequest } from '../../shared/types/booking';

export function useBookings(launchId: string) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(() => {
    setIsLoading(true);
    setError(null);
    bookingsApi
      .getBookingsByLaunch(launchId)
      .then(setBookings)
      .catch((cause: unknown) => {
        setError(cause instanceof Error ? cause : new Error(String(cause)));
      })
      .finally(() => setIsLoading(false));
  }, [launchId]);

  useEffect(() => {
    load();
  }, [load]);

  const create = useCallback(
    async (req: BookingRequest): Promise<void> => {
      try {
        await bookingsApi.createBooking(req);
        load();
      } catch (cause: unknown) {
        throw cause instanceof Error ? cause : new Error(String(cause));
      }
    },
    [load],
  );

  const cancel = useCallback(
    async (id: number): Promise<void> => {
      try {
        await bookingsApi.cancelBooking(id);
        load();
      } catch (cause: unknown) {
        throw cause instanceof Error ? cause : new Error(String(cause));
      }
    },
    [load],
  );

  return { bookings, isLoading, error, create, cancel } as const;
}
