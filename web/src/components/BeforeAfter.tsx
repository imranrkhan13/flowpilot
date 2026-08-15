import { BeforeAfterMetrics } from '../types';

interface Props {
  beforeAfter: BeforeAfterMetrics | null;
}

export default function BeforeAfter({ beforeAfter }: Props) {
  if (!beforeAfter) return null;
  const b = beforeAfter.before;
  const a = beforeAfter.after;
  return (
    <section className="rounded-2xl border border-[#c6ddc7] bg-[#f7fbf4] p-4 shadow-[0_10px_28px_rgba(61,113,71,0.06)]" aria-labelledby="before-after-heading">
      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#47774e]">Intervention result</div>
      <h2 id="before-after-heading" className="mt-1 text-sm font-extrabold text-[#3d281e]">Before / after</h2>
      <p className="mt-2 text-xs leading-5 text-[#6b806b]">Modelled change after applying the suggested alternate route.</p>
      <div className="mt-4 space-y-2.5 text-xs"><Row label="Peak density" before={b.peakDensity} after={a.peakDensity} unit="/m²" lowerIsBetter /><Row label="Average wait" before={b.avgWaitTime} after={a.avgWaitTime} unit="s" lowerIsBetter /><Row label="Throughput" before={b.totalThroughput} after={a.totalThroughput} unit="" lowerIsBetter={false} /><Row label="Bottlenecks" before={b.activeBottlenecks} after={a.activeBottlenecks} unit="" lowerIsBetter /></div>
      <div className="mt-3 flex items-center justify-between border-t border-[#d8e8d7] pt-3 text-xs"><span className="font-semibold text-[#6b806b]">Overall risk</span><div className="flex items-center gap-2"><span className="text-[#9aae9a]">{b.overallRisk}</span><span className="text-[#94ad96]">→</span><span className="rounded-full bg-[#e7f2e7] px-2 py-1 font-extrabold text-[#3d7147]">{a.overallRisk}</span></div></div>
    </section>
  );
}

function Row({ label, before, after, unit, lowerIsBetter }: { label: string; before: number; after: number; unit: string; lowerIsBetter: boolean }) {
  const diff = after - before;
  const pct = before !== 0 ? (diff / before) * 100 : 0;
  const improved = lowerIsBetter ? diff < 0 : diff > 0;
  return <div className="flex items-center justify-between gap-3"><span className="font-semibold text-[#6b806b]">{label}</span><div className="flex items-center gap-1.5"><span className="text-[#9aae9a]">{before.toFixed(1)}{unit}</span><span className="text-[#94ad96]">→</span><span className="font-bold text-[#3d7147]">{after.toFixed(1)}{unit}</span><span className={`font-extrabold ${improved ? 'text-[#3d7147]' : 'text-[#a4552f]'}`}>{improved ? '↓' : '↑'}{Math.abs(pct).toFixed(0)}%</span></div></div>;
}
