import type { Request, Response } from 'express';

import { AppError } from '../../errors/app-error.js';
import { feedbackBodySchema } from './feedback-schema.js';
import type { FeedbackService } from './feedback-service.js';

export class FeedbackController {
  constructor(private readonly service: FeedbackService) {}

  async create(req: Request, res: Response): Promise<void> {
    const rawWebsite = req.body?.website;
    if (typeof rawWebsite === 'string' && rawWebsite.length > 0) {
      // Honeypot tripped — look like success, skip persistence / mail
      res.status(201).json({ id: 'accepted' });
      return;
    }

    const parsed = feedbackBodySchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(
        'VALIDATION_ERROR',
        'Invalid feedback payload',
        400,
        true,
        parsed.error.flatten(),
      );
    }

    const { category, levelId, message, email } = parsed.data;
    const result = await this.service.submit({
      category,
      ...(levelId !== undefined ? { levelId } : {}),
      message,
      ...(email ? { email } : {}),
    });

    res.status(201).json(result);
  }
}
