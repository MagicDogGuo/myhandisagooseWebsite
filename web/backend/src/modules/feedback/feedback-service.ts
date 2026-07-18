import type { Logger } from 'pino';

import type { FeedbackMailService } from './feedback-mail-service.js';
import type { FeedbackRepository } from './feedback-repository.js';
import type { CreateFeedbackInput } from './types/index.js';

export class FeedbackService {
  constructor(
    private readonly repository: FeedbackRepository,
    private readonly mailService: FeedbackMailService,
    private readonly logger: Logger,
  ) {}

  async submit(input: CreateFeedbackInput): Promise<{ id: string }> {
    const feedback = await this.repository.create(input);

    try {
      await this.mailService.notify(feedback);
    } catch (err) {
      // Persist succeeded — email failure must not block 201
      this.logger.warn(
        { err, feedbackId: feedback.id },
        'feedback notify email failed',
      );
    }

    return { id: feedback.id };
  }
}
