import { renderHook, waitFor } from '@testing-library/react';
import { useHealth } from './useHealth';
import { getHealth } from './healthApi';
import type { HealthResponse } from '../../shared/types/health';

vi.mock('./healthApi', () => ({ getHealth: vi.fn() }));

const healthy: HealthResponse = {
  status: 'UP',
  database: 'UP',
  uptime: { seconds: 60, since: '2026-05-29T10:00:00Z' },
  timestamp: '2026-05-29T11:02:05Z',
};

beforeEach(() => {
  vi.mocked(getHealth).mockReset();
});

test('exposes data when the request resolves UP', async () => {
  vi.mocked(getHealth).mockResolvedValue(healthy);

  const { result } = renderHook(() => useHealth());

  expect(result.current.isLoading).toBe(true);
  await waitFor(() => expect(result.current.isLoading).toBe(false));
  expect(result.current.data).toEqual(healthy);
  expect(result.current.error).toBeNull();
});

test('exposes an error when the request rejects', async () => {
  vi.mocked(getHealth).mockRejectedValue(new Error('network down'));

  const { result } = renderHook(() => useHealth());

  await waitFor(() => expect(result.current.isLoading).toBe(false));
  expect(result.current.data).toBeNull();
  expect(result.current.error).toBeInstanceOf(Error);
});

test('treats a DOWN status as an unhealthy error state', async () => {
  vi.mocked(getHealth).mockResolvedValue({ ...healthy, status: 'DOWN', database: 'DOWN' });

  const { result } = renderHook(() => useHealth());

  await waitFor(() => expect(result.current.isLoading).toBe(false));
  expect(result.current.data).toBeNull();
  expect(result.current.error).toBeInstanceOf(Error);
});
