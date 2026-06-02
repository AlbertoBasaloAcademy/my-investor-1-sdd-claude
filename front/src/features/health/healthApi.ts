import { httpClient } from '../../shared/api/httpClient';
import type { HealthResponse } from '../../shared/types/health';

export async function getHealth(): Promise<HealthResponse> {
  return httpClient.get<HealthResponse>('/api/health');
}
