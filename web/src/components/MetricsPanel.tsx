import { SimulationState } from '../types';

interface Props {
  state: SimulationState | null;
  status: string;
  hasBottleneck: boolean;
}

const riskColors: Record<string, string> = {
  Low: 'text-emerald-400',
  Moderate: 'text-yellow-400',
  High: 'text-orange-400',
  Critical: 'text-red-500',
};

export default function MetricsPanel({ state, status, hasBottleneck }: Props) {
  if (!state) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-500 text-sm">
        {status === 'loading' ? 'Loading metrics...' : 'Run simulation to see metrics'}
      </div>
    );
  }
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Live Metrics</h3>
        {hasBottleneck && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-900/40 text-red-400 animate-pulse">BOTTLENECK</span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Metric label="Total Crowd" value={state.totalCrowd.toLocaleString()} />
        <Metric label="Peak Density" value={`${state.peakDensity.toFixed(2)} /m²`} />
        <Metric label="Avg Wait Time" value={`${state.avgWaitTime.toFixed(1)}s`} />
        <Metric label="Throughput" value={state.totalThroughput.toLocaleString()} />
        <Metric label="Active Bottlenecks" value={state.activeBottlenecks.toString()} highlight={state.activeBottlenecks > 0} />
        <div className="col-span-2">
          <div className="text-xs text-slate-500 mb-1">Overall Risk</div>
          <div className={`text-lg font-bold ${riskColors[state.overallRisk]}`}>{state.overallRisk}</div>
        </div>
      </div>
      {state.interventionApplied && (
        <div className="mt-3 text-[10px] text-emerald-400 bg-emerald-900/20 border border-emerald-800/40 rounded px-2 py-1">
          Intervention applied to this simulation
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded p-2 ${highlight ? 'bg-red-900/10' : ''}`}>
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`text-sm font-semibold ${highlight ? 'text-red-400' : 'text-slate-200'}`}>{value}</div>
    </div>
  );
}
