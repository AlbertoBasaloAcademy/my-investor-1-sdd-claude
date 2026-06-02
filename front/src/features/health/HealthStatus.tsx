import { useHealth } from './useHealth';
import './HealthStatus.css';

function formatUptime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}h ${minutes}m ${seconds}s`;
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleString();
}

export function HealthStatus() {
  const { data, error, isLoading } = useHealth();

  if (isLoading) {
    return (
      <section className="health-card" aria-busy="true">
        <p className="health-loading" data-testid="health-loading">
          <span className="health-spinner" aria-hidden="true" />
          Probing system vitals…
        </p>
      </section>
    );
  }

  if (error || !data) {
    return (
      <section className="health-card health-card--down">
        <p className="health-error" data-testid="health-error" role="alert">
          System unavailable — the health probe failed or reported an unhealthy status.
        </p>
      </section>
    );
  }

  const isUp = data.status === 'UP';

  return (
    <section className="health-card">
      <header className="health-header">
        <span
          className={`health-badge ${isUp ? 'health-badge--up' : 'health-badge--down'}`}
          data-testid="health-status"
        >
          {data.status}
        </span>
        <h2 className="health-title">System Vitals</h2>
      </header>

      <dl className="health-grid">
        <div className="health-metric">
          <dt>Database</dt>
          <dd data-testid="health-database">{data.database}</dd>
        </div>
        <div className="health-metric">
          <dt>Uptime</dt>
          <dd data-testid="health-uptime">{formatUptime(data.uptime.seconds)}</dd>
        </div>
        <div className="health-metric">
          <dt>Server time</dt>
          <dd data-testid="health-timestamp">{formatTimestamp(data.timestamp)}</dd>
        </div>
      </dl>
    </section>
  );
}
