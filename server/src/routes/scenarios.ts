import { Router } from 'express';
import { z } from 'zod';
import { getScenario, getAllScenarios } from '../scenarios/fixtures.js';
import { SimulationEngine } from '../simulation/engine.js';
import { findRerouteRecommendations, applyReroute } from '../simulation/rerouter.js';
import { Scenario, BeforeAfterMetrics, SimulationState } from '../types/index.js';

const router = Router();

interface CachedSim {
  engine: SimulationEngine;
  states: SimulationState[];
  scenario: Scenario;
  interventionCount: number;
}

const simulationCache = new Map<string, CachedSim>();
const beforeAfterCache = new Map<string, BeforeAfterMetrics>();

router.get('/', (_req, res) => { res.json(getAllScenarios()); });

router.get('/:id', (req, res) => {
  const scenario = getScenario(req.params.id);
  if (!scenario) { res.status(404).json({ error: 'Scenario not found' }); return; }
  res.json(scenario);
});

const simulateSchema = z.object({ steps: z.number().int().min(1).max(500).optional(), reset: z.boolean().optional() });

router.post('/:id/simulate', (req, res) => {
  const scenario = getScenario(req.params.id);
  if (!scenario) { res.status(404).json({ error: 'Scenario not found' }); return; }
  const parse = simulateSchema.safeParse(req.body);
  if (!parse.success) { res.status(400).json({ error: 'Invalid request body', details: parse.error.format() }); return; }
  const shouldReset = parse.data.reset ?? true;
  const steps = parse.data.steps ?? scenario.totalSteps;
  let sim: CachedSim;
  if (shouldReset || !simulationCache.has(req.params.id)) {
    const engine = new SimulationEngine(scenario);
    const states = engine.run();
    sim = { engine, states, scenario, interventionCount: 0 };
    simulationCache.set(req.params.id, sim);
  } else {
    sim = simulationCache.get(req.params.id)!;
  }
  const limited = sim.states.slice(0, steps);
  res.json({ scenarioId: req.params.id, steps: limited.length, states: limited });
});

router.get('/:id/metrics', (req, res) => {
  const cached = simulationCache.get(req.params.id);
  if (!cached) { res.status(404).json({ error: 'No simulation found. Run simulate first.' }); return; }
  res.json(cached.states[cached.states.length - 1]);
});

router.get('/:id/states', (req, res) => {
  const cached = simulationCache.get(req.params.id);
  if (!cached) { res.status(404).json({ error: 'No simulation found. Run simulate first.' }); return; }
  res.json(cached.states);
});

router.post('/:id/reroute', (req, res) => {
  const scenario = getScenario(req.params.id);
  if (!scenario) { res.status(404).json({ error: 'Scenario not found' }); return; }
  const cached = simulationCache.get(req.params.id);
  if (!cached) { res.status(404).json({ error: 'No simulation found. Run simulate first.' }); return; }
  const lastState = cached.states[cached.states.length - 1];
  const recommendations = findRerouteRecommendations(scenario.venue, lastState, 50);
  if (recommendations.length === 0) {
    res.json({ message: 'No bottlenecks detected above threshold.', recommendations: [] });
    return;
  }
  const rec = recommendations[0];
  const newScenario = applyReroute(scenario, rec);
  const newEngine = new SimulationEngine(newScenario, true);
  const newStates = newEngine.run();
  const beforeAfter: BeforeAfterMetrics = { before: lastState, after: newStates[newStates.length - 1], recommendation: rec };
  simulationCache.set(req.params.id, { engine: newEngine, states: newStates, scenario: newScenario, interventionCount: cached.interventionCount + 1 });
  beforeAfterCache.set(req.params.id, beforeAfter);
  res.json({ recommendation: rec, beforeAfter, newStates });
});

router.get('/:id/beforeafter', (req, res) => {
  const ba = beforeAfterCache.get(req.params.id);
  if (!ba) { res.status(404).json({ error: 'No reroute performed yet.' }); return; }
  res.json(ba);
});

export default router;
