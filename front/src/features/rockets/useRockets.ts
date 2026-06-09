import { useCallback, useEffect, useState } from 'react';
import { rocketsApi } from './rocketsApi';
import type { Rocket, RocketRequest } from '../../shared/types/rocket';

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

  useEffect(() => {
    load();
  }, [load]);

  const create = useCallback(
    async (data: RocketRequest): Promise<void> => {
      try {
        const rocket = await rocketsApi.create(data);
        setRockets((prev) => [...prev, rocket]);
      } catch (cause: unknown) {
        throw cause instanceof Error ? cause : new Error(String(cause));
      }
    },
    [],
  );

  const update = useCallback(
    async (id: string, data: RocketRequest): Promise<void> => {
      try {
        const rocket = await rocketsApi.update(id, data);
        setRockets((prev) => prev.map((r) => (r.id === id ? rocket : r)));
      } catch (cause: unknown) {
        throw cause instanceof Error ? cause : new Error(String(cause));
      }
    },
    [],
  );

  const decommission = useCallback(
    async (id: string): Promise<void> => {
      try {
        await rocketsApi.decommission(id);
        setRockets((prev) => prev.filter((r) => r.id !== id));
      } catch (cause: unknown) {
        throw cause instanceof Error ? cause : new Error(String(cause));
      }
    },
    [],
  );

  return { rockets, error, isLoading, create, update, decommission } as const;
}
