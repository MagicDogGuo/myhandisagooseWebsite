import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';

import type { AppConfig } from './config/appConfig.js';

export type CreateAppDeps = {
  config: AppConfig;
};

export function createApp(deps: CreateAppDeps): Express {
  const { config } = deps;
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: config.corsOrigin,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '100kb' }));

  return app;
}
