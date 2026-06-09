---
plan-type: spec
container: front
---
# spec - bookings - front

## Specification

The `front` container must let passengers book a launch and view/cancel their reservations, and let operators see the full passenger manifest for a launch. All booking operations go through the `back` API via the existing `httpClient`.

**Context**: [spec.md](.product/specs/bookings/spec.md)
**Architecture**: [front.arch.md](.product/arch/front.arch.md)

### Data model

New domain types in `shared/types/booking.ts`.

```typescript
type BookingStatus = 'CREATED' | 'CANCELLED';
interface Booking {
  id: number;
  launchId: string;
  passengerName: string;
  passengerEmail: string;
  passengerPhone: string;
  status: BookingStatus;
}
interface BookingRequest {
  launchId: string;
  passengerName: string;
  passengerEmail: string;
  passengerPhone: string;
}
```

---

## Implementation Steps

### Step 1: Booking domain types
Add the canonical TypeScript interfaces for the bookings feature, aligned with the `back` API contract.
- Paths:
    - `front/src/shared/types/booking.ts`
- [ ] Define `BookingStatus` union type (`'CREATED' | 'CANCELLED'`)
- [ ] Define `Booking` interface with all fields matching `BookingResponse` from the back contract
- [ ] Define `BookingRequest` interface

### Step 2: bookingsApi service
HTTP adapter following the same pattern as `launchesApi.ts`. Wraps all four booking endpoints.
- Paths:
    - `front/src/features/bookings/bookingsApi.ts`
    - `front/src/features/bookings/bookingsApi.test.ts`
- [ ] Implement `createBooking(req: BookingRequest): Promise<Booking>` → `POST /api/bookings`
- [ ] Implement `cancelBooking(id: number): Promise<Booking>` → `POST /api/bookings/{id}/cancel`
- [ ] Implement `getBookingsByLaunch(launchId: string): Promise<Booking[]>` → `GET /api/bookings?launchId=…`
- [ ] Implement `getMyBookings(email: string): Promise<Booking[]>` → `GET /api/bookings?email=…`
- [ ] Unit-test each function with mocked `httpClient`

### Step 3: useBookings hook
Manages booking state scoped to a single launch: the manifest list, a create action, and a cancel action.
- Paths:
    - `front/src/features/bookings/useBookings.ts`
    - `front/src/features/bookings/useBookings.test.ts`
- [ ] Implement `useBookings(launchId: string)` returning `{ bookings, isLoading, error, create, cancel }`
- [ ] `create(req: BookingRequest)` calls `bookingsApi.createBooking` then refreshes the list
- [ ] `cancel(id: number)` calls `bookingsApi.cancelBooking` then refreshes the list
- [ ] Unit-test loading, create success, create duplicate error (409), cancel success, cancel conflict (409)

### Step 4: useMyBookings hook
Manages the passenger's personal booking list, loaded by email.
- Paths:
    - `front/src/features/bookings/useMyBookings.ts`
    - `front/src/features/bookings/useMyBookings.test.ts`
- [ ] Implement `useMyBookings(email: string)` returning `{ bookings, isLoading, error, cancel }`
- [ ] `cancel(id: number)` calls `bookingsApi.cancelBooking` then refreshes the list
- [ ] Unit-test loading and cancel flows

### Step 5: BookingForm component
Inline form opened from the launch detail area. Collects name, email, phone; validates before submit; displays API errors.
- Paths:
    - `front/src/features/bookings/BookingForm.tsx`
- [ ] Render controlled inputs for `passengerName`, `passengerEmail`, `passengerPhone`
- [ ] Disable submit if any field is empty or email format is invalid
- [ ] Call `onCreate(req: BookingRequest)` prop on valid submit
- [ ] Display an inline error message when the API returns a duplicate-booking error
- [ ] Show a success state (confirmed booking) after creation

### Step 6: LaunchBookings component
Dual-purpose component rendered inside the launch detail area: shows the "Book this launch" button for passengers and the full manifest for operators.
- Paths:
    - `front/src/features/bookings/LaunchBookings.tsx`
- [ ] Accept `launchId: string` prop; use `useBookings(launchId)` internally
- [ ] Render a "Book this launch" button that toggles `BookingForm` visibility
- [ ] Render a passenger manifest table: name, email, phone, status for each booking
- [ ] Show a cancel button next to each `CREATED` booking; hide it for `CANCELLED` ones
- [ ] Show loading and error states

### Step 7: MyBookings component
Passenger self-service view: a simple email input that loads and displays all their reservations.
- Paths:
    - `front/src/features/bookings/MyBookings.tsx`
- [ ] Render an email input field; on submit call `useMyBookings` with that email
- [ ] Display all bookings in a list with status badge (`CREATED` / `CANCELLED`)
- [ ] Show cancel button for `CREATED` bookings; update list immediately on cancel
- [ ] Show loading and error states

### Step 8: Integrate into LaunchManifest
Embed `LaunchBookings` inside the existing `LaunchManifest.tsx` launch detail/card area.
- Paths:
    - `front/src/features/launches/LaunchManifest.tsx`
- [ ] Import and render `<LaunchBookings launchId={launch.id} />` within the launch detail section

### Step 9: Integrate MyBookings into App
Add the `MyBookings` feature component to the application root so passengers can reach it.
- Paths:
    - `front/src/App.tsx`
- [ ] Import and render `<MyBookings />` as a new section in `App.tsx`
