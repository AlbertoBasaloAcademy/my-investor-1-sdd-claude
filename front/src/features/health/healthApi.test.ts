import { getHealth } from './healthApi';
import { httpClient } from '../../shared/api/httpClient';
import type { HealthResponse } from '../../shared/types/health';

vi.mock('../../shared/api/httpClient', () => ({
  httpClient: { get: vi.fn() },
}));

const sample: HealthResponse = {
  status: 'UP',
  database: 'UP',
  uptime: { seconds: 3725, since: '2026-05-29T10:00:00Z' },
  timestamp: '2026-05-29T11:02:05Z',
};

test('getHealth requests /api/health and returns the typed payload', async () => {
  vi.mocked(httpClient.get).mockResolvedValue(sample);

  const result = await getHealth();

  expect(httpClient.get).toHaveBeenCalledWith('/api/health');
  expect(result).toEqual(sample);
});

test('getHealth propagates client errors', async () => {
  vi.mocked(httpClient.get).mockRejectedValue(new Error('boom'));

  await expect(getHealth()).rejects.toThrow('boom');
});
