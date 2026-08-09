import { AgentGroup, InternalAgent } from '../types/index.js';

export function createAgentsFromGroups(groups: AgentGroup[], rng: () => number): InternalAgent[] {
  const agents: InternalAgent[] = [];
  let counter = 0;
  for (const group of groups) {
    for (let i = 0; i < group.count; i++) {
      const speedVariation = 0.8 + rng() * 0.4;
      agents.push({
        id: `${group.id}_agent_${counter++}`,
        groupId: group.id,
        originId: group.originId,
        destinationId: group.destinationId,
        currentNodeId: group.originId,
        nextNodeId: null,
        progress: 0,
        speed: group.walkingSpeed * speedVariation,
        state: 'arrived',
        waitStartStep: null,
        route: [...group.route],
        routeIndex: 0,
      });
    }
  }
  return agents;
}
