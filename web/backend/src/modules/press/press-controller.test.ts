import { describe, expect, it, vi } from 'vitest';
import request from 'supertest';

import { createApp } from '../../app.js';
import { AppError } from '../../errors/app-error.js';
import {
  createSilentLogger,
  createTestControllers,
} from '../../test/create-test-controllers.js';
import { createTestConfig } from '../../test/test-config.js';
import type { PressAsset } from './types/index.js';

const sampleAssets: PressAsset[] = [
  {
    id: 'press-kit',
    title: 'Press Kit',
    description: 'Placeholder zip',
    relativePath: '/press-kit/press-kit.zip',
    downloadCount: 2,
  },
];

describe('press API', () => {
  it('GET /api/v1/press/assets returns asset list', async () => {
    const listAssets = vi.fn(async () => sampleAssets);

    const app = createApp({
      config: createTestConfig(),
      logger: createSilentLogger(),
      controllers: createTestControllers(
        {},
        {
          press: {
            service: {
              listAssets,
              recordDownload: vi.fn(),
            },
          },
        },
      ),
    });

    const res = await request(app).get('/api/v1/press/assets');

    expect(res.status).toBe(200);
    expect(res.body.assets).toEqual(sampleAssets);
    expect(listAssets).toHaveBeenCalledOnce();
  });

  it('GET download redirects 302 to public asset URL', async () => {
    const recordDownload = vi.fn(async () => ({
      redirectUrl: 'http://localhost:5173/press-kit/press-kit.zip',
    }));

    const app = createApp({
      config: createTestConfig(),
      logger: createSilentLogger(),
      controllers: createTestControllers(
        {},
        {
          press: {
            service: {
              listAssets: vi.fn(),
              recordDownload,
            },
          },
        },
      ),
    });

    const res = await request(app)
      .get('/api/v1/press/assets/press-kit/download')
      .redirects(0);

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe(
      'http://localhost:5173/press-kit/press-kit.zip',
    );
    expect(recordDownload).toHaveBeenCalledWith('press-kit');
  });

  it('GET download returns 404 for unknown asset', async () => {
    const recordDownload = vi.fn(async () => {
      throw new AppError('NOT_FOUND', 'Press asset not found', 404);
    });

    const app = createApp({
      config: createTestConfig(),
      logger: createSilentLogger(),
      controllers: createTestControllers(
        {},
        {
          press: {
            service: {
              listAssets: vi.fn(),
              recordDownload,
            },
          },
        },
      ),
    });

    const res = await request(app).get(
      '/api/v1/press/assets/unknown/download',
    );

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
