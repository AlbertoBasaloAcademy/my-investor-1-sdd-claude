import { useCallback, useEffect, useState } from 'react';
import { bookingsApi } from './bookingsApi';
import type { Booking } from '../../shared/types/booking';

export function useMyBookings(email: string) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(() => {
    setIsLoading(true);
    setError(null);
    bookingsApi
      .getMyBookings(email)
      .then(setBookings)
      .catch((cause: unknown) => {
        setError(cause instanceof Error ? cause : new Error(String(cause)));
      })
      .finally(() => setIsLoading(false));
  }, [email]);

  useEffect(() => {
    load();
  }, [load]);

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

  return { bookings, isLoading, error, cancel } as const;
}
