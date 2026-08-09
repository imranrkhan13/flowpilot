# FlowPilot Changelog

## v1.1.0 — Hackathon Upgrade

### Simulation
- Fixed bottleneck formula: 45% occupancy, 35% queue, 20% density
- Added real throughput tracking via edge-traversal counts per step
- Added routeIndex to agents for robust route progression
- Added route validation and auto-recalculation when edges are missing
- Added NaN/negative safeguards across all metrics
- Tuned Stadium scenario: corridor capacities reduced to 15–18 to create natural bottlenecks

### Rerouting
- applyReroute now modifies actual agent group routes to avoid affected edges
- Added alternateRouteLabels, affectedEdgeLabel, and confidence to recommendations
- Backend reroute endpoint updates simulation cache with new states

### Backend API
- POST /simulate accepts optional reset flag
- GET /:id/states returns full state history
- POST /reroute returns newStates so frontend can continue playback
- CORS origin configurable via CORS_ORIGIN env var
- Vision detector adds 15s timeout, timestamp, and clearer DEMOMODE labeling

### Frontend
- SimulationPage uses explicit state machine (idle|loading|ready|playing|paused|completed|error)
- MetricsPanel shows bottleneck alert pulse and intervention badge
- RecommendationPanel shows confidence level and only appears when bottlenecks exist
- Added MetricsChart component showing peak density and bottleneck history over time
- VenueMap includes legend overlay
- BeforeAfter panel shows risk level change
- CameraPanel displays timestamp

### Tests
- Added boundary tests for risk classification (39->Low, 40->Moderate, etc.)
- Added real reroute test verifying agent route changes
- Added throughput tracking test
- Added NaN/negative safeguard test across all simulation steps
