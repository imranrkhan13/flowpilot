import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchScenario, runSimulation, requestReroute } from '../lib/api';
import { Scenario, SimulationState, BeforeAfterMetrics, RerouteRecommendation } from '../types';
import VenueMap from '../components/VenueMap';
import SimulationControls from '../components/SimulationControls';
import MetricsPanel from '../components/MetricsPanel';
import RecommendationPanel from '../components/RecommendationPanel';
import CameraPanel from '../components/CameraPanel';
import BeforeAfter from '../components/BeforeAfter';
import MetricsChart from '../components/MetricsChart';

type SimStatus = 'idle' | 'loading' | 'ready' | 'playing' | 'paused' | 'completed' | 'error';

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
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!scenarioId) return;
    setStatus('loading');
    setError(null);
    fetchScenario(scenarioId)
      .then((s) => { setScenario(s); return runSimulation(scenarioId, undefined, true); })
      .then((res) => { setStates(res.states); setCurrentStep(0); setStatus('ready'); })
      .catch((e) => { setError(e instanceof Error ? e.message : 'Failed to load'); setStatus('error'); });
  }, [scenarioId]);

  const play = useCallback(() => { if (states.length === 0) return; setStatus('playing'); }, [states.length]);
  const pause = useCallback(() => setStatus('paused'), []);
  const reset = useCallback(() => {
    setStatus('ready');
    setCurrentStep(0);
    setBeforeAfter(null);
    setRecommendation(null);
  }, []);

  useEffect(() => {
    if (status !== 'playing') { if (intervalRef.current) clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= states.length - 1) { setStatus('completed'); return prev; }
        return prev + 1;
      });
    }, 1000 / speed);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [status, speed, states.length]);

  const handleReroute = async () => {
    if (!scenarioId) return;
    setLoadingReroute(true);
    setError(null);
    try {
      const res = await requestReroute(scenarioId);
      setRecommendation(res.recommendation);
      setBeforeAfter(res.beforeAfter);
      setStates(res.newStates);
      setCurrentStep(0);
      setStatus('ready');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Reroute failed');
    } finally {
      setLoadingReroute(false);
    }
  };

  const currentState = states[currentStep] ?? null;
  const hasBottleneck = currentState ? currentState.activeBottlenecks > 0 : false;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="text-sm text-slate-400 hover:text-white">← Back</button>
          <h1 className="text-lg font-semibold">FlowPilot <span className="text-slate-500">·</span> <span className="text-slate-300">{scenario?.name}</span></h1>
        </div>
        <div className="text-xs text-slate-500">Decision-support prototype using simplified assumptions</div>
      </header>

      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-sm text-red-300">Error: {error}</div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0">
          <div className="p-4">
            <SimulationControls isPlaying={status === 'playing'} speed={speed} currentStep={currentStep} totalSteps={states.length}
              onPlay={play} onPause={pause} onReset={reset} onSpeedChange={setSpeed} />
          </div>
          <div className="flex-1 px-4 pb-4 min-h-0">
            {status === 'loading' ? (
              <div className="w-full h-full flex items-center justify-center text-slate-500">Loading simulation...</div>
            ) : scenario && currentState ? (
              <VenueMap scenario={scenario} state={currentState} recommendation={recommendation} beforeAfter={beforeAfter} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500">No simulation data</div>
            )}
          </div>
          <div className="px-4 pb-4 h-48">
            <MetricsChart states={states} currentStep={currentStep} />
          </div>
        </div>

        <aside className="w-full lg:w-80 border-l border-slate-800 bg-slate-900/50 overflow-y-auto p-4 space-y-4">
          <MetricsPanel state={currentState} status={status} hasBottleneck={hasBottleneck} />
          <RecommendationPanel recommendation={recommendation} beforeAfter={beforeAfter} onReroute={handleReroute}
            loading={loadingReroute} hasBottleneck={hasBottleneck} status={status} />
          <BeforeAfter beforeAfter={beforeAfter} />
          <CameraPanel scenarioId={scenarioId ?? ''} />
        </aside>
      </div>
    </div>
  );
}
