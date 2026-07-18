import { Router } from 'express';

import { AppError } from '../../errors/app-error.js';
import { asyncHandler } from '../../middleware/async-handler.js';
import type { LevelsService } from './levels-service.js';

export function createLevelsRouter(service: LevelsService): Router {
  const router = Router();

  router.get(
    '/',
    asyncHandler(async (_req, res) => {
      res.json({ levels: service.listSummaries() });
    }),
  );

  router.get(
    '/:levelId',
    asyncHandler(async (req, res) => {
      const levelId = Number(req.params.levelId);
      if (!Number.isInteger(levelId) || levelId < 0) {
        throw new AppError('VALIDATION_ERROR', 'Invalid levelId', 400);
      }

      const level = service.getById(levelId);
      res.json(level);
    }),
  );

  return router;
}
