---
plan-type: e2e
slug: bookings
---
# e2e - bookings

## Scope

End-to-end flows for the bookings feature: a passenger books a launch, views their reservations, and cancels a booking; the system rejects duplicate bookings and attempts to cancel an already-cancelled one; an operator views the passenger manifest on a launch.

**Context**: [spec.md](.product/specs/bookings/spec.md)

### Acceptance criteria under test
- [x] When a passenger submits a valid booking form, the system creates a booking with status `CREATED` and returns it.
- [x] When a passenger attempts to book the same launch twice with the same email, the system rejects the second request with an error.
- [x] When a passenger cancels a `CREATED` booking, the system updates its status to `CANCELLED`.
- [x] When a passenger attempts to cancel a `CANCELLED` booking, the system rejects the request with an error.
- [x] When an operator views a launch, the system displays all bookings for that launch with passenger details and statuses.
- [x] When a passenger views their bookings, the system lists all their reservations across all launches.
- [x] Booking form validates that name, email, and phone are present before submission.
- [x] Email field is validated as a properly formatted email address.
- [x] Cancelled bookings remain visible in the passenger's booking list with a `CANCELLED` label.

---

## Test Steps

### Step 1: Scaffold booking test file
Create the Playwright spec file and shared fixtures (a confirmed launch for booking against).
- Paths:
    - `e2e/tests/bookings.spec.ts`
    - `e2e/fixtures/bookings.fixture.ts` *(if needed)*
- [ ] Arrange: seed a confirmed launch via `POST /api/launches` + `POST /api/launches/{id}/confirm` in `beforeAll`
- [ ] Act: (none — setup only)
- [ ] Assert: confirmed launch id is available to all scenarios

### Step 2: Passenger creates a valid booking
- Paths:
    - `e2e/tests/bookings.spec.ts`
- [ ] Arrange: navigate to the launch detail section showing the confirmed launch
- [ ] Act: click "Book this launch", fill in name, valid email, phone, submit
- [ ] Assert: booking appears in the manifest with status `CREATED` — maps to criterion 1

### Step 3: Duplicate booking rejected
- Paths:
    - `e2e/tests/bookings.spec.ts`
- [ ] Arrange: a booking already exists for this email + launch (created in Step 2 or via API)
- [ ] Act: attempt to book again with the same email
- [ ] Assert: form displays a duplicate-booking error message; no new booking row added — maps to criterion 2

### Step 4: Form validation — missing fields
- Paths:
    - `e2e/tests/bookings.spec.ts`
- [ ] Arrange: open the booking form
- [ ] Act: leave name blank (or phone blank); attempt to submit
- [ ] Assert: submit button remains disabled or inline validation error shown — maps to criterion 7

### Step 5: Form validation — invalid email
- Paths:
    - `e2e/tests/bookings.spec.ts`
- [ ] Arrange: open the booking form
- [ ] Act: enter an invalid email string (e.g. `notanemail`)
- [ ] Assert: submit is blocked or validation error shown — maps to criterion 8

### Step 6: Passenger cancels a CREATED booking
- Paths:
    - `e2e/tests/bookings.spec.ts`
- [ ] Arrange: a `CREATED` booking exists (use one from Step 2 or create via API)
- [ ] Act: click the cancel button next to the booking in the manifest
- [ ] Assert: booking status updates to `CANCELLED` in the UI immediately — maps to criterion 3

### Step 7: Cancelling an already-cancelled booking rejected (API-level)
- Paths:
    - `e2e/tests/bookings.spec.ts`
- [ ] Arrange: a `CANCELLED` booking exists (from Step 6)
- [ ] Act: send `POST /api/bookings/{id}/cancel` directly via Playwright `request`
- [ ] Assert: API returns 409 Conflict — maps to criterion 4

### Step 8: Operator sees passenger manifest
- Paths:
    - `e2e/tests/bookings.spec.ts`
- [ ] Arrange: multiple bookings (different emails) exist for the launch
- [ ] Act: navigate to the launch detail / manifest section
- [ ] Assert: all bookings are listed with name, email, phone, and status visible — maps to criterion 5

### Step 9: Passenger views My Bookings
- Paths:
    - `e2e/tests/bookings.spec.ts`
- [ ] Arrange: at least two bookings exist for the same passenger email across different launches
- [ ] Act: open the "My Bookings" section, enter the passenger email
- [ ] Assert: both reservations appear in the list — maps to criterion 6

### Step 10: Cancelled bookings stay visible with CANCELLED label
- Paths:
    - `e2e/tests/bookings.spec.ts`
- [ ] Arrange: one booking is `CREATED`, one is `CANCELLED` for the same passenger
- [ ] Act: view "My Bookings" for that passenger
- [ ] Assert: the cancelled booking remains in the list labelled `CANCELLED` — maps to criterion 9

---

## Execution

- [x] Start backend: `cd back && mvnw.cmd spring-boot:run`
- [x] Start frontend: `cd front && npm run dev`
- [x] Run the e2e suite: `cd e2e && npm test`
- [ ] Stop both servers after the run.

## Defects report

- [x] Write `.product/specs/bookings/e2e.report.md` listing each defect found: scenario, expected vs actual, affected container, severity.
- [x] Mark each acceptance criterion `[x]` in this plan and in `spec.md` when its tests pass, `[ ]` otherwise.
