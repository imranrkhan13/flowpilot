# FlowPilot

FlowPilot is a **decision-support prototype** for exploring crowd movement through venue graphs, identifying developing bottlenecks, and testing route interventions in a deterministic discrete-time simulation. It is designed to make the reasoning visible within a short demo: choose a venue, run the crowd flow, inspect a bottleneck recommendation, apply a reroute, and compare modelled before-and-after metrics.

> FlowPilot is not a scientifically validated evacuation model, certified safety system, or guarantee of real-world safety. Its outputs are simplified simulation results for exploration and demonstration.

## Product journey

1. Choose a clearly labelled demo venue such as a stadium, festival, or railway station.
2. Start or pause the discrete-time crowd simulation and watch agents move across entrances, exits, corridors, zones, and other graph nodes.
3. Inspect live metrics including crowd size, density, waiting time, throughput, active bottlenecks, and overall risk.
4. Review the recommendation explaining the affected edge, why the bottleneck is occurring, and which alternate route is suggested.
5. Select **Apply Reroute** to load the intervention scenario and highlight the alternate route in green.
6. Compare modelled peak density, average wait, throughput, bottlenecks, and risk before and after the intervention.
7. Optionally upload a camera image and request an occupancy estimate. The result is explicitly labelled **LIVE MODE** only when the Hugging Face request is used, otherwise it is labelled **DEMO MODE**.

## Architecture

| Layer | Implementation |
|---|---|
| Frontend | React, TypeScript, Vite, and Tailwind CSS |
| Backend | Node.js, TypeScript, Express, and Zod validation |
| Simulation | Seeded discrete-time graph-based crowd simulator |
| Vision | Hugging Face `facebook/detr-resnet-50` through the Inference API, with deterministic fallback |
| Hosting | GitHub-linked serverless deployment with explicit API handlers |
| Testing | Vitest frontend and backend suites, TypeScript checks, and production build validation |

The graph, agents, bottleneck detection, route recommendation, and before/after comparison remain separate concepts in the code so the demo is understandable and straightforward to extend.

## Quick start

Install the two packages in separate terminals:

```bash
cd server
npm install
npm run dev
```

```bash
cd web
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The frontend uses `/api` in production and the Vite development proxy locally.

## Environment variables

Copy the server example file before starting the backend:

```bash
cd server
cp .env.example .env
```

| Variable | Description | Required |
|---|---|---:|
| `PORT` | Backend port; defaults to `3001` | No |
| `CORS_ORIGIN` | Allowed frontend origin; defaults to `*` for local development | No |
| `HF_API_TOKEN` | Hugging Face token used for live occupancy inference | No |

No secret is exposed in client-side code. When `HF_API_TOKEN` is absent, the server returns deterministic fixture data and the UI identifies the result as **DEMO MODE**. A live result must not be represented as working unless the Hugging Face request succeeds.

## API routes

| Method | Route | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/scenarios` | List available scenarios |
| GET | `/api/scenarios/:id` | Fetch one scenario |
| POST | `/api/scenarios/:id/simulate` | Run a simulation; body supports `{ steps?, reset? }` |
| GET | `/api/scenarios/:id/metrics` | Fetch current metrics |
| GET | `/api/scenarios/:id/states` | Fetch the full state history |
| POST | `/api/scenarios/:id/reroute` | Apply the best detected reroute |
| GET | `/api/scenarios/:id/beforeafter` | Fetch the comparison after rerouting |
| POST | `/api/vision/estimate-occupancy` | Estimate occupancy from a validated image payload |

The hosted project includes explicit serverless handlers for multi-segment API paths so scenario selection, simulation, rerouting, metrics, states, and vision requests resolve correctly in production.

## Validation commands

Run the same commands used before deployment:

```bash
npm --prefix web test
npm --prefix web run typecheck
npm --prefix web run build
npm --prefix server test
npm --prefix server run typecheck
```

The test suites cover deterministic simulation, graph pathfinding, bottleneck scoring, rerouting, vision demo fallback, and the main landing-page render. Browser smoke testing should additionally cover scenario selection, play/pause/reset, rerouting, image validation, refreshes, and responsive layouts.

## Deployment

The repository is connected to the hosted project and deploys from the `main` branch. The current public deployment is [https://flowpilot-eight.vercel.app](https://flowpilot-eight.vercel.app).

For a new deployment, push a validated commit to `main`, then verify:

```bash
curl -fsS https://flowpilot-eight.vercel.app/api/health
curl -fsS https://flowpilot-eight.vercel.app/api/scenarios
```

## Limitations and honest assumptions

FlowPilot uses simplified venue graphs, seeded randomness, synthetic agent groups, and modelled thresholds. It does not guarantee safe evacuation, predict real-world outcomes, replace trained personnel, or provide certified safety guidance. Demo venue data is realistic in structure but is not a live operational feed.

Camera occupancy is an optional evidence panel, not a sensor system. **DEMO MODE** uses deterministic fixture data when no Hugging Face credential is configured or when the live request cannot be used. **LIVE MODE** should only be treated as active when the server successfully completes the Hugging Face request.

The simulator keeps state separate from presentation state and resets route-specific state when the user changes venue. Image uploads are limited to supported image types and 10 MB, with visible errors for invalid files, unreadable files, failed requests, and unsupported responses.
