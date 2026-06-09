---
description: Code rules for the front container of AstroBookings
paths: ["front/src/**"]
---
# Front code rules — AstroBookings

## Summary

Feature-based colocation: each domain folder owns its component, hook, API service, and tests. The critical principle is strict layer isolation — components never call `httpClient` directly; hooks never import `httpClient`; only API service classes do.

## Naming

| Element | Convention | Example |
|---------|------------|---------|
| Feature folders | `kebab-case` | `rockets/`, `launches/` |
| Component files | `PascalCase.tsx` | `RocketFleet.tsx` |
| Hook files | `use{Domain}.ts` | `useRockets.ts` |
| API service files | `{domain}Api.ts` | `rocketsApi.ts` |
| Type files | `{domain}.ts` | `rocket.ts` |
| Test files | `{file}.test.{ts,tsx}` | `useRockets.test.ts` |
| CSS files | `{Component}.css` | `RocketFleet.css` |
| Interfaces / Types | `PascalCase` | `Rocket`, `RocketRequest`, `LaunchStatus` |
| Functions / Variables | `camelCase` | `useRockets`, `rocketsApi` |
| Constants / Env keys | `UPPER_SNAKE` / `VITE_` prefix | `VITE_API_BASE_URL` |

## Artifact roles

| Role | Structural rule (one line) |
|------|----------------------------|
| Component (`*.tsx`) | Renders UI; calls one or more hooks; never fetches directly |
| Hook (`use*.ts`) | Owns `useState` + `useEffect`; calls API service; returns `{ data, error, isLoading, ...actions } as const` |
| API service (`*Api.ts`) | Class with async methods; calls only `httpClient`; exports a singleton instance |
| `httpClient` | Single generic fetch wrapper; reads `VITE_API_BASE_URL`; never imported outside `*Api.ts` |
| Types (`shared/types/*.ts`) | Plain interfaces/unions; no logic; imported by both hooks and services |
| Test (`*.test.{ts,tsx}`) | Vitest + Testing Library; mocks the layer below (component mocks hook; hook mocks API; API mocks httpClient) |

## Canonical example

> `useRockets.ts` — the representative hook: load-on-mount, stable actions, error normalization.

```typescript
export function useRockets() {
  const [rockets, setRockets] = useState<Rocket[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(() => {
    setIsLoading(true);
    setError(null);
    rocketsApi
      .getAll()
      .then(setRockets)
      .catch((cause: unknown) => {
        setError(cause instanceof Error ? cause : new Error(String(cause)));
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = useCallback(async (data: RocketRequest): Promise<void> => {
    try {
      const rocket = await rocketsApi.create(data);
      setRockets((prev) => [...prev, rocket]);
    } catch (cause: unknown) {
      throw cause instanceof Error ? cause : new Error(String(cause));
    }
  }, []);

  return { rockets, error, isLoading, create, update, decommission } as const;
}
```

## Conventions

- **Wiring**: hooks import their API service singleton directly (`import { rocketsApi } from './rocketsApi'`); no dependency injection or context.
- **Errors**: always normalize to `Error` instances (`cause instanceof Error ? cause : new Error(String(cause))`); hooks hold `error: Error | null`; components display `error.message`.
- **Testing**: colocated `*.test.{ts,tsx}` files; mock the immediate layer below only; use `vi.mock` + `vi.mocked`; clear mocks in `beforeEach`; use `data-testid` for queries.
- **Avoid**: importing `httpClient` outside `*Api.ts` files (breaks layer isolation); using `any` instead of generics in HTTP calls; mixing data-fetching logic inside components; skipping `as const` on hook return objects (loses literal type inference).
