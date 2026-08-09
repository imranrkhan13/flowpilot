import { Scenario, SimulationState, BeforeAfterMetrics, VisionResult, RerouteRecommendation } from '../types';

const API_BASE = '/api';

export async function fetchScenarios(): Promise<Scenario[]> {
  const res = await fetch(`${API_BASE}/scenarios`);
  if (!res.ok) throw new Error('Failed to fetch scenarios');
  return res.json();
}

export async function fetchScenario(id: string): Promise<Scenario> {
  const res = await fetch(`${API_BASE}/scenarios/${id}`);
  if (!res.ok) throw new Error('Failed to fetch scenario');
  return res.json();
}

export async function runSimulation(id: string, steps?: number, reset = true): Promise<{ states: SimulationState[] }> {
  const res = await fetch(`${API_BASE}/scenarios/${id}/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ steps, reset }),
  });
  if (!res.ok) throw new Error('Simulation failed');
  return res.json();
}

export async function requestReroute(id: string): Promise<{
  beforeAfter: BeforeAfterMetrics;
  recommendation: RerouteRecommendation;
  newStates: SimulationState[];
}> {
  const res = await fetch(`${API_BASE}/scenarios/${id}/reroute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  if (!res.ok) throw new Error('Reroute failed');
  return res.json();
}

export async function estimateOccupancy(imageBase64: string, zoneId: string): Promise<VisionResult> {
  const res = await fetch(`${API_BASE}/vision/estimate-occupancy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, zoneId }),
  });
  if (!res.ok) throw new Error('Occupancy estimation failed');
  return res.json();
}
