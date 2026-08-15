import { SimulationState } from '../types';

interface Props {
  state: SimulationState | null;
  status: string;
  hasBottleneck: boolean;
}

const riskStyles: Record<string, string> = {
  Low: 'bg-[#e7f2e7] text-[#3d7147]',
  Moderate: 'bg-[#fff1d6] text-[#936728]',
  High: 'bg-[#fde5d4] text-[#a4552f]',
  Critical: 'bg-[#f7d9d3] text-[#963b2d]',
};

const statusLabels: Record<string, string> = {
  loading: 'Loading',
  ready: 'Ready',
  playing: 'Running',
  paused: 'Paused',
  completed: 'Complete',
  error: 'Needs attention',
  idle: 'Idle',
};

export default function MetricsPanel({ state, status, hasBottleneck }: Props) {
  return (
    <section className="rounded-2xl border border-[#dfd2c5] bg-[#fffdf9] p-4 shadow-[0_10px_28px_rgba(85,55,37,0.06)]" aria-labelledby="metrics-heading">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#a35d3f]">How the app is doing</div>
          <h2 id="metrics-heading" className="mt-1 text-sm font-extrabold text-[#3d281e]">Crowd movement</h2>
        </div>
        <span className="rounded-full bg-[#f1e2d4] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#8e5e43]">{statusLabels[status] ?? status}</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 border-y border-[#eee4da] py-3">
        <div><div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#a58b7a]">Sample data</div><div className="mt-1 text-xs font-bold text-[#4a2e22]">Repeatable sample</div></div>
        <div><div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#a58b7a]">What it assumes</div><div className="mt-1 text-xs font-bold text-[#4a2e22]">Simple rules</div></div>
      </div>
      {!state ? (
        <p className="py-3 text-sm leading-6 text-[#806957]">{status === 'loading' ? 'Getting the crowd movement ready…' : 'Press Play to see the numbers change.'}</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <Metric label="People" value={state.totalCrowd.toLocaleString()} />
            <Metric label="Most crowded" value={`${state.peakDensity.toFixed(2)} /m²`} />
            <Metric label="Average wait" value={`${state.avgWaitTime.toFixed(1)}s`} />
            <Metric label="People through" value={state.totalThroughput.toLocaleString()} />
            <Metric label="Crowded spots" value={state.activeBottlenecks.toString()} highlight={state.activeBottlenecks > 0} />
            <div className="rounded-xl bg-[#f8f1e9] p-2.5"><div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#a58b7a]">Overall concern</div><div className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-extrabold ${riskStyles[state.overallRisk]}`}>{state.overallRisk}</div></div>
          </div>
          {hasBottleneck && <div className="mt-3 rounded-xl border border-[#e5b09a] bg-[#fff2ec] px-3 py-2 text-xs font-bold text-[#9b4a31]">A crowded spot is growing — see the advice below.</div>}
          {state.interventionApplied && <div className="mt-3 rounded-xl border border-[#b5d5b8] bg-[#eef7ed] px-3 py-2 text-xs font-bold text-[#47774e]">New route added to this run.</div>}
        </>
      )}
    </section>
  );
}

function Metric({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return <div className={`rounded-xl p-2.5 ${highlight ? 'bg-[#fff0ea]' : 'bg-[#f8f1e9]'}`}><div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#a58b7a]">{label}</div><div className={`mt-1 text-sm font-extrabold ${highlight ? 'text-[#a4552f]' : 'text-[#4a2e22]'}`}>{value}</div></div>;
}
