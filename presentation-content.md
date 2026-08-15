# FlowPilot — Grand Prix Mentoring Round

## Deck direction

Use the existing FlowPilot warm white-and-brown visual system with Inter typography, terracotta accents, and one clear visual idea per slide. Keep the deck to eight slides for a seven-minute presentation. Use the live product screenshots prepared alongside this outline. The narrative should prioritise problem understanding, product execution, reliability, meaningful use of technology, social impact, and a credible business model rather than claiming scientific certainty.

## Cover

**On-slide copy:**

FlowPilot

Crowd Flow Optimiser

A decision-support prototype for large venues that detects developing bottlenecks and lets operators test a reroute before the crowd piles up.

Grand Prix · AI in Racing Strategy & Decision-Making · Powered by Hugging Face

**Visual direction:** Use a framed live product screenshot on the right and keep the left side quiet with the one-line thesis.

**Speaker focus:** Introduce the team’s idea in one sentence and establish that this is a working frontend-plus-backend prototype, not only a concept.

## Slide 1 — The operational problem (0:35–1:20)

**On-slide copy:**

Crowds do not become dangerous all at once.

They bunch up at gates, narrow corridors, food counters, platforms, and exits. By the time an operator sees the pile-up, the safest intervention window may already be closing.

**The brief asks for:** venue layout + crowd size + event schedule → bottleneck map + updated rerouting path.

**Visual:** A simple three-step visual: hidden pressure → visible bottleneck → safer decision window. Avoid claiming that the system guarantees safety.

**Speaker focus:** Explain why the problem is decision latency and lack of an interpretable operating picture, not merely a lack of raw data.

## Slide 2 — What FlowPilot does (1:20–2:10)

**On-slide copy:**

Input

Venue graph · capacities · expected crowd · arrival waves

Intelligence

Seeded discrete-time simulation · bottleneck scoring · pathfinding

Output

Live map · red risk zone · green alternate route · before/after evidence

**Visual:** Horizontal input → intelligence → operator decision flow with one small map fragment.

**Speaker focus:** Tie each stage directly to the problem statement and explain that every recommendation is visible, challengeable, and reproducible.

## Slide 3 — Live demo: from risk to intervention (2:10–3:40)

**On-slide copy:**

1. Choose Stadium Match Day.
2. Press Play and watch the state evolve.
3. Read the current bottleneck and recommendation.
4. Apply Reroute.
5. Compare the new route and before/after metrics.

**Visual direction:** Use a large live simulation screenshot on the left with five numbered callouts on the right. Reserve the live demo narration for the actual hosted app.

**Speaker focus:** Demonstrate one clean path. Do not click into optional camera evidence unless time remains. Stop at 6:30 of the live timer and leave room to recover if the network is slow.

## Slide 4 — Technical execution (3:40–4:35)

**On-slide copy:**

Frontend

React · TypeScript · Vite · Tailwind CSS

Backend

Node.js · Express · TypeScript · Zod validation

Decision engine

Graph pathfinding · seeded simulation · bottleneck detection · rerouting

Hugging Face

Optional camera occupancy evidence through the Inference API, with an explicit deterministic DEMO MODE fallback.

**Footer:** End-to-end, serverless-hosted, testable, and reproducible.

**Speaker focus:** Show that the solution uses technology meaningfully: Hugging Face supports an optional evidence channel, while the core differentiator is the interpretable simulation and intervention loop.

## Slide 5 — Why it matters (4:35–5:25)

**On-slide copy:**

Designed for operators who need a clearer decision window.

Stadiums · IPL venues · Railway stations · Festivals · Airports · Large public gatherings

Social impact

Earlier visibility of crowd pressure, clearer communication of intervention options, and a common picture for operations teams.

**Honesty line:** This prototype is decision support, not certified evacuation guidance.

**Speaker focus:** Connect the product to the examples in the brief and emphasize that meaningful impact comes from helping people coordinate earlier, not from replacing human responsibility.

## Slide 6 — Product and business model (5:25–6:20)

**On-slide copy:**

Pilot first, scale with the operator.

Customer

Venue owners, event organisers, transit operators, and safety consultancies.

Business model

B2B SaaS with venue-based annual plans, simulation scenario packs, and optional live-evidence integrations. Start with a paid pilot around one venue and one event workflow.

Adoption path

Import venue graph → calibrate assumptions → run tabletop simulation → connect live feeds → measure intervention quality.

**Speaker focus:** Make clear that the first sale is not an autonomous safety system. It is an auditable planning and decision-support layer that can be evaluated before live deployment.

## Slide 7 — Close: a better decision window (6:20–7:00)

**On-slide copy:**

FlowPilot turns crowd pressure into an explainable intervention.

See the crowd.

Change the flow.

What we are asking from mentors:

Help us validate the first operational pilot, the right venue data contract, and the evidence needed to move from deterministic demo to calibrated deployment.

Thank you.

**Speaker focus:** Restate the problem, the working product, and the next validation step. Invite questions and stop before the seven-minute mark.

## Presentation guardrails

Keep the live presentation under seven minutes, with the final slide visible by 6:35. All team members should join the Google Meet early, keep cameras on while presenting, and assign one primary presenter plus one backup for the demo. If the live demo fails, switch immediately to the two product screenshots and explain the same five-step flow without improvising new claims.
