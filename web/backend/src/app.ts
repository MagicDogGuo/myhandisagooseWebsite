import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import type { Logger } from 'pino';

import type { AppConfig } from './config/appConfig.js';
import { createErrorHandler } from './errors/error-handler.js';
import { asyncHandler } from './middleware/async-handler.js';
import { createExpressErrorMiddleware } from './middleware/express-error-middleware.js';
import {
  createVoteRateLimiter,
  feedbackRateLimiter,
} from './middleware/rate-limiters.js';
import type { FeedbackController } from './modules/feedback/feedback-controller.js';
import type { HealthController } from './modules/health/health-controller.js';
import type { LevelsController } from './modules/levels/levels-controller.js';
import type { PollsController } from './modules/polls/polls-controller.js';

export type AppControllers = {
  health: HealthController;
  levels: LevelsController;
  feedback: FeedbackController;
  polls: PollsController;
};

export type CreateAppDeps = {
  config: AppConfig;
  logger: Logger;
  controllers: AppControllers;
};

export function createApp(deps: CreateAppDeps): Express {
  const { config, logger, controllers } = deps;
  const app = express();
  const errorHandler = createErrorHandler(logger);
  const voteRateLimiter = createVoteRateLimiter(config.vote);

  app.use(helmet());
  app.use(
    cors({
      origin: config.corsOrigin,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());

  // Central route table — no express.Router() modules
  app.get(
    '/health',
    asyncHandler(async (req, res) => {
      controllers.health.getHealth(req, res);
    }),
  );
  app.get(
    '/api/v1/levels',
    asyncHandler(async (req, res) => {
      controllers.levels.list(req, res);
    }),
  );
  app.get(
    '/api/v1/levels/:levelId',
    asyncHandler(async (req, res) => {
      controllers.levels.getById(req, res);
    }),
  );
  app.post(
    '/api/v1/feedback',
    feedbackRateLimiter,
    asyncHandler(async (req, res) => {
      await controllers.feedback.create(req, res);
    }),
  );
  app.get(
    '/api/v1/polls',
    asyncHandler(async (req, res) => {
      await controllers.polls.list(req, res);
    }),
  );
  app.post(
    '/api/v1/polls/:pollId/vote',
    voteRateLimiter,
    asyncHandler(async (req, res) => {
      await controllers.polls.vote(req, res);
    }),
  );

  app.use(createExpressErrorMiddleware(errorHandler));

  return app;
}
