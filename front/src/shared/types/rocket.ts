export type Range = 'Earth' | 'Moon' | 'Mars';

export interface Rocket {
  id: string;
  name: string;
  capacity: number;
  range: Range;
}

export interface RocketRequest {
  name: string;
  capacity: number;
  range: Range;
}
