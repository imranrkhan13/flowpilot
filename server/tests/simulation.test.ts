import { describe, it, expect } from 'vitest';
import { SimulationEngine } from '../src/simulation/engine.js';
import { stadiumScenario } from '../src/scenarios/fixtures.js';
import { findShortestPath, findPathAvoidingEdge } from '../src/simulation/graph.js';
import { calculateBottlenecks, classifyRisk } from '../src/simulation/bottleneck.js';
import { findRerouteRecommendations, applyReroute } from '../src/simulation/rerouter.js';
import { estimateOccupancy } from '../src/vision/detector.js';

describe('Venue Graph', () => {
  it('finds shortest path', () => {
    const path = findShortestPath(stadiumScenario.venue, 'north_gate', 'stage');
    expect(path.length).toBeGreaterThanOrEqual(2);
    expect(path[0]).toBe('north_gate');
    expect(path[path.length - 1]).toBe('stage');
  });
  it('finds path avoiding an edge', () => {
    const path = findPathAvoidingEdge(stadiumScenario.venue, 'north_gate', 'stage', 'e_jn_corridor_n');
    expect(path.length).toBeGreaterThanOrEqual(2);
  });
});

describe('Simulation Engine', () => {
  it('is deterministic with same seed', () => {
    const e1 = new SimulationEngine(stadiumScenario);
    const s1 = e1.run();
    const e2 = new SimulationEngine(stadiumScenario);
    const s2 = e2.run();
    expect(s1.length).toBe(s2.length);
    expect(s1[0].totalCrowd).toBe(s2[0].totalCrowd);
    expect(s1[10].peakDensity).toBe(s2[10].peakDensity);
    expect(s1[50].activeBottlenecks).toBe(s2[50].activeBottlenecks);
  });
  it('produces bottlenecks in stadium scenario', () => {
    const engine = new SimulationEngine(stadiumScenario);
    const states = engine.run();
    const maxBottlenecks = Math.max(...states.map((s) => s.activeBottlenecks));
    expect(maxBottlenecks).toBeGreaterThan(0);
    const criticalSteps = states.filter((s) => s.overallRisk === 'Critical' || s.overallRisk === 'High');
    expect(criticalSteps.length).toBeGreaterThan(0);
  });
  it('has valid zone states at every step', () => {
    const engine = new SimulationEngine(stadiumScenario);
    const states = engine.run();
    for (const state of states) {
      expect(state.zones.length).toBe(stadiumScenario.venue.edges.length);
      for (const z of state.zones) {
        expect(z.density).toBeGreaterThanOrEqual(0);
        expect(z.occupancy).toBeGreaterThanOrEqual(0);
        expect(z.queueLength).toBeGreaterThanOrEqual(0);
        expect(z.throughput).toBeGreaterThanOrEqual(0);
        expect(['Low', 'Moderate', 'High', 'Critical']).toContain(z.riskLabel);
        expect(isNaN(z.bottleneckScore)).toBe(false);
      }
      expect(state.totalCrowd).toBeGreaterThanOrEqual(0);
      expect(state.peakDensity).toBeGreaterThanOrEqual(0);
      expect(isNaN(state.avgWaitTime)).toBe(false);
    }
  });
  it('tracks throughput correctly', () => {
    const engine = new SimulationEngine(stadiumScenario);
    const states = engine.run();
    const totalThroughput = states.reduce((sum, s) => sum + s.totalThroughput, 0);
    expect(totalThroughput).toBeGreaterThan(0);
  });
});

describe('Bottleneck Detection', () => {
  it('scores 0 for empty edge', () => {
    expect(calculateBottlenecks(0, 100, 0, 0)).toBe(0);
  });
  it('scores high for full edge with queue', () => {
    const score = calculateBottlenecks(50, 50, 2, 100);
    expect(score).toBeGreaterThan(60);
  });
  it('classifies risk at boundaries', () => {
    expect(classifyRisk(0)).toBe('Low');
    expect(classifyRisk(39)).toBe('Low');
    expect(classifyRisk(40)).toBe('Moderate');
    expect(classifyRisk(59)).toBe('Moderate');
    expect(classifyRisk(60)).toBe('High');
    expect(classifyRisk(79)).toBe('High');
    expect(classifyRisk(80)).toBe('Critical');
    expect(classifyRisk(100)).toBe('Critical');
  });
});

describe('Rerouting', () => {
  it('finds recommendations when bottleneck exists', () => {
    const engine = new SimulationEngine(stadiumScenario);
    const states = engine.run();
    const peakState = states.reduce((max, s) => (s.activeBottlenecks > max.activeBottlenecks ? s : max), states[0]);
    const recs = findRerouteRecommendations(stadiumScenario.venue, peakState, 50);
    expect(recs.length).toBeGreaterThan(0);
    expect(recs[0].alternateRoute.length).toBeGreaterThanOrEqual(2);
    expect(recs[0].reason).toBeTruthy();
  });
  it('applies reroute and changes agent routes', () => {
    const engine = new SimulationEngine(stadiumScenario);
    const states = engine.run();
    const peakState = states.reduce((max, s) => (s.activeBottlenecks > max.activeBottlenecks ? s : max), states[0]);
    const recs = findRerouteRecommendations(stadiumScenario.venue, peakState, 50);
    expect(recs.length).toBeGreaterThan(0);
    const newScenario = applyReroute(stadiumScenario, recs[0]);
    const newEngine = new SimulationEngine(newScenario, true);
    const newStates = newEngine.run();
    expect(newStates.length).toBe(states.length);
    const oldPeakDensity = Math.max(...states.map((s) => s.peakDensity));
    const newPeakDensity = Math.max(...newStates.map((s) => s.peakDensity));
    expect(newPeakDensity).toBeLessThanOrEqual(oldPeakDensity * 1.05);
  });
});

describe('Vision / Occupancy', () => {
  it('returns DEMOMODE when no API token', async () => {
    const result = await estimateOccupancy('fakebase64', 'north_gate');
    expect(result.mode).toBe('DEMOMODE');
    expect(result.peopleCount).toBeGreaterThan(0);
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.timestamp).toBeTruthy();
  });
  it('returns deterministic fixture for same zone', async () => {
    const r1 = await estimateOccupancy('a', 'zone_a');
    const r2 = await estimateOccupancy('b', 'zone_a');
    expect(r1.peopleCount).toBe(r2.peopleCount);
    expect(r1.confidence).toBe(r2.confidence);
  });
});
