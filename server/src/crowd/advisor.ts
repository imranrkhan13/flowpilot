import { LiveFeedSnapshot, RerouteRecommendation, Scenario, SimulationState } from '../types/index.js';

export interface CrowdQuestionContext {
  question: string;
  scenario: Pick<Scenario, 'id' | 'name' | 'description'>;
  liveFeed: LiveFeedSnapshot | null;
  currentState: Pick<SimulationState, 'step' | 'totalCrowd' | 'peakDensity' | 'avgWaitTime' | 'activeBottlenecks' | 'overallRisk'> | null;
  recommendation: Pick<RerouteRecommendation, 'affectedEdgeLabel' | 'reason' | 'alternateRouteLabels' | 'confidence'> | null;
}

interface ChatProvider {
  name: string;
  endpoint: string;
  apiKey: string;
  model: string;
}

function getProviders(): ChatProvider[] {
  const providers: ChatProvider[] = [];
  if (process.env.OPENROUTER_API) providers.push({ name: 'OpenRouter', endpoint: 'https://openrouter.ai/api/v1/chat/completions', apiKey: process.env.OPENROUTER_API, model: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini' });
  if (process.env.GROQ_API) providers.push({ name: 'Groq', endpoint: 'https://api.groq.com/openai/v1/chat/completions', apiKey: process.env.GROQ_API, model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant' });
  if (process.env.MISTRAL_API) providers.push({ name: 'Mistral', endpoint: 'https://api.mistral.ai/v1/chat/completions', apiKey: process.env.MISTRAL_API, model: process.env.MISTRAL_MODEL || 'mistral-small-latest' });
  return providers;
}

function buildPrompt(context: CrowdQuestionContext): string {
  const feed = context.liveFeed ? {
    updatedAt: context.liveFeed.updatedAt,
    totalScans: context.liveFeed.totalScans,
    peopleInside: context.liveFeed.peopleInside,
    gates: context.liveFeed.gates.map((gate) => ({ gate: gate.gateLabel, scansLastMinute: gate.scansLastMinute, peopleInside: gate.peopleInside, status: gate.status })),
  } : null;
  const state = context.currentState ? {
    step: context.currentState.step,
    peopleOnMap: context.currentState.totalCrowd,
    crowdedSpots: context.currentState.activeBottlenecks,
    averageWaitSeconds: context.currentState.avgWaitTime,
    peakDensity: context.currentState.peakDensity,
  } : null;
  const recommendation = context.recommendation ? {
    crowdedPath: context.recommendation.affectedEdgeLabel,
    reason: context.recommendation.reason,
    newRoute: context.recommendation.alternateRouteLabels,
    certainty: context.recommendation.confidence,
  } : null;

  return [
    `Place: ${context.scenario.name}. ${context.scenario.description}`,
    `Live ticket and gate data: ${JSON.stringify(feed)}`,
    `Crowd movement snapshot: ${JSON.stringify(state)}`,
    `Current route advice: ${JSON.stringify(recommendation)}`,
    `Question: ${context.question}`,
  ].join('\n');
}

function demoAnswer(context: CrowdQuestionContext): string {
  const busiest = context.liveFeed?.gates.slice().sort((a, b) => b.scansLastMinute - a.scansLastMinute)[0];
  if (!busiest) return 'I do not have live gate data yet. Start the place view and ask again when the feed appears.';
  if (/why|cause|reason|kyun|kyon|wajah|kaaran|bheed kyu|bheed kyun/i.test(context.question)) return `${busiest.gateLabel} is getting the most ticket scans right now, so more people are entering there than the other gates. The sample data marks it as ${busiest.status.toLowerCase()}.`;
  if (/where|which|gate|busy|crowd|bheed|kahan|kaunsa|konsa|vyast/i.test(context.question)) return `${busiest.gateLabel} is the busiest gate right now, with about ${busiest.scansLastMinute} scans in the last minute and ${busiest.peopleInside} people counted inside.`;
  if (/route|move|send|do|help|raasta|rasta|asan|aasaan|easy|jaun|jaana|use karu|chalun/i.test(context.question)) return context.recommendation ? `Try the suggested route through ${context.recommendation.alternateRouteLabels.join(' → ')}. It is meant to take pressure off ${context.recommendation.affectedEdgeLabel}.` : 'The app is still watching the gates. Press Play and wait for a crowded spot before trying a new route.';
  return `Right now, ${busiest.gateLabel} has the most activity. I can explain the busiest gate, why pressure is building, or what route to try next.`;
}

async function callProvider(provider: ChatProvider, prompt: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    const response = await fetch(provider.endpoint, {
      method: 'POST',
      headers: { Authorization: `Bearer ${provider.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: provider.model,
        temperature: 0.2,
        max_tokens: 220,
        messages: [
          { role: 'system', content: 'You are FlowPilot, a calm crowd helper. Understand simple English, Hindi, and Romanized Hinglish such as “kaunsa route easy hai?”, “kahan bheed hai?”, and “kaunsa gate use karun?”. Reply in the same language style as the question when possible. Keep the wording easy and short. Use only the data in the prompt. Mention when something is a sample or estimate. Never invent a gate, number, or route. Do not give emergency or medical advice. Keep the answer under 90 words.' },
          { role: 'user', content: prompt },
        ],
      }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`${provider.name} returned ${response.status}`);
    const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const answer = payload.choices?.[0]?.message?.content?.trim();
    if (!answer) throw new Error(`${provider.name} returned no answer`);
    return answer;
  } finally {
    clearTimeout(timeout);
  }
}

export async function answerCrowdQuestion(context: CrowdQuestionContext): Promise<{ answer: string; mode: 'live-ai' | 'demo'; provider?: string }> {
  const prompt = buildPrompt(context);
  for (const provider of getProviders()) {
    try {
      return { answer: await callProvider(provider, prompt), mode: 'live-ai', provider: provider.name };
    } catch (error) {
      console.warn(`Crowd advisor provider failed: ${provider.name}`, error);
    }
  }
  return { answer: demoAnswer(context), mode: 'demo' };
}
