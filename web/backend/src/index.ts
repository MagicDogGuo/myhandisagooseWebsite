import type { Server } from 'node:http';

import { createApp } from './app.js';
import { loadConfig } from './config/appConfig.js';
import { connectMongo, disconnectMongo } from './db/mongoose.js';
import { createLogger } from './logger.js';
import { HealthController } from './modules/health/health-controller.js';
import { LevelsController } from './modules/levels/levels-controller.js';
import { LevelsRepository } from './modules/levels/levels-repository.js';
import { LevelsService } from './modules/levels/levels-service.js';

const config = loadConfig();
const logger = createLogger(config.nodeEnv);

let server: Server | undefined;
let shuttingDown = false;

async function shutdown(code = 0): Promise<void> {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;

  logger.info({ code }, 'shutting down');

  if (server) {
    await new Promise<void>((resolve) => {
      server?.close(() => resolve());
    });
  }

  try {
    await disconnectMongo();
  } catch (err) {
    logger.error({ err }, 'error during mongo disconnect');
  }

  process.exit(code);
}

async function main(): Promise<void> {
  await connectMongo(config.mongoUri);
  logger.info('mongo connected');

  // Composition root: Repository → Service → Controller
  const levelsRepository = new LevelsRepository();
  const levelsService = new LevelsService(levelsRepository);
  const levelsController = new LevelsController(levelsService);
  const healthController = new HealthController();

  const app = createApp({
    config,
    logger,
    controllers: {
      health: healthController,
      levels: levelsController,
    },
  });

  server = app.listen(config.port, () => {
    logger.info({ port: config.port }, 'goose-web-backend listening');
  });

  process.on('SIGTERM', () => {
    void shutdown(0);
  });
  process.on('SIGINT', () => {
    void shutdown(0);
  });

  process.on('unhandledRejection', (reason) => {
    logger.error({ reason }, 'unhandledRejection');
  });

  process.on('uncaughtException', (err) => {
    logger.fatal({ err }, 'uncaughtException');
    void shutdown(1);
  });
}

main().catch((err) => {
  logger.fatal({ err }, 'failed to start');
  process.exit(1);
});
