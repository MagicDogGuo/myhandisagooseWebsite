import type { Request, Response } from 'express';

import { AppError } from '../../errors/app-error.js';
import type { PressService } from './press-service.js';

export class PressController {
  constructor(private readonly service: PressService) {}

  async list(_req: Request, res: Response): Promise<void> {
    const assets = await this.service.listAssets();
    res.status(200).json({ assets });
  }

  async download(req: Request, res: Response): Promise<void> {
    const assetId =
      typeof req.params.assetId === 'string' ? req.params.assetId : '';
    if (!assetId) {
      throw new AppError('VALIDATION_ERROR', 'Missing assetId', 400);
    }

    const { redirectUrl } = await this.service.recordDownload(assetId);
    res.redirect(302, redirectUrl);
  }
}
