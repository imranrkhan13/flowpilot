import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchScenario, requestReroute, runSimulation } from '../lib/api';
import { BeforeAfterMetrics, LiveFeedSnapshot, LiveGateCounter, RerouteRecommendation, Scenario, SimulationState } from '../types';
import VenueMap from '../components/VenueMap';
import SimulationControls from '../components/SimulationControls';
import MetricsPanel from '../components/MetricsPanel';
import RecommendationPanel from '../components/RecommendationPanel';
import CameraPanel from '../components/CameraPanel';
import BeforeAfter from '../components/BeforeAfter';
import MetricsChart from '../components/MetricsChart';
import LiveFeedPanel from '../components/LiveFeedPanel';

type SimStatus = 'idle' | 'loading' | 'ready' | 'playing' | 'paused' | 'completed' | 'error';

function makeLiveFeed(scenario: Scenario, tick: number): LiveFeedSnapshot {
  const gates = scenario.venue.nodes.filter((node) => node.type === 'gate');
  const counters = gates.map((gate, index) => {
    const arrivals = scenario.agents.filter((agent) => agent.originId === gate.id).reduce((sum, agent) => sum + agent.count, 0);
    const scansLastMinute = Math.max(2, Math.round(arrivals / 14 + ((tick * 7 + index * 5) % 18)));
    const peopleInside = Math.min(arrivals || 180, Math.max(18, Math.round((arrivals || 180) * (0.24 + (((tick + index * 2) % 10) / 18)))));
    const status: LiveGateCounter['status'] = scansLastMinute > 48 ? 'Full' : scansLastMinute > 30 ? 'Busy' : 'Open';
    return { gateId: gate.id, gateLabel: gate.label, scansLastMinute, peopleInside, status };
  });
  return {
    updatedAt: new Date().toISOString(),
    totalScans: counters.reduce((sum, gate) => sum + gate.scansLastMinute, 0),
    peopleInside: counters.reduce((sum, gate) => sum + gate.peopleInside, 0),
    gates: counters,
    sourceLabel: 'Replay of ticket scans and entry-gate counters from this sample place.',
    isDemo: true,
  };
}

const statusLabels: Record<SimStatus, string> = { idle: 'Not started', loading: 'Loading', ready: 'Ready', playing: 'Playing', paused: 'Paused', completed: 'Finished', error: 'Needs help' };

export default function SimulationPage() {
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const navigate = useNavigate();
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [states, setStates] = useState<SimulationState[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [status, setStatus] = useState<SimStatus>('idle');
  const [speed, setSpeed] = useState(3);
  const [recommendation, setRecommendation] = useState<RerouteRecommendation | null>(null);
  const [beforeAfter, setBeforeAfter] = useState<BeforeAfterMetrics | null>(null);
  const [loadingReroute, setLoadingReroute] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [liveTick, setLiveTick] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let active = true;
    if (!scenarioId) return () => { active = false; };
    setStatus('loading'); setError(null); setScenario(null); setStates([]); setRecommendation(null); setBeforeAfter(null); setCurrentStep(0); setLiveTick(0);
    fetchScenario(scenarioId)
      .then((loadedScenario) => { if (!active) return null; setScenario(loadedScenario); return runSimulation(scenarioId, undefined, true); })
      .then((res) => { if (!active || !res) return; setStates(res.states); setCurrentStep(0); setStatus('ready'); })
      .catch((cause) => { if (!active) return; setError(cause instanceof Error ? cause.message : 'We could not load this place.'); setStatus('error'); });
    return () => { active = false; };
  }, [scenarioId]);

  const play = useCallback(() => { if (states.length > 0) setStatus('playing'); }, [states.length]);
  const pause = useCallback(() => setStatus('paused'), []);
  const reset = useCallback(() => { setStatus(states.length > 0 ? 'ready' : 'idle'); setCurrentStep(0); setBeforeAfter(null); setRecommendation(null); setError(null); }, [states.length]);

  useEffect(() => {
    if (status !== 'playing') { if (intervalRef.current) clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => setCurrentStep((previous) => { if (previous >= states.length - 1) { setStatus('completed'); return previous; } return previous + 1; }), 1000 / speed);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [status, speed, states.length]);

  const handleReroute = async () => {
    if (!scenarioId) return;
    setLoadingReroute(true); setError(null);
    try { const response = await requestReroute(scenarioId); setRecommendation(response.recommendation); setBeforeAfter(response.beforeAfter); setStates(response.newStates); setCurrentStep(0); setStatus('ready'); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'We could not try the new route.'); }
    finally { setLoadingReroute(false); }
  };

  useEffect(() => {
    if (!scenario) return;
    const feedInterval = setInterval(() => setLiveTick((previous) => previous + 1), 3000);
    return () => clearInterval(feedInterval);
  }, [scenario]);

  const liveFeed = useMemo(() => (scenario ? makeLiveFeed(scenario, liveTick) : null), [scenario, liveTick]);
  const liveCrowdedGates = liveFeed?.gates.filter((gate) => gate.status === 'Full' || gate.status === 'Busy').length ?? 0;
  const currentState = states[currentStep] ?? null;
  const hasBottleneck = Boolean(currentState?.activeBottlenecks || liveCrowdedGates > 0);
  const venueType = scenario?.name.toLowerCase().includes('festival') ? 'Festival' : scenario?.name.toLowerCase().includes('station') || scenario?.name.toLowerCase().includes('rail') ? 'Railway station' : 'Stadium';
  const totalAgents = scenario?.agents.reduce((sum, agent) => sum + agent.count, 0) ?? 0;
  const arrivalWaves = scenario?.agents.filter((agent) => agent.arrivalTime > 0).length ?? 0;
  const activeBottlenecks = Math.max(currentState?.activeBottlenecks ?? 0, liveFeed?.gates.filter((gate) => gate.status === 'Full').length ?? 0);

  return (
    <main className="flex min-h-screen flex-col bg-[#f7f3ee] text-[#30241e]">
      <header className="border-b border-[#dfd2c5] bg-[#fffdf9]/95 px-5 py-4 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-5">
          <div className="flex min-w-0 items-center gap-3"><button type="button" onClick={() => navigate('/')} className="rounded-xl border border-[#dfd2c5] bg-[#fffaf4] px-3 py-2 text-xs font-bold text-[#6f4b3b] hover:border-[#b97852]">← Back</button><div className="min-w-0"><div className="flex items-center gap-2"><span className="text-sm font-extrabold tracking-tight text-[#4a2e22]">FlowPilot</span><span className="text-[#c7aa92]">/</span><span className="truncate text-sm font-semibold text-[#806957]">{scenario?.name ?? 'Loading place'}</span></div><div className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#a35d3f]">{venueType} · crowd flow demo</div></div></div>
          <div className="hidden items-center gap-3 text-right sm:flex"><div><div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#a58b7a]">App status</div><div className="mt-1 text-xs font-extrabold text-[#4a2e22]">{statusLabels[status]}</div></div><span className="h-2.5 w-2.5 rounded-full bg-[#b97852]" aria-hidden="true" /></div>
        </div>
      </header>

      {error && <div className="mx-auto mt-4 w-full max-w-[1500px] px-5 sm:px-8" role="alert"><div className="rounded-2xl border border-[#e5b09a] bg-[#fff2ec] px-4 py-3 text-sm font-semibold text-[#9b4a31]">Something went wrong: {error}</div></div>}

      <div className="mx-auto grid w-full max-w-[1500px] gap-3 px-5 pt-5 sm:grid-cols-3 sm:px-8" aria-label="What we add and what you get">
        <div className="rounded-2xl border border-[#dfd2c5] bg-[#fffdf9] px-4 py-3 shadow-[0_8px_20px_rgba(85,55,37,0.04)]"><div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#a35d3f]">What we add · Place map</div><div className="mt-1 text-sm font-extrabold text-[#4a2e22]">{scenario ? `${scenario.venue.nodes.length} map points · ${scenario.venue.edges.length} paths` : 'Loading place map'}</div><div className="mt-1 text-xs text-[#806957]">Entrances, paths, areas, and exits</div></div>
        <div className="rounded-2xl border border-[#dfd2c5] bg-[#fffdf9] px-4 py-3 shadow-[0_8px_20px_rgba(85,55,37,0.04)]"><div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#a35d3f]">What we add · Crowd plan</div><div className="mt-1 text-sm font-extrabold text-[#4a2e22]">{scenario ? `${totalAgents.toLocaleString()} people · ${arrivalWaves} arrival groups` : 'Loading crowd plan'}</div><div className="mt-1 text-xs text-[#806957]">When people are expected to arrive</div></div>
        <div className="rounded-2xl border border-[#d9c7b8] bg-[#4a2e22] px-4 py-3 text-[#fff8ef] shadow-[0_8px_20px_rgba(85,55,37,0.08)]"><div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#efc49d]">What you get · Helpful advice</div><div className="mt-1 text-sm font-extrabold">{activeBottlenecks > 0 ? `${activeBottlenecks} crowded spot${activeBottlenecks === 1 ? '' : 's'} found` : 'Watching for crowded spots'}</div><div className="mt-1 text-xs text-[#ead8c9]">{liveCrowdedGates > 0 ? `${liveCrowdedGates} gate${liveCrowdedGates === 1 ? ' is' : 's are'} getting busy. ` : ''}See why it happens, try a new route, and compare the result</div></div>
      </div>

      <div className="mx-auto flex w-full max-w-[1500px] flex-1 flex-col gap-5 px-5 py-5 sm:px-8 lg:flex-row">
        <section className="flex min-w-0 flex-1 flex-col gap-4" aria-label="Crowd movement area">
          <div className="rounded-2xl border border-[#dfd2c5] bg-[#fffdf9] p-4 shadow-[0_10px_28px_rgba(85,55,37,0.06)]"><SimulationControls isPlaying={status === 'playing'} speed={speed} currentStep={currentStep} totalSteps={states.length} onPlay={play} onPause={pause} onReset={reset} onSpeedChange={setSpeed} /></div>
          <div className="relative min-h-[430px] flex-1 overflow-hidden rounded-3xl border border-[#d9c7b8] bg-[#fffdf9] p-3 shadow-[0_18px_50px_rgba(85,55,37,0.09)] sm:p-5">
            <div className="pointer-events-none absolute left-7 top-6 z-10"><div className="rounded-full border border-[#dfd2c5] bg-[#fffdf9]/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#806957] shadow-sm">Place map · live view</div></div>
            {status === 'loading' ? <div className="flex h-full min-h-[390px] items-center justify-center text-sm font-semibold text-[#806957]">Getting the crowd movement ready…</div> : scenario && currentState ? <VenueMap scenario={scenario} state={currentState} recommendation={recommendation} beforeAfter={beforeAfter} /> : <div className="flex h-full min-h-[390px] items-center justify-center text-sm font-semibold text-[#806957]">There is no crowd movement to show yet.</div>}
            <div className="absolute bottom-6 left-7 rounded-xl border border-[#dfd2c5] bg-[#fffdf9]/90 px-3 py-2 text-[10px] font-semibold text-[#806957] shadow-sm"><span className="mr-3 inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#b14a3d]" /> Crowded spot</span><span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#4f9861]" /> New route</span></div>
          </div>
          <div className="h-48 rounded-2xl border border-[#dfd2c5] bg-[#fffdf9] p-3 shadow-[0_10px_28px_rgba(85,55,37,0.06)]"><MetricsChart states={states} currentStep={currentStep} /></div>
        </section>

        <aside className="w-full space-y-4 lg:w-[360px] lg:shrink-0" aria-label="What the app found">
          <LiveFeedPanel feed={liveFeed} />
          <MetricsPanel state={currentState} status={status} hasBottleneck={hasBottleneck} />
          <RecommendationPanel recommendation={recommendation} beforeAfter={beforeAfter} onReroute={handleReroute} loading={loadingReroute} hasBottleneck={hasBottleneck} status={status} />
          <BeforeAfter beforeAfter={beforeAfter} />
          <CameraPanel scenarioId={scenarioId ?? ''} />
          <div className="rounded-2xl border border-[#dfd2c5] bg-[#fffaf4] p-4 text-xs leading-5 text-[#806957]"><span className="font-extrabold text-[#4a2e22]">Good to know. </span>FlowPilot is a planning demo. It uses simple sample rules and is not certified emergency or safety advice.</div>
        </aside>
      </div>
    </main>
  );
}
