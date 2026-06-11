import { BookingsApi } from './bookingsApi';
import { httpClient } from '../../shared/api/httpClient';
import type { Booking } from '../../shared/types/booking';

vi.mock('../../shared/api/httpClient', () => ({
  httpClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), del: vi.fn() },
}));

const sample: Booking = {
  id: 1,
  launchId: 'L1',
  passengerName: 'Alice',
  passengerEmail: 'alice@example.com',
  passengerPhone: '555-0100',
  status: 'CREATED',
};

const api = new BookingsApi();

beforeEach(() => vi.clearAllMocks());

test('createBooking calls POST /api/bookings with body', async () => {
  vi.mocked(httpClient.post).mockResolvedValue(sample);
  const req = { launchId: 'L1', passengerName: 'Alice', passengerEmail: 'alice@example.com', passengerPhone: '555-0100' };
  const result = await api.createBooking(req);
  expect(httpClient.post).toHaveBeenCalledWith('/api/bookings', req);
  expect(result).toEqual(sample);
});

test('cancelBooking calls POST /api/bookings/:id/cancel', async () => {
  vi.mocked(httpClient.post).mockResolvedValue({ ...sample, status: 'CANCELLED' });
  await api.cancelBooking(1);
  expect(httpClient.post).toHaveBeenCalledWith('/api/bookings/1/cancel', {});
});

test('getBookingsByLaunch calls GET /api/bookings?launchId=…', async () => {
  vi.mocked(httpClient.get).mockResolvedValue([sample]);
  const result = await api.getBookingsByLaunch('L1');
  expect(httpClient.get).toHaveBeenCalledWith('/api/bookings?launchId=L1');
  expect(result).toEqual([sample]);
});

test('getMyBookings calls GET /api/bookings?email=… with encoded email', async () => {
  vi.mocked(httpClient.get).mockResolvedValue([sample]);
  const result = await api.getMyBookings('alice@example.com');
  expect(httpClient.get).toHaveBeenCalledWith('/api/bookings?email=alice%40example.com');
  expect(result).toEqual([sample]);
});
