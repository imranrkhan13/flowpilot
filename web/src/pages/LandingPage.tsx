import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchScenarios } from '../lib/api';
import { Scenario } from '../types';

function totalAgents(scenario: Scenario) {
  return scenario.agents.reduce((sum, agent) => sum + agent.count, 0);
}

export default function LandingPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadScenarios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setScenarios(await fetchScenarios());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load scenarios.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadScenarios();
  }, [loadScenarios]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-6 py-12 sm:py-16">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-6xl flex-col justify-center">
        <header className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-cyan-300">
            Crowd intelligence console
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl">
            Flow<span className="text-cyan-300">Pilot</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
            Explore venue crowd flow as it unfolds, surface bottlenecks before they compound, and test safer route interventions in a deterministic digital twin.
          </p>
          <p className="mt-4 text-sm text-slate-500">
            Decision-support prototype · deterministic simulation · optional Hugging Face vision evidence
          </p>
        </header>

        <section className="mt-12" aria-labelledby="scenario-heading">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="scenario-heading" className="text-xl font-semibold text-white">Choose a venue scenario</h2>
              <p className="mt-1 text-sm text-slate-500">Start a live simulation to inspect crowd movement and intervention impact.</p>
            </div>
            <div className="text-xs uppercase tracking-[0.16em] text-slate-600">FlowPilot / workspace</div>
          </div>

          {loading && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8 text-slate-400" role="status">
              Loading available scenarios…
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-red-900/70 bg-red-950/30 p-6" role="alert">
              <p className="font-medium text-red-200">Scenario catalog unavailable</p>
              <p className="mt-2 text-sm text-red-300/80">{error}</p>
              <button
                type="button"
                onClick={() => void loadScenarios()}
                className="mt-5 rounded-lg border border-red-400/40 px-4 py-2 text-sm font-medium text-red-100 transition hover:bg-red-400/10 focus:outline-none focus:ring-2 focus:ring-red-300/60"
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && scenarios.length === 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8 text-slate-400">
              No scenarios are configured yet.
            </div>
          )}

          {!loading && !error && scenarios.length > 0 && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {scenarios.map((scenario) => (
                <button
                  key={scenario.id}
                  type="button"
                  onClick={() => navigate(`/simulate/${scenario.id}`)}
                  className="group rounded-2xl border border-slate-800 bg-slate-900/80 p-6 text-left shadow-[0_12px_40px_rgba(0,0,0,0.16)] transition duration-200 hover:-translate-y-0.5 hover:border-cyan-400/60 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-300/70"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-lg font-semibold text-white transition-colors group-hover:text-cyan-200">{scenario.name}</span>
                    <span className="text-cyan-300 transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
                  </div>
                  <p className="mt-3 min-h-[4.5rem] text-sm leading-6 text-slate-400">{scenario.description}</p>
                  <div className="mt-6 flex items-center gap-3 border-t border-slate-800 pt-4 text-xs text-slate-500">
                    <span>{totalAgents(scenario).toLocaleString()} agents</span>
                    <span className="text-slate-700">•</span>
                    <span>{scenario.venue.nodes.length} locations</span>
                    <span className="text-slate-700">•</span>
                    <span>{scenario.totalSteps} steps</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

