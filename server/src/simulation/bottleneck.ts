export function calculateBottlenecks(occupancy: number, capacity: number, density: number, queueLength: number): number {
  if (capacity <= 0) return 0;
  const occRatio = Math.min(1, occupancy / capacity);
  const queueRatio = Math.min(1, queueLength / Math.max(1, capacity));
  const densityFactor = Math.min(1, density / 5);
  const raw = occRatio * 0.45 + queueRatio * 0.35 + densityFactor * 0.2;
  return Math.min(100, Math.max(0, raw * 100));
}

export function classifyRisk(score: number): 'Low' | 'Moderate' | 'High' | 'Critical' {
  if (score >= 80) return 'Critical';
  if (score >= 60) return 'High';
  if (score >= 40) return 'Moderate';
  return 'Low';
}

export function timeToCritical(score: number, occupancy: number, capacity: number, queueGrowthRate: number): number | null {
  if (score >= 80) return 0;
  if (score >= 60) {
    if (queueGrowthRate <= 0) return null;
    const remaining = Math.max(0, capacity - occupancy);
    return Math.ceil(remaining / queueGrowthRate);
  }
  return null;
}
