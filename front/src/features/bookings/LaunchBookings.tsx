import { useState } from 'react';
import { useBookings } from './useBookings';
import { BookingForm } from './BookingForm';
import type { BookingRequest } from '../../shared/types/booking';

export function LaunchBookings({ launchId }: { launchId: string }) {
  const { bookings, isLoading, error, create, cancel } = useBookings(launchId);
  const [showForm, setShowForm] = useState(false);

  if (isLoading) {
    return (
      <p aria-busy="true" data-testid="bookings-loading">
        Loading bookings…
      </p>
    );
  }

  if (error) {
    return (
      <p className="booking-error" role="alert" data-testid="bookings-error">
        Failed to load bookings: {error.message}
      </p>
    );
  }

  const handleCreate = async (req: BookingRequest) => {
    await create(req);
    setShowForm(false);
  };

  return (
    <div className="launch-bookings">
      <div className="launch-bookings-header">
        {!showForm && (
          <button type="button" onClick={() => setShowForm(true)} data-testid="btn-book-launch">
            Book this launch
          </button>
        )}
      </div>

      {showForm && <BookingForm launchId={launchId} onCreate={handleCreate} />}

      {bookings.length === 0 ? (
        <p data-testid="bookings-empty">No bookings yet.</p>
      ) : (
        <table className="bookings-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} data-testid={`booking-row-${b.id}`}>
                <td>{b.passengerName}</td>
                <td>{b.passengerEmail}</td>
                <td>{b.passengerPhone}</td>
                <td>
                  <span className={`booking-status booking-status-${b.status.toLowerCase()}`}>
                    {b.status}
                  </span>
                </td>
                <td>
                  {b.status === 'CREATED' && (
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={() => cancel(b.id)}
                      data-testid={`btn-cancel-booking-${b.id}`}
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
