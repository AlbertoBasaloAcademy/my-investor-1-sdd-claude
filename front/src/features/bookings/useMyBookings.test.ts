import { renderHook, act, waitFor } from '@testing-library/react';
import { useMyBookings } from './useMyBookings';
import { bookingsApi } from './bookingsApi';
import type { Booking } from '../../shared/types/booking';

vi.mock('./bookingsApi', () => ({
  bookingsApi: {
    getMyBookings: vi.fn(),
    cancelBooking: vi.fn(),
  },
}));

const booking1: Booking = {
  id: 1,
  launchId: 'L1',
  passengerName: 'Alice',
  passengerEmail: 'alice@example.com',
  passengerPhone: '555-0100',
  status: 'CREATED',
};

beforeEach(() => vi.clearAllMocks());

test('loads bookings on mount', async () => {
  vi.mocked(bookingsApi.getMyBookings).mockResolvedValue([booking1]);

  const { result } = renderHook(() => useMyBookings('alice@example.com'));

  expect(result.current.isLoading).toBe(true);
  await waitFor(() => expect(result.current.isLoading).toBe(false));
  expect(result.current.bookings).toEqual([booking1]);
  expect(result.current.error).toBeNull();
});

test('exposes error when load fails', async () => {
  vi.mocked(bookingsApi.getMyBookings).mockRejectedValue(new Error('network'));

  const { result } = renderHook(() => useMyBookings('alice@example.com'));

  await waitFor(() => expect(result.current.isLoading).toBe(false));
  expect(result.current.error).toBeInstanceOf(Error);
  expect(result.current.bookings).toEqual([]);
});

test('cancel success refreshes the list', async () => {
  const cancelled: Booking = { ...booking1, status: 'CANCELLED' };
  vi.mocked(bookingsApi.getMyBookings)
    .mockResolvedValueOnce([booking1])
    .mockResolvedValueOnce([cancelled]);
  vi.mocked(bookingsApi.cancelBooking).mockResolvedValue(cancelled);

  const { result } = renderHook(() => useMyBookings('alice@example.com'));
  await waitFor(() => expect(result.current.isLoading).toBe(false));

  await act(async () => {
    await result.current.cancel(1);
  });

  await waitFor(() => expect(result.current.bookings[0].status).toBe('CANCELLED'));
});
