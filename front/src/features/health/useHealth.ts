import { useEffect, useState } from 'react';
import { getHealth } from './healthApi';
import type { HealthResponse } from '../../shared/types/health';

export function useHealth() {
  const [data, setData] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getHealth()
      .then((response) => {
        if (!active) return;
        if (response.status === 'DOWN') {
          setError(new Error('System reported an unhealthy status'));
          return;
        }
        setData(response);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause : new Error(String(cause)));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { data, error, isLoading } as const;
}
