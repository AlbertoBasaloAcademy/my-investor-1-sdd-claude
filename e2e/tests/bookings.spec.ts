import { test, expect, type APIRequestContext } from '@playwright/test';

const API_BASE = process.env.E2E_API_URL ?? 'http://localhost:8080';
const FUTURE_DATE = '2030-12-01T12:00:00';

// ── API helpers ──────────────────────────────────────────────────────────────

async function apiCreateRocket(request: APIRequestContext) {
  const res = await request.post(`${API_BASE}/api/rockets`, {
    data: { name: `E2E Rocket ${Date.now()}`, capacity: 9, range: 'Moon' },
  });
  return res.json() as Promise<{ id: string }>;
}

async function apiCreateConfirmedLaunch(request: APIRequestContext, rocketId: string) {
  const launchRes = await request.post(`${API_BASE}/api/launches`, {
    data: { rocketId, scheduledAt: FUTURE_DATE, pricePerTicket: 1000, minimumOccupancy: 1 },
  });
  const launch = (await launchRes.json()) as { id: string };
  await request.post(`${API_BASE}/api/launches/${launch.id}/confirm`);
  return launch;
}

async function apiCreateBooking(
  request: APIRequestContext,
  launchId: string,
  email: string,
  name = 'Test Passenger',
  phone = '+1234567890',
) {
  const res = await request.post(`${API_BASE}/api/bookings`, {
    data: { launchId, passengerName: name, passengerEmail: email, passengerPhone: phone },
  });
  return res.json() as Promise<{ id: number; launchId: string; status: string }>;
}

function uid() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

// ── Shared fixture ───────────────────────────────────────────────────────────

let sharedLaunchId: string;

test.describe('Bookings', () => {
  // Serial mode: this describe block runs against a SQLite backend via Vite proxy.
  // Parallel workers flood the proxy and trigger "Failed to fetch" errors.
  test.describe.configure({ mode: 'serial' });

  test.beforeAll(async ({ request }) => {
    const rocket = await apiCreateRocket(request);
    const launch = await apiCreateConfirmedLaunch(request, rocket.id);
    sharedLaunchId = launch.id;
  });

  // ── Criterion 1: valid booking created with CREATED status ────────────────

  test('creates a valid booking and shows it in the manifest with CREATED status', async ({
    page,
  }) => {
    const email = `valid.${uid()}@test.com`;

    await page.goto('/');
    const launchCard = page.getByTestId(`available-launch-${sharedLaunchId}`);
    await expect(launchCard).toBeVisible();

    await launchCard.getByTestId('btn-book-launch').click();
    await launchCard.getByTestId('input-passenger-name').fill('Alice E2E');
    await launchCard.getByTestId('input-passenger-email').fill(email);
    await launchCard.getByTestId('input-passenger-phone').fill('+1234567890');
    await launchCard.getByTestId('btn-book').click();

    // Form is hidden after success; manifest reloads — row with email + CREATED appears
    const row = launchCard.locator('tr').filter({ hasText: email });
    await expect(row).toBeVisible();
    await expect(row.getByText('CREATED')).toBeVisible();
  });

  // ── Criterion 2: duplicate booking rejected ───────────────────────────────

  test('rejects a duplicate booking and shows an inline form error', async ({ page, request }) => {
    const email = `dup.${uid()}@test.com`;
    await apiCreateBooking(request, sharedLaunchId, email);

    await page.goto('/');
    const launchCard = page.getByTestId(`available-launch-${sharedLaunchId}`);
    await expect(launchCard).toBeVisible();

    await launchCard.getByTestId('btn-book-launch').click();
    await launchCard.getByTestId('input-passenger-name').fill('Dup User');
    await launchCard.getByTestId('input-passenger-email').fill(email);
    await launchCard.getByTestId('input-passenger-phone').fill('+1234567890');
    await launchCard.getByTestId('btn-book').click();

    await expect(launchCard.getByTestId('booking-form-error')).toBeVisible();
    // No second row for this email should appear
    await expect(launchCard.locator('tr').filter({ hasText: email })).toHaveCount(1);
  });

  // ── Criterion 3: cancel a CREATED booking ────────────────────────────────

  test('cancels a CREATED booking and the status updates to CANCELLED in the UI', async ({
    page,
    request,
  }) => {
    const email = `cancel.${uid()}@test.com`;
    const booking = await apiCreateBooking(request, sharedLaunchId, email);

    await page.goto('/');
    const launchCard = page.getByTestId(`available-launch-${sharedLaunchId}`);
    await expect(launchCard).toBeVisible();

    const bookingRow = launchCard.getByTestId(`booking-row-${booking.id}`);
    await expect(bookingRow).toBeVisible();
    await launchCard.getByTestId(`btn-cancel-booking-${booking.id}`).click();

    await expect(bookingRow.getByText('CANCELLED')).toBeVisible();
    await expect(launchCard.getByTestId(`btn-cancel-booking-${booking.id}`)).toHaveCount(0);
  });

  // ── Criterion 4: cancel an already-cancelled booking → 409 (API-level) ───

  test('returns 409 when attempting to cancel an already-cancelled booking', async ({ request }) => {
    const email = `already.${uid()}@test.com`;
    const booking = await apiCreateBooking(request, sharedLaunchId, email);
    await request.post(`${API_BASE}/api/bookings/${booking.id}/cancel`);

    const res = await request.post(`${API_BASE}/api/bookings/${booking.id}/cancel`);
    expect(res.status()).toBe(409);
  });

  // ── Criterion 5: operator sees passenger manifest ────────────────────────

  test('shows all bookings with passenger name, email, phone and status in the manifest', async ({
    page,
    request,
  }) => {
    const e1 = `op1.${uid()}@test.com`;
    const e2 = `op2.${uid()}@test.com`;
    await apiCreateBooking(request, sharedLaunchId, e1, 'Passenger One', '+111');
    await apiCreateBooking(request, sharedLaunchId, e2, 'Passenger Two', '+222');

    await page.goto('/');
    const launchCard = page.getByTestId(`available-launch-${sharedLaunchId}`);
    await expect(launchCard).toBeVisible();

    await expect(launchCard.getByText('Passenger One')).toBeVisible();
    await expect(launchCard.getByText(e1)).toBeVisible();
    await expect(launchCard.getByText('+111')).toBeVisible();
    await expect(launchCard.getByText('Passenger Two')).toBeVisible();
    await expect(launchCard.getByText(e2)).toBeVisible();
    await expect(launchCard.getByText('+222')).toBeVisible();
  });

  // ── Criterion 6: passenger views My Bookings ─────────────────────────────

  test('lists all reservations for a passenger across multiple launches in My Bookings', async ({
    page,
    request,
  }) => {
    const email = `mybkgs.${uid()}@test.com`;
    const rocket2 = await apiCreateRocket(request);
    const launch2 = await apiCreateConfirmedLaunch(request, rocket2.id);

    const b1 = await apiCreateBooking(request, sharedLaunchId, email);
    const b2 = await apiCreateBooking(request, launch2.id, email);

    await page.goto('/');
    const myBookings = page.locator('.my-bookings');
    await myBookings.getByTestId('input-my-email').fill(email);
    await myBookings.getByTestId('btn-lookup').click();

    await expect(myBookings.getByTestId(`my-booking-${b1.id}`)).toBeVisible();
    await expect(myBookings.getByTestId(`my-booking-${b2.id}`)).toBeVisible();
  });

  // ── Criterion 7: form validates required fields before submission ─────────

  test('disables the submit button when a required field is empty', async ({ page }) => {
    await page.goto('/');
    const launchCard = page.getByTestId(`available-launch-${sharedLaunchId}`);
    await expect(launchCard).toBeVisible();

    await launchCard.getByTestId('btn-book-launch').click();
    // Leave name empty; fill the other fields
    await launchCard.getByTestId('input-passenger-email').fill('valid@email.com');
    await launchCard.getByTestId('input-passenger-phone').fill('+1234567890');

    await expect(launchCard.getByTestId('btn-book')).toBeDisabled();
  });

  // ── Criterion 8: email must be a properly formatted address ──────────────

  test('disables the submit button when the email format is invalid', async ({ page }) => {
    await page.goto('/');
    const launchCard = page.getByTestId(`available-launch-${sharedLaunchId}`);
    await expect(launchCard).toBeVisible();

    await launchCard.getByTestId('btn-book-launch').click();
    await launchCard.getByTestId('input-passenger-name').fill('Test User');
    await launchCard.getByTestId('input-passenger-email').fill('notanemail');
    await launchCard.getByTestId('input-passenger-phone').fill('+1234567890');

    await expect(launchCard.getByTestId('btn-book')).toBeDisabled();
  });

  // ── Criterion 9: cancelled bookings remain visible with CANCELLED label ───

  test('cancelled booking remains visible in My Bookings with a CANCELLED label', async ({
    page,
    request,
  }) => {
    const email = `clabel.${uid()}@test.com`;
    const booking = await apiCreateBooking(request, sharedLaunchId, email);
    await request.post(`${API_BASE}/api/bookings/${booking.id}/cancel`);

    await page.goto('/');
    const myBookings = page.locator('.my-bookings');
    await myBookings.getByTestId('input-my-email').fill(email);
    await myBookings.getByTestId('btn-lookup').click();

    const item = myBookings.getByTestId(`my-booking-${booking.id}`);
    await expect(item).toBeVisible();
    await expect(item.getByText('CANCELLED')).toBeVisible();
  });
});
