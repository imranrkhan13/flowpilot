import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchScenarios } from '../lib/api';
import { Scenario } from '../types';

export default function LandingPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchScenarios().then(setScenarios).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4">
          FlowPilot
        </h1>
        <p className="text-xl text-slate-400 mb-2">
          Venue crowd digital twin that predicts bottlenecks and recommends safer routes.
        </p>
        <p className="text-sm text-slate-500 mb-10">
          Powered by Hugging Face · Decision-support prototype using simplified assumptions
        </p>
        {loading ? (
          <div className="text-slate-400">Loading scenarios...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            {scenarios.map((s) => (
              <button key={s.id} onClick={() => navigate(`/simulate/${s.id}`)}
                className="group text-left bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-cyan-500/50 hover:bg-slate-850 transition-all">
                <div className="text-lg font-semibold text-slate-100 group-hover:text-cyan-400 transition-colors">{s.name}</div>
                <div className="text-sm text-slate-400 mt-2">{s.description}</div>
                <div className="mt-4 text-xs text-slate-500">
                  {s.agents.reduce((sum, a) => sum + a.count, 0).toLocaleString()} agents · {s.venue.nodes.length} zones
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
