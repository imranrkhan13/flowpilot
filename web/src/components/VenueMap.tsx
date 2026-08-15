import { useMemo } from 'react';
import { BeforeAfterMetrics, RerouteRecommendation, Scenario, SimulationState } from '../types';

interface Props { scenario: Scenario; state: SimulationState; recommendation: RerouteRecommendation | null; beforeAfter: BeforeAfterMetrics | null; }

const NODE_COLORS: Record<string, string> = { gate: '#b97852', junction: '#8e5e43', corridor: '#b49a87', exit: '#5f8e68', food: '#c76d7a', toilet: '#8c77a5', stage: '#c18843', emergency: '#b14a3d' };

export default function VenueMap({ scenario, state, recommendation }: Props) {
  const zonesByEdge = useMemo(() => new Map(state.zones.map((zone) => [zone.edgeId, zone])), [state]);
  const nodeById = useMemo(() => new Map(scenario.venue.nodes.map((node) => [node.id, node])), [scenario]);
  const altEdgeIds = useMemo(() => {
    const ids = new Set<string>();
    if (!recommendation) return ids;
    for (let index = 0; index < recommendation.alternateRoute.length - 1; index += 1) {
      const from = recommendation.alternateRoute[index]; const to = recommendation.alternateRoute[index + 1];
      const edge = scenario.venue.edges.find((candidate) => (candidate.from === from && candidate.to === to) || (candidate.bidirectional && candidate.from === to && candidate.to === from));
      if (edge) ids.add(edge.id);
    }
    return ids;
  }, [recommendation, scenario.venue.edges]);
  const viewBox = useMemo(() => {
    const xs = scenario.venue.nodes.map((node) => node.position.x); const ys = scenario.venue.nodes.map((node) => node.position.y); const pad = 40;
    const minX = Math.min(...xs) - pad; const minY = Math.min(...ys) - pad; const maxX = Math.max(...xs) + pad; const maxY = Math.max(...ys) + pad;
    return `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;
  }, [scenario]);

  return (
    <div className="relative h-full min-h-[390px] w-full overflow-hidden rounded-2xl border border-[#eadfd5] bg-[#fffaf4]">
      <svg className="h-full w-full" viewBox={viewBox} preserveAspectRatio="xMidYMid meet" role="img" aria-label={`${scenario.name} venue graph showing crowd movement`}>
        <defs><pattern id="flowpilot-grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M 32 0 L 0 0 0 32" fill="none" stroke="#eadfd5" strokeWidth="0.6" /></pattern></defs>
        <rect x={viewBox.split(' ')[0]} y={viewBox.split(' ')[1]} width={viewBox.split(' ')[2]} height={viewBox.split(' ')[3]} fill="url(#flowpilot-grid)" opacity="0.55" />
        {scenario.venue.edges.map((edge) => {
          const from = nodeById.get(edge.from); const to = nodeById.get(edge.to); if (!from || !to) return null;
          const zone = zonesByEdge.get(edge.id); const isAlt = altEdgeIds.has(edge.id); const isBottleneck = zone && (zone.riskLabel === 'High' || zone.riskLabel === 'Critical');
          const stroke = isAlt ? '#4f9861' : isBottleneck ? '#b14a3d' : '#c6b3a4'; const strokeWidth = isAlt ? 4 : isBottleneck ? 3.5 : 2.2;
          return <g key={edge.id}><line x1={from.position.x} y1={from.position.y} x2={to.position.x} y2={to.position.y} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" opacity={0.92} />{zone && zone.occupancy > 0 && <text x={(from.position.x + to.position.x) / 2} y={(from.position.y + to.position.y) / 2 - 6} fill="#8e7564" fontSize="10" fontWeight="700" textAnchor="middle">{zone.occupancy}</text>}</g>;
        })}
        {Object.entries(state.agentPositions).map(([key, positions]) => positions.map((position, index) => <circle key={`${key}_${index}`} cx={position.x} cy={position.y} r={2.3} fill="#a35d3f" opacity={0.7} />))}
        {scenario.venue.nodes.map((node) => { const color = NODE_COLORS[node.type] ?? '#8e7564'; const agentsHere = state.agentPositions[node.id]?.length ?? 0; return <g key={node.id}><circle cx={node.position.x} cy={node.position.y} r={10} fill={color} opacity={0.13} /><circle cx={node.position.x} cy={node.position.y} r={4.5} fill={color} /><text x={node.position.x} y={node.position.y + 18} fill="#6f594d" fontSize="10" fontWeight="700" textAnchor="middle">{node.label}</text>{agentsHere > 0 && <text x={node.position.x} y={node.position.y - 11} fill="#a35d3f" fontSize="9" fontWeight="800" textAnchor="middle">{agentsHere}</text>}</g>; })}
      </svg>
    </div>
  );
}
