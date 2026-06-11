---
plan-type: e2e
slug: launches
---
# e2e - launches

## Scope

End-to-end verification of the launch lifecycle: operator creates, confirms, and cancels launches through the SPA; passengers see only confirmed launches. Covers both the browser-driven UI flows and direct API validations, spanning the `front` SPA and the `back` REST API.

**Context**: [spec.md](./spec.md)

### Acceptance criteria under test

- [ ] AC-1: When an operator creates a launch with valid data, the system saves it with `created` status.
- [ ] AC-2: When an operator submits a launch with a past date, the system rejects it with a validation error.
- [ ] AC-3: When an operator submits a price of zero or less, the system rejects it with a validation error.
- [ ] AC-4: When an operator confirms a launch, the status changes from `created` to `confirmed`.
- [ ] AC-5: When an operator cancels a launch, the status changes to `cancelled` and all bookings are flagged for refund.
- [ ] AC-6: When a passenger views available launches, only `confirmed` launches are displayed.
- [ ] AC-7: When an operator attempts an invalid status transition, the system returns an error.
- [ ] AC-8: Status transitions outside the allowed sequence are blocked.
- [ ] AC-9: A launch cannot reference a non-existent rocket.
- [ ] AC-10: Minimum occupancy cannot exceed the assigned rocket's seat capacity.

## Test Steps

### Step 1: Page object — LaunchManifestPage
Create a thin POM wrapper for the launch section of the SPA.
- Paths:
    - `e2e/pages/LaunchManifestPage.ts`
- [ ] Arrange: N/A — this is a test-infrastructure step.
- [ ] Act: implement locators for: launch table rows, create-launch form fields (rocket selector, datetime, price, occupancy), Submit button, Confirm/Cancel action buttons per row, error/validation message area, passenger-view section.
- [ ] Assert: N/A — page object exposes locators only; no `expect()` calls.

### Step 2: API helpers for launch fixtures
Add reusable async functions to create rockets and launches via the REST API for test setup.
- Paths:
    - `e2e/tests/launches.spec.ts`
- [ ] Arrange: N/A — helper definitions.
- [ ] Act: implement `createRocket(request)` and `createLaunch(request)` helpers using `APIRequestContext`; `confirmLaunch(id)` helper for status-transition setup.
- [ ] Assert: helpers throw on non-2xx to surface fixture failures early.

### Step 3: AC-1 — Create launch with valid data (UI)
Operator submits the create-launch form; launch appears in the list with `created` status.
- Paths:
    - `e2e/tests/launches.spec.ts`
- [ ] Arrange: create a rocket via API helper; navigate to the SPA.
- [ ] Act: fill the create-launch form (select rocket, set a future date, set price > 0, set minimum occupancy ≤ capacity); click Submit.
- [ ] Assert: the new launch appears in the operator list with status `created`.

### Step 4: AC-2 — Reject past scheduled date (API)
API returns a validation error when `scheduledAt` is in the past.
- Paths:
    - `e2e/tests/launches.spec.ts`
- [ ] Arrange: create a rocket via API helper.
- [ ] Act: `POST /api/launches` with `scheduledAt` set to yesterday.
- [ ] Assert: response status is 400 (or 422); response body contains a validation error message.

### Step 5: AC-3 — Reject price ≤ 0 (API)
API returns a validation error when `pricePerTicket` is zero or negative.
- Paths:
    - `e2e/tests/launches.spec.ts`
- [ ] Arrange: create a rocket via API helper.
- [ ] Act: `POST /api/launches` with `pricePerTicket: 0`.
- [ ] Assert: response status is 400 (or 422); response body contains a price validation message.

### Step 6: AC-4 — Confirm a launch (UI)
Operator clicks the Confirm button on a `created` launch; status changes to `confirmed`.
- Paths:
    - `e2e/tests/launches.spec.ts`
- [ ] Arrange: create a rocket and a launch (status `created`) via API helpers; navigate to the SPA.
- [ ] Act: click the Confirm button for that launch in the operator list.
- [ ] Assert: the launch row updates to status `confirmed`; Confirm button is no longer visible.

### Step 7: AC-5 — Cancel a launch with bookings (API + UI)
Cancelling a launch changes its status to `cancelled` and flags associated bookings for refund.
- Paths:
    - `e2e/tests/launches.spec.ts`
- [ ] Arrange: create a rocket, launch (confirm it), and one booking via API helpers.
- [ ] Act: `POST /api/launches/{id}/cancel` directly via API; then reload the SPA.
- [ ] Assert: launch status is `cancelled` in the UI; verify via `GET /api/bookings` that the booking status is `refunded` (or equivalent refund-flagged state).

### Step 8: AC-6 — Passenger view shows only confirmed launches (UI)
The passenger section filters launches to `confirmed` only.
- Paths:
    - `e2e/tests/launches.spec.ts`
- [ ] Arrange: create via API: one `created` launch, one `confirmed` launch, one `cancelled` launch (using rocket + confirm/cancel helpers).
- [ ] Act: navigate to the SPA and locate the passenger-view section.
- [ ] Assert: only the `confirmed` launch is visible; the `created` and `cancelled` launches are absent from that section.

### Step 9: AC-7 & AC-8 — Invalid status transition (API)
The API rejects transitions that are not in the allowed state machine.
- Paths:
    - `e2e/tests/launches.spec.ts`
- [ ] Arrange: create a launch via API helper; cancel it (`POST /api/launches/{id}/cancel`).
- [ ] Act: attempt `POST /api/launches/{id}/confirm` on the now-cancelled launch.
- [ ] Assert: response status is 409 (Conflict); response body describes the invalid transition.

### Step 10: AC-9 — Launch with non-existent rocket (API)
The API rejects a launch creation that references an unknown rocket.
- Paths:
    - `e2e/tests/launches.spec.ts`
- [ ] Arrange: N/A.
- [ ] Act: `POST /api/launches` with `rocketId: "non-existent-id"` and otherwise valid fields.
- [ ] Assert: response status is 422 (or 404); response body indicates the rocket was not found.

### Step 11: AC-10 — Minimum occupancy exceeds rocket capacity (API)
The API rejects a launch where minimum occupancy is greater than the rocket's seat capacity.
- Paths:
    - `e2e/tests/launches.spec.ts`
- [ ] Arrange: create a rocket with `capacity: 2` via API helper.
- [ ] Act: `POST /api/launches` with `minimumOccupancy: 5` referencing that rocket.
- [ ] Assert: response status is 422; response body indicates occupancy exceeds capacity.

## Execution

- [ ] Ensure back is running: `cd back && mvnw.cmd spring-boot:run` (port 8080).
- [ ] Ensure front is running: `cd front && npm run dev` (port 5173).
- [ ] Run the e2e suite: `cd e2e && npm test`.
- [ ] Review HTML report generated by Playwright (`playwright-report/index.html`).

## Defects report

- [ ] Write `.product/specs/launches/e2e.report.md` listing each defect found: scenario, expected vs actual, affected container, severity.
- [ ] Mark each acceptance criterion `[x]` in `spec.md` when its tests pass, `[ ]` otherwise.
