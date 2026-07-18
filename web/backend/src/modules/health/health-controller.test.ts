import { afterEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import pino from 'pino';

import { createApp } from '../../app.js';
import * as mongooseDb from '../../db/mongoose.js';
import { HealthController } from './health-controller.js';
import { LevelsController } from '../levels/levels-controller.js';
import { LevelsRepository } from '../levels/levels-repository.js';
import { LevelsService } from '../levels/levels-service.js';
import { createTestConfig } from '../../test/test-config.js';

function createTestApp() {
  const levelsService = new LevelsService(new LevelsRepository());
  return createApp({
    config: createTestConfig(),
    logger: pino({ level: 'silent' }),
    controllers: {
      health: new HealthController(),
      levels: new LevelsController(levelsService),
    },
  });
}

describe('GET /health', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns ok when mongo is up', async () => {
    vi.spyOn(mongooseDb, 'getMongoReadyState').mockReturnValue('up');

    const res = await request(createTestApp()).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', mongo: 'up' });
  });

  it('returns 503 when mongo is down', async () => {
    vi.spyOn(mongooseDb, 'getMongoReadyState').mockReturnValue('down');

    const res = await request(createTestApp()).get('/health');

    expect(res.status).toBe(503);
    expect(res.body).toEqual({ status: 'degraded', mongo: 'down' });
  });
});
