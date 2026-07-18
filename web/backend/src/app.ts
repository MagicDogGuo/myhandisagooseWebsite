import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import type { Logger } from 'pino';

import type { AppConfig } from './config/appConfig.js';
import { createErrorHandler } from './errors/error-handler.js';
import { createExpressErrorMiddleware } from './middleware/express-error-middleware.js';
import { createHealthRouter } from './modules/health/health-router.js';
import { createLevelsRouter } from './modules/levels/levels-router.js';
import { LevelsRepository } from './modules/levels/levels-repository.js';
import { LevelsService } from './modules/levels/levels-service.js';

export type CreateAppDeps = {
  config: AppConfig;
  logger: Logger;
  levelsService?: LevelsService;
};

export function createApp(deps: CreateAppDeps): Express {
  const { config, logger } = deps;
  const app = express();
  const errorHandler = createErrorHandler(logger);
  const levelsService =
    deps.levelsService ?? new LevelsService(new LevelsRepository());

  app.use(helmet());
  app.use(
    cors({
      origin: config.corsOrigin,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '100kb' }));

  app.use(createHealthRouter());
  app.use('/api/v1/levels', createLevelsRouter(levelsService));

  app.use(createExpressErrorMiddleware(errorHandler));

  return app;
}
