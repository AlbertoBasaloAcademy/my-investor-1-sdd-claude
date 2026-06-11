---
plan-type: spec
container: back
---
# spec - launches - back

## Specification

The REST API must store and manage launches with full lifecycle support.

- Operators can create a launch by supplying a rocket reference, scheduled time, price per ticket, and minimum occupancy.
- The API exposes a list of all launches with their current status.
- Operators can update a launch's details while it is in `created` status.
- Operators can transition a launch from `created` to `confirmed`.
- Operators can cancel a launch in `created` or `confirmed` status.
- Invalid status transitions are rejected with a clear error response.

**Context**: [spec.md](./spec.md)
**Architecture**: [back.arch.md](../../arch/back.arch.md)

### Data model

| Table | Column | Type | Constraints |
|-------|--------|------|-------------|
| `launch` | `id` | VARCHAR | PK, UUID |
| | `rocket_id` | VARCHAR | FK → rocket.id, NOT NULL |
| | `scheduled_at` | DATETIME | must be future on create/update |
| | `price_per_ticket` | DECIMAL | > 0 |
| | `minimum_occupancy` | INT | > 0 and ≤ rocket.capacity |
| | `status` | VARCHAR | `created \| confirmed \| cancelled \| completed` |

Status transitions allowed:
```
created ──confirm──→ confirmed
created ──cancel──→  cancelled
confirmed ──cancel──→ cancelled
completed / cancelled  (terminal — no transitions allowed)
```

## Implementation Steps

### Step 1: Launch entity
Define the `Launch` JPA entity with all required columns and the status enum.
- Paths:
    - `back/src/main/java/dev/aiddbot/abjavareact/launch/Launch.java`
- [ ] Create `Launch` entity with fields: `id` (UUID), `rocketId`, `scheduledAt`, `pricePerTicket`, `minimumOccupancy`, `status` (String).
- [ ] Annotate with `@Entity`, `@Table(name = "launch")`, `@Id`, `@GeneratedValue`.
- [ ] Add `@ManyToOne` or bare FK column for `rocketId` (no cascade — FK integrity only).

### Step 2: Launch repository
Expose the data-access layer for launches.
- Paths:
    - `back/src/main/java/dev/aiddbot/abjavareact/launch/LaunchRepository.java`
- [ ] Create `LaunchRepository extends JpaRepository<Launch, String>`.
- [ ] Add `List<Launch> findByStatus(String status)` for passenger filtered view.

### Step 3: DTOs
Define immutable request/response contracts as Java records.
- Paths:
    - `back/src/main/java/dev/aiddbot/abjavareact/launch/LaunchRequest.java`
    - `back/src/main/java/dev/aiddbot/abjavareact/launch/LaunchResponse.java`
- [ ] `LaunchRequest` record: `rocketId`, `scheduledAt`, `pricePerTicket`, `minimumOccupancy`. Add Bean Validation: `@NotBlank`, `@Future`, `@Positive`, `@Min(1)`.
- [ ] `LaunchResponse` record: `id`, `rocketId`, `rocketName`, `scheduledAt`, `pricePerTicket`, `minimumOccupancy`, `status`.

### Step 4: Launch exception
Signal not-found errors in a way the global handler can map to 404.
- Paths:
    - `back/src/main/java/dev/aiddbot/abjavareact/launch/LaunchNotFoundException.java`
- [ ] Create `LaunchNotFoundException extends RuntimeException` with an `id` constructor.

### Step 5: LaunchService — CRUD and validation
Implement business rules for creation and update.
- Paths:
    - `back/src/main/java/dev/aiddbot/abjavareact/launch/LaunchService.java`
- [ ] `getAll()`: return all launches mapped to `LaunchResponse` (include `rocketName` from `Rocket` lookup).
- [ ] `create(LaunchRequest)`: validate rocket exists, minimum occupancy ≤ rocket capacity; save with status `created`.
- [ ] `update(id, LaunchRequest)`: only allowed when status is `created`; reject otherwise with `IllegalStateException`.
- [ ] Map `Launch` → `LaunchResponse` in a private helper, resolving `rocketName` from `RocketRepository`.

### Step 6: LaunchService — status transitions
Enforce the allowed state machine for confirm and cancel.
- Paths:
    - `back/src/main/java/dev/aiddbot/abjavareact/launch/LaunchService.java`
- [ ] `confirm(id)`: transition `created` → `confirmed`; throw `IllegalStateException` for any other source status.
- [ ] `cancel(id)`: transition `created` or `confirmed` → `cancelled`; throw `IllegalStateException` for terminal statuses.
- [ ] On cancel, trigger refund logic stub for associated bookings (log or call a booking service method — do not implement full refund flow here).

### Step 7: LaunchController
Expose the REST endpoints per the API contract.
- Paths:
    - `back/src/main/java/dev/aiddbot/abjavareact/launch/LaunchController.java`
- [ ] `GET  /api/launches` → `200 List<LaunchResponse>`.
- [ ] `POST /api/launches` → `201 LaunchResponse`; use `@Valid` on request body.
- [ ] `PUT  /api/launches/{id}` → `200 LaunchResponse`.
- [ ] `POST /api/launches/{id}/confirm` → `200 LaunchResponse`.
- [ ] `POST /api/launches/{id}/cancel` → `200 LaunchResponse`.

### Step 8: Global exception handler — launch errors
Map domain exceptions to HTTP error responses.
- Paths:
    - `back/src/main/java/dev/aiddbot/abjavareact/shared/GlobalExceptionHandler.java`
- [ ] Handle `LaunchNotFoundException` → 404.
- [ ] Handle `IllegalStateException` (invalid transition / update on non-created) → 409 Conflict with message body.
- [ ] Handle `IllegalArgumentException` (occupancy > capacity, unknown rocket) → 422 Unprocessable Entity.
