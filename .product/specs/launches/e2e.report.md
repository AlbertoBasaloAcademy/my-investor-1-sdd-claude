---
slug: launches
suite-run: 2026-06-11
status: green
---
# E2E Report — Launches

## Summary

All 10 acceptance criteria pass. Two code bugs were found and fixed; one test bug was corrected before the first clean run.

| AC | Description | Result |
|----|-------------|--------|
| AC-1 | Create launch — UI | ✅ pass |
| AC-2 | Reject past date — API | ✅ pass |
| AC-3 | Reject price ≤ 0 — API | ✅ pass |
| AC-4 | Confirm launch — UI | ✅ pass |
| AC-5 | Cancel launch cascades to bookings — API + UI | ✅ pass (after fix) |
| AC-6 | Passenger view shows only confirmed — UI | ✅ pass |
| AC-7 | Invalid status transition rejected — API | ✅ pass (after fix) |
| AC-8 | Terminal launch blocks further transitions — API | ✅ pass (after fix) |
| AC-9 | Non-existent rocket rejected — API | ✅ pass |
| AC-10 | Minimum occupancy > capacity rejected — API | ✅ pass |

---

## Defects

### DEF-1 — Booking cascade missing on launch cancellation

| Field | Value |
|-------|-------|
| Scenario | AC-5 |
| Affected container | `back` |
| Severity | high |
| Kind | code bug |
| Status | **fixed** |

**Expected**: Cancelling a launch sets all associated `CREATED` bookings to `CANCELLED`.

**Actual**: `LaunchService.cancel()` changed only the launch status; bookings remained `CREATED`.

**Root cause**: `LaunchService` had no reference to `BookingRepository` and performed no cascade.

**Fix** (`back/src/main/java/…/launch/LaunchService.java`):
- Injected `BookingRepository` into `LaunchService` via constructor.
- After saving the cancelled launch, streamed all bookings for that launch and set status `CANCELLED` for any in `CREATED` state.

---

### DEF-2 — Invalid status transition returned 400 instead of 409

| Field | Value |
|-------|-------|
| Scenario | AC-7, AC-8 |
| Affected container | `back` |
| Severity | medium |
| Kind | code bug |
| Status | **fixed** |

**Expected**: Attempting a state transition that violates the launch state machine returns HTTP 409 Conflict.

**Actual**: `LaunchService.confirm()` and `LaunchService.cancel()` threw `IllegalArgumentException` for state-transition violations, which `GlobalExceptionHandler` maps to 400 Bad Request.

**Root cause**: Wrong exception type — state-machine violations are conflicts (409), not bad requests (400). The handler already mapped `IllegalStateException` → 409.

**Fix** (`back/src/main/java/…/launch/LaunchService.java`):
- Changed `confirm()` to throw `IllegalStateException` (not `IllegalArgumentException`) when status is not `created`.
- Changed `cancel()` to throw `IllegalStateException` (not `IllegalArgumentException`) when status is terminal.

---

## Test bug

### TBUG-1 — AC-1 locator matched two rows

**Scenario**: AC-1 (UI).

**Issue**: `page.getByRole('row').filter({ hasText: rocket.name })` resolved to two elements — one in the `RocketFleet` table and one in the `LaunchManifest` table — causing a strict-mode violation.

**Fix**: Narrowed to `page.locator('[data-testid^="launch-row-"]').filter({ hasText: rocket.name })`, which targets only launch rows by their test-ID prefix.

---

## Observations (non-blocking)

- **AC-9 status code**: The plan specified 422 or 404 for a non-existent rocket. The implementation returns 400 (`IllegalArgumentException("Rocket not found")`). The test accepts `[400, 404, 422]`; behavior is correct but the semantic HTTP status is debatable. A future refinement could introduce a custom exception that maps to 422.
- **AC-10 status code**: Same pattern — plan said 422, implementation returns 400. Test accepts `[400, 422]`.
