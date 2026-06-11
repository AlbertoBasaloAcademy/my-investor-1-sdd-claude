import { useState } from 'react';
import { useLaunches } from './useLaunches';
import { useRockets } from '../rockets/useRockets';
import { LaunchBookings } from '../bookings/LaunchBookings';
import type { Launch, LaunchRequest, LaunchStatus } from '../../shared/types/launch';
import './LaunchManifest.css';

function statusClass(status: LaunchStatus) {
  return `launch-status launch-status-${status}`;
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString();
}

function LaunchForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial: LaunchRequest;
  onSubmit: (data: LaunchRequest) => Promise<void>;
  onCancel: () => void;
}) {
  const { rockets } = useRockets();
  const [form, setForm] = useState<LaunchRequest>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      await onSubmit(form);
    } catch (cause: unknown) {
      setFormError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="launch-form" onSubmit={handleSubmit} noValidate>
      {formError && (
        <p className="launch-form-error" role="alert" data-testid="form-error">
          {formError}
        </p>
      )}
      <label>
        Rocket
        <select
          value={form.rocketId}
          onChange={(e) => setForm({ ...form, rocketId: e.target.value })}
          required
          data-testid="select-rocket"
        >
          <option value="">— select a rocket —</option>
          {rockets.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} (capacity {r.capacity})
            </option>
          ))}
        </select>
      </label>
      <label>
        Scheduled At
        <input
          type="datetime-local"
          value={form.scheduledAt}
          onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
          required
          data-testid="input-scheduled-at"
        />
      </label>
      <label>
        Price per Ticket ($)
        <input
          type="number"
          min={0.01}
          step={0.01}
          value={form.pricePerTicket}
          onChange={(e) => setForm({ ...form, pricePerTicket: Number(e.target.value) })}
          required
          data-testid="input-price"
        />
      </label>
      <label>
        Minimum Occupancy
        <input
          type="number"
          min={1}
          value={form.minimumOccupancy}
          onChange={(e) => setForm({ ...form, minimumOccupancy: Number(e.target.value) })}
          required
          data-testid="input-occupancy"
        />
      </label>
      <div className="launch-form-actions">
        <button type="submit" disabled={submitting} data-testid="btn-submit">
          {submitting ? 'Saving…' : 'Save'}
        </button>
        <button type="button" onClick={onCancel} data-testid="btn-cancel">
          Cancel
        </button>
      </div>
    </form>
  );
}

function LaunchRow({
  launch,
  onEdit,
  onConfirm,
  onCancel,
}: {
  launch: Launch;
  onEdit: (l: Launch) => void;
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
}) {
  const canEdit = launch.status === 'created';
  const canConfirm = launch.status === 'created';
  const canCancel = launch.status === 'created' || launch.status === 'confirmed';

  return (
    <tr data-testid={`launch-row-${launch.id}`}>
      <td>{launch.rocketName}</td>
      <td>{formatDateTime(launch.scheduledAt)}</td>
      <td>${launch.pricePerTicket.toFixed(2)}</td>
      <td>{launch.minimumOccupancy}</td>
      <td>
        <span className={statusClass(launch.status)}>{launch.status}</span>
      </td>
      <td className="launch-actions">
        {canEdit && (
          <button type="button" onClick={() => onEdit(launch)} data-testid={`btn-edit-${launch.id}`}>
            Edit
          </button>
        )}
        {canConfirm && (
          <button
            type="button"
            className="btn-confirm"
            onClick={() => onConfirm(launch.id)}
            data-testid={`btn-confirm-${launch.id}`}
          >
            Confirm
          </button>
        )}
        {canCancel && (
          <button
            type="button"
            className="btn-cancel"
            onClick={() => onCancel(launch.id)}
            data-testid={`btn-cancel-${launch.id}`}
          >
            Cancel
          </button>
        )}
      </td>
    </tr>
  );
}

const EMPTY_FORM: LaunchRequest = {
  rocketId: '',
  scheduledAt: '',
  pricePerTicket: 100,
  minimumOccupancy: 1,
};

export function LaunchManifest() {
  const { launches, error, isLoading, create, update, confirm, cancel } = useLaunches();
  const [editing, setEditing] = useState<Launch | null>(null);
  const [showForm, setShowForm] = useState(false);

  if (isLoading) {
    return (
      <section className="launch-manifest" aria-busy="true">
        <p data-testid="launches-loading">Loading launches…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="launch-manifest">
        <p className="launch-error" role="alert" data-testid="launches-error">
          Failed to load launches: {error.message}
        </p>
      </section>
    );
  }

  const handleCreate = async (data: LaunchRequest) => {
    await create(data);
    setShowForm(false);
  };

  const handleUpdate = async (data: LaunchRequest) => {
    if (!editing) return;
    await update(editing.id, data);
    setEditing(null);
  };

  const handleConfirm = async (id: string) => {
    await confirm(id);
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm('Cancel this launch? All bookings will be flagged for refund.')) return;
    await cancel(id);
  };

  const confirmedLaunches = launches.filter((l) => l.status === 'confirmed');

  return (
    <section className="launch-manifest">
      <header className="launch-manifest-header">
        <h2>Launch Manifest</h2>
        {!showForm && !editing && (
          <button type="button" onClick={() => setShowForm(true)} data-testid="btn-add-launch">
            Schedule Launch
          </button>
        )}
      </header>

      {showForm && (
        <LaunchForm initial={EMPTY_FORM} onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
      )}

      {editing && (
        <LaunchForm
          initial={{
            rocketId: editing.rocketId,
            scheduledAt: editing.scheduledAt.slice(0, 16),
            pricePerTicket: editing.pricePerTicket,
            minimumOccupancy: editing.minimumOccupancy,
          }}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(null)}
        />
      )}

      {launches.length === 0 ? (
        <p data-testid="launches-empty">No launches scheduled.</p>
      ) : (
        <table className="launch-table">
          <thead>
            <tr>
              <th>Rocket</th>
              <th>Scheduled At</th>
              <th>Price</th>
              <th>Min. Occupancy</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {launches.map((l) => (
              <LaunchRow
                key={l.id}
                launch={l}
                onEdit={setEditing}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
              />
            ))}
          </tbody>
        </table>
      )}

      <div className="launch-passenger-section">
        <h3>Available for Booking</h3>
        {confirmedLaunches.length === 0 ? (
          <p data-testid="confirmed-launches-empty">No launches available for booking.</p>
        ) : (
          <div className="confirmed-launches">
            {confirmedLaunches.map((l) => (
              <div key={l.id} className="confirmed-launch-card" data-testid={`available-launch-${l.id}`}>
                <div className="confirmed-launch-info">
                  <span>{l.rocketName}</span>
                  <span>{formatDateTime(l.scheduledAt)}</span>
                  <span>${l.pricePerTicket.toFixed(2)}</span>
                  <span>Min. {l.minimumOccupancy}</span>
                </div>
                <LaunchBookings launchId={l.id} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
