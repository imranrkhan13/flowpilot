# FlowPilot Mentoring Round Speaking Notes

## Timing plan

| Segment | Target time | Cumulative time |
|---|---:|---:|
| Opening and thesis | 0:35 | 0:35 |
| Problem | 0:45 | 1:20 |
| Product and architecture | 0:50 | 2:10 |
| Live demo | 1:30 | 3:40 |
| Technical execution | 0:55 | 4:35 |
| Social impact | 0:50 | 5:25 |
| Business model | 0:55 | 6:20 |
| Close and mentor ask | 0:40 | 7:00 |

## 0:00–0:35 — Opening

Good evening mentors. We are Team FlowPilot, and our idea is simple: **see the crowd before the crowd becomes a problem, then test the next decision before taking it live**.

FlowPilot is a frontend-and-backend decision-support prototype for stadiums, railway stations, festivals, and other large venues. It models how people move through a venue, identifies where pressure is building, and lets an operator test an alternate route. We are presenting it as a working prototype, not as a certified safety system.

## 0:35–1:20 — Problem

Crowds usually do not become risky in one dramatic moment. They bunch up gradually at gates, narrow corridors, food counters, platforms, and exits. The difficult part for an operator is not only collecting data; it is recognising the developing bottleneck early enough to coordinate a response.

The problem statement asks for three things: a venue layout, an expected crowd and event schedule as inputs, and a bottleneck map with a rerouting path as outputs. FlowPilot is built around exactly that loop. The important design choice is that the recommendation is visible and explainable: an operator can see the affected edge, understand the reason, and compare the intervention rather than blindly trusting a score.

## 1:20–2:10 — Product and architecture

The input is a venue graph containing gates, walkways, capacities, zones, concessions, and emergency exits. We also model expected crowd size and arrival waves, which represent an event schedule in a small deterministic fixture.

The decision engine runs a seeded discrete-time simulation. It tracks movement, density, queue pressure, throughput, and active bottlenecks. When a bottleneck is detected, the route layer finds an alternate path and the interface marks it in green.

The output is an operator workspace: the venue map, the current state, system metrics, the recommendation, and a before-and-after comparison. We also built an optional camera-evidence panel using Hugging Face. When a Hugging Face token is configured, it can request occupancy evidence; otherwise the interface clearly says DEMO MODE and returns deterministic fixture data. That honesty matters because a demo fallback should never look like live intelligence.

## 2:10–3:40 — Live demo

I will use the Stadium Match Day scenario because it makes the decision loop easy to see.

First, I select the venue. The input strip makes the model visible: the number of locations and links, the total agents and arrival waves, and the decision output that is currently being monitored.

Next, I press Play. The map shows agents moving through the graph, and the metrics panel updates as the simulation advances. At the moment where pressure develops, the system reports the active bottleneck and the overall risk. This is the point where a traditional dashboard might show a red number; FlowPilot also shows where the pressure is happening and why it matters.

I then open the recommendation and choose Apply Reroute. The new route is highlighted in green, the simulation state is replaced with the intervention result, and the before-and-after panel lets us compare modelled density, waiting time, throughput, bottlenecks, and risk.

The claim is deliberately modest: this is a repeatable way to test an intervention before an operator communicates it. It is not a guarantee that real crowds will behave exactly like the fixture.

## 3:40–4:35 — Technical execution

The frontend uses React, TypeScript, Vite, and Tailwind CSS. The backend uses Node, Express, TypeScript, and Zod validation. The core technical work is not a single model call. It is the combination of a venue graph, seeded simulation, bottleneck scoring, deterministic pathfinding, rerouting, and a stateful-looking operator workflow that remains reliable across serverless requests.

We use Hugging Face meaningfully for the optional occupancy evidence channel. The main crowd-flow decision engine is our own interpretable simulation because the judging criteria ask for a balanced solution: more than simply calling one ready-made tool, but still practical to build and explain. We have frontend and backend tests, strict typechecking, a production build, and live smoke checks for the scenario, simulation, and reroute APIs.

## 4:35–5:25 — Social impact

The social impact is earlier visibility and clearer coordination. A stadium control room, a railway operator, or an event organiser could use the same workflow to examine a gate plan, a schedule, or an intervention before a live event. The potential applications include IPL venues, large Indian gatherings, airports, festivals, and stations.

We are careful not to describe FlowPilot as an autonomous evacuation system. Human operators, venue-specific procedures, and certified safety processes remain responsible for the final decision. Our contribution is a common operational picture: where pressure is building, what alternative is available, and what the modelled trade-off looks like.

## 5:25–6:20 — Business model

Our first customers would be venue owners, event organisers, transit operators, and safety consultancies. The business model is B2B SaaS with a paid pilot for one venue and one event workflow, followed by venue-based annual plans and optional live-evidence integrations.

The adoption path is intentionally staged. First import a venue graph and calibrate assumptions. Then run a tabletop simulation with an operator. Next connect approved live feeds and compare model predictions with observed conditions. Only after that would the customer decide whether the system is valuable enough to support a live operating process.

This makes the product commercially credible without pretending that a hackathon prototype is ready to control a real evacuation. The first value is planning, rehearsal, and decision support.

## 6:20–7:00 — Close

To close: FlowPilot turns crowd pressure into an explainable intervention. It takes a venue, a crowd, and a schedule; simulates the flow; surfaces a bottleneck; and lets an operator test a reroute with evidence before communicating the decision.

Our ask from mentors is specific: help us validate the first operational pilot, the right venue-data contract, and the evidence needed to move from a deterministic demo to a calibrated deployment.

Thank you. We are happy to take your questions.

## Three-minute Q&A preparation

### How is this different from a dashboard that just shows crowd density?

A dashboard reports the current state. FlowPilot adds a controlled experiment: it simulates how the state evolves, identifies a bottleneck through graph and queue conditions, recommends an alternate path, and compares the intervention. The important output is not only a red zone; it is the explainable decision loop around that red zone.

### Is the AI really doing anything, or is this only a simulation?

The core decision engine is an interpretable seeded simulation and pathfinding system, which is intentional because operators need to challenge assumptions. Hugging Face is used for optional camera-based occupancy evidence through the Inference API. We keep the AI evidence channel distinct from the deterministic demo fallback and label DEMO MODE clearly when live inference is unavailable.

### How would this work with real data?

A pilot would start with a venue graph, historical event counts, gate capacities, schedule information, and approved camera or sensor feeds. We would calibrate the graph and thresholds against observed event data, measure false positives and missed bottlenecks, and keep an operator in the loop. We would not go directly from a hackathon fixture to autonomous operational control.

### What is the strongest technical challenge you solved?

The hardest part was making the simulation and reroute workflow reliable across independent serverless API calls. We added stateless-safe route handlers and explicit production handlers for nested scenario paths, then validated health, scenario fetch, simulation, and reroute flows against the hosted deployment.

### What is the most important limitation?

The model uses simplified venue graphs, seeded agents, and synthetic thresholds. It is not scientifically validated and cannot guarantee real-world safety. That is why the interface exposes assumptions and before-and-after metrics instead of presenting a single authoritative safety score.

### Why can this become a business?

Operators already spend money on planning, rehearsals, event safety, and coordination. The first product is a paid pilot that helps them test scenarios and document decisions. Recurring value comes from venue-specific models, scenario libraries, integrations, and calibration over time.

## Live-demo recovery plan

If the hosted demo is slow, show the landing-page screenshot and say: “This is the scenario selector that loads the venue catalog from the backend.” Then show the simulation screenshot and walk through the five visible areas: map, controls, metrics, recommendation, and camera evidence. If a reroute request fails, do not invent a result. State that the deterministic result is prevalidated, explain the expected interaction, and continue with the product and business-model slides. Keep cameras on throughout the presentation and assign one person to watch the timer and one person to advance the deck.
