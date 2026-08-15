import { Router } from 'express';
import { z } from 'zod';
import { getScenario } from '../scenarios/fixtures.js';
import { answerCrowdQuestion } from '../crowd/advisor.js';

const router = Router();

const liveFeedSchema = z.object({
  updatedAt: z.string(),
  totalScans: z.number(),
  peopleInside: z.number(),
  gates: z.array(z.object({
    gateId: z.string(),
    gateLabel: z.string(),
    scansLastMinute: z.number(),
    peopleInside: z.number(),
    status: z.enum(['Open', 'Busy', 'Full']),
  })),
  sourceLabel: z.string(),
  isDemo: z.boolean(),
}).nullable();

const stateSchema = z.object({
  step: z.number(),
  totalCrowd: z.number(),
  peakDensity: z.number(),
  avgWaitTime: z.number(),
  activeBottlenecks: z.number(),
  overallRisk: z.enum(['Low', 'Moderate', 'High', 'Critical']),
}).passthrough().nullable();

const recommendationSchema = z.object({
  affectedEdgeLabel: z.string(),
  reason: z.string(),
  alternateRouteLabels: z.array(z.string()),
  confidence: z.enum(['Low', 'Medium', 'High']),
}).passthrough().nullable();

const askSchema = z.object({
  question: z.string().trim().min(2).max(500),
  scenarioId: z.string().min(1),
  liveFeed: liveFeedSchema,
  currentState: stateSchema,
  recommendation: recommendationSchema,
});

router.post('/ask', async (req, res) => {
  const parse = askSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: 'Please ask a short question about the crowd.', details: parse.error.format() });
    return;
  }

  const scenario = getScenario(parse.data.scenarioId);
  if (!scenario) {
    res.status(404).json({ error: 'We could not find this place.' });
    return;
  }

  try {
    const result = await answerCrowdQuestion({
      question: parse.data.question,
      scenario: { id: scenario.id, name: scenario.name, description: scenario.description },
      liveFeed: parse.data.liveFeed,
      currentState: parse.data.currentState,
      recommendation: parse.data.recommendation,
    });
    res.json(result);
  } catch (error) {
    console.error('Crowd advisor failed', error);
    res.status(500).json({ error: 'The crowd helper is unavailable right now. Please try again.' });
  }
});

export default router;
