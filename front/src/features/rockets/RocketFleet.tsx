import { useState } from 'react';
import { useRockets } from './useRockets';
import type { Rocket, RocketRequest, Range } from '../../shared/types/rocket';
import './RocketFleet.css';

const RANGES: Range[] = ['Earth', 'Moon', 'Mars'];

const EMPTY_FORM: RocketRequest = { name: '', capacity: 1, range: 'Earth' };

function RocketForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial: RocketRequest;
  onSubmit: (data: RocketRequest) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<RocketRequest>(initial);
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
    <form className="rocket-form" onSubmit={handleSubmit} noValidate>
      {formError && (
        <p className="rocket-form-error" role="alert" data-testid="form-error">
          {formError}
        </p>
      )}
      <label>
        Name
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          data-testid="input-name"
        />
      </label>
      <label>
        Capacity (1–9)
        <input
          type="number"
          min={1}
          max={9}
          value={form.capacity}
          onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
          required
          data-testid="input-capacity"
        />
      </label>
      <label>
        Range
        <select
          value={form.range}
          onChange={(e) => setForm({ ...form, range: e.target.value as Range })}
          data-testid="select-range"
        >
          {RANGES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>
      <div className="rocket-form-actions">
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

function RocketRow({
  rocket,
  onEdit,
  onDecommission,
}: {
  rocket: Rocket;
  onEdit: (r: Rocket) => void;
  onDecommission: (id: string) => void;
}) {
  return (
    <tr data-testid={`rocket-row-${rocket.id}`}>
      <td>{rocket.name}</td>
      <td>{rocket.capacity}</td>
      <td>{rocket.range}</td>
      <td className="rocket-actions">
        <button type="button" onClick={() => onEdit(rocket)} data-testid={`btn-edit-${rocket.id}`}>
          Edit
        </button>
        <button
          type="button"
          className="btn-danger"
          onClick={() => onDecommission(rocket.id)}
          data-testid={`btn-decommission-${rocket.id}`}
        >
          Decommission
        </button>
      </td>
    </tr>
  );
}

export function RocketFleet() {
  const { rockets, error, isLoading, create, update, decommission } = useRockets();
  const [editing, setEditing] = useState<Rocket | null>(null);
  const [showForm, setShowForm] = useState(false);

  if (isLoading) {
    return (
      <section className="rocket-fleet" aria-busy="true">
        <p data-testid="rockets-loading">Loading fleet…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rocket-fleet">
        <p className="rocket-error" role="alert" data-testid="rockets-error">
          Failed to load rockets: {error.message}
        </p>
      </section>
    );
  }

  const handleCreate = async (data: RocketRequest) => {
    await create(data);
    setShowForm(false);
  };

  const handleUpdate = async (data: RocketRequest) => {
    if (!editing) return;
    await update(editing.id, data);
    setEditing(null);
  };

  const handleDecommission = async (id: string) => {
    if (!window.confirm('Decommission this rocket?')) return;
    await decommission(id);
  };

  return (
    <section className="rocket-fleet">
      <header className="rocket-fleet-header">
        <h2>Rocket Fleet</h2>
        {!showForm && !editing && (
          <button type="button" onClick={() => setShowForm(true)} data-testid="btn-add-rocket">
            Register Rocket
          </button>
        )}
      </header>

      {showForm && (
        <RocketForm
          initial={EMPTY_FORM}
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editing && (
        <RocketForm
          initial={{ name: editing.name, capacity: editing.capacity, range: editing.range }}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(null)}
        />
      )}

      {rockets.length === 0 ? (
        <p data-testid="rockets-empty">No rockets registered.</p>
      ) : (
        <table className="rocket-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Capacity</th>
              <th>Range</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rockets.map((r) => (
              <RocketRow
                key={r.id}
                rocket={r}
                onEdit={setEditing}
                onDecommission={handleDecommission}
              />
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
