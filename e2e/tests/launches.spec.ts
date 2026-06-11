import { test, expect, type APIRequestContext } from '@playwright/test';
import { LaunchManifestPage } from '../pages/LaunchManifestPage';

const API_BASE = process.env.E2E_API_URL ?? 'http://localhost:8080';
const FUTURE_DATE = '2030-12-01T12:00:00';
const FUTURE_DATE_INPUT = '2030-12-01T12:00';
const PAST_DATE = '2020-01-01T12:00:00';

// ── API helpers ──────────────────────────────────────────────────────────────

async function apiCreateRocket(request: APIRequestContext, capacity = 9) {
  const res = await request.post(`${API_BASE}/api/rockets`, {
    data: { name: `E2E Rocket ${uid()}`, capacity, range: 'Moon' },
  });
  if (!res.ok()) throw new Error(`apiCreateRocket failed: ${res.status()}`);
  return res.json() as Promise<{ id: string; name: string; capacity: number }>;
}

async function apiCreateLaunch(
  request: APIRequestContext,
  rocketId: string,
  overrides: Record<string, unknown> = {},
) {
  const res = await request.post(`${API_BASE}/api/launches`, {
    data: {
      rocketId,
      scheduledAt: FUTURE_DATE,
      pricePerTicket: 1000,
      minimumOccupancy: 1,
      ...overrides,
    },
  });
  if (!res.ok()) throw new Error(`apiCreateLaunch failed: ${res.status()}`);
  return res.json() as Promise<{ id: string; status: string }>;
}

async function apiConfirmLaunch(request: APIRequestContext, id: string) {
  const res = await request.post(`${API_BASE}/api/launches/${id}/confirm`);
  if (!res.ok()) throw new Error(`apiConfirmLaunch failed: ${res.status()}`);
  return res.json() as Promise<{ id: string; status: string }>;
}

async function apiCancelLaunch(request: APIRequestContext, id: string) {
  const res = await request.post(`${API_BASE}/api/launches/${id}/cancel`);
  if (!res.ok()) throw new Error(`apiCancelLaunch failed: ${res.status()}`);
  return res.json() as Promise<{ id: string; status: string }>;
}

async function apiCreateBooking(request: APIRequestContext, launchId: string, email: string) {
  const res = await request.post(`${API_BASE}/api/bookings`, {
    data: {
      launchId,
      passengerName: 'E2E Passenger',
      passengerEmail: email,
      passengerPhone: '+1234567890',
    },
  });
  if (!res.ok()) throw new Error(`apiCreateBooking failed: ${res.status()}`);
  return res.json() as Promise<{ id: number; status: string }>;
}

function uid(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

// ── Launches suite ───────────────────────────────────────────────────────────

test.describe('Launches', () => {
  test.describe.configure({ mode: 'serial' });

  // ── AC-1: Create launch with valid data (UI) ─────────────────────────────

  test('AC-1: creates a launch with valid data and shows it in the manifest with created status', async ({
    page,
    request,
  }) => {
    const rocket = await apiCreateRocket(request);
    const launchPage = new LaunchManifestPage(page);
    await launchPage.goto();

    await launchPage.addLaunchBtn.click();
    await expect(launchPage.rocketSelect.locator(`option[value="${rocket.id}"]`)).toBeAttached();
    await launchPage.rocketSelect.selectOption(rocket.id);
    await launchPage.scheduledAtInput.fill(FUTURE_DATE_INPUT);
    await launchPage.priceInput.fill('999');
    await launchPage.occupancyInput.fill('1');
    await launchPage.submitBtn.click();

    const newRow = page.locator('[data-testid^="launch-row-"]').filter({ hasText: rocket.name });
    await expect(newRow).toBeVisible();
    await expect(newRow).toContainText('created');
  });

  // ── AC-2: Reject past scheduled date (API) ───────────────────────────────

  test('AC-2: rejects a launch with a past scheduled date with a validation error', async ({
    request,
  }) => {
    const rocket = await apiCreateRocket(request);
    const res = await request.post(`${API_BASE}/api/launches`, {
      data: {
        rocketId: rocket.id,
        scheduledAt: PAST_DATE,
        pricePerTicket: 1000,
        minimumOccupancy: 1,
      },
    });
    expect(res.status()).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBeTruthy();
  });

  // ── AC-3: Reject price ≤ 0 (API) ─────────────────────────────────────────

  test('AC-3: rejects a launch with a price of zero or less with a validation error', async ({
    request,
  }) => {
    const rocket = await apiCreateRocket(request);
    const res = await request.post(`${API_BASE}/api/launches`, {
      data: {
        rocketId: rocket.id,
        scheduledAt: FUTURE_DATE,
        pricePerTicket: 0,
        minimumOccupancy: 1,
      },
    });
    expect(res.status()).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBeTruthy();
  });

  // ── AC-4: Confirm a launch (UI) ──────────────────────────────────────────

  test('AC-4: confirms a launch and updates its status to confirmed in the operator list', async ({
    page,
    request,
  }) => {
    const rocket = await apiCreateRocket(request);
    const launch = await apiCreateLaunch(request, rocket.id);
    const launchPage = new LaunchManifestPage(page);
    await launchPage.goto();

    await launchPage.confirmBtn(launch.id).click();

    await expect(launchPage.launchRow(launch.id)).toContainText('confirmed');
    await expect(launchPage.confirmBtn(launch.id)).toHaveCount(0);
  });

  // ── AC-5: Cancel a launch with bookings (API + UI) ───────────────────────

  test('AC-5: cancels a launch and flags all associated bookings for refund', async ({
    page,
    request,
  }) => {
    const rocket = await apiCreateRocket(request);
    const launch = await apiCreateLaunch(request, rocket.id);
    await apiConfirmLaunch(request, launch.id);
    const booking = await apiCreateBooking(request, launch.id, `ac5.${uid()}@test.com`);

    await apiCancelLaunch(request, launch.id);

    await page.goto('/');
    await expect(page.getByTestId(`launch-row-${launch.id}`)).toContainText('cancelled');

    const bookingsRes = await request.get(`${API_BASE}/api/bookings?launchId=${launch.id}`);
    const bookings = (await bookingsRes.json()) as Array<{ id: number; status: string }>;
    const affectedBooking = bookings.find((b) => b.id === booking.id);
    expect(affectedBooking).toBeDefined();
    expect(['CANCELLED', 'REFUNDED']).toContain(affectedBooking?.status);
  });

  // ── AC-6: Passenger view shows only confirmed launches (UI) ──────────────

  test('AC-6: passenger view shows only confirmed launches, not created or cancelled ones', async ({
    page,
    request,
  }) => {
    const rocketA = await apiCreateRocket(request);
    const rocketB = await apiCreateRocket(request);
    const rocketC = await apiCreateRocket(request);

    const createdLaunch = await apiCreateLaunch(request, rocketA.id);
    const confirmedLaunch = await apiCreateLaunch(request, rocketB.id);
    const cancelledLaunch = await apiCreateLaunch(request, rocketC.id);

    await apiConfirmLaunch(request, confirmedLaunch.id);
    await apiCancelLaunch(request, cancelledLaunch.id);

    await page.goto('/');

    await expect(page.getByTestId(`available-launch-${confirmedLaunch.id}`)).toBeVisible();
    await expect(page.getByTestId(`available-launch-${createdLaunch.id}`)).toHaveCount(0);
    await expect(page.getByTestId(`available-launch-${cancelledLaunch.id}`)).toHaveCount(0);
  });

  // ── AC-7 & AC-8: Invalid status transition (API) ─────────────────────────

  test('AC-7/AC-8: rejects an invalid status transition with a 409 Conflict error', async ({
    request,
  }) => {
    const rocket = await apiCreateRocket(request);
    const launch = await apiCreateLaunch(request, rocket.id);
    // Cancel the launch to put it in a terminal state
    const cancelRes = await request.post(`${API_BASE}/api/launches/${launch.id}/cancel`);
    expect(cancelRes.ok()).toBeTruthy();

    // Attempt to confirm an already-cancelled launch
    const res = await request.post(`${API_BASE}/api/launches/${launch.id}/confirm`);
    expect(res.status()).toBe(409);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBeTruthy();
  });

  // ── AC-9: Launch with non-existent rocket (API) ──────────────────────────

  test('AC-9: rejects a launch that references a non-existent rocket', async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/launches`, {
      data: {
        rocketId: 'non-existent-rocket-id',
        scheduledAt: FUTURE_DATE,
        pricePerTicket: 1000,
        minimumOccupancy: 1,
      },
    });
    expect([400, 404, 422]).toContain(res.status());
    const body = (await res.json()) as { error: string };
    expect(body.error).toBeTruthy();
  });

  // ── AC-10: Minimum occupancy exceeds capacity (API) ──────────────────────

  test('AC-10: rejects a launch where minimum occupancy exceeds the rocket seat capacity', async ({
    request,
  }) => {
    const rocket = await apiCreateRocket(request, 2);
    const res = await request.post(`${API_BASE}/api/launches`, {
      data: {
        rocketId: rocket.id,
        scheduledAt: FUTURE_DATE,
        pricePerTicket: 1000,
        minimumOccupancy: 5,
      },
    });
    expect([400, 422]).toContain(res.status());
    const body = (await res.json()) as { error: string };
    expect(body.error).toBeTruthy();
  });
});
