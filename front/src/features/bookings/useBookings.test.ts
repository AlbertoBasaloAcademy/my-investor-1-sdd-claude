import { renderHook, act, waitFor } from '@testing-library/react';
import { useBookings } from './useBookings';
import { bookingsApi } from './bookingsApi';
import type { Booking, BookingRequest } from '../../shared/types/booking';

vi.mock('./bookingsApi', () => ({
  bookingsApi: {
    getBookingsByLaunch: vi.fn(),
    createBooking: vi.fn(),
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

const req: BookingRequest = {
  launchId: 'L1',
  passengerName: 'Alice',
  passengerEmail: 'alice@example.com',
  passengerPhone: '555-0100',
};

beforeEach(() => vi.clearAllMocks());

test('loads bookings on mount', async () => {
  vi.mocked(bookingsApi.getBookingsByLaunch).mockResolvedValue([booking1]);

  const { result } = renderHook(() => useBookings('L1'));

  expect(result.current.isLoading).toBe(true);
  await waitFor(() => expect(result.current.isLoading).toBe(false));
  expect(result.current.bookings).toEqual([booking1]);
  expect(result.current.error).toBeNull();
});

test('exposes error when load fails', async () => {
  vi.mocked(bookingsApi.getBookingsByLaunch).mockRejectedValue(new Error('network'));

  const { result } = renderHook(() => useBookings('L1'));

  await waitFor(() => expect(result.current.isLoading).toBe(false));
  expect(result.current.error).toBeInstanceOf(Error);
  expect(result.current.bookings).toEqual([]);
});

test('create success refreshes the list', async () => {
  const created: Booking = { ...booking1, id: 2 };
  vi.mocked(bookingsApi.getBookingsByLaunch)
    .mockResolvedValueOnce([booking1])
    .mockResolvedValueOnce([booking1, created]);
  vi.mocked(bookingsApi.createBooking).mockResolvedValue(created);

  const { result } = renderHook(() => useBookings('L1'));
  await waitFor(() => expect(result.current.isLoading).toBe(false));

  await act(async () => {
    await result.current.create(req);
  });

  await waitFor(() => expect(result.current.bookings).toEqual([booking1, created]));
});

test('create throws on duplicate (409)', async () => {
  vi.mocked(bookingsApi.getBookingsByLaunch).mockResolvedValue([booking1]);
  vi.mocked(bookingsApi.createBooking).mockRejectedValue(new Error('Booking already exists'));

  const { result } = renderHook(() => useBookings('L1'));
  await waitFor(() => expect(result.current.isLoading).toBe(false));

  await expect(
    act(async () => {
      await result.current.create(req);
    }),
  ).rejects.toThrow('Booking already exists');
});

test('cancel success refreshes the list', async () => {
  const cancelled: Booking = { ...booking1, status: 'CANCELLED' };
  vi.mocked(bookingsApi.getBookingsByLaunch)
    .mockResolvedValueOnce([booking1])
    .mockResolvedValueOnce([cancelled]);
  vi.mocked(bookingsApi.cancelBooking).mockResolvedValue(cancelled);

  const { result } = renderHook(() => useBookings('L1'));
  await waitFor(() => expect(result.current.isLoading).toBe(false));

  await act(async () => {
    await result.current.cancel(1);
  });

  await waitFor(() => expect(result.current.bookings[0].status).toBe('CANCELLED'));
});

test('cancel throws on conflict (409)', async () => {
  vi.mocked(bookingsApi.getBookingsByLaunch).mockResolvedValue([booking1]);
  vi.mocked(bookingsApi.cancelBooking).mockRejectedValue(new Error('Cannot cancel booking'));

  const { result } = renderHook(() => useBookings('L1'));
  await waitFor(() => expect(result.current.isLoading).toBe(false));

  await expect(
    act(async () => {
      await result.current.cancel(1);
    }),
  ).rejects.toThrow('Cannot cancel booking');
});
