export * from '../../../shared/types.js';

export interface SimulationConfig {
  seed: number;
  stepDuration: number;
  totalSteps: number;
}

export interface InternalAgent {
  id: string;
  groupId: string;
  originId: string;
  destinationId: string;
  currentNodeId: string;
  nextNodeId: string | null;
  progress: number;
  speed: number;
  state: 'waiting' | 'moving' | 'arrived';
  waitStartStep: number | null;
  route: string[];
  routeIndex: number;
}
