import { VenueGraph, VenueEdge, ZoneState, RerouteRecommendation, SimulationState, Scenario } from '../types/index.js';
import { findShortestPath, findPathAvoidingEdge, getEdgeBetween, getNodeById } from './graph.js';

export function findRerouteRecommendations(venue: VenueGraph, state: SimulationState, threshold = 55): RerouteRecommendation[] {
  const recommendations: RerouteRecommendation[] = [];
  const criticalZones = state.zones.filter((z) => z.bottleneckScore >= threshold);
  criticalZones.sort((a, b) => b.bottleneckScore - a.bottleneckScore);
  for (const zone of criticalZones) {
    const edge = venue.edges.find((e) => e.id === zone.edgeId);
    if (!edge) continue;
    const altPath = findPathAvoidingEdge(venue, edge.from, edge.to, edge.id);
    if (altPath.length < 2) continue;
    const altEdges: VenueEdge[] = [];
    for (let i = 0; i < altPath.length - 1; i++) {
      const e = getEdgeBetween(venue, altPath[i], altPath[i + 1]);
      if (e) altEdges.push(e);
    }
    if (altEdges.length === 0) continue;
    const altCapacity = Math.min(...altEdges.map((e) => e.capacity));
    const capacityImprovement = edge.capacity > 0 ? (altCapacity - edge.capacity) / edge.capacity : 0;
    const queueSeverity = Math.min(1, zone.queueLength / Math.max(1, edge.capacity));
    const densityReduction = Math.min(0.75, Math.max(0.15, queueSeverity * 0.6 + capacityImprovement * 0.3));
    const waitTimeReduction = Math.min(0.7, Math.max(0.2, queueSeverity * 0.7));
    const throughputIncrease = Math.min(0.5, Math.max(0.1, capacityImprovement * 0.4 + queueSeverity * 0.2));
    const fromLabel = getNodeById(venue, edge.from)?.label ?? edge.from;
    const toLabel = getNodeById(venue, edge.to)?.label ?? edge.to;
    const altLabels = altPath.map((n) => getNodeById(venue, n)?.label ?? n);
    const confidence: 'Low' | 'Medium' | 'High' = zone.bottleneckScore >= 80 ? 'High' : zone.bottleneckScore >= 65 ? 'Medium' : 'Low';
    recommendations.push({
      id: `rec_${edge.id}`,
      affectedEdgeId: edge.id,
      affectedEdgeLabel: `${fromLabel} -> ${toLabel}`,
      reason: `${fromLabel} -> ${toLabel} is at ${Math.round((zone.occupancy / Math.max(1, edge.capacity)) * 100)}% capacity with ${zone.queueLength} queued. Rerouting via ${altLabels.join(' -> ')} adds ${Math.round(altCapacity - edge.capacity)} extra capacity and avoids the congested corridor.`,
      alternateRoute: altPath,
      alternateRouteLabels: altLabels,
      expectedImprovement: { densityReduction: parseFloat(densityReduction.toFixed(2)), waitTimeReduction: parseFloat(waitTimeReduction.toFixed(2)), throughputIncrease: parseFloat(throughputIncrease.toFixed(2)) },
      confidence,
    });
  }
  return recommendations;
}

export function applyReroute(scenario: Scenario, recommendation: RerouteRecommendation): Scenario {
  const newScenario: Scenario = JSON.parse(JSON.stringify(scenario));
  const affectedEdge = scenario.venue.edges.find((e) => e.id === recommendation.affectedEdgeId);
  if (!affectedEdge) return newScenario;
  for (const group of newScenario.agents) {
    const route = group.route;
    for (let i = 0; i < route.length - 1; i++) {
      const from = route[i];
      const to = route[i + 1];
      const usesAffectedEdge = (from === affectedEdge.from && to === affectedEdge.to) || (affectedEdge.bidirectional && from === affectedEdge.to && to === affectedEdge.from);
      if (!usesAffectedEdge) continue;
      const remainingNodes = route.slice(i + 1);
      let rejoinIndex = -1;
      for (let j = 0; j < recommendation.alternateRoute.length; j++) {
        if (remainingNodes.includes(recommendation.alternateRoute[j])) { rejoinIndex = j; break; }
      }
      if (rejoinIndex >= 0) {
        const rejoinNode = recommendation.alternateRoute[rejoinIndex];
        const originalRejoinIndex = remainingNodes.indexOf(rejoinNode);
        group.route = [...route.slice(0, i), ...recommendation.alternateRoute.slice(0, rejoinIndex + 1), ...remainingNodes.slice(originalRejoinIndex + 1)];
      } else {
        const newRoute = [...route.slice(0, i), ...recommendation.alternateRoute];
        const lastAlt = recommendation.alternateRoute[recommendation.alternateRoute.length - 1];
        if (lastAlt !== group.destinationId) {
          const tail = findShortestPath(scenario.venue, lastAlt, group.destinationId);
          if (tail.length > 1) group.route = [...newRoute, ...tail.slice(1)];
          else group.route = newRoute;
        } else {
          group.route = newRoute;
        }
      }
      break;
    }
  }
  for (let i = 0; i < recommendation.alternateRoute.length - 1; i++) {
    const from = recommendation.alternateRoute[i];
    const to = recommendation.alternateRoute[i + 1];
    const edge = newScenario.venue.edges.find((e) => (e.from === from && e.to === to) || (e.bidirectional && e.from === to && e.to === from));
    if (edge) edge.capacity = Math.floor(edge.capacity * 1.25);
  }
  return newScenario;
}
