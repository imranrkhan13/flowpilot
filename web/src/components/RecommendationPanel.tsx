import { BeforeAfterMetrics, RerouteRecommendation } from '../types';

interface Props {
  recommendation: RerouteRecommendation | null;
  beforeAfter: BeforeAfterMetrics | null;
  onReroute: () => void;
  loading: boolean;
  hasBottleneck: boolean;
  status: string;
}

export default function RecommendationPanel({ recommendation, beforeAfter, onReroute, loading, hasBottleneck, status }: Props) {
  if (status === 'loading') return <Panel title="What to do next"><p className="text-sm text-[#806957]">Reading the current crowd movement…</p></Panel>;
  if (!hasBottleneck && !recommendation) return <Panel title="What to do next"><p className="text-sm leading-6 text-[#806957]">No crowded spot yet. Press Play or choose another place.</p></Panel>;
  if (!recommendation) return <Panel title="What to do next"><p className="text-sm leading-6 text-[#806957]">A crowded spot is growing. FlowPilot is looking for a new route…</p></Panel>;

  return (
    <section className="rounded-2xl border border-[#d9b89e] bg-[#fffaf4] p-4 shadow-[0_10px_28px_rgba(85,55,37,0.07)]" aria-labelledby="recommendation-heading">
      <div className="flex items-start justify-between gap-3">
        <div><div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#a35d3f]">Helpful advice</div><h2 id="recommendation-heading" className="mt-1 text-sm font-extrabold text-[#3d281e]">Suggested next step</h2></div>
        <span className="rounded-full bg-[#f1e2d4] px-2 py-1 text-[10px] font-extrabold text-[#8e5e43]">{recommendation.confidence} certainty</span>
      </div>
      <div className="mt-4 rounded-xl bg-[#f8f1e9] p-3"><div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#a58b7a]">Where people are stuck</div><div className="mt-1 text-sm font-extrabold text-[#4a2e22]">{recommendation.affectedEdgeLabel}</div></div>
      <p className="mt-3 text-sm leading-6 text-[#70594b]">{recommendation.reason}</p>
      <div className="mt-3 rounded-xl border border-[#c6ddc7] bg-[#f0f8ed] p-3"><div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#47774e]">New route to try</div><div className="mt-1 text-sm font-bold leading-6 text-[#3d7147]">{recommendation.alternateRouteLabels.join(' → ')}</div></div>
      <div className="mt-4 grid grid-cols-3 gap-2"><Improvement label="Crowding" value={recommendation.expectedImprovement.densityReduction} /><Improvement label="Wait time" value={recommendation.expectedImprovement.waitTimeReduction} /><Improvement label="People through" value={recommendation.expectedImprovement.throughputIncrease} inverse /></div>
      {!beforeAfter ? <button type="button" onClick={onReroute} disabled={loading} className="mt-4 w-full rounded-xl bg-[#4a2e22] px-3 py-3 text-sm font-extrabold text-white shadow-[0_8px_18px_rgba(74,46,34,0.16)] hover:bg-[#633d2d] disabled:cursor-wait disabled:opacity-60">{loading ? 'Trying the new route…' : 'Try this route'}</button> : <div className="mt-4 rounded-xl border border-[#b5d5b8] bg-[#eef7ed] px-3 py-2.5 text-xs font-bold leading-5 text-[#47774e]">New route added. Press Play to watch it in green.</div>}
    </section>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-[#dfd2c5] bg-[#fffdf9] p-4 shadow-[0_10px_28px_rgba(85,55,37,0.06)]"><div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#a35d3f]">Helpful advice</div><h2 className="mt-1 text-sm font-extrabold text-[#3d281e]">{title}</h2><div className="mt-3">{children}</div></section>;
}

function Improvement({ label, value, inverse }: { label: string; value: number; inverse?: boolean }) {
  return <div className="rounded-xl bg-[#f8f1e9] p-2 text-center"><div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#a58b7a]">{label} {inverse ? '↑' : '↓'}</div><div className="mt-1 text-sm font-extrabold text-[#3d7147]">{Math.round(value * 100)}%</div></div>;
}
