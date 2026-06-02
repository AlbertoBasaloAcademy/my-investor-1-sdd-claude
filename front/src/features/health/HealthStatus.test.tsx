import { render, screen } from '@testing-library/react';
import { HealthStatus } from './HealthStatus';
import { getHealth } from './healthApi';
import type { HealthResponse } from '../../shared/types/health';

vi.mock('./healthApi', () => ({ getHealth: vi.fn() }));

const healthy: HealthResponse = {
  status: 'UP',
  database: 'UP',
  uptime: { seconds: 3725, since: '2026-05-29T10:00:00Z' },
  timestamp: '2026-05-29T11:02:05Z',
};

beforeEach(() => {
  vi.mocked(getHealth).mockReset();
});

test('shows a loading indicator while the probe is in flight', () => {
  vi.mocked(getHealth).mockReturnValue(new Promise(() => {}));

  render(<HealthStatus />);

  expect(screen.getByTestId('health-loading')).toBeInTheDocument();
});

test('renders the vitals when the probe succeeds', async () => {
  vi.mocked(getHealth).mockResolvedValue(healthy);

  render(<HealthStatus />);

  expect(await screen.findByTestId('health-status')).toHaveTextContent('UP');
  expect(screen.getByTestId('health-database')).toHaveTextContent('UP');
  expect(screen.getByTestId('health-uptime')).toHaveTextContent('1h 2m 5s');
  expect(screen.getByTestId('health-timestamp')).not.toBeEmptyDOMElement();
});

test('renders a clear error state when the probe fails', async () => {
  vi.mocked(getHealth).mockRejectedValue(new Error('unavailable'));

  render(<HealthStatus />);

  const error = await screen.findByTestId('health-error');
  expect(error).toHaveTextContent(/unavailable/i);
  expect(error).toHaveAttribute('role', 'alert');
});
