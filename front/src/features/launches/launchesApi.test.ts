import { LaunchesApi } from './launchesApi';
import { httpClient } from '../../shared/api/httpClient';
import type { Launch } from '../../shared/types/launch';

vi.mock('../../shared/api/httpClient', () => ({
  httpClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), del: vi.fn() },
}));

const sample: Launch = {
  id: 'L1',
  rocketId: 'r1',
  rocketName: 'Falcon',
  scheduledAt: '2027-01-01T10:00:00',
  pricePerTicket: 999.99,
  minimumOccupancy: 3,
  status: 'created',
};

const api = new LaunchesApi();

beforeEach(() => vi.clearAllMocks());

test('getAll calls GET /api/launches', async () => {
  vi.mocked(httpClient.get).mockResolvedValue([sample]);
  const result = await api.getAll();
  expect(httpClient.get).toHaveBeenCalledWith('/api/launches');
  expect(result).toEqual([sample]);
});

test('create calls POST /api/launches with body', async () => {
  vi.mocked(httpClient.post).mockResolvedValue(sample);
  const req = { rocketId: 'r1', scheduledAt: '2027-01-01T10:00', pricePerTicket: 999.99, minimumOccupancy: 3 };
  const result = await api.create(req);
  expect(httpClient.post).toHaveBeenCalledWith('/api/launches', req);
  expect(result).toEqual(sample);
});

test('update calls PUT /api/launches/:id with body', async () => {
  vi.mocked(httpClient.put).mockResolvedValue(sample);
  const req = { rocketId: 'r1', scheduledAt: '2027-01-01T10:00', pricePerTicket: 999.99, minimumOccupancy: 3 };
  const result = await api.update('L1', req);
  expect(httpClient.put).toHaveBeenCalledWith('/api/launches/L1', req);
  expect(result).toEqual(sample);
});

test('confirm calls POST /api/launches/:id/confirm', async () => {
  vi.mocked(httpClient.post).mockResolvedValue({ ...sample, status: 'confirmed' });
  await api.confirm('L1');
  expect(httpClient.post).toHaveBeenCalledWith('/api/launches/L1/confirm', {});
});

test('cancel calls POST /api/launches/:id/cancel', async () => {
  vi.mocked(httpClient.post).mockResolvedValue({ ...sample, status: 'cancelled' });
  await api.cancel('L1');
  expect(httpClient.post).toHaveBeenCalledWith('/api/launches/L1/cancel', {});
});
