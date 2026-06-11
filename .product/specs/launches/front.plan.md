---
plan-type: spec
container: front
---
# spec - launches - front

## Specification

The SPA must give operators a clear interface to manage launches and let passengers browse them.

- Operators see a launch list showing rocket name, scheduled time, price, minimum occupancy, and current status.
- Operators can create a new launch using a form that validates required fields.
- Operators can view the detail of a launch and trigger status changes (confirm, cancel).
- Passengers see a read-only list of launches in `confirmed` status available for booking.

**Context**: [spec.md](./spec.md)
**Architecture**: [front.arch.md](../../arch/front.arch.md)

### Data model

```typescript
// front/src/shared/types/launch.ts
type LaunchStatus = 'created' | 'confirmed' | 'completed' | 'cancelled';

interface Launch {
  id: string;
  rocketId: string;
  rocketName: string;
  scheduledAt: string;       // ISO 8601 datetime string
  pricePerTicket: number;
  minimumOccupancy: number;
  status: LaunchStatus;
}

interface LaunchRequest {
  rocketId: string;
  scheduledAt: string;
  pricePerTicket: number;
  minimumOccupancy: number;
}
```

## Implementation Steps

### Step 1: Domain types
Ensure the shared type definitions match the API contract.
- Paths:
    - `front/src/shared/types/launch.ts`
- [ ] Define `LaunchStatus` union type: `'created' | 'confirmed' | 'completed' | 'cancelled'`.
- [ ] Define `Launch` interface with: `id`, `rocketId`, `rocketName`, `scheduledAt`, `pricePerTicket`, `minimumOccupancy`, `status`.
- [ ] Define `LaunchRequest` interface with: `rocketId`, `scheduledAt`, `pricePerTicket`, `minimumOccupancy`.

### Step 2: API service
Wrap all launch HTTP calls in a typed service module.
- Paths:
    - `front/src/features/launches/launchesApi.ts`
    - `front/src/features/launches/launchesApi.test.ts`
- [ ] `getLaunches(): Promise<Launch[]>` — `GET /api/launches`.
- [ ] `createLaunch(req: LaunchRequest): Promise<Launch>` — `POST /api/launches`.
- [ ] `updateLaunch(id: string, req: LaunchRequest): Promise<Launch>` — `PUT /api/launches/:id`.
- [ ] `confirmLaunch(id: string): Promise<Launch>` — `PATCH /api/launches/:id/confirm`.
- [ ] `cancelLaunch(id: string): Promise<Launch>` — `PATCH /api/launches/:id/cancel`.
- [ ] Unit tests: mock `httpClient`, assert correct method + URL for each function.

### Step 3: useLaunches hook
Centralize launch state, loading flags, and action dispatchers.
- Paths:
    - `front/src/features/launches/useLaunches.ts`
    - `front/src/features/launches/useLaunches.test.ts`
- [ ] State: `launches: Launch[]`, `isLoading: boolean`, `error: string | null`.
- [ ] Actions: `schedule(req)`, `update(id, req)`, `confirm(id)`, `cancel(id)` — each updates state optimistically or re-fetches on success.
- [ ] Return shape: `{ launches, isLoading, error, schedule, update, confirm, cancel }`.
- [ ] Unit tests: mock `launchesApi`, assert state transitions for each action.

### Step 4: LaunchManifest component — operator view
Build the operator management UI: list, create form, and status actions.
- Paths:
    - `front/src/features/launches/LaunchManifest.tsx`
    - `front/src/features/launches/LaunchManifest.test.tsx`
- [ ] Accept `rockets: Rocket[]` as prop (from `useRockets`) for the rocket selector in the create form.
- [ ] Render a table/list of all launches showing: rocket name, scheduled time, price per ticket, minimum occupancy, status.
- [ ] Render a create-launch form with: rocket selector, datetime input, price input, minimum occupancy input. Validate all fields client-side before submit.
- [ ] For each launch row in `created` status: show "Confirm" and "Cancel" action buttons.
- [ ] For each launch in `confirmed` status: show "Cancel" action button only.
- [ ] Disable action buttons while `isLoading` is true to prevent double-submit.
- [ ] Display `error` from the hook if non-null.
- [ ] Unit tests: render with fixture launches and assert buttons appear per status.

### Step 5: Passenger available-launches view
Show passengers only `confirmed` launches as a read-only list.
- Paths:
    - `front/src/features/launches/LaunchManifest.tsx`
- [ ] Add a separate read-only section (or tab) that filters `launches` to `status === 'confirmed'`.
- [ ] Display: rocket name, scheduled time, price per ticket, available seats (rocket capacity − current booking count if available, else omit).
- [ ] No action buttons in this view.

### Step 6: Wire into App
Compose `LaunchManifest` into the root component and supply the rockets list.
- Paths:
    - `front/src/App.tsx`
- [ ] Import and render `<LaunchManifest rockets={rockets} />` below `RocketFleet`, using `rockets` already loaded by `useRockets`.
- [ ] Pass the `useLaunches` hook result through or let `LaunchManifest` call `useLaunches` internally (prefer internal to avoid prop-drilling state).
