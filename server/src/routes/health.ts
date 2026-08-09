import { Router } from 'express';
const router = Router();
router.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'flowpilot-server', version: '1.1.0' });
});
export default router;
