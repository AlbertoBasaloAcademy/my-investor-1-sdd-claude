export type LaunchStatus = 'created' | 'confirmed' | 'completed' | 'cancelled';

export interface Launch {
  id: string;
  rocketId: string;
  rocketName: string;
  scheduledAt: string;
  pricePerTicket: number;
  minimumOccupancy: number;
  status: LaunchStatus;
}

export interface LaunchRequest {
  rocketId: string;
  scheduledAt: string;
  pricePerTicket: number;
  minimumOccupancy: number;
}
