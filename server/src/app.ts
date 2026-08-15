import express from 'express';
import cors from 'cors';
import healthRouter from './routes/health.js';
import scenariosRouter from './routes/scenarios.js';
import visionRouter from './routes/vision.js';
import crowdRouter from './routes/crowd.js';

const app = express();
const corsOrigin = process.env.CORS_ORIGIN || '*';

app.disable('x-powered-by');
app.use(cors({ origin: corsOrigin }));
app.use(express.json({ limit: '10mb' }));
app.use('/api/health', healthRouter);
app.use('/api/scenarios', scenariosRouter);
app.use('/api/vision', visionRouter);
app.use('/api/crowd', crowdRouter);
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;

