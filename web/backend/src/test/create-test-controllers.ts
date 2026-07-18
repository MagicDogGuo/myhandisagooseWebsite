import type { Logger } from 'pino';
import pino from 'pino';

import type { AppControllers } from '../app.js';
import { FeedbackController } from '../modules/feedback/feedback-controller.js';
import type { FeedbackMailService } from '../modules/feedback/feedback-mail-service.js';
import type { FeedbackRepository } from '../modules/feedback/feedback-repository.js';
import { FeedbackService } from '../modules/feedback/feedback-service.js';
import type {
  CreateFeedbackInput,
  FeedbackRecord,
} from '../modules/feedback/types/index.js';
import { HealthController } from '../modules/health/health-controller.js';
import { LevelsController } from '../modules/levels/levels-controller.js';
import { LevelsRepository } from '../modules/levels/levels-repository.js';
import { LevelsService } from '../modules/levels/levels-service.js';

export type FeedbackTestDoubles = {
  repository?: Pick<FeedbackRepository, 'create'>;
  mailService?: Pick<FeedbackMailService, 'notify'>;
};

export function createSilentLogger(): Logger {
  return pino({ level: 'silent' });
}

export function createTestControllers(
  overrides: Partial<AppControllers> = {},
  doubles: FeedbackTestDoubles = {},
): AppControllers {
  const logger = createSilentLogger();
  const levelsService = new LevelsService(new LevelsRepository());

  const repository: Pick<FeedbackRepository, 'create'> = doubles.repository ?? {
    create: async (input: CreateFeedbackInput): Promise<FeedbackRecord> => ({
      id: 'test-feedback-id',
      category: input.category,
      ...(input.levelId !== undefined ? { levelId: input.levelId } : {}),
      message: input.message,
      ...(input.email ? { email: input.email } : {}),
      createdAt: new Date(),
    }),
  };

  const mailService: Pick<FeedbackMailService, 'notify'> =
    doubles.mailService ?? {
      notify: async () => undefined,
    };

  const feedbackService = new FeedbackService(
    repository as FeedbackRepository,
    mailService as FeedbackMailService,
    logger,
  );

  return {
    health: new HealthController(),
    levels: new LevelsController(levelsService),
    feedback: new FeedbackController(feedbackService),
    ...overrides,
  };
}
