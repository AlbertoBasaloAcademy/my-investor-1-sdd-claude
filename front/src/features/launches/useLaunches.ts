import { useCallback, useEffect, useState } from 'react';
import { launchesApi } from './launchesApi';
import type { Launch, LaunchRequest } from '../../shared/types/launch';

export function useLaunches() {
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(() => {
    setIsLoading(true);
    setError(null);
    launchesApi
      .getAll()
      .then(setLaunches)
      .catch((cause: unknown) => {
        setError(cause instanceof Error ? cause : new Error(String(cause)));
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const create = useCallback(async (data: LaunchRequest): Promise<void> => {
    try {
      const launch = await launchesApi.create(data);
      setLaunches((prev) => [...prev, launch]);
    } catch (cause: unknown) {
      throw cause instanceof Error ? cause : new Error(String(cause));
    }
  }, []);

  const update = useCallback(async (id: string, data: LaunchRequest): Promise<void> => {
    try {
      const launch = await launchesApi.update(id, data);
      setLaunches((prev) => prev.map((l) => (l.id === id ? launch : l)));
    } catch (cause: unknown) {
      throw cause instanceof Error ? cause : new Error(String(cause));
    }
  }, []);

  const confirm = useCallback(async (id: string): Promise<void> => {
    try {
      const launch = await launchesApi.confirm(id);
      setLaunches((prev) => prev.map((l) => (l.id === id ? launch : l)));
    } catch (cause: unknown) {
      throw cause instanceof Error ? cause : new Error(String(cause));
    }
  }, []);

  const cancel = useCallback(async (id: string): Promise<void> => {
    try {
      const launch = await launchesApi.cancel(id);
      setLaunches((prev) => prev.map((l) => (l.id === id ? launch : l)));
    } catch (cause: unknown) {
      throw cause instanceof Error ? cause : new Error(String(cause));
    }
  }, []);

  return { launches, error, isLoading, create, update, confirm, cancel } as const;
}
