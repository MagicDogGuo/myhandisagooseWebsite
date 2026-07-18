import type { Request, Response } from 'express';

import { getMongoReadyState } from '../../db/mongoose.js';

export class HealthController {
  getHealth(_req: Request, res: Response): void {
    const mongo = getMongoReadyState();
    const ok = mongo === 'up';
    res.status(ok ? 200 : 503).json({
      status: ok ? 'ok' : 'degraded',
      mongo,
    });
  }
}
