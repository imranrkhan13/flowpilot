export interface Point {
  x: number;
  y: number;
}

export interface VenueNode {
  id: string;
  label: string;
  type: 'gate' | 'junction' | 'corridor' | 'exit' | 'food' | 'toilet' | 'stage' | 'emergency';
  position: Point;
  capacity?: number;
  throughput?: number;
}

export interface VenueEdge {
  id: string;
  from: string;
  to: string;
  length: number;
  width: number;
  capacity: number;
  baseTravelTime: number;
  bidirectional: boolean;
}

export interface VenueGraph {
  nodes: VenueNode[];
  edges: VenueEdge[];
}

export interface AgentGroup {
  id: string;
  originId: string;
  destinationId: string;
  count: number;
  walkingSpeed: number;
  arrivalTime: number;
  route: string[];
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  venue: VenueGraph;
  agents: AgentGroup[];
  totalSteps: number;
  stepDuration: number;
  seed: number;
}

export interface ZoneState {
  edgeId: string;
  occupancy: number;
  density: number;
  queueLength: number;
  waitTime: number;
  throughput: number;
  bottleneckScore: number;
  riskLabel: 'Low' | 'Moderate' | 'High' | 'Critical';
  timeToThreshold: number | null;
}

export interface SimulationState {
  step: number;
  zones: ZoneState[];
  totalCrowd: number;
  peakDensity: number;
  avgWaitTime: number;
  totalThroughput: number;
  activeBottlenecks: number;
  overallRisk: 'Low' | 'Moderate' | 'High' | 'Critical';
  agentPositions: Record<string, Point[]>;
  interventionApplied: boolean;
}

export interface RerouteRecommendation {
  id: string;
  affectedEdgeId: string;
  affectedEdgeLabel: string;
  reason: string;
  alternateRoute: string[];
  alternateRouteLabels: string[];
  expectedImprovement: {
    densityReduction: number;
    waitTimeReduction: number;
    throughputIncrease: number;
  };
  confidence: 'Low' | 'Medium' | 'High';
}

export interface BeforeAfterMetrics {
  before: SimulationState;
  after: SimulationState;
  recommendation: RerouteRecommendation;
}

export interface VisionResult {
  mode: 'LIVEMODE' | 'DEMOMODE';
  modelName: string;
  peopleCount: number;
  confidence: number;
  zoneId?: string;
  timestamp: string;
  error?: string;
}

export interface OccupancyRequest {
  imageBase64: string;
  zoneId: string;
}

export interface LiveGateCounter {
  gateId: string;
  gateLabel: string;
  scansLastMinute: number;
  peopleInside: number;
  status: 'Open' | 'Busy' | 'Full';
}

export interface LiveFeedSnapshot {
  updatedAt: string;
  totalScans: number;
  peopleInside: number;
  gates: LiveGateCounter[];
  sourceLabel: string;
  isDemo: boolean;
}

export interface SimulationResponse {
  scenarioId: string;
  steps: number;
  states: SimulationState[];
}

export interface RerouteResponse {
  recommendation: RerouteRecommendation;
  beforeAfter: BeforeAfterMetrics;
  newStates: SimulationState[];
}
