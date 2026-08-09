# FlowPilot

**FlowPilot** is a venue crowd digital twin that predicts bottlenecks and recommends safer routes. Built for the GRAND PRIX hackathon, powered by Hugging Face.

## Quick Start

```bash
# 1. Backend
cd server
npm install
npm run dev

# 2. Frontend (new terminal)
cd web
npm install
npm run dev
```

Open http://localhost:5173

## Environment Variables

Copy `.env.example` to `.env` and fill in:

| Variable | Description |
|----------|-------------|
| `PORT` | Backend port (default 3001) |
| `CORS_ORIGIN` | Allowed CORS origin (default `*`) |
| `HF_API_TOKEN` | Hugging Face API token for LIVEMODE |

## Architecture

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + TypeScript + Express + Zod validation
- **Simulation**: Custom discrete-time graph-based crowd simulator with deterministic seeding
- **Vision**: Hugging Face `facebook/detr-resnet-50` via Inference API, with explicit `DEMOMODE` fallback

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/scenarios` | List all scenarios |
| GET | `/api/scenarios/:id` | Get scenario by ID |
| POST | `/api/scenarios/:id/simulate` | Run simulation (body: `{ steps?, reset? }`) |
| GET | `/api/scenarios/:id/metrics` | Latest metrics |
| GET | `/api/scenarios/:id/states` | Full state history |
| POST | `/api/scenarios/:id/reroute` | Apply reroute intervention |
| GET | `/api/scenarios/:id/beforeafter` | Get before/after comparison |
| POST | `/api/vision/estimate-occupancy` | Estimate occupancy from image |

## Demo Flow

1. Select **Stadium Match Day**
2. Click **Play** — watch agents move, corridors turn red as they bottleneck
3. Review the **Recommendation** panel when a bottleneck appears
4. Click **Apply Reroute** — alternate routes highlight in green
5. Press **Play** again to see the rerouted simulation
6. Compare **Before/After** metrics
7. Upload a camera image in the **Camera Evidence** panel

## Tests

```bash
cd server && npm test
cd web && npm test
```

## Limitations

- This is a decision-support prototype using simplified assumptions.
- It is not a scientifically validated evacuation model.
- Simulation uses deterministic seeded randomness for repeatable demos.
