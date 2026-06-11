---
slug: bookings
date: 2026-06-11
suite-result: green
---
# e2e Report — Bookings

## Summary

13 tests run (9 bookings + 4 health regression). All 13 pass. One test-infrastructure defect was found and fixed during the run.

---

## Defects

### D-001 — Parallel workers overwhelm the SQLite/Vite-proxy stack

| Field | Detail |
|-------|--------|
| **Scenario** | "rejects a duplicate booking" / "lists all reservations in My Bookings" |
| **Expected** | API responds in time; `LaunchBookings` renders the booking button / My Bookings renders the list |
| **Actual** | `LaunchBookings` showed "Failed to load bookings: Failed to fetch"; My Bookings showed "Failed to fetch". Tests timed out. |
| **Affected container** | `e2e` (test design), not product code |
| **Severity** | Medium — intermittent, depends on worker count |
| **Kind** | test bug |
| **Root cause** | `fullyParallel: true` with 8 workers causes all `beforeAll` hooks to run simultaneously, then up to 8 browser pages each load all confirmed launches, generating ~64 concurrent `GET /api/bookings?launchId=…` requests through Vite's proxy. The SQLite-backed Spring Boot server could not serve all requests in time, causing "Failed to fetch" errors. |
| **Fix applied** | Added `test.describe.configure({ mode: 'serial' })` inside the `Bookings` describe block. Tests now run one at a time (single browser instance at a time), keeping concurrent requests at a level the stack handles reliably. Health tests run in parallel in a separate file and are read-only, so no conflict. |
| **Verification** | Full suite re-run: 13/13 passed in 8.6 s. |

---

## Acceptance criteria

| # | Criterion | Test | Result |
|---|-----------|------|--------|
| 1 | Passenger submits valid form → booking created with `CREATED` status | creates a valid booking… | ✅ |
| 2 | Duplicate email + same launch → rejected with error | rejects a duplicate booking… | ✅ |
| 3 | Cancel a `CREATED` booking → status becomes `CANCELLED` | cancels a CREATED booking… | ✅ |
| 4 | Cancel an already-`CANCELLED` booking → rejected (409) | returns 409 when attempting… | ✅ |
| 5 | Operator views launch → all bookings shown with name, email, phone, status | shows all bookings with passenger… | ✅ |
| 6 | Passenger views My Bookings → all reservations across launches shown | lists all reservations… | ✅ |
| 7 | Form validates required fields (name, email, phone) before submit | disables submit when required field empty | ✅ |
| 8 | Email field validates format | disables submit when email format invalid | ✅ |
| 9 | Cancelled bookings stay visible with `CANCELLED` label | cancelled booking remains visible… | ✅ |

All 9 criteria verified.
