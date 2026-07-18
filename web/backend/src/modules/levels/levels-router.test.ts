import { describe, expect, it } from 'vitest';
import request from 'supertest';
import pino from 'pino';

import { createApp } from '../../app.js';
import { createTestConfig } from '../../test/test-config.js';

describe('levels API', () => {
  const app = createApp({
    config: createTestConfig(),
    logger: pino({ level: 'silent' }),
  });

  it('GET /api/v1/levels returns levels 0-3 summaries', async () => {
    const res = await request(app).get('/api/v1/levels');

    expect(res.status).toBe(200);
    expect(res.body.levels).toHaveLength(4);
    expect(res.body.levels.map((l: { levelId: number }) => l.levelId)).toEqual([
      0, 1, 2, 3,
    ]);
    for (const level of res.body.levels) {
      expect(level.title).toBeTruthy();
      expect(level.promptEn).toBeTruthy();
      expect(level.trainingFocus.length).toBeGreaterThan(0);
      expect(level.screenshots.length).toBeGreaterThan(0);
    }
  });

  it('GET /api/v1/levels/:levelId returns full LevelDoc', async () => {
    for (const levelId of [0, 1, 2, 3]) {
      const res = await request(app).get(`/api/v1/levels/${levelId}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        levelId,
        title: expect.any(String),
        promptEn: expect.any(String),
        trainingFocus: expect.any(Array),
        screenshots: expect.any(Array),
        bodyMd: expect.any(String),
        pitfalls: expect.any(Array),
      });
      expect(res.body.bodyMd.length).toBeGreaterThan(0);
      expect(res.body.pitfalls.length).toBeGreaterThan(0);
      expect(res.body.pitfalls[0]).toMatchObject({
        title: expect.any(String),
        detail: expect.any(String),
      });
    }
  });

  it('GET /api/v1/levels/:levelId returns 404 for unknown level', async () => {
    const res = await request(app).get('/api/v1/levels/99');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      error: {
        code: 'NOT_FOUND',
        message: 'Level 99 not found',
      },
    });
  });
});
