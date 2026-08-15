import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchScenarios } from '../lib/api';
import { Scenario } from '../types';

function totalAgents(scenario: Scenario) {
  return scenario.agents.reduce((sum, agent) => sum + agent.count, 0);
}

function venueLabel(scenario: Scenario) {
  const value = scenario.name.toLowerCase();
  if (value.includes('festival')) return 'Festival';
  if (value.includes('rail') || value.includes('station')) return 'Railway station';
  return 'Stadium';
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

  const totalVenues = scenarios.length;
  const totalLocations = useMemo(() => scenarios.reduce((sum, scenario) => sum + scenario.venue.nodes.length, 0), [scenarios]);

  return (
    <main className="min-h-screen overflow-hidden px-5 py-6 text-[#30241e] sm:px-8 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <nav className="flex items-center justify-between border-b border-[#dfd2c5] pb-5" aria-label="Primary navigation">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#4a2e22] text-sm font-extrabold tracking-tight text-[#fffaf4] shadow-[0_8px_22px_rgba(74,46,34,0.16)]">FP</div>
            <div>
              <div className="text-sm font-extrabold tracking-tight">FlowPilot</div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9b7962]">Crowd flow lab</div>
            </div>
          </div>
          <div className="hidden items-center gap-5 text-xs font-semibold text-[#806957] sm:flex">
            <span>Decision support prototype</span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#bb815c]" aria-hidden="true" />
            <span>Deterministic demo data</span>
          </div>
        </nav>

        <section className="grid gap-10 pb-12 pt-14 lg:grid-cols-[1.08fr_0.92fr] lg:items-end lg:pt-20">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#d8bca7] bg-[#fffaf4] px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#8e5e43] shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#b86b42]" aria-hidden="true" />
              Venue intelligence, made tangible
            </div>
            <h1 className="max-w-3xl text-5xl font-extrabold leading-[0.98] tracking-[-0.055em] text-[#3d281e] sm:text-7xl lg:text-[5.7rem]">
              See the crowd.
              <span className="block text-[#a35d3f]">Change the flow.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-[#70594b] sm:text-lg">
              Explore how people move through a venue, spot developing bottlenecks, and test a route intervention in a clear, deterministic simulation.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 text-xs font-semibold text-[#806957]">
              <span className="rounded-full border border-[#dfd2c5] bg-[#fffdf9] px-3 py-2">Graph-based simulation</span>
              <span className="rounded-full border border-[#dfd2c5] bg-[#fffdf9] px-3 py-2">Optional camera evidence</span>
              <span className="rounded-full border border-[#dfd2c5] bg-[#fffdf9] px-3 py-2">Before / after metrics</span>
            </div>
          </div>

          <aside className="relative overflow-hidden rounded-[2rem] border border-[#d9c7b8] bg-[#4a2e22] p-7 text-[#fff8ef] shadow-[0_24px_70px_rgba(74,46,34,0.18)] sm:p-9">
            <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full border-[22px] border-[#b97852]/30" aria-hidden="true" />
            <div className="absolute -bottom-24 -left-20 h-48 w-48 rounded-full border-[22px] border-[#f0c89d]/15" aria-hidden="true" />
            <div className="relative">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#efc49d]">The 30-second demo</div>
              <ol className="mt-6 space-y-5">
                <li className="flex gap-4"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#b97852] text-xs font-bold">1</span><div><div className="font-semibold">Choose a venue</div><div className="mt-1 text-sm leading-6 text-[#ead8c9]">Use realistic but clearly labelled demo data.</div></div></li>
                <li className="flex gap-4"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#b97852] text-xs font-bold">2</span><div><div className="font-semibold">Run the flow</div><div className="mt-1 text-sm leading-6 text-[#ead8c9]">Watch movement, density, and bottlenecks evolve.</div></div></li>
                <li className="flex gap-4"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#b97852] text-xs font-bold">3</span><div><div className="font-semibold">Apply a reroute</div><div className="mt-1 text-sm leading-6 text-[#ead8c9]">Compare the intervention without overstating accuracy.</div></div></li>
              </ol>
              <div className="mt-8 border-t border-[#8d6049] pt-5 text-xs leading-5 text-[#d9c1ad]">A decision-support prototype, not a certified evacuation or safety system.</div>
            </div>
          </aside>
        </section>

        <section aria-labelledby="scenario-heading" className="border-t border-[#dfd2c5] py-10 sm:py-12">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#a35d3f]">Start here</div>
              <h2 id="scenario-heading" className="mt-2 text-2xl font-extrabold tracking-tight text-[#3d281e] sm:text-3xl">Choose a venue scenario</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-[#806957]">Select a venue to inspect entrances, exits, corridors, zones, crowd movement, and the next best intervention.</p>
            </div>
            <div className="flex gap-6 text-right text-xs text-[#806957]">
              <div><div className="text-xl font-extrabold text-[#4a2e22]">{loading ? '—' : totalVenues}</div><div>venues</div></div>
              <div><div className="text-xl font-extrabold text-[#4a2e22]">{loading ? '—' : totalLocations}</div><div>locations</div></div>
            </div>
          </div>

          {loading && <div className="rounded-3xl border border-[#dfd2c5] bg-[#fffdf9] p-8 text-sm text-[#806957] shadow-[0_12px_40px_rgba(85,55,37,0.06)]" role="status">Loading available scenarios…</div>}

          {!loading && error && (
            <div className="rounded-3xl border border-[#d9a18b] bg-[#fff4ef] p-6" role="alert">
              <p className="font-bold text-[#8e3f2b]">Scenario catalog unavailable</p>
              <p className="mt-2 text-sm text-[#a35d3f]">{error}</p>
              <button type="button" onClick={() => void loadScenarios()} className="mt-5 rounded-xl bg-[#4a2e22] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#633d2d] focus:outline-none focus:ring-2 focus:ring-[#b97852]/60">Try again</button>
            </div>
          )}

          {!loading && !error && scenarios.length === 0 && <div className="rounded-3xl border border-[#dfd2c5] bg-[#fffdf9] p-8 text-sm text-[#806957]">No scenarios are configured yet.</div>}

          {!loading && !error && scenarios.length > 0 && (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {scenarios.map((scenario, index) => (
                <button key={scenario.id} type="button" onClick={() => navigate(`/simulate/${scenario.id}`)} className="group rounded-3xl border border-[#dfd2c5] bg-[#fffdf9] p-6 text-left shadow-[0_12px_40px_rgba(85,55,37,0.07)] hover:-translate-y-1 hover:border-[#b97852] hover:shadow-[0_20px_48px_rgba(85,55,37,0.13)] focus:outline-none focus:ring-2 focus:ring-[#b97852]/60">
                  <div className="flex items-start justify-between gap-4"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f1e2d4] text-sm font-extrabold text-[#9b5d40]">0{index + 1}</span><span className="text-xl text-[#b97852] transition-transform group-hover:translate-x-1" aria-hidden="true">↗</span></div>
                  <div className="mt-8 text-[11px] font-bold uppercase tracking-[0.18em] text-[#a35d3f]">{venueLabel(scenario)}</div>
                  <h3 className="mt-2 text-xl font-extrabold tracking-tight text-[#3d281e]">{scenario.name}</h3>
                  <p className="mt-3 min-h-[4.5rem] text-sm leading-6 text-[#806957]">{scenario.description}</p>
                  <div className="mt-6 flex flex-wrap gap-x-3 gap-y-2 border-t border-[#eee4da] pt-4 text-xs font-semibold text-[#9b7962]"><span>{totalAgents(scenario).toLocaleString()} agents</span><span>·</span><span>{scenario.venue.nodes.length} locations</span><span>·</span><span>{scenario.totalSteps} steps</span></div>
                </button>
              ))}
            </div>
          )}
        </section>

        <section aria-labelledby="fit-heading" className="border-t border-[#dfd2c5] py-12 sm:py-16">
          <div className="max-w-2xl"><div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#a35d3f]">Problem fit</div><h2 id="fit-heading" className="mt-2 text-3xl font-extrabold tracking-tight text-[#3d281e] sm:text-4xl">Built for the Crowd Flow Optimiser brief.</h2><p className="mt-4 text-sm leading-7 text-[#806957]">FlowPilot turns a venue layout, an expected crowd, and a schedule of arrival waves into an interpretable intervention. The goal is not to replace an event operator; it is to help them see a developing pile-up early enough to test a better route.</p></div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <article className="rounded-3xl border border-[#dfd2c5] bg-[#fffdf9] p-6 shadow-[0_12px_40px_rgba(85,55,37,0.05)]"><div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#b97852]">01 · Input</div><h3 className="mt-3 text-lg font-extrabold text-[#4a2e22]">Venue + crowd model</h3><p className="mt-2 text-sm leading-6 text-[#806957]">Nodes, walkways, exits, capacities, expected agent counts, and seeded arrival waves represent the operating picture.</p></article>
            <article className="rounded-3xl border border-[#dfd2c5] bg-[#fffdf9] p-6 shadow-[0_12px_40px_rgba(85,55,37,0.05)]"><div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#b97852]">02 · Intelligence</div><h3 className="mt-3 text-lg font-extrabold text-[#4a2e22]">Simulate + detect</h3><p className="mt-2 text-sm leading-6 text-[#806957]">A deterministic graph simulator tracks movement, density, queue pressure, throughput, and bottleneck risk over time.</p></article>
            <article className="rounded-3xl border border-[#dfd2c5] bg-[#fffdf9] p-6 shadow-[0_12px_40px_rgba(85,55,37,0.05)]"><div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#b97852]">03 · Output</div><h3 className="mt-3 text-lg font-extrabold text-[#4a2e22]">Explain + reroute</h3><p className="mt-2 text-sm leading-6 text-[#806957]">Operators see the red bottleneck, the reason, a green alternate route, and a before/after comparison they can challenge.</p></article>
          </div>
          <div className="mt-5 grid gap-4 rounded-3xl border border-[#d9c7b8] bg-[#4a2e22] p-6 text-[#fff8ef] sm:grid-cols-[1fr_auto] sm:items-center sm:p-8"><div><div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#efc49d]">Meaningful by design</div><p className="mt-2 max-w-3xl text-sm leading-6 text-[#ead8c9]">The same workflow can support stadiums, railway stations, festivals, airports, IPL venues, and other large gatherings. The prototype uses Hugging Face for optional camera-based occupancy evidence while keeping deterministic demo data visible and honest.</p></div><div className="rounded-full border border-[#b97852]/60 px-4 py-2 text-center text-xs font-bold text-[#f0c89d]">Frontend + backend + HF</div></div>
        </section>

        <footer className="flex flex-col gap-3 border-t border-[#dfd2c5] py-6 text-xs leading-5 text-[#9b7962] sm:flex-row sm:items-center sm:justify-between">
          <span>FlowPilot is a decision-support prototype using simplified assumptions.</span>
          <span>Demo mode is deterministic and repeatable.</span>
        </footer>
      </div>
    </main>
  );
}
