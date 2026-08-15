const fs = require('fs');
const sim = JSON.parse(fs.readFileSync('/tmp/flowpilot-sim.json', 'utf8'));
const reroute = JSON.parse(fs.readFileSync('/tmp/flowpilot-reroute.json', 'utf8'));
if (Array.isArray(sim.states) === false || sim.states.length !== 12) process.exit(1);
if (reroute.recommendation == null || Array.isArray(reroute.newStates) === false) process.exit(2);
console.log(JSON.stringify({
  health: JSON.parse(fs.readFileSync('/tmp/flowpilot-health.json', 'utf8')),
  simulationSteps: sim.steps,
  rerouteId: reroute.recommendation.id,
  newStateCount: reroute.newStates.length
}, null, 2));
