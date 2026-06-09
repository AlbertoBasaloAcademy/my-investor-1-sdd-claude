import { RocketsApi } from './rocketsApi';
import { httpClient } from '../../shared/api/httpClient';
import type { Rocket } from '../../shared/types/rocket';

vi.mock('../../shared/api/httpClient', () => ({
  httpClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), del: vi.fn() },
}));

const sample: Rocket = { id: '1', name: 'Falcon', capacity: 5, range: 'Moon' };
const api = new RocketsApi();

beforeEach(() => vi.clearAllMocks());

test('getAll calls GET /api/rockets', async () => {
  vi.mocked(httpClient.get).mockResolvedValue([sample]);
  const result = await api.getAll();
  expect(httpClient.get).toHaveBeenCalledWith('/api/rockets');
  expect(result).toEqual([sample]);
});

test('create calls POST /api/rockets with body', async () => {
  vi.mocked(httpClient.post).mockResolvedValue(sample);
  const result = await api.create({ name: 'Falcon', capacity: 5, range: 'Moon' });
  expect(httpClient.post).toHaveBeenCalledWith('/api/rockets', { name: 'Falcon', capacity: 5, range: 'Moon' });
  expect(result).toEqual(sample);
});

test('update calls PUT /api/rockets/:id with body', async () => {
  vi.mocked(httpClient.put).mockResolvedValue(sample);
  const result = await api.update('1', { name: 'Falcon', capacity: 5, range: 'Moon' });
  expect(httpClient.put).toHaveBeenCalledWith('/api/rockets/1', { name: 'Falcon', capacity: 5, range: 'Moon' });
  expect(result).toEqual(sample);
});

test('decommission calls DELETE /api/rockets/:id', async () => {
  vi.mocked(httpClient.del).mockResolvedValue(undefined);
  await api.decommission('1');
  expect(httpClient.del).toHaveBeenCalledWith('/api/rockets/1');
});

test('getAll propagates errors', async () => {
  vi.mocked(httpClient.get).mockRejectedValue(new Error('network'));
  await expect(api.getAll()).rejects.toThrow('network');
});
