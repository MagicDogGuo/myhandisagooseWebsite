import { afterEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

import { createApp } from '../../app.js';
import * as mongooseDb from '../../db/mongoose.js';
import { createTestConfig } from '../../test/test-config.js';
import {
  createSilentLogger,
  createTestControllers,
} from '../../test/create-test-controllers.js';

function createTestApp() {
  return createApp({
    config: createTestConfig(),
    logger: createSilentLogger(),
    controllers: createTestControllers(),
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
