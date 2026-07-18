import { Router } from 'express';

import { getMongoReadyState } from '../../db/mongoose.js';

export function createHealthRouter(): Router {
  const router = Router();

  router.get('/health', (_req, res) => {
    const mongo = getMongoReadyState();
    const ok = mongo === 'up';
    res.status(ok ? 200 : 503).json({
      status: ok ? 'ok' : 'degraded',
      mongo,
    });
  });

  return router;
}
