import express from 'express';
import cors from 'cors';
import healthRouter from './routes/health.js';
import scenariosRouter from './routes/scenarios.js';
import visionRouter from './routes/vision.js';

const app = express();
const PORT = process.env.PORT || 3001;
const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({ origin: corsOrigin }));
app.use(express.json({ limit: '10mb' }));
app.use('/api/health', healthRouter);
app.use('/api/scenarios', scenariosRouter);
app.use('/api/vision', visionRouter);
app.use((_req, res) => { res.status(404).json({ error: 'Not found' }); });
app.use((err: any, _req: any, res: any, _next: any) => { console.error(err); res.status(500).json({ error: 'Internal server error' }); });
app.listen(PORT, () => { console.log(`FlowPilot server running on http://localhost:${PORT}`); });
export default app;
