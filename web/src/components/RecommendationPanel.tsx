import { RerouteRecommendation, BeforeAfterMetrics } from '../types';

interface Props {
  recommendation: RerouteRecommendation | null;
  beforeAfter: BeforeAfterMetrics | null;
  onReroute: () => void;
  loading: boolean;
  hasBottleneck: boolean;
  status: string;
}

export default function RecommendationPanel({ recommendation, beforeAfter, onReroute, loading, hasBottleneck, status }: Props) {
  if (status === 'loading') {
    return <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-500 text-sm">Loading...</div>;
  }
  if (!hasBottleneck && !recommendation) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-500 text-sm">
        No active bottlenecks detected. Continue simulation or try a different scenario.
      </div>
    );
  }
  if (!recommendation) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-500 text-sm">
        Bottlenecks detected. Analyzing alternatives...
      </div>
    );
  }
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Recommendation</h3>
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
          recommendation.confidence === 'High' ? 'bg-emerald-900/40 text-emerald-400' :
          recommendation.confidence === 'Medium' ? 'bg-blue-900/40 text-blue-400' :
          'bg-slate-800 text-slate-400'
        }`}>{recommendation.confidence} confidence</span>
      </div>
      <div className="text-sm text-slate-300 mb-3 leading-relaxed">{recommendation.reason}</div>
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-slate-950 rounded p-2 text-center">
          <div className="text-xs text-slate-500">Density ↓</div>
          <div className="text-sm font-semibold text-emerald-400">{Math.round(recommendation.expectedImprovement.densityReduction * 100)}%</div>
        </div>
        <div className="bg-slate-950 rounded p-2 text-center">
          <div className="text-xs text-slate-500">Wait ↓</div>
          <div className="text-sm font-semibold text-emerald-400">{Math.round(recommendation.expectedImprovement.waitTimeReduction * 100)}%</div>
        </div>
        <div className="bg-slate-950 rounded p-2 text-center">
          <div className="text-xs text-slate-500">Throughput ↑</div>
          <div className="text-sm font-semibold text-emerald-400">{Math.round(recommendation.expectedImprovement.throughputIncrease * 100)}%</div>
        </div>
      </div>
      {!beforeAfter ? (
        <button onClick={onReroute} disabled={loading}
          className="w-full px-3 py-2 rounded bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white text-sm font-medium transition-colors">
          {loading ? 'Applying...' : 'Apply Reroute'}
        </button>
      ) : (
        <div className="p-2 bg-emerald-900/20 border border-emerald-800/50 rounded text-xs text-emerald-300">
          Reroute applied! New simulation loaded. Press Play to see the effect.
        </div>
      )}
    </div>
  );
}
