import { Scenario, SimulationState, ZoneState, InternalAgent, SimulationConfig, Point } from '../types/index.js';
import { findShortestPath, getEdgeBetween } from './graph.js';
import { createAgentsFromGroups } from './agent.js';
import { calculateBottlenecks, classifyRisk, timeToCritical } from './bottleneck.js';
import { computeMetrics } from './metrics.js';

export class SimulationEngine {
  private scenario: Scenario;
  private config: SimulationConfig;
  private agents: InternalAgent[] = [];
  private step = 0;
  private rng: () => number;
  private edgeOccupancy = new Map<string, number>();
  private edgeQueue = new Map<string, InternalAgent[]>();
  private agentPositions = new Map<string, Point[]>();
  private edgeTraversals = new Map<string, number>();
  private interventionApplied = false;

  constructor(scenario: Scenario, interventionApplied = false) {
    this.scenario = scenario;
    this.config = { seed: scenario.seed, stepDuration: scenario.stepDuration, totalSteps: scenario.totalSteps };
    this.interventionApplied = interventionApplied;
    this.rng = this.seededRandom(scenario.seed);
    this.initialize();
  }

  private seededRandom(seed: number): () => number {
    let s = seed;
    return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  }

  private initialize() {
    this.agents = createAgentsFromGroups(this.scenario.agents, this.rng);
    for (const edge of this.scenario.venue.edges) {
      this.edgeOccupancy.set(edge.id, 0);
      this.edgeQueue.set(edge.id, []);
      this.edgeTraversals.set(edge.id, 0);
    }
    for (const node of this.scenario.venue.nodes) this.agentPositions.set(node.id, []);
  }

  run(): SimulationState[] {
    const states: SimulationState[] = [];
    for (let i = 0; i < this.config.totalSteps; i++) states.push(this.tick());
    return states;
  }

  tick(): SimulationState {
    for (const edge of this.scenario.venue.edges) this.edgeTraversals.set(edge.id, 0);
    this.spawnAgents();
    this.moveAgents();
    this.processQueues();
    this.updatePositions();
    const zones = this.calculateZones();
    const metrics = computeMetrics(zones, this.agents, this.config, this.interventionApplied);
    const state: SimulationState = { step: this.step, zones, ...metrics, agentPositions: Object.fromEntries(this.agentPositions) };
    this.step++;
    return state;
  }

  private spawnAgents() {
    for (const agent of this.agents) {
      if (agent.state !== 'arrived' || agent.waitStartStep !== null) continue;
      const group = this.scenario.agents.find((g) => g.id === agent.groupId);
      if (!group) continue;
      if (this.step >= group.arrivalTime) {
        agent.state = 'waiting';
        agent.waitStartStep = this.step;
        agent.currentNodeId = agent.originId;
        agent.routeIndex = 0;
        if (agent.route.length < 2 || agent.route[0] !== agent.originId || agent.route[agent.route.length - 1] !== agent.destinationId) {
          const path = findShortestPath(this.scenario.venue, agent.originId, agent.destinationId);
          if (path.length >= 2) agent.route = path;
          else { agent.state = 'arrived'; continue; }
        }
        agent.nextNodeId = agent.route[1] ?? null;
      }
    }
  }

  private moveAgents() {
    for (const agent of this.agents) {
      if (agent.state !== 'waiting') continue;
      if (!agent.nextNodeId) { agent.state = 'arrived'; continue; }
      const edge = getEdgeBetween(this.scenario.venue, agent.currentNodeId, agent.nextNodeId);
      if (!edge) {
        const remainingPath = findShortestPath(this.scenario.venue, agent.currentNodeId, agent.destinationId);
        if (remainingPath.length >= 2) { agent.route = remainingPath; agent.routeIndex = 0; agent.nextNodeId = agent.route[1] ?? null; }
        else { agent.state = 'arrived'; }
        continue;
      }
      const currentOcc = this.edgeOccupancy.get(edge.id) ?? 0;
      if (currentOcc < edge.capacity) {
        this.edgeOccupancy.set(edge.id, currentOcc + 1);
        agent.state = 'moving'; agent.progress = 0; agent.waitStartStep = null;
      } else {
        const queue = this.edgeQueue.get(edge.id) ?? [];
        if (!queue.some((a) => a.id === agent.id)) queue.push(agent);
        this.edgeQueue.set(edge.id, queue);
      }
    }
  }

  private processQueues() {
    for (const edge of this.scenario.venue.edges) {
      const queue = this.edgeQueue.get(edge.id) ?? [];
      const currentOcc = this.edgeOccupancy.get(edge.id) ?? 0;
      const available = Math.max(0, edge.capacity - currentOcc);
      const toMove = queue.splice(0, available);
      this.edgeQueue.set(edge.id, queue);
      for (const agent of toMove) {
        this.edgeOccupancy.set(edge.id, (this.edgeOccupancy.get(edge.id) ?? 0) + 1);
        agent.state = 'moving'; agent.progress = 0; agent.waitStartStep = null;
      }
    }
  }

  private updatePositions() {
    for (const key of this.agentPositions.keys()) this.agentPositions.set(key, []);
    for (const agent of this.agents) {
      if (agent.state === 'moving' && agent.nextNodeId) {
        const edge = getEdgeBetween(this.scenario.venue, agent.currentNodeId, agent.nextNodeId);
        if (!edge) continue;
        const fromNode = this.scenario.venue.nodes.find((n) => n.id === agent.currentNodeId);
        const toNode = this.scenario.venue.nodes.find((n) => n.id === agent.nextNodeId);
        if (!fromNode || !toNode) continue;
        const speedFraction = agent.speed / edge.length;
        agent.progress += speedFraction * this.config.stepDuration;
        if (agent.progress >= 1) {
          agent.progress = 0;
          this.edgeOccupancy.set(edge.id, Math.max(0, (this.edgeOccupancy.get(edge.id) ?? 0) - 1));
          this.edgeTraversals.set(edge.id, (this.edgeTraversals.get(edge.id) ?? 0) + 1);
          agent.currentNodeId = agent.nextNodeId;
          agent.routeIndex++;
          agent.nextNodeId = agent.route[agent.routeIndex + 1] ?? null;
          if (!agent.nextNodeId) agent.state = 'arrived';
          else { agent.state = 'waiting'; agent.waitStartStep = this.step; }
        } else {
          const x = fromNode.position.x + (toNode.position.x - fromNode.position.x) * agent.progress;
          const y = fromNode.position.y + (toNode.position.y - fromNode.position.y) * agent.progress;
          const positions = this.agentPositions.get(edge.id) ?? [];
          positions.push({ x, y });
          this.agentPositions.set(edge.id, positions);
        }
      } else if (agent.state === 'waiting' || agent.state === 'arrived') {
        const node = this.scenario.venue.nodes.find((n) => n.id === agent.currentNodeId);
        if (node) {
          const positions = this.agentPositions.get(node.id) ?? [];
          const jitter = 10;
          positions.push({ x: node.position.x + (this.rng() - 0.5) * jitter, y: node.position.y + (this.rng() - 0.5) * jitter });
          this.agentPositions.set(node.id, positions);
        }
      }
    }
  }

  private calculateZones(): ZoneState[] {
    const zones: ZoneState[] = [];
    for (const edge of this.scenario.venue.edges) {
      const occupancy = this.edgeOccupancy.get(edge.id) ?? 0;
      const queue = this.edgeQueue.get(edge.id) ?? [];
      const area = edge.length * edge.width;
      const density = area > 0 ? occupancy / area : 0;
      const throughput = this.edgeTraversals.get(edge.id) ?? 0;
      const waitTime = queue.length > 0 && throughput > 0 ? (queue.length / throughput) * this.config.stepDuration : queue.length > 0 ? queue.length * this.config.stepDuration : 0;
      const bottleneckScore = calculateBottlenecks(occupancy, edge.capacity, density, queue.length);
      const riskLabel = classifyRisk(bottleneckScore);
      const queueGrowthRate = Math.max(0, throughput);
      const timeToThreshold = timeToCritical(bottleneckScore, occupancy, edge.capacity, queueGrowthRate);
      zones.push({
        edgeId: edge.id, occupancy: Math.max(0, occupancy),
        density: parseFloat(Math.max(0, density).toFixed(2)),
        queueLength: Math.max(0, queue.length),
        waitTime: parseFloat(Math.max(0, waitTime).toFixed(1)),
        throughput: Math.max(0, throughput),
        bottleneckScore: parseFloat(Math.max(0, bottleneckScore).toFixed(2)),
        riskLabel, timeToThreshold,
      });
    }
    return zones;
  }

  getCurrentState(): SimulationState { return this.tick(); }
  getScenario(): Scenario { return this.scenario; }
  getAgents(): InternalAgent[] { return this.agents; }
}
