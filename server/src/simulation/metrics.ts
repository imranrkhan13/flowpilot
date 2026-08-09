import { ZoneState, SimulationState, InternalAgent } from '../types/index.js';
import { SimulationConfig } from '../types/index.js';
import { classifyRisk } from './bottleneck.js';

export function computeMetrics(zones: ZoneState[], agents: InternalAgent[], config: SimulationConfig, interventionApplied: boolean = false) {
  const activeAgents = agents.filter((a) => a.state === 'moving' || a.state === 'waiting');
  const totalCrowd = activeAgents.length;
  const peakDensity = zones.length > 0 ? Math.max(...zones.map((z) => z.density), 0) : 0;
  const avgWaitTime = zones.length > 0 ? zones.reduce((sum, z) => sum + z.waitTime, 0) / zones.length : 0;
  const totalThroughput = zones.reduce((sum, z) => sum + z.throughput, 0);
  const activeBottlenecks = zones.filter((z) => z.riskLabel === 'High' || z.riskLabel === 'Critical').length;
  const maxScore = zones.length > 0 ? Math.max(...zones.map((z) => z.bottleneckScore), 0) : 0;
  const overallRisk = classifyRisk(maxScore);
  return {
    totalCrowd: Math.max(0, totalCrowd),
    peakDensity: parseFloat(Math.max(0, peakDensity).toFixed(2)),
    avgWaitTime: parseFloat(Math.max(0, avgWaitTime).toFixed(1)),
    totalThroughput: Math.max(0, totalThroughput),
    activeBottlenecks: Math.max(0, activeBottlenecks),
    overallRisk,
    interventionApplied,
  };
}
