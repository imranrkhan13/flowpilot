import { BeforeAfterMetrics } from '../types';

interface Props {
  beforeAfter: BeforeAfterMetrics | null;
}

export default function BeforeAfter({ beforeAfter }: Props) {
  if (!beforeAfter) return null;
  const b = beforeAfter.before;
  const a = beforeAfter.after;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">Before / After</h3>
      <div className="space-y-2 text-sm">
        <Row label="Peak Density" before={b.peakDensity} after={a.peakDensity} unit="/m²" lowerIsBetter />
        <Row label="Avg Wait" before={b.avgWaitTime} after={a.avgWaitTime} unit="s" lowerIsBetter />
        <Row label="Throughput" before={b.totalThroughput} after={a.totalThroughput} unit="" lowerIsBetter={false} />
        <Row label="Bottlenecks" before={b.activeBottlenecks} after={a.activeBottlenecks} unit="" lowerIsBetter />
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Risk</span>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">{b.overallRisk}</span>
            <span className="text-slate-600">→</span>
            <span className={`font-medium ${a.overallRisk === 'Low' || a.overallRisk === 'Moderate' ? 'text-emerald-400' : a.overallRisk === 'High' ? 'text-orange-400' : 'text-red-400'}`}>{a.overallRisk}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, before, after, unit, lowerIsBetter }: { label: string; before: number; after: number; unit: string; lowerIsBetter: boolean }) {
  const diff = after - before;
  const pct = before !== 0 ? (diff / before) * 100 : 0;
  const improved = lowerIsBetter ? diff < 0 : diff > 0;
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-400">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-slate-500">{before.toFixed(1)}{unit}</span>
        <span className="text-slate-600">→</span>
        <span className="text-slate-200">{after.toFixed(1)}{unit}</span>
        <span className={`text-xs font-medium ${improved ? 'text-emerald-400' : 'text-red-400'}`}>
          {improved ? '↓' : '↑'} {Math.abs(pct).toFixed(0)}%
        </span>
      </div>
    </div>
  );
}
