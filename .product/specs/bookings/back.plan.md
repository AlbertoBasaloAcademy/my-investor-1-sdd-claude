---
plan-type: spec
container: back
---
# spec - bookings - back

## Specification

The `back` container must expose a booking API that lets passengers create and cancel bookings, and lets operators and passengers query bookings. Business rules enforced: duplicate check (email + launch), status transition guard (only `CREATED` → `CANCELLED`), no hard deletes.

**Context**: [spec.md](.product/specs/bookings/spec.md)
**Architecture**: [back.arch.md](.product/arch/back.arch.md)

### Data model

New table `booking` — auto-created by Hibernate from the `Booking` JPA entity.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | BIGINT | PK, auto-increment |
| `launch_id` | TEXT | NOT NULL, FK → `launch.id` |
| `passenger_name` | TEXT | NOT NULL |
| `passenger_email` | TEXT | NOT NULL |
| `passenger_phone` | TEXT | NOT NULL |
| `status` | TEXT | NOT NULL, default `'CREATED'` |

Unique constraint on `(launch_id, passenger_email)`.

---

## Implementation Steps

### Step 1: Booking domain model
Define the `BookingStatus` enum and the `Booking` JPA entity. The entity drives the `booking` table via `ddl-auto: update`. Apply the unique constraint on `(launch_id, passenger_email)` at the entity level.
- Paths:
    - `back/src/main/java/dev/aiddbot/abjavareact/booking/BookingStatus.java`
    - `back/src/main/java/dev/aiddbot/abjavareact/booking/Booking.java`
- [ ] Create `BookingStatus` enum with values `CREATED` and `CANCELLED`
- [ ] Create `Booking` JPA entity with fields: `id` (auto), `launchId`, `passengerName`, `passengerEmail`, `passengerPhone`, `status`
- [ ] Annotate entity with `@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"launch_id","passenger_email"}))`
- [ ] Set default status to `CREATED` in the entity field initializer

### Step 2: Request and response DTOs
Add immutable Java records for the API contract. `BookingRequest` carries the creation payload; `BookingResponse` is the canonical response shape for all booking endpoints.
- Paths:
    - `back/src/main/java/dev/aiddbot/abjavareact/booking/BookingRequest.java`
    - `back/src/main/java/dev/aiddbot/abjavareact/booking/BookingResponse.java`
- [ ] Create `BookingRequest` record: `launchId`, `passengerName`, `passengerEmail`, `passengerPhone`
- [ ] Create `BookingResponse` record: `id`, `launchId`, `passengerName`, `passengerEmail`, `passengerPhone`, `status`
- [ ] Add a static `BookingResponse.from(Booking)` factory method

### Step 3: BookingRepository
Spring Data JPA repository with two custom queries needed by the service.
- Paths:
    - `back/src/main/java/dev/aiddbot/abjavareact/booking/BookingRepository.java`
- [ ] Extend `JpaRepository<Booking, Long>`
- [ ] Add `List<Booking> findByLaunchId(String launchId)`
- [ ] Add `List<Booking> findByPassengerEmail(String email)`
- [ ] Add `boolean existsByLaunchIdAndPassengerEmail(String launchId, String email)` for duplicate guard

### Step 4: BookingService
Business logic layer. Enforces the duplicate check on create and the status transition guard on cancel.
- Paths:
    - `back/src/main/java/dev/aiddbot/abjavareact/booking/BookingService.java`
    - `back/src/main/java/dev/aiddbot/abjavareact/booking/BookingNotFoundException.java`
- [ ] Create `BookingNotFoundException` extending `RuntimeException`
- [ ] Implement `createBooking(BookingRequest)`: reject with `409 Conflict` if duplicate, persist and return `BookingResponse`
- [ ] Implement `cancelBooking(Long id)`: throw `BookingNotFoundException` if not found; throw `IllegalStateException` if status is not `CREATED`; set status to `CANCELLED` and persist
- [ ] Implement `getBookingsByLaunch(String launchId)`: return `List<BookingResponse>`
- [ ] Implement `getBookingsByEmail(String email)`: return `List<BookingResponse>`

### Step 5: BookingController
REST controller exposing four endpoints. Query-param routing handles the dual `GET /api/bookings` use cases.
- Paths:
    - `back/src/main/java/dev/aiddbot/abjavareact/booking/BookingController.java`
- [ ] `POST /api/bookings` → `createBooking` → 201 Created
- [ ] `POST /api/bookings/{id}/cancel` → `cancelBooking` → 200 OK with updated `BookingResponse`
- [ ] `GET /api/bookings?launchId={id}` → `getBookingsByLaunch` → 200 OK
- [ ] `GET /api/bookings?email={email}` → `getBookingsByEmail` → 200 OK

### Step 6: GlobalExceptionHandler update
Register handlers for the two new exception types so the API returns meaningful HTTP status codes.
- Paths:
    - `back/src/main/java/dev/aiddbot/abjavareact/shared/GlobalExceptionHandler.java`
- [ ] Map `BookingNotFoundException` → 404 Not Found
- [ ] Map `IllegalStateException` (booking already cancelled) → 409 Conflict with message `"Booking already cancelled"`
- [ ] Map `DataIntegrityViolationException` (duplicate booking) → 409 Conflict with message `"Duplicate booking"`

### Step 7: Unit and integration tests
Cover the two critical business rules (duplicate rejection, transition guard) and the four controller routes.
- Paths:
    - `back/src/test/java/dev/aiddbot/abjavareact/booking/BookingServiceTest.java`
    - `back/src/test/java/dev/aiddbot/abjavareact/booking/BookingControllerTest.java`
- [ ] Test `createBooking` happy path returns 201 with `BookingResponse`
- [ ] Test `createBooking` duplicate → 409
- [ ] Test `cancelBooking` happy path transitions status to `CANCELLED`
- [ ] Test `cancelBooking` on already-cancelled booking → 409
- [ ] Test `cancelBooking` on unknown id → 404
- [ ] Test `GET /api/bookings?launchId=…` returns list
- [ ] Test `GET /api/bookings?email=…` returns list
