import { useState } from 'react';
import type { BookingRequest } from '../../shared/types/booking';

interface BookingFormProps {
  launchId: string;
  onCreate: (req: BookingRequest) => Promise<void>;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function BookingForm({ launchId, onCreate }: BookingFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const canSubmit = name.trim() !== '' && isValidEmail(email) && phone.trim() !== '' && !submitting;

  if (success) {
    return (
      <p className="booking-success" data-testid="booking-success">
        Booking confirmed!
      </p>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      await onCreate({ launchId, passengerName: name, passengerEmail: email, passengerPhone: phone });
      setSuccess(true);
      setName('');
      setEmail('');
      setPhone('');
    } catch (cause: unknown) {
      setFormError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="booking-form" onSubmit={handleSubmit} noValidate>
      {formError && (
        <p className="booking-form-error" role="alert" data-testid="booking-form-error">
          {formError}
        </p>
      )}
      <label>
        Name
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          data-testid="input-passenger-name"
        />
      </label>
      <label>
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          data-testid="input-passenger-email"
        />
      </label>
      <label>
        Phone
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          data-testid="input-passenger-phone"
        />
      </label>
      <button type="submit" disabled={!canSubmit} data-testid="btn-book">
        {submitting ? 'Booking…' : 'Book'}
      </button>
    </form>
  );
}
