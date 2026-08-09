import { SimulationState } from '../types';

interface Props {
  states: SimulationState[];
  currentStep: number;
}

export default function MetricsChart({ states, currentStep }: Props) {
  if (states.length < 2) return null;
  const width = 600;
  const height = 120;
  const padding = 20;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const maxDensity = Math.max(...states.map((s) => s.peakDensity), 0.01);
  const maxBottlenecks = Math.max(...states.map((s) => s.activeBottlenecks), 1);

  const densityPoints = states.map((s, i) => {
    const x = padding + (i / (states.length - 1)) * chartWidth;
    const y = height - padding - (s.peakDensity / maxDensity) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  const bottleneckPoints = states.map((s, i) => {
    const x = padding + (i / (states.length - 1)) * chartWidth;
    const y = height - padding - (s.activeBottlenecks / maxBottlenecks) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  const currentX = padding + (currentStep / (states.length - 1)) * chartWidth;

  return (
    <div className="w-full h-full bg-slate-900 border border-slate-800 rounded-xl p-3">
      <div className="flex items-center gap-4 mb-1 text-[10px] text-slate-400">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400"></span> Peak Density</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400"></span> Bottlenecks</span>
      </div>
      <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <polyline points={densityPoints} fill="none" stroke="#fb923c" strokeWidth="1.5" opacity="0.8" />
        <polyline points={bottleneckPoints} fill="none" stroke="#f87171" strokeWidth="1.5" opacity="0.8" strokeDasharray="3,2" />
        <line x1={currentX} y1={padding} x2={currentX} y2={height - padding} stroke="#94a3b8" strokeWidth="1" strokeDasharray="4,2" />
      </svg>
    </div>
  );
}
