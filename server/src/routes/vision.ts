import { Router } from 'express';
import { z } from 'zod';
import { estimateOccupancy } from '../vision/detector.js';

const router = Router();
const occupancySchema = z.object({ imageBase64: z.string().min(1), zoneId: z.string().min(1) });

router.post('/estimate-occupancy', async (req, res) => {
  const parse = occupancySchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: 'Invalid request body', details: parse.error.format() });
    return;
  }
  const { imageBase64, zoneId } = parse.data;
  const apiToken = process.env.HF_API_TOKEN;
  try {
    const result = await estimateOccupancy(imageBase64, zoneId, apiToken);
    res.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: msg });
  }
});

export default router;
