import { renderHook, act, waitFor } from '@testing-library/react';
import { useRockets } from './useRockets';
import { rocketsApi } from './rocketsApi';
import type { Rocket } from '../../shared/types/rocket';

vi.mock('./rocketsApi', () => ({
  rocketsApi: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    decommission: vi.fn(),
  },
}));

const falcon: Rocket = { id: '1', name: 'Falcon', capacity: 5, range: 'Moon' };
const titan: Rocket = { id: '2', name: 'Titan', capacity: 9, range: 'Mars' };

beforeEach(() => vi.clearAllMocks());

test('loads rockets on mount', async () => {
  vi.mocked(rocketsApi.getAll).mockResolvedValue([falcon]);

  const { result } = renderHook(() => useRockets());

  expect(result.current.isLoading).toBe(true);
  await waitFor(() => expect(result.current.isLoading).toBe(false));
  expect(result.current.rockets).toEqual([falcon]);
  expect(result.current.error).toBeNull();
});

test('exposes error when load fails', async () => {
  vi.mocked(rocketsApi.getAll).mockRejectedValue(new Error('network'));

  const { result } = renderHook(() => useRockets());

  await waitFor(() => expect(result.current.isLoading).toBe(false));
  expect(result.current.error).toBeInstanceOf(Error);
  expect(result.current.rockets).toEqual([]);
});

test('create appends new rocket to list', async () => {
  vi.mocked(rocketsApi.getAll).mockResolvedValue([falcon]);
  vi.mocked(rocketsApi.create).mockResolvedValue(titan);

  const { result } = renderHook(() => useRockets());
  await waitFor(() => expect(result.current.isLoading).toBe(false));

  await act(async () => {
    await result.current.create({ name: 'Titan', capacity: 9, range: 'Mars' });
  });

  expect(result.current.rockets).toEqual([falcon, titan]);
});

test('update replaces rocket in list', async () => {
  const updated = { ...falcon, name: 'Falcon-9', capacity: 7 };
  vi.mocked(rocketsApi.getAll).mockResolvedValue([falcon]);
  vi.mocked(rocketsApi.update).mockResolvedValue(updated);

  const { result } = renderHook(() => useRockets());
  await waitFor(() => expect(result.current.isLoading).toBe(false));

  await act(async () => {
    await result.current.update('1', { name: 'Falcon-9', capacity: 7, range: 'Moon' });
  });

  expect(result.current.rockets).toEqual([updated]);
});

test('decommission removes rocket from list', async () => {
  vi.mocked(rocketsApi.getAll).mockResolvedValue([falcon, titan]);
  vi.mocked(rocketsApi.decommission).mockResolvedValue(undefined);

  const { result } = renderHook(() => useRockets());
  await waitFor(() => expect(result.current.isLoading).toBe(false));

  await act(async () => {
    await result.current.decommission('1');
  });

  expect(result.current.rockets).toEqual([titan]);
});
