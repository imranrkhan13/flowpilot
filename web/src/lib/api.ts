import { Scenario, SimulationState, BeforeAfterMetrics, VisionResult, RerouteRecommendation, LiveFeedSnapshot } from '../types';

const API_BASE = '/api';

export async function fetchScenarios(): Promise<Scenario[]> {
  const res = await fetch(`${API_BASE}/scenarios`);
  if (!res.ok) throw new Error('We could not load the places');
  return res.json();
}

export async function fetchScenario(id: string): Promise<Scenario> {
  const res = await fetch(`${API_BASE}/scenarios/${id}`);
  if (!res.ok) throw new Error('We could not load this place');
  return res.json();
}

export async function runSimulation(id: string, steps?: number, reset = true): Promise<{ states: SimulationState[] }> {
  const res = await fetch(`${API_BASE}/scenarios/${id}/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ steps, reset }),
  });
  if (!res.ok) throw new Error('We could not start the crowd movement');
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
  if (!res.ok) throw new Error('We could not try the new route');
  return res.json();
}

export async function askCrowdQuestion(input: {
  question: string;
  scenarioId: string;
  liveFeed: LiveFeedSnapshot | null;
  currentState: SimulationState | null;
  recommendation: RerouteRecommendation | null;
}): Promise<{ answer: string; mode: 'live-ai' | 'demo'; provider?: string }> {
  const res = await fetch(`${API_BASE}/crowd/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const payload = await res.json().catch(() => null) as { error?: string } | null;
    throw new Error(payload?.error || 'We could not answer that question');
  }
  return res.json();
}

export async function estimateOccupancy(imageBase64: string, zoneId: string): Promise<VisionResult> {
  const res = await fetch(`${API_BASE}/vision/estimate-occupancy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, zoneId }),
  });
  if (!res.ok) throw new Error('We could not check this photo');
  return res.json();
}
