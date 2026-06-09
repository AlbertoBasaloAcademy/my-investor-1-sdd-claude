import { httpClient } from '../../shared/api/httpClient';
import type { Launch, LaunchRequest } from '../../shared/types/launch';

export class LaunchesApi {
  async getAll(): Promise<Launch[]> {
    console.log('[LaunchesApi] fetching all launches');
    return httpClient.get<Launch[]>('/api/launches');
  }

  async create(data: LaunchRequest): Promise<Launch> {
    console.log('[LaunchesApi] creating launch');
    return httpClient.post<Launch>('/api/launches', data);
  }

  async update(id: string, data: LaunchRequest): Promise<Launch> {
    console.log('[LaunchesApi] updating launch', id);
    return httpClient.put<Launch>(`/api/launches/${id}`, data);
  }

  async confirm(id: string): Promise<Launch> {
    console.log('[LaunchesApi] confirming launch', id);
    return httpClient.post<Launch>(`/api/launches/${id}/confirm`, {});
  }

  async cancel(id: string): Promise<Launch> {
    console.log('[LaunchesApi] cancelling launch', id);
    return httpClient.post<Launch>(`/api/launches/${id}/cancel`, {});
  }
}

export const launchesApi = new LaunchesApi();
