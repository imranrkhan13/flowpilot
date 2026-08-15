import { SimulationState } from '../types';

interface Props { states: SimulationState[]; currentStep: number; }

export default function MetricsChart({ states, currentStep }: Props) {
  if (states.length < 2) return <div className="flex h-full items-center justify-center rounded-2xl border border-[#eadfd5] bg-[#fffaf4] text-xs font-semibold text-[#9b7962]">Metrics appear when the simulation has multiple steps.</div>;
  const width = 600; const height = 120; const padding = 20; const chartWidth = width - padding * 2; const chartHeight = height - padding * 2;
  const maxDensity = Math.max(...states.map((state) => state.peakDensity), 0.01); const maxBottlenecks = Math.max(...states.map((state) => state.activeBottlenecks), 1);
  const densityPoints = states.map((state, index) => `${padding + (index / (states.length - 1)) * chartWidth},${height - padding - (state.peakDensity / maxDensity) * chartHeight}`).join(' ');
  const bottleneckPoints = states.map((state, index) => `${padding + (index / (states.length - 1)) * chartWidth},${height - padding - (state.activeBottlenecks / maxBottlenecks) * chartHeight}`).join(' ');
  const currentX = padding + (Math.min(currentStep, states.length - 1) / (states.length - 1)) * chartWidth;
  return <div className="h-full w-full rounded-2xl border border-[#eadfd5] bg-[#fffaf4] p-3"><div className="mb-1 flex items-center gap-4 text-[10px] font-semibold text-[#806957]"><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#b97852]" /> Peak density</span><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#b14a3d]" /> Bottlenecks</span><span className="ml-auto uppercase tracking-[0.14em] text-[#a58b7a]">Trend over time</span></div><svg className="h-full w-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img" aria-label="Simulation metrics trend chart"><polyline points={densityPoints} fill="none" stroke="#b97852" strokeWidth="2" opacity="0.9" /><polyline points={bottleneckPoints} fill="none" stroke="#b14a3d" strokeWidth="2" opacity="0.9" strokeDasharray="4,3" /><line x1={currentX} y1={padding} x2={currentX} y2={height - padding} stroke="#8e5e43" strokeWidth="1.2" strokeDasharray="4,2" /></svg></div>;
}
