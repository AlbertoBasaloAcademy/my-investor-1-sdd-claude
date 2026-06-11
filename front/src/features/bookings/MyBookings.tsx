import { useState } from 'react';
import { useMyBookings } from './useMyBookings';

function MyBookingsList({ email }: { email: string }) {
  const { bookings, isLoading, error, cancel } = useMyBookings(email);

  if (isLoading) {
    return (
      <p aria-busy="true" data-testid="my-bookings-loading">
        Loading…
      </p>
    );
  }

  if (error) {
    return (
      <p className="booking-error" role="alert" data-testid="my-bookings-error">
        {error.message}
      </p>
    );
  }

  if (bookings.length === 0) {
    return <p data-testid="my-bookings-empty">No bookings found.</p>;
  }

  return (
    <ul className="my-bookings-list">
      {bookings.map((b) => (
        <li key={b.id} data-testid={`my-booking-${b.id}`}>
          <span>Launch: {b.launchId}</span>
          <span className={`booking-status booking-status-${b.status.toLowerCase()}`}>{b.status}</span>
          {b.status === 'CREATED' && (
            <button
              type="button"
              onClick={() => cancel(b.id)}
              data-testid={`btn-cancel-my-booking-${b.id}`}
            >
              Cancel
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

export function MyBookings() {
  const [emailInput, setEmailInput] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedEmail(emailInput.trim());
  };

  return (
    <section className="my-bookings">
      <h2>My Bookings</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="your@email.com"
            data-testid="input-my-email"
          />
        </label>
        <button type="submit" data-testid="btn-lookup">
          Lookup
        </button>
      </form>
      {submittedEmail && <MyBookingsList email={submittedEmail} />}
    </section>
  );
}
