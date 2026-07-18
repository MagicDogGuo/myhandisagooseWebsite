import type { Request, Response } from 'express';

import { AppError } from '../../errors/app-error.js';
import type { LevelsService } from './levels-service.js';

export class LevelsController {
  constructor(private readonly service: LevelsService) {}

  list(_req: Request, res: Response): void {
    res.json({ levels: this.service.listSummaries() });
  }

  getById(req: Request, res: Response): void {
    const levelId = Number(req.params.levelId);
    if (!Number.isInteger(levelId) || levelId < 0) {
      throw new AppError('VALIDATION_ERROR', 'Invalid levelId', 400);
    }

    const level = this.service.getById(levelId);
    res.json(level);
  }
}
