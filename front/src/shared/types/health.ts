export type Status = 'UP' | 'DOWN';

export type HealthResponse = {
  status: Status;
  database: Status;
  uptime: { seconds: number; since: string };
  timestamp: string;
};
