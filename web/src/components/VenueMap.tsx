import { useMemo } from 'react';
import { Scenario, SimulationState, BeforeAfterMetrics, RerouteRecommendation } from '../types';

interface Props {
  scenario: Scenario;
  state: SimulationState;
  recommendation: RerouteRecommendation | null;
  beforeAfter: BeforeAfterMetrics | null;
}

const NODE_COLORS: Record<string, string> = {
  gate: '#22d3ee',
  junction: '#94a3b8',
  corridor: '#64748b',
  exit: '#34d399',
  food: '#f472b6',
  toilet: '#a78bfa',
  stage: '#fbbf24',
  emergency: '#ef4444',
};

export default function VenueMap({ scenario, state, recommendation }: Props) {
  const zonesByEdge = useMemo(() => {
    const map = new Map<string, typeof state.zones[0]>();
    for (const z of state.zones) map.set(z.edgeId, z);
    return map;
  }, [state]);

  const nodeById = useMemo(() => {
    const map = new Map<string, typeof scenario.venue.nodes[0]>();
    for (const n of scenario.venue.nodes) map.set(n.id, n);
    return map;
  }, [scenario]);

  const altEdgeIds = useMemo(() => {
    if (!recommendation) return new Set<string>();
    const ids = new Set<string>();
    for (let i = 0; i < recommendation.alternateRoute.length - 1; i++) {
      const a = recommendation.alternateRoute[i];
      const b = recommendation.alternateRoute[i + 1];
      const edge = scenario.venue.edges.find((e) => (e.from === a && e.to === b) || (e.bidirectional && e.from === b && e.to === a));
      if (edge) ids.add(edge.id);
    }
    return ids;
  }, [recommendation, scenario.venue.edges]);

  const viewBox = useMemo(() => {
    const xs = scenario.venue.nodes.map((n) => n.position.x);
    const ys = scenario.venue.nodes.map((n) => n.position.y);
    const pad = 40;
    const minX = Math.min(...xs) - pad;
    const minY = Math.min(...ys) - pad;
    const maxX = Math.max(...xs) + pad;
    const maxY = Math.max(...ys) + pad;
    return `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;
  }, [scenario]);

  return (
    <div className="w-full h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden relative">
      <svg className="w-full h-full" viewBox={viewBox} preserveAspectRatio="xMidYMid meet">
        {scenario.venue.edges.map((edge) => {
          const from = nodeById.get(edge.from);
          const to = nodeById.get(edge.to);
          if (!from || !to) return null;
          const zone = zonesByEdge.get(edge.id);
          const isAlt = altEdgeIds.has(edge.id);
          const isBottleneck = zone && (zone.riskLabel === 'High' || zone.riskLabel === 'Critical');
          const stroke = isAlt ? '#34d399' : isBottleneck ? '#ef4444' : '#334155';
          const strokeWidth = isAlt ? 4 : isBottleneck ? 3 : 2;
          return (
            <g key={edge.id}>
              <line x1={from.position.x} y1={from.position.y} x2={to.position.x} y2={to.position.y}
                stroke={stroke} strokeWidth={strokeWidth} opacity={0.9} />
              {zone && zone.occupancy > 0 && (
                <text x={(from.position.x + to.position.x) / 2} y={(from.position.y + to.position.y) / 2 - 6}
                  fill="#94a3b8" fontSize="10" textAnchor="middle">{zone.occupancy}</text>
              )}
            </g>
          );
        })}
        {Object.entries(state.agentPositions).map(([key, positions]) => {
          const edge = scenario.venue.edges.find((e) => e.id === key);
          if (!edge) return null;
          return positions.map((pos, idx) => (
            <circle key={`${key}_${idx}`} cx={pos.x} cy={pos.y} r={2} fill="#22d3ee" opacity={0.7} />
          ));
        })}
        {scenario.venue.nodes.map((node) => {
          const color = NODE_COLORS[node.type] ?? '#94a3b8';
          const agentsHere = state.agentPositions[node.id]?.length ?? 0;
          return (
            <g key={node.id}>
              <circle cx={node.position.x} cy={node.position.y} r={8} fill={color} opacity={0.2} />
              <circle cx={node.position.x} cy={node.position.y} r={4} fill={color} />
              <text x={node.position.x} y={node.position.y + 18} fill="#cbd5e1" fontSize="10" textAnchor="middle">{node.label}</text>
              {agentsHere > 0 && (
                <text x={node.position.x} y={node.position.y - 10} fill="#22d3ee" fontSize="9" textAnchor="middle">{agentsHere}</text>
              )}
            </g>
          );
        })}
      </svg>
      <div className="absolute bottom-2 left-2 bg-slate-950/80 border border-slate-800 rounded-lg p-2 text-[10px] space-y-1">
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-400"></span> Gate</div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-yellow-400"></span> Stage</div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> Exit</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-red-500"></span> Bottleneck</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-emerald-400"></span> Alternate</div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-400 opacity-70"></span> Agent</div>
      </div>
    </div>
  );
}
