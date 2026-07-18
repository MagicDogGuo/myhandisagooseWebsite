import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import type { Logger } from 'pino';

import type { AppConfig } from './config/appConfig.js';
import { createErrorHandler } from './errors/error-handler.js';
import { createExpressErrorMiddleware } from './middleware/express-error-middleware.js';
import { createHealthRouter } from './modules/health/health-router.js';

export type CreateAppDeps = {
  config: AppConfig;
  logger: Logger;
};

export function createApp(deps: CreateAppDeps): Express {
  const { config, logger } = deps;
  const app = express();
  const errorHandler = createErrorHandler(logger);

  app.use(helmet());
  app.use(
    cors({
      origin: config.corsOrigin,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '100kb' }));

  app.use(createHealthRouter());

  app.use(createExpressErrorMiddleware(errorHandler));

  return app;
}
