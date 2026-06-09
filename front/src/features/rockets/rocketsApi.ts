import { httpClient } from '../../shared/api/httpClient';
import type { Rocket, RocketRequest } from '../../shared/types/rocket';

export class RocketsApi {
  async getAll(): Promise<Rocket[]> {
    console.log('[RocketsApi] fetching all rockets');
    return httpClient.get<Rocket[]>('/api/rockets');
  }

  async create(data: RocketRequest): Promise<Rocket> {
    console.log('[RocketsApi] creating rocket', data.name);
    return httpClient.post<Rocket>('/api/rockets', data);
  }

  async update(id: string, data: RocketRequest): Promise<Rocket> {
    console.log('[RocketsApi] updating rocket', id);
    return httpClient.put<Rocket>(`/api/rockets/${id}`, data);
  }

  async decommission(id: string): Promise<void> {
    console.log('[RocketsApi] decommissioning rocket', id);
    return httpClient.del(`/api/rockets/${id}`);
  }
}

export const rocketsApi = new RocketsApi();
